import { settings } from '../state.js';
import { gameState } from './state.js';
import { updateControls } from './controls.js';
import { updateMeltingEnemies } from './melting.js';
import { updateRepairs } from './repair.js';
import { rebuildObjectList } from './combat.js';
import { session, spawnNextMarshmallow, onMarshmallowDefeated } from './manager.js';
import { damageMarshmallow } from './marshmallow.js';
import { 
  SKEWER_RECOIL_DURATION, 
  SKEWER_RECOIL_RECOVERY,
  MELTER_COOLDOWN_PER_SECOND,
  CLEAVER_CHARGE_TIME,
} from './constants.js';
import { castRay, getEnemyDistanceAt } from './shooting.js';
import { addLaserDamage, addChunkToEnemy } from './enemy.js';
import { damageBoss } from './boss.js';
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
    // Update wave timer
    if (gameState.waveTimer.active) {
      gameState.waveTimer.update(delta);
    }
    
    // Wave transition check - timer expired
    if (gameState.waveTimer.isComplete() && gameState.meltingMarshmallows.length === 0) {
      gameState.waveInProgress = false;
      gameState.waveTimer.stop();
      if (session.upgradeScreen) {
        session.upgradeScreen.show(gameState.currentWave);
        document.exitPointerLock();
      }
    }
    
    // Spawn next marshmallow if needed
    if (gameState.waveInProgress && !gameState.currentMarshmallow && gameState.meltingMarshmallows.length <= 1) {
      spawnNextMarshmallow();
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
    
    // Skewer recoil recovery
    if (!ws.skewerReady) {
      gameState.player.recoilTime += delta;
      if (gameState.player.recoilTime < SKEWER_RECOIL_DURATION) {
        const t = gameState.player.recoilTime / SKEWER_RECOIL_DURATION;
        gameState.player.pitch -= gameState.player.recoilAmount * (1 - t) * delta / SKEWER_RECOIL_DURATION;
      } else if (gameState.player.recoilTime >= SKEWER_RECOIL_DURATION + SKEWER_RECOIL_RECOVERY) {
        ws.skewerReady = true;
        gameState.player.recoilAmount = 0;
      }
    }
    
    // Spatterer cooldown
    if (ws.spattererCooldown > 0) {
      ws.spattererCooldown = Math.max(0, ws.spattererCooldown - delta);
    }
    
    // Cleaver charging
    if (ws.cleaverCharging) {
      ws.cleaverCharge = Math.min(CLEAVER_CHARGE_TIME, ws.cleaverCharge + delta);
    }
    
    // Melter heat management
    if (ws.melterOverheated) {
      ws.melterHeat = Math.max(0, ws.melterHeat - MELTER_COOLDOWN_PER_SECOND * delta);
      if (ws.melterHeat <= 0) {
        ws.melterOverheated = false;
      }
    } else if (gameState.currentWeapon !== 4) {
      ws.melterHeat = Math.max(0, ws.melterHeat - MELTER_COOLDOWN_PER_SECOND * delta * 0.5);
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
          
          const damage = 2 + gameState.upgrades.damage;
          const defeated = damageMarshmallow(gameState.currentMarshmallow, damage);
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

    // Logic updates
    updateControls(delta);
    session.particleSystem.update(delta);
    updateMeltingEnemies(time * 0.001);
    updateRepairs(time * 0.001, delta);
    rebuildObjectList();
  }
  
  // Render call
  if (session.renderFn) {
    session.renderFn(time, session.particleSystem);
  }
  
  requestAnimationFrame(runGameLoop);
}