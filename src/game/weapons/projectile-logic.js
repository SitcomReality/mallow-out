import { gameState } from '../state.js';
import { getSceneDistanceAt, rebuildObjectList } from '../combat.js';
import { getEnemyDistanceAt } from '../shooting.js';
import { getBubbleDistanceAt, popBubble } from '../bubble.js';
import { addChunkToEnemy } from '../enemy.js';
import { damageMarshmallow } from '../marshmallow.js';
import { checkMarshmallowPop } from '../marshmallow-pop.js';
import { awardPollen } from '../economy.js';
import { session, onMarshmallowDefeated } from '../manager.js';
import { getWeaponDamageBonus, applyCriticalMultiplier } from '../upgrades/weapon-modifiers.js';
import { getDamageMultiplier } from '../petals/petal-effects.js';
import { BASE_DAMAGE_CHUNK } from '../combat-constants.js';

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
    
    // Check collision with scene (marshmallow + bubbles)
    const dist = getSceneDistanceAt(proj.position);
    
    if (dist < proj.size) {
      let hitBubble = null;
      let hitMarshmallow = false;
      
      let distToMarshmallow = gameState.currentMarshmallow ? getEnemyDistanceAt(gameState.currentMarshmallow, proj.position) : 1e10;
      
      let closestBubble = null;
      let minBubbleDist = 1e10;
      for (const bubble of gameState.bubbles) {
        if (bubble.state !== 'popping') {
          const d = getBubbleDistanceAt(bubble, proj.position);
          if (d < minBubbleDist) {
            minBubbleDist = d;
            closestBubble = bubble;
          }
        }
      }

      if (closestBubble && minBubbleDist < distToMarshmallow + 0.1) {
        hitBubble = closestBubble;
      } else if (distToMarshmallow < proj.size + 0.1) {
        hitMarshmallow = true;
      }

      if (hitBubble) {
        popBubble(hitBubble, proj.position);
        rebuildObjectList();
        if (session.floatingTextSystem) session.floatingTextSystem.createInfoText(proj.position, "POP!", 'info');
        toRemove.push(proj);
        continue; 
      } else if (hitMarshmallow && gameState.currentMarshmallow) {
        // Hit marshmallow!
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
          deadMarshmallow.meltStartTime = time;
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
}