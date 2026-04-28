import { gameState } from './state.js';
import { 
  REPAIR_DURATION, 
  REPAIR_DELAY,
  CHUNK_REPAIR_SPEED, 
  CHUNK_REPAIR_NOISE_SPEED, 
  CHUNK_REPAIR_INITIAL_BLEND, 
  CHUNK_REPAIR_FINAL_BLEND 
} from './repair-constants.js';

export function updateRepairs(currentTime, delta) {
  // Only repair the active marshmallow; melting marshmallows stop repairing
  const allEnemies = [];
  if (gameState.currentMarshmallow) allEnemies.push(gameState.currentMarshmallow);

  for (const enemy of allEnemies) {
    if (enemy.marshmallow.targetExpression !== undefined) {
      const diff = enemy.marshmallow.targetExpression - enemy.marshmallow.expression;
      enemy.marshmallow.expression += diff * delta * 5.0;
    }
    
    // Return pupils to center over time
    if (enemy.marshmallow.pupilLookHold !== undefined && enemy.marshmallow.pupilLookHold > 0) {
        enemy.marshmallow.pupilLookHold -= delta;
    } else {
        if (enemy.marshmallow.pupilLookX !== undefined) {
            enemy.marshmallow.pupilLookX *= Math.pow(0.01, delta); // fast decay
        }
        if (enemy.marshmallow.pupilLookY !== undefined) {
            enemy.marshmallow.pupilLookY *= Math.pow(0.01, delta);
        }
    }

    const toRemove = [];
    
    for (const hole of enemy.holes) {
      if (!hole.repairData) continue;
      
      const elapsed = currentTime - hole.repairData.startTime;
      
      // Delay repair start
      if (elapsed < REPAIR_DELAY) continue;
      
      const t = Math.min((elapsed - REPAIR_DELAY) / REPAIR_DURATION, 1.0);
      
      if (t >= 1.0) {
        toRemove.push(hole);
        continue;
      }
      
      if (hole.repairData.type === 'hole') {
        // Decrease radius until it disappears
        hole.scale.x = hole.repairData.initialRadius * (1.0 - t);

        // Shrink lengthwards in the final 25% of the animation
        if (t > 0.75) {
          const lengthT = (t - 0.75) / 0.25;
          hole.scale.y = hole.repairData.initialHeight * (1.0 - lengthT);
        }
      } else if (hole.repairData.type === 'chunk') {
        const speed = CHUNK_REPAIR_SPEED * delta;
        hole.position.x += hole.repairData.normal.x * speed;
        hole.position.y += hole.repairData.normal.y * speed;
        hole.position.z += hole.repairData.normal.z * speed;

        const scale = (hole.repairData.initialScale || 0.6) * (1.0 - t);
        hole.scale.x = hole.scale.y = hole.scale.z = scale;

        hole.blendRadius = CHUNK_REPAIR_INITIAL_BLEND * (1.0 - t) + CHUNK_REPAIR_FINAL_BLEND * t;
        
        if (!hole.noiseOffset) hole.noiseOffset = { x: 0, y: 0, z: 0 };
        hole.noiseOffset.y += CHUNK_REPAIR_NOISE_SPEED * delta;
        
      } else if (hole.repairData.type === 'spatterer') {
        // Move away from surface
        const speed = 1.0 * delta;
        hole.position.x += hole.repairData.normal.x * speed;
        hole.position.y += hole.repairData.normal.y * speed;
        hole.position.z += hole.repairData.normal.z * speed;
        
        // Animate noise parameters
        hole.noiseAmount = hole.repairData.initialNoiseAmount * (1.0 - t) + 0.4 * t;
        hole.noiseScale = hole.repairData.initialNoiseScale * (1.0 - t) + 3.0 * t;
        
      } else if (hole.repairData.type === 'cleaver') {
        // Move away along attack direction
        const speed = 1.5 * delta;
        hole.position.x += hole.repairData.normal.x * speed;
        hole.position.y += hole.repairData.normal.y * speed;
        hole.position.z += hole.repairData.normal.z * speed;
        
        // Reduce blend to 0
        hole.blendRadius = hole.repairData.initialBlend * (1.0 - t);
        
      } else if (hole.repairData.type === 'laser') {
        // Fast repair - shrinks quickly
        const scale = hole.repairData.initialScale * (1.0 - t);
        hole.scale.x = hole.scale.y = hole.scale.z = scale;
      }
    }
    
    // Cleanup removed damage models to keep CSG operations fast
    for (const hole of toRemove) {
      const idx = enemy.holes.indexOf(hole);
      if (idx > -1) {
        enemy.holes.splice(idx, 1);
      }
    }
  }
}