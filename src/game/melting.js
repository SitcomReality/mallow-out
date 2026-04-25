import { gameState } from './state.js';
import {
  MELT_DURATION,
  MELT_END_Y,
  MELT_NOISE_AMOUNT_START,
  MELT_NOISE_AMOUNT_END,
  MELT_NOISE_SCALE_START,
  MELT_NOISE_SCALE_END,
  MELT_NOISE_SPEED,
  MELT_BLEND_START,
  MELT_BLEND_END
} from './melt-constants.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function updateMeltingEnemies(currentTime) {
  const toRemove = [];
  
  for (const enemy of gameState.meltingEnemies) {
    const elapsed = currentTime - enemy.meltStartTime;
    const t = Math.min(elapsed / MELT_DURATION, 1.0);
    
    if (t >= 1.0) {
      toRemove.push(enemy);
      continue;
    }
    
    if (enemy.meltStartY === undefined) {
      enemy.meltStartY = enemy.position.y;
      
      enemy.holes.forEach(hole => {
        hole.meltStartY = hole.position.y;
      });
      
      if (!enemy.noiseOffset) enemy.noiseOffset = { x: 0, y: 0, z: 0 };
    }
    
    // Smooth easing
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
    const currentY = lerp(enemy.meltStartY, MELT_END_Y, ease);
    const dy = currentY - enemy.position.y;
    
    enemy.position.y = currentY;
    enemy.holes.forEach(hole => {
      if (hole.meltStartY !== undefined) {
        hole.position.y += dy;
      }
    });
    
    enemy.blendRadius = lerp(MELT_BLEND_START, MELT_BLEND_END, ease);
    enemy.noiseAmount = lerp(MELT_NOISE_AMOUNT_START, MELT_NOISE_AMOUNT_END, ease);
    enemy.noiseScale = lerp(MELT_NOISE_SCALE_START, MELT_NOISE_SCALE_END, ease);
    
    enemy.noiseOffset.y += MELT_NOISE_SPEED * (1.0 / 60.0);
  }
  
  for (const enemy of toRemove) {
    const index = gameState.meltingEnemies.indexOf(enemy);
    if (index > -1) {
      gameState.meltingEnemies.splice(index, 1);
    }
  }
}