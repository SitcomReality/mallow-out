import { gameState } from './state.js';
import {
  SPAWN_DURATION,
  SPAWN_START_Y,
  SPAWN_END_Y,
  SPAWN_BLEND_START,
  SPAWN_BLEND_END,
  SPAWN_NOISE_START,
  SPAWN_NOISE_END
} from './spawn-constants.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Handles the rising animation for newly spawned marshmallows.
 */
export function updateSpawningMarshmallows(currentTime) {
  const enemy = gameState.currentMarshmallow;
  if (!enemy || enemy.spawnStartTime === undefined) return;

  const elapsed = currentTime - enemy.spawnStartTime;
  const t = Math.min(elapsed / SPAWN_DURATION, 1.0);

  // Smooth easing for a nice pop-up effect
  const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // Update Y position
  enemy.marshmallow.position.y = lerp(SPAWN_START_Y, SPAWN_END_Y, ease);
  
  // Update blending (starts high/melted, ends sharp/standard)
  enemy.marshmallow.blendRadius = lerp(SPAWN_BLEND_START, SPAWN_BLEND_END, ease);
  
  // Update noise (requested to be less noisy/static)
  enemy.marshmallow.noiseAmount = lerp(SPAWN_NOISE_START, SPAWN_NOISE_END, ease);
  
  // Ensure noise offset is initialized but not animated
  if (!enemy.marshmallow.noiseOffset) {
    enemy.marshmallow.noiseOffset = { x: 0, y: 0, z: 0 };
  }

  // Once animation is complete, we can clear the start time to stop processing
  if (t >= 1.0) {
    delete enemy.spawnStartTime;
    // Reset to exact intended values
    enemy.marshmallow.position.y = SPAWN_END_Y;
    enemy.marshmallow.blendRadius = SPAWN_BLEND_END;
    enemy.marshmallow.noiseAmount = SPAWN_NOISE_END;
  }
}