import { gameState } from './state.js';
import { executeMarshmallowPop } from './marshmallow-pop.js';
import { updateMarshmallowMovement } from './marshmallow-movement.js';
import { session } from './manager.js';

/**
 * Handles per-frame logic for the active marshmallow, including movement and the popping sequence.
 */
export function updateMarshmallows(delta) {
  const marshmallow = gameState.currentMarshmallow;
  if (!marshmallow) return;

  if (marshmallow.isPopping) {
    // Process pop timer
    marshmallow.popTimer -= delta;
    
    // Telegraph visuals: Pulse red
    const flash = Math.sin(performance.now() * 0.02) * 0.5 + 0.5;
    const r = 255;
    const g = Math.floor(255 * (1 - flash));
    const b = Math.floor(255 * (1 - flash));
    marshmallow.marshmallow.color = `rgb(${r},${g},${b})`;
    
    if (marshmallow.popTimer <= 0) {
      executeMarshmallowPop(marshmallow, session.particleSystem);
      if (session.marshmallowHUD) session.marshmallowHUD.hide();
    }
  } else if (marshmallow.movement) {
    updateMarshmallowMovement(marshmallow, delta);
  }
}