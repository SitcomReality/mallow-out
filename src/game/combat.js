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