import * as THREE from 'three';
import { gameState } from './state.js';
import { castRay, getEnemyDistanceAt } from './shooting.js';
import { addHoleToEnemy, addChunkToEnemy } from './enemy.js';
import { damageBoss } from './boss.js';
import { BASE_DAMAGE_CHUNK, BASE_DAMAGE_HOLE } from './constants.js';

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

/**
 * Handles weapon firing logic, raycasting, and damaging enemies.
 */
export function shoot(particleSystem, bossHUD) {
  if (!gameState.boss) return;
  
  // Lava Hose not yet implemented
  if (gameState.currentWeapon === 2) return;
  
  const player = gameState.player;
  const origin = player.position.clone();
  const direction = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  const distFunc = (p) => getEnemyDistanceAt(gameState.boss, p);
  const result = castRay(origin, direction, distFunc);
  
  if (result.hit) {
    let damage = 0;
    
    // Set pupil look direction based on hit point relative to face
    // The face is on the "top" of the cylinder (local Y near max)
    // and looks forward in its local orientation.
    const bossPos = new THREE.Vector3(gameState.boss.marshmallow.position.x, gameState.boss.marshmallow.position.y, gameState.boss.marshmallow.position.z);
    const hitRelative = result.point.clone().sub(bossPos);
    // Rotate relative hit into marshmallow local space
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(gameState.boss.marshmallow.rotation.x, gameState.boss.marshmallow.rotation.y, gameState.boss.marshmallow.rotation.z));
    hitRelative.applyQuaternion(q.invert());
    
    // hitRelative.z is horizontal face axis, hitRelative.x is vertical
    // scale to range -1 to 1 roughly
    gameState.boss.marshmallow.pupilLookX = THREE.MathUtils.clamp(hitRelative.z / gameState.boss.marshmallow.scale.x, -1, 1);
    gameState.boss.marshmallow.pupilLookY = THREE.MathUtils.clamp(hitRelative.x / gameState.boss.marshmallow.scale.x, -1, 1);
    gameState.boss.marshmallow.pupilLookHold = 0.8;

    if (gameState.currentWeapon === 0) {
      // Chunking weapon
      const chunk = addChunkToEnemy(gameState.boss, result.point);
      particleSystem.createBloodSplatter(result.point, chunk.repairData.normal);
      damage = BASE_DAMAGE_CHUNK + gameState.upgrades.damage;
    } else {
      // Hole punching weapon
      addHoleToEnemy(gameState.boss, result.point, direction);
      particleSystem.createHoleSpray(result.point, direction);
      damage = BASE_DAMAGE_HOLE + gameState.upgrades.damage;
    }
    
    const defeated = damageBoss(gameState.boss, damage);
    if (bossHUD) bossHUD.update(gameState.boss);
    
    rebuildObjectList();
    
    if (defeated) {
      // Limit active melting enemies to keep performance stable
      if (gameState.meltingEnemies.length >= 2) {
        gameState.meltingEnemies.shift();
      }
      
      const deadBoss = gameState.boss;
      deadBoss.meltStartTime = performance.now() * 0.001;
      gameState.meltingEnemies.push(deadBoss);
      gameState.boss = null;
      if (bossHUD) bossHUD.hide();
      
      rebuildObjectList();
    }
  }
}