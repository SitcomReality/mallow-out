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

export function updateMeltingMarshmallows(currentTime) {
  const toRemove = [];
  
  for (const marshmallow of gameState.meltingMarshmallows) {
    const elapsed = currentTime - marshmallow.meltStartTime;
    const t = Math.min(elapsed / MELT_DURATION, 1.0);
    
    if (t >= 1.0) {
      toRemove.push(marshmallow);
      continue;
    }
    
    if (marshmallow.meltStartY === undefined) {
      marshmallow.meltStartY = marshmallow.marshmallow.position.y;
      
      marshmallow.holes.forEach(hole => {
        hole.meltStartY = hole.position.y;
      });
      
      if (!marshmallow.marshmallow.noiseOffset) marshmallow.marshmallow.noiseOffset = { x: 0, y: 0, z: 0 };
    }
    
    // Smooth easing
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
    const currentY = lerp(marshmallow.meltStartY, MELT_END_Y, ease);
    
    marshmallow.marshmallow.position.y = currentY;
    
    marshmallow.marshmallow.blendRadius = lerp(MELT_BLEND_START, MELT_BLEND_END, ease);
    marshmallow.marshmallow.noiseAmount = lerp(MELT_NOISE_AMOUNT_START, MELT_NOISE_AMOUNT_END, ease);
    marshmallow.marshmallow.noiseScale = lerp(MELT_NOISE_SCALE_START, MELT_NOISE_SCALE_END, ease);
    
    if (marshmallow.marshmallow.targetExpression !== undefined) {
      const diff = marshmallow.marshmallow.targetExpression - marshmallow.marshmallow.expression;
      marshmallow.marshmallow.expression += diff * (1.0 / 60.0) * 5.0;
    }
    
    marshmallow.marshmallow.noiseOffset.y += MELT_NOISE_SPEED * (1.0 / 60.0);
  }
  
  for (const mallow of toRemove) {
    const index = gameState.meltingMarshmallows.indexOf(mallow);
    if (index > -1) {
      gameState.meltingMarshmallows.splice(index, 1);
      console.log("[Melting Complete] Mallow removed from melting state. Remaining melting marshmallows:", gameState.meltingMarshmallows.length);
    }
  }
}