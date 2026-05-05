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
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

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

  // Sync internal goo properties
  if (enemy.goo) {
    enemy.goo.blendRadius = enemy.marshmallow.blendRadius;
    enemy.goo.noiseAmount = enemy.marshmallow.noiseAmount;
  }
  
  // Ensure noise offset is initialized but not animated
  if (!enemy.marshmallow.noiseOffset) {
    enemy.marshmallow.noiseOffset = { x: 0, y: 0, z: 0 };
  }

  // Once animation is complete, reconcile movement so there is no frame-jump
  if (t >= 1.0) {
    // Capture the final interpolated world Y before we snap any internal bases
    const finalY = enemy.marshmallow.position.y;

    // Reset to exact intended values
    enemy.marshmallow.position.y = SPAWN_END_Y;
    enemy.marshmallow.blendRadius = SPAWN_BLEND_END;
    enemy.marshmallow.noiseAmount = SPAWN_NOISE_END;

    // If this entity uses the idle movement system, adjust its baseY and bobPhase
    // so the transition from the spawned position into normal bobbing is continuous.
    if (enemy.movement) {
      // Preserve amplitude if present, otherwise fallback to base constant
      const amp = enemy.movement.bobAmplitude || BASE_BOB_AMPLITUDE;
      enemy.movement.baseY = SPAWN_END_Y;

      // Compute the current offset that the bob should represent and clamp safely into [-1,1]
      const currentOffset = finalY - enemy.movement.baseY;
      const ratio = Math.max(-1, Math.min(1, currentOffset / (amp === 0 ? 1e-6 : amp)));

      // Set bobPhase so Math.sin(bobPhase)*amp equals the current offset.
      enemy.movement.bobPhase = Math.asin(ratio);
    }

    // Clear the start time to stop processing
    delete enemy.spawnStartTime;
  }
}