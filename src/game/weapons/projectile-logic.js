import { gameState } from '../state.js';
import { getSceneDistanceAt, rebuildObjectList } from '../combat.js';
import { getEnemyDistanceAt } from '../shooting.js';

import { addChunkToMarshmallow } from '../marshmallow-damage.js';
import { session } from '../manager.js';
import { getWeaponDamageBonus, rollCriticalHit } from '../upgrades/weapon-modifiers.js';
import { getDamageMultiplier } from '../petals/petal-effects.js';
import { BASE_DAMAGE_CHUNK } from '../combat-constants.js';
import { handleMarshmallowHit } from '../combat.js';

/**
 * Updates physics, collisions, and damage for all active projectiles.
 */
export function updateProjectiles(delta, time) {
  const toRemove = [];
  for (const proj of gameState.projectiles) {
    proj.position.x += proj.velocity.x * delta;
    proj.position.y += proj.velocity.y * delta;
    proj.position.z += proj.velocity.z * delta;
    proj.lifetime -= delta;
    
    // Check collision with scene
    const dist = getSceneDistanceAt(proj.position);
    
    if (dist < proj.size) {
      let hitMarshmallow = false;
      
      let distToMarshmallow = gameState.currentMarshmallow ? getEnemyDistanceAt(gameState.currentMarshmallow, proj.position) : 1e10;
      
      if (distToMarshmallow < proj.size + 0.1) {
        hitMarshmallow = true;
      }

      if (hitMarshmallow && gameState.currentMarshmallow) {
        // Hit marshmallow!
        const chunk = addChunkToMarshmallow(gameState.currentMarshmallow, proj.position);
        session.particleSystem.createBloodSplatter(proj.position, chunk.repairData.normal);
        
        const isCritical = rollCriticalHit();
        let damage = (BASE_DAMAGE_CHUNK + getWeaponDamageBonus()) * getDamageMultiplier();
        if (isCritical) damage *= 2;

        handleMarshmallowHit(proj.position, damage, isCritical, session.particleSystem, session.marshmallowHUD);
        
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
}