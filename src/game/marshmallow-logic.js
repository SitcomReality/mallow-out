import { gameState } from './state.js';
import { updateMarshmallowMovement } from './marshmallow-movement.js';
import { session } from './manager.js';

/**
 * Handles per-frame logic for the active marshmallow, including movement and the popping sequence.
 */
export function updateMarshmallows(delta) {
  const marshmallow = gameState.currentMarshmallow;
  if (!marshmallow) return;

  if (marshmallow.movement) {
    updateMarshmallowMovement(marshmallow, delta);
  }
}