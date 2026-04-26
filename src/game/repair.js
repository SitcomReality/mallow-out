import { gameState } from './state.js';
import { REPAIR_DURATION, CHUNK_REPAIR_SPEED, CHUNK_REPAIR_NOISE_SPEED } from './repair-constants.js';

export function updateRepairs(currentTime, delta) {
  // Only repair the active boss; melting marshmallows stop repairing
  const allEnemies = [];
  if (gameState.boss) allEnemies.push(gameState.boss);

  for (const enemy of allEnemies) {
    const toRemove = [];
    
    for (const hole of enemy.holes) {
      if (!hole.repairData) continue;
      
      const elapsed = currentTime - hole.repairData.startTime;
      const t = Math.min(elapsed / REPAIR_DURATION, 1.0);
      
      if (t >= 1.0) {
        toRemove.push(hole);
        continue;
      }
      
      if (hole.repairData.type === 'hole') {
        // Decrease radius until it disappears
        hole.scale.x = hole.repairData.initialRadius * (1.0 - t);
      } else if (hole.repairData.type === 'chunk') {
        // Move away from mallow body along surface normal
        const speed = CHUNK_REPAIR_SPEED * delta;
        hole.position.x += hole.repairData.normal.x * speed;
        hole.position.y += hole.repairData.normal.y * speed;
        hole.position.z += hole.repairData.normal.z * speed;

        // Shrink the chunk as it moves away
        const scale = (hole.repairData.initialScale || 0.6) * (1.0 - t);
        hole.scale.x = hole.scale.y = hole.scale.z = scale;
        
        // Animate surface noise to match melting
        if (!hole.noiseOffset) hole.noiseOffset = { x: 0, y: 0, z: 0 };
        hole.noiseOffset.y += CHUNK_REPAIR_NOISE_SPEED * delta;
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