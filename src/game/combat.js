import * as THREE from 'three';
import { gameState } from './state.js';
import { castRay, getEnemyDistanceAt } from './shooting.js';
import { addHoleToEnemy, addChunkToEnemy, addSpattererDamage, addCleaverDamage, addLaserDamage } from './enemy.js';
import { activeFX } from './fx.js';
import { damageMarshmallow } from './marshmallow.js';
import { onMarshmallowDefeated, session } from './manager.js';
import { awardPollen } from './economy.js';
import { getDamageMultiplier, getFireRateMultiplier } from './petals/petal-effects.js';
import { getWeaponDamageBonus, applyCriticalMultiplier, rollCriticalHit } from './upgrades/weapon-modifiers.js';
import { 
  BASE_DAMAGE_CHUNK, 
  BASE_DAMAGE_HOLE, 
  BASE_DAMAGE_SPATTERER,
  BASE_DAMAGE_CLEAVER,
  BASE_DAMAGE_LASER_PER_TICK,
  SKEWER_RECOIL_PITCH,
  SKEWER_RECOIL_DURATION,
  GLOBBER_PROJECTILE_SPEED,
  GLOBBER_PROJECTILE_SIZE,
  GLOBBER_FIRE_COOLDOWN,
  SPATTERER_MAX_RANGE,
  CLEAVER_CHARGE_TIME,
  MELTER_HEAT_PER_SECOND,
  MELTER_MAX_HEAT,
} from './constants.js';

/**
 * Syncs the visual object list for the raymarching renderer with the current game state.
 */
export function rebuildObjectList() {
  gameState.objects = [];
  if (gameState.currentMarshmallow) {
    gameState.objects.push(gameState.currentMarshmallow.marshmallow);
    gameState.objects.push(...gameState.currentMarshmallow.holes);
  }
  for (const melting of gameState.meltingMarshmallows) {
    gameState.objects.push(melting.marshmallow);
    gameState.objects.push(...melting.holes);
  }

  // Add active visual effects to the raymarching scene
  if (activeFX && activeFX.length > 0) {
    gameState.objects.push(...activeFX);
  }
}

function setPupilLook(marshmallow, hitPoint) {
  const marshmallowPos = new THREE.Vector3(marshmallow.marshmallow.position.x, marshmallow.marshmallow.position.y, marshmallow.marshmallow.position.z);
  const hitRelative = hitPoint.clone().sub(marshmallowPos);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(marshmallow.marshmallow.rotation.x, marshmallow.marshmallow.rotation.y, marshmallow.marshmallow.rotation.z));
  hitRelative.applyQuaternion(q.invert());
  
  marshmallow.marshmallow.pupilLookX = THREE.MathUtils.clamp(hitRelative.z / marshmallow.marshmallow.scale.x, -1, 1);
  marshmallow.marshmallow.pupilLookY = THREE.MathUtils.clamp(hitRelative.x / marshmallow.marshmallow.scale.x, -1, 1);
  marshmallow.marshmallow.pupilLookHold = 0.8;
}

/**
 * Handles weapon firing logic, raycasting, and damaging enemies.
 */
export function shoot(particleSystem, bossHUD) {
  if (!gameState.currentMarshmallow) return;
  
  const weapon = gameState.currentWeapon;
  const player = gameState.player;
  const ws = gameState.weaponStates;
  
  // Check weapon-specific readiness
  if (weapon === 0 && !ws.skewerReady) return;
  if (weapon === 1 && ws.globberCooldown > 0) return;
  if (weapon === 2 && ws.spattererCooldown > 0) return;
  if (weapon === 4 && ws.melterOverheated) return;
  
  const origin = player.position.clone();
  const direction = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  // Calculate a visual start point (weapon tip) for projectiles and tracers
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, Math.sin(player.yaw));
  const up = new THREE.Vector3(0, 1, 0); // Simplified up
  const visualOrigin = origin.clone()
    .add(right.multiplyScalar(0.3))
    .add(up.multiplyScalar(-0.2))
    .add(direction.clone().multiplyScalar(0.5));
  
  // Weapon 1 (Globber) - Create projectile instead of instant hit
  if (weapon === 1) {
    ws.globberCooldown = GLOBBER_FIRE_COOLDOWN;
    gameState.projectiles.push({
      position: visualOrigin.clone(),
      velocity: direction.clone().multiplyScalar(GLOBBER_PROJECTILE_SPEED),
      size: GLOBBER_PROJECTILE_SIZE,
      lifetime: 5.0,
    });
    return;
  }
  
  // Weapon 3 (Cleaver) - Charging mechanic
  if (weapon === 3) {
    ws.cleaverCharging = true;
    return; // Continue charging
  }
  
  let shouldDamageMelter = false;
  let shouldTraceMelter = false;

  if (weapon === 4) {
    const now = performance.now();
    ws.lastMelterFire = now;
    ws.melterHeat += MELTER_HEAT_PER_SECOND * (1/30);
    if (ws.melterHeat >= MELTER_MAX_HEAT) {
      ws.melterOverheated = true;
    }
    
    shouldTraceMelter = now - (ws.lastMelterTracer || 0) > 100;
    shouldDamageMelter = now - (ws.lastMelterDamage || 0) > 200;
    
    if (!shouldTraceMelter && !shouldDamageMelter) return;
    
    if (shouldTraceMelter) ws.lastMelterTracer = now;
    if (shouldDamageMelter) ws.lastMelterDamage = now;
  }

  const distFunc = (p) => getEnemyDistanceAt(gameState.currentMarshmallow, p);
  const result = castRay(origin, direction, distFunc);
  
  // Determine visual endpoint for tracers/effects
  const effectEnd = result.hit ? result.point : origin.clone().add(direction.clone().multiplyScalar(60));

  // Handle weapon firing visual feedback (recoil, muzzle flash, tracers) regardless of hit
  if (weapon === 0) {
    if (session.weaponModels) session.weaponModels.animateRecoil(0.2, 0.2);
    if (session.weaponModels) session.weaponModels.createMuzzleFlash();
    if (session.tracerSystem) session.tracerSystem.createTracer(visualOrigin, effectEnd, 0xffffff);
    ws.skewerReady = false;
    player.recoilTime = 0;
    player.recoilAmount = SKEWER_RECOIL_PITCH;
  } else if (weapon === 2) {
    if (session.weaponModels) session.weaponModels.animateRecoil(0.15, 0.15);
    if (session.weaponModels) session.weaponModels.createMuzzleFlash();
    ws.spattererCooldown = 1.0;
  } else if (weapon === 4 && shouldTraceMelter) {
    if (session.tracerSystem) session.tracerSystem.createTracer(visualOrigin, effectEnd, 0xff6600);
  }

  if (result.hit) {
    if (weapon === 4 && !shouldDamageMelter) {
        return; // Ray hit, but it's not time for a damage tick
    }

    let damage = 0;
    const isCritical = rollCriticalHit();
    setPupilLook(gameState.currentMarshmallow, result.point);
    
    if (weapon === 0) {
      // Skewer - Hole punch
      addHoleToEnemy(gameState.currentMarshmallow, result.point, direction);
      particleSystem.createHoleSpray(result.point, direction);
      damage = (BASE_DAMAGE_HOLE + getWeaponDamageBonus()) * getDamageMultiplier();
      if (isCritical) damage *= 2;
      
    } else if (weapon === 2) {
      // Spatterer - Shotgun with range penalty
      const distance = result.distance;
      const rangeFactor = Math.max(0, 1 - (distance - 3) / (SPATTERER_MAX_RANGE - 3));
      
      addSpattererDamage(gameState.currentMarshmallow, result.point, distance);
      particleSystem.createBloodSplatter(result.point, direction);
      damage = Math.floor((BASE_DAMAGE_SPATTERER + getWeaponDamageBonus()) * rangeFactor * getDamageMultiplier());
      if (isCritical) damage *= 2;
      
    } else if (weapon === 4) {
      // Melter - Laser beam (tick based)
      addLaserDamage(gameState.currentMarshmallow, result.point);
      damage = (BASE_DAMAGE_LASER_PER_TICK + getWeaponDamageBonus() * 0.2) * getDamageMultiplier();
      if (isCritical) damage *= 2;
    }
    
    if (damage > 0) {
      awardPollen(damage);
      
      // Show damage text
      if (session.floatingTextSystem) {
        session.floatingTextSystem.createDamageText(result.point, damage, isCritical);
      }
      
      const defeated = damageMarshmallow(gameState.currentMarshmallow, damage, particleSystem);
      if (bossHUD) bossHUD.update(gameState.currentMarshmallow);
      
      if (defeated) {
        if (gameState.meltingMarshmallows.length >= 2) {
          gameState.meltingMarshmallows.shift();
        }
        
        const deadMarshmallow = gameState.currentMarshmallow;
        deadMarshmallow.meltStartTime = performance.now() * 0.001;
        gameState.meltingMarshmallows.push(deadMarshmallow);
        gameState.currentMarshmallow = null;
        if (bossHUD) bossHUD.hide();
        onMarshmallowDefeated();
      }
    }
    
    rebuildObjectList();
  }
}

export function releaseCleaver(particleSystem, bossHUD) {
  const ws = gameState.weaponStates;
  if (!ws.cleaverCharging) return;
  
  ws.cleaverCharging = false;
  
  // Only fire if sufficiently charged
  if (ws.cleaverCharge < CLEAVER_CHARGE_TIME) {
    return;
  }
  
  ws.cleaverCharge = 0;
  
  const player = gameState.player;
  const origin = player.position.clone();
  const direction = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  const distFunc = (p) => getEnemyDistanceAt(gameState.currentMarshmallow, p);
  const result = castRay(origin, direction, distFunc);
  
  // Visual effects (always trigger on release if charged)
  if (session.weaponModels) session.weaponModels.animateRecoil(0.3, 0.3);
  if (session.weaponModels) session.weaponModels.createMuzzleFlash();

  if (result.hit && gameState.currentMarshmallow) {
    setPupilLook(gameState.currentMarshmallow, result.point);
    addCleaverDamage(gameState.currentMarshmallow, result.point, direction);
    particleSystem.createBloodSplatter(result.point, direction);
    
    const isCritical = rollCriticalHit();
    let damage = (BASE_DAMAGE_CLEAVER + getWeaponDamageBonus()) * getDamageMultiplier();
    if (isCritical) damage *= 2;
    awardPollen(damage);
    
    // Show damage text
    if (session.floatingTextSystem) {
      session.floatingTextSystem.createDamageText(result.point, damage, isCritical);
    }
    
    const defeated = damageMarshmallow(gameState.currentMarshmallow, damage, particleSystem);
    if (bossHUD) bossHUD.update(gameState.currentMarshmallow);
    
    if (defeated) {
      if (gameState.meltingMarshmallows.length >= 2) {
        gameState.meltingMarshmallows.shift();
      }
      
      const deadMarshmallow = gameState.currentMarshmallow;
      deadMarshmallow.meltStartTime = performance.now() * 0.001;
      gameState.meltingMarshmallows.push(deadMarshmallow);
      gameState.currentMarshmallow = null;
      if (bossHUD) bossHUD.hide();
      onMarshmallowDefeated();
    }
    
    rebuildObjectList();
  }
}