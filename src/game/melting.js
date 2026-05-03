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
    
    // Melting is now a two-phase process:
    // Phase 1 (0.0 to 0.5): Move from start Y to end Y, increase noise/blending.
    // Phase 2 (0.5 to 1.0): Stay at end Y, shrink until invisible, reduce noise/blending to 0.
    const half = 0.5;
    
    if (t <= half) {
      // PHASE 1: Sinking
      const p = t / half; // 0..1 for first half
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      
      marshmallow.marshmallow.position.y = lerp(marshmallow.meltStartY, MELT_END_Y, ease);
      
      marshmallow.marshmallow.blendRadius = lerp(MELT_BLEND_START, MELT_BLEND_END, ease);
      marshmallow.marshmallow.noiseAmount = lerp(MELT_NOISE_AMOUNT_START, MELT_NOISE_AMOUNT_END, ease);
      marshmallow.marshmallow.noiseScale = lerp(MELT_NOISE_SCALE_START, MELT_NOISE_SCALE_END, ease);
      
      // Maintain scale during sinking
      marshmallow.marshmallow.scale.x = marshmallow.meltStartScale.x;
      marshmallow.marshmallow.scale.y = marshmallow.meltStartScale.y;
      marshmallow.marshmallow.scale.z = marshmallow.meltStartScale.z;
    } else {
      // PHASE 2: Shrinking and Fading
      const p = (t - half) / (1.0 - half); // 0..1 for second half
      
      // Stop moving vertically
      marshmallow.marshmallow.position.y = MELT_END_Y;
      
      // Reduce effects to 0
      marshmallow.marshmallow.blendRadius = lerp(MELT_BLEND_END, 0.0, p);
      marshmallow.marshmallow.noiseAmount = lerp(MELT_NOISE_AMOUNT_END, 0.0, p);
      marshmallow.marshmallow.noiseScale = lerp(MELT_NOISE_SCALE_END, 0.0, p);
      
      // Shrink away
      const finalScaleFactor = 0.01;
      const factor = lerp(1.0, finalScaleFactor, p);
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