import { settings } from '../state.js';
import { gameState } from './state.js';
import { updateControls } from './controls.js';
import { updateMeltingEnemies } from './melting.js';
import { updateSpawningMarshmallows } from './spawning.js';
import { updateRepairs } from './repair.js';
import { rebuildObjectList } from './combat.js';
import { session, spawnNextMarshmallow, onMarshmallowDefeated } from './manager.js';
import { damageMarshmallow } from './marshmallow.js';
import { checkMarshmallowPop, executeMarshmallowPop } from './marshmallow-pop.js';
import { awardPollen } from './economy.js';
import { updatePetalEffects, getDamageMultiplier, getFireRateMultiplier } from './petals/petal-effects.js';
import { getWeaponFireRateMultiplier, getWeaponDamageBonus, applyCriticalMultiplier, rollCriticalHit } from './upgrades/weapon-modifiers.js';
import { 
  SKEWER_RECOIL_DURATION, 
  SKEWER_RECOIL_RECOVERY,
  MELTER_COOLDOWN_PER_SECOND,
  CLEAVER_CHARGE_TIME,
  BASE_DAMAGE_CHUNK,
  MELTER_MAX_HEAT,
} from './constants.js';
import { castRay, getEnemyDistanceAt } from './shooting.js';
import { addLaserDamage, addChunkToEnemy } from './enemy.js';
import { updateMarshmallowMovement } from './marshmallow-movement.js';
import { updateFX } from './fx.js';

import * as THREE from 'three';

let lastTime = 0;
let frameCount = 0;
let totalDelta = 0;

/**
 * The core game loop. Orchestrates performance monitoring, state updates, and rendering.
 */
export function runGameLoop(time) {
  if (!session.isPlaying) return;
  
  const delta = (time - lastTime) * 0.001;
  lastTime = time;
  
  if (!session.isPaused) {
    // Wave-specific gameplay logic
    if (gameState.waveInProgress) {
      // Update wave timer
      if (gameState.waveTimer.active) {
        gameState.waveTimer.update(delta);
      }
      
      // Wave transition check - timer expired
      if (gameState.waveTimer.isComplete()) {
        gameState.waveInProgress = false;
        gameState.waveTimer.stop();
        
        if (!gameState.waveEndReason) {
          gameState.waveEndReason = 'TIME_OUT';
        }
        
        if (session.waveSummary) {
          session.waveSummary.show();
          document.exitPointerLock();
        }
      }
      
      // Spawn next marshmallow if needed
      if (!gameState.currentMarshmallow && gameState.meltingMarshmallows.length <= 1) {
        spawnNextMarshmallow();
      }
    }

    // Dynamic resolution scaling based on framerate
    if (settings.dynamicRes) {
      frameCount++;
      totalDelta += delta;
      if (frameCount >= 30) {
        const avgDelta = totalDelta / frameCount;
        const targetDelta = 1.0 / settings.targetFPS;
        
        if (avgDelta > targetDelta * 1.1) {
          settings.renderScale = Math.max(settings.minScale, settings.renderScale - 0.05);
        } else if (avgDelta < targetDelta * 0.8) {
          settings.renderScale = Math.min(settings.maxScale, settings.renderScale + 0.02);
        }
        frameCount = 0;
        totalDelta = 0;
      }
    }

    // Weapon state updates
    const ws = gameState.weaponStates;
    
    // Generalized recoil system
    const player = gameState.player;
    if (player.recoilPitchAmount !== 0 || player.recoilYawAmount !== 0) {
      const petalFireRateMult = getFireRateMultiplier();
      const upgradeFireRateMult = getWeaponFireRateMultiplier();
      const totalMult = (gameState.currentWeapon === 0) ? (petalFireRateMult * upgradeFireRateMult) : 1.0;
      
      const kickDur = player.recoilKickDuration || 0.1;
      const recDur = player.recoilRecoveryDuration || 0.2;
      
      player.recoilTime += delta / totalMult;
      
      if (player.recoilTime < kickDur) {
        // Phase 1: Kick
        const frameT = (delta / totalMult) / kickDur;
        player.pitch += player.recoilPitchAmount * frameT;
        player.yaw += player.recoilYawAmount * frameT;
      } else if (player.recoilTime < kickDur + recDur) {
        // Phase 2: Recovery
        const frameT = (delta / totalMult) / recDur;
        
        // Recover kick amount minus the desired permanent offset
        const pRec = (player.recoilPitchAmount - (player.recoilReturnOffset || 0)) * frameT;
        const yRec = player.recoilYawAmount * frameT;
        
        player.pitch -= pRec;
        player.yaw -= yRec;
      } else {
        // End of recoil sequence
        if (gameState.currentWeapon === 0) ws.skewerReady = true;
        player.recoilPitchAmount = 0;
        player.recoilYawAmount = 0;
        player.recoilReturnOffset = 0;
      }
      
      // Sync and clamp
      player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.pitch));
      player.rotation.x = player.pitch;
      player.rotation.y = player.yaw;
    }
    
    const petalFireRateMult = getFireRateMultiplier();
    const upgradeFireRateMult = getWeaponFireRateMultiplier();
    const totalMult = petalFireRateMult * upgradeFireRateMult;

    // Spatterer cooldown (affected by fire rate boost and upgrades)
    if (ws.spattererCooldown > 0) {
      ws.spattererCooldown = Math.max(0, ws.spattererCooldown - delta / totalMult);
    }
    
    // Globber cooldown
    if (ws.globberCooldown > 0) {
      ws.globberCooldown = Math.max(0, ws.globberCooldown - delta / totalMult);
    }
    
    // Cleaver charging
    if (ws.cleaverCharging) {
      const petalFireRateMult = getFireRateMultiplier();
      const upgradeFireRateMult = getWeaponFireRateMultiplier();
      const totalMult = petalFireRateMult * upgradeFireRateMult;
      
      ws.cleaverCharge = Math.min(CLEAVER_CHARGE_TIME, ws.cleaverCharge + delta / totalMult);
    } else {
      // Deplete at the same speed if not charging
      ws.cleaverCharge = Math.max(0, ws.cleaverCharge - delta);
    }
    
    // Melter heat management
    if (ws.melterOverheated) {
      // Severe overheating penalty: 50% slower cooldown!
      ws.melterHeat = Math.max(0, ws.melterHeat - (MELTER_COOLDOWN_PER_SECOND * 0.5) * delta);
      if (ws.melterHeat <= 0) {
        ws.melterOverheated = false;
      }
    } else {
      // If not firing melter right now, cool down normally
      const now = performance.now();
      if (gameState.currentWeapon !== 4 || (now - (ws.lastMelterFire || 0) > 100)) {
        ws.melterHeat = Math.max(0, ws.melterHeat - MELTER_COOLDOWN_PER_SECOND * delta);
      }
    }
    
    // Update projectiles
    const toRemove = [];
    for (const proj of gameState.projectiles) {
      proj.position.x += proj.velocity.x * delta;
      proj.position.y += proj.velocity.y * delta;
      proj.position.z += proj.velocity.z * delta;
      proj.lifetime -= delta;
      
      // Check collision with current marshmallow
      if (gameState.currentMarshmallow) {
        const distFunc = (p) => getEnemyDistanceAt(gameState.currentMarshmallow, p);
        const dist = distFunc(proj.position);
        
        if (dist < proj.size) {
          // Hit!
          const chunk = addChunkToEnemy(gameState.currentMarshmallow, proj.position);
          session.particleSystem.createBloodSplatter(proj.position, chunk.repairData.normal);
          
          let damage = (BASE_DAMAGE_CHUNK + getWeaponDamageBonus()) * getDamageMultiplier();
          damage = applyCriticalMultiplier(damage);
          awardPollen(damage);
          
          // Check for pop before applying damage
          checkMarshmallowPop(gameState.currentMarshmallow, session.particleSystem);
          
          const defeated = damageMarshmallow(gameState.currentMarshmallow, damage, session.particleSystem);
          if (session.bossHUD) session.bossHUD.update(gameState.currentMarshmallow);
          
          if (defeated) {
            if (gameState.meltingMarshmallows.length >= 2) {
              gameState.meltingMarshmallows.shift();
            }
            const deadMarshmallow = gameState.currentMarshmallow;
            deadMarshmallow.meltStartTime = time * 0.001;
            gameState.meltingMarshmallows.push(deadMarshmallow);
            gameState.currentMarshmallow = null;
            if (session.bossHUD) session.bossHUD.hide();
            onMarshmallowDefeated();
          }
          
          toRemove.push(proj);
        }
      }
      
      if (proj.lifetime <= 0) {
        toRemove.push(proj);
      }
    }
    
    for (const proj of toRemove) {
      const idx = gameState.projectiles.indexOf(proj);
      if (idx > -1) gameState.projectiles.splice(idx, 1);
    }

    // Logic updates (some only during active wave)
    if (gameState.waveInProgress) {
      updateControls(delta);
      
      // Update current marshmallow movement
      if (gameState.currentMarshmallow) {
        if (gameState.currentMarshmallow.isPopping) {
          // Process pop timer
          gameState.currentMarshmallow.popTimer -= delta;
          
          // Telegraph visuals: Pulse red
          const pulseSpeed = 15.0;
          const flash = Math.sin(performance.now() * 0.02) * 0.5 + 0.5;
          const r = Math.floor(255);
          const g = Math.floor(255 * (1 - flash));
          const b = Math.floor(255 * (1 - flash));
          gameState.currentMarshmallow.marshmallow.color = `rgb(${r},${g},${b})`;
          
          if (gameState.currentMarshmallow.popTimer <= 0) {
            executeMarshmallowPop(gameState.currentMarshmallow, session.particleSystem);
            if (session.bossHUD) session.bossHUD.hide();
          }
        } else if (gameState.currentMarshmallow.movement) {
          updateMarshmallowMovement(gameState.currentMarshmallow, delta);
        }
      }
    }
    
    // Global systems that should continue processing (melting, cleanup, particles, and FX)
    // This prevents performance death between waves by allowing objects to clear themselves out.
    session.particleSystem.update(delta);
    session.floatingTextSystem.update(delta);
    if (session.tracerSystem) session.tracerSystem.update(delta);
    updateSpawningMarshmallows(time * 0.001);
    updateMeltingEnemies(time * 0.001);
    updateRepairs(time * 0.001, delta);
    updatePetalEffects(time * 0.001);
    updateFX(time * 0.001);
    rebuildObjectList();
    
    // Update HUD
    if (session.hud) session.hud.update();
    
    // Update weapon status indicators
    if (session.weaponStatus) {
      const ws = gameState.weaponStates;
      if (gameState.currentWeapon === 3 && (ws.cleaverCharging || ws.cleaverCharge > 0)) {
        session.weaponStatus.updateCleaverCharge(ws.cleaverCharge, CLEAVER_CHARGE_TIME);
      } else if (gameState.currentWeapon === 4 && (ws.melterHeat > 0 || ws.melterOverheated)) {
        // Use MELTER_MAX_HEAT which is now configurable via constants
        session.weaponStatus.updateMelterHeat(ws.melterHeat, MELTER_MAX_HEAT, ws.melterOverheated);
      } else {
        session.weaponStatus.hide();
      }
    }
    
    // Update weapon model
    if (session.weaponModels) {
      session.weaponModels.update();
    }
  }
  
  // Render call
  if (session.renderFn) {
    session.renderFn(time, session.particleSystem, session.floatingTextSystem);
  }
  
  // Render floating text
  if (session.floatingTextRenderer) {
    session.floatingTextRenderer.render(session.floatingTextSystem.getTexts());
  }
  
  requestAnimationFrame(runGameLoop);
}