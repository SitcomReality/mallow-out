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
      
      // Capture the starting scale so we can shrink from that value
      marshmallow.meltStartScale = {
        x: marshmallow.marshmallow.scale.x,
        y: marshmallow.marshmallow.scale.y,
        z: marshmallow.marshmallow.scale.z !== undefined ? marshmallow.marshmallow.scale.z : marshmallow.marshmallow.scale.x
      };
      
      marshmallow.holes.forEach(hole => {
        hole.meltStartY = hole.position.y;
      });
      
      if (!marshmallow.marshmallow.noiseOffset) marshmallow.marshmallow.noiseOffset = { x: 0, y: 0, z: 0 };
    }
    
    // Smooth easing for position
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
    const currentY = lerp(marshmallow.meltStartY, MELT_END_Y, ease);
    marshmallow.marshmallow.position.y = currentY;
    
    // Noise/blend should peak at halfway, then decline to 0 by despawn.
    // Compute a 0..1 progress for the first half and second half separately.
    const half = 0.5;
    if (t <= half) {
      // Increasing phase: from start values up to the defined "end" (peak) at halfway.
      const p = t / half; // 0..1
      marshmallow.marshmallow.blendRadius = lerp(MELT_BLEND_START, MELT_BLEND_END, p);
      marshmallow.marshmallow.noiseAmount = lerp(MELT_NOISE_AMOUNT_START, MELT_NOISE_AMOUNT_END, p);
      marshmallow.marshmallow.noiseScale = lerp(MELT_NOISE_SCALE_START, MELT_NOISE_SCALE_END, p);
    } else {
      // Decreasing phase: from peak down to 0 as it finishes melting.
      const p = (t - half) / (1.0 - half); // 0..1
      // Start values for decline are the peak values (MELT_*_END), end at 0
      marshmallow.marshmallow.blendRadius = lerp(MELT_BLEND_END, 0.0, p);
      marshmallow.marshmallow.noiseAmount = lerp(MELT_NOISE_AMOUNT_END, 0.0, p);
      marshmallow.marshmallow.noiseScale = lerp(MELT_NOISE_SCALE_END, 0.0, p);
    }
    
    // Start shrinking halfway through the descent so by the end it's imperceptibly small
    const shrinkStartT = 0.5;
    const finalScaleFactor = 0.01; // nearly invisible at end
    if (t <= shrinkStartT) {
      // Keep original start scale until shrink begins
      marshmallow.marshmallow.scale.x = marshmallow.meltStartScale.x;
      marshmallow.marshmallow.scale.y = marshmallow.meltStartScale.y;
      marshmallow.marshmallow.scale.z = marshmallow.meltStartScale.z;
    } else {
      const localT = (t - shrinkStartT) / (1.0 - shrinkStartT); // 0..1 from halfway to end
      const factor = lerp(1.0, finalScaleFactor, localT);
      marshmallow.marshmallow.scale.x = marshmallow.meltStartScale.x * factor;
      marshmallow.marshmallow.scale.y = marshmallow.meltStartScale.y * factor;
      marshmallow.marshmallow.scale.z = marshmallow.meltStartScale.z * factor;
    }
    
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