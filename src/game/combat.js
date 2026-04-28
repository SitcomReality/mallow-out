import * as THREE from 'three';
import { gameState } from './state.js';
import { castRay, getEnemyDistanceAt } from './shooting.js';
import { addHoleToEnemy, addChunkToEnemy, addSpattererDamage, addCleaverDamage, addLaserDamage } from './enemy.js';
import { damageBoss } from './boss.js';
import { 
  BASE_DAMAGE_CHUNK, 
  BASE_DAMAGE_HOLE, 
  BASE_DAMAGE_SPATTERER,
  BASE_DAMAGE_CLEAVER,
  BASE_DAMAGE_LASER_PER_SECOND,
  SKEWER_RECOIL_PITCH,
  SKEWER_RECOIL_DURATION,
  GLOBBER_PROJECTILE_SPEED,
  GLOBBER_PROJECTILE_SIZE,
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
  if (gameState.boss) {
    gameState.objects.push(gameState.boss.marshmallow);
    gameState.objects.push(...gameState.boss.holes);
  }
  for (const melting of gameState.meltingEnemies) {
    gameState.objects.push(melting.marshmallow);
    gameState.objects.push(...melting.holes);
  }
}

function setPupilLook(boss, hitPoint) {
  const bossPos = new THREE.Vector3(boss.marshmallow.position.x, boss.marshmallow.position.y, boss.marshmallow.position.z);
  const hitRelative = hitPoint.clone().sub(bossPos);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(boss.marshmallow.rotation.x, boss.marshmallow.rotation.y, boss.marshmallow.rotation.z));
  hitRelative.applyQuaternion(q.invert());
  
  boss.marshmallow.pupilLookX = THREE.MathUtils.clamp(hitRelative.z / boss.marshmallow.scale.x, -1, 1);
  boss.marshmallow.pupilLookY = THREE.MathUtils.clamp(hitRelative.x / boss.marshmallow.scale.x, -1, 1);
  boss.marshmallow.pupilLookHold = 0.8;
}

/**
 * Handles weapon firing logic, raycasting, and damaging enemies.
 */
export function shoot(particleSystem, bossHUD) {
  if (!gameState.boss) return;
  
  const weapon = gameState.currentWeapon;
  const player = gameState.player;
  const ws = gameState.weaponStates;
  
  // Check weapon-specific readiness
  if (weapon === 0 && !ws.skewerReady) return;
  if (weapon === 2 && ws.spattererCooldown > 0) return;
  if (weapon === 4 && ws.melterOverheated) return;
  
  const origin = player.position.clone();
  const direction = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  // Weapon 1 (Globber) - Create projectile instead of instant hit
  if (weapon === 1) {
    gameState.projectiles.push({
      position: origin.clone(),
      velocity: direction.clone().multiplyScalar(GLOBBER_PROJECTILE_SPEED),
      size: GLOBBER_PROJECTILE_SIZE,
      lifetime: 5.0,
    });
    return;
  }
  
  // Weapon 3 (Cleaver) - Charging mechanic
  if (weapon === 3) {
    if (!ws.cleaverCharging) {
      ws.cleaverCharging = true;
      ws.cleaverCharge = 0;
    }
    return; // Continue charging
  }
  
  const distFunc = (p) => getEnemyDistanceAt(gameState.boss, p);
  const result = castRay(origin, direction, distFunc);
  
  if (result.hit) {
    let damage = 0;
    setPupilLook(gameState.boss, result.point);
    
    if (weapon === 0) {
      // Skewer - Hole punch with recoil
      addHoleToEnemy(gameState.boss, result.point, direction);
      particleSystem.createHoleSpray(result.point, direction);
      damage = BASE_DAMAGE_HOLE + gameState.upgrades.damage;
      
      // Apply recoil
      ws.skewerReady = false;
      player.recoilTime = 0;
      player.recoilAmount = SKEWER_RECOIL_PITCH;
      
    } else if (weapon === 2) {
      // Spatterer - Shotgun with range penalty
      const distance = result.distance;
      const rangeFactor = Math.max(0, 1 - (distance - 3) / (SPATTERER_MAX_RANGE - 3));
      
      addSpattererDamage(gameState.boss, result.point, distance);
      particleSystem.createBloodSplatter(result.point, direction);
      damage = Math.floor((BASE_DAMAGE_SPATTERER + gameState.upgrades.damage) * rangeFactor);
      
      ws.spattererCooldown = 1.0;
      
    } else if (weapon === 4) {
      // Melter - Laser beam (continuous on hold)
      addLaserDamage(gameState.boss, result.point);
      damage = 0.5; // Small damage per frame
      
      ws.melterHeat += MELTER_HEAT_PER_SECOND * (1/60);
      if (ws.melterHeat >= MELTER_MAX_HEAT) {
        ws.melterOverheated = true;
      }
    }
    
    if (damage > 0) {
      const defeated = damageBoss(gameState.boss, damage);
      if (bossHUD) bossHUD.update(gameState.boss);
      
      if (defeated) {
        if (gameState.meltingEnemies.length >= 2) {
          gameState.meltingEnemies.shift();
        }
        
        const deadBoss = gameState.boss;
        deadBoss.meltStartTime = performance.now() * 0.001;
        gameState.meltingEnemies.push(deadBoss);
        gameState.boss = null;
        if (bossHUD) bossHUD.hide();
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
    ws.cleaverCharge = 0;
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
  
  const distFunc = (p) => getEnemyDistanceAt(gameState.boss, p);
  const result = castRay(origin, direction, distFunc);
  
  if (result.hit && gameState.boss) {
    setPupilLook(gameState.boss, result.point);
    addCleaverDamage(gameState.boss, result.point, direction);
    particleSystem.createBloodSplatter(result.point, direction);
    
    const damage = BASE_DAMAGE_CLEAVER + gameState.upgrades.damage;
    const defeated = damageBoss(gameState.boss, damage);
    if (bossHUD) bossHUD.update(gameState.boss);
    
    if (defeated) {
      if (gameState.meltingEnemies.length >= 2) {
        gameState.meltingEnemies.shift();
      }
      
      const deadBoss = gameState.boss;
      deadBoss.meltStartTime = performance.now() * 0.001;
      gameState.meltingEnemies.push(deadBoss);
      gameState.boss = null;
      if (bossHUD) bossHUD.hide();
    }
    
    rebuildObjectList();
  }
}