import { gameState } from './state.js';
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

/**
 * Simple idle bobbing animation for the marshmallow pet.
 */
export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement) return;
  
  const mov = marshmallow.movement;
  
  // Simple bobbing animation
  mov.bobPhase += delta * 2.0;
  const bobOffset = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  marshmallow.marshmallow.position.y = mov.baseY + bobOffset;
  
  // Gentle idle rotation
  marshmallow.marshmallow.rotation.y += delta * 0.2;
}