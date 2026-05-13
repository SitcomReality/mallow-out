import { gameState } from './state.js';
import { updateMarshmallowMovement } from './marshmallow-movement.js';
import { session } from './manager.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';

/**
 * Handles per-frame logic for the active marshmallow, including movement and health degeneration.
 */
export function updateMarshmallows(delta) {
  const marshmallow = gameState.currentMarshmallow;
  if (!marshmallow) return;

  // Update hit reaction effects
  if (marshmallow.hitReaction.active) {
    marshmallow.hitReaction.timer -= delta;
    marshmallow.hitReaction.flashTimer -= delta;
    marshmallow.hitReaction.bulgeTimer -= delta;
    
    if (marshmallow.hitReaction.timer <= 0) {
      marshmallow.hitReaction.active = false;
      marshmallow.hitReaction.knockbackVelocity.set(0, 0, 0);
    }
  }

  if (marshmallow.movement) {
    updateMarshmallowMovement(marshmallow, delta);
  }

  // Check if marshmallow is defeated
  if (marshmallow.currentHealth <= 0 && !marshmallow.isDying) {
    marshmallow.isDying = true;
    if (session.marshmallowHUD) session.marshmallowHUD.hide();
    
    // Move to melting state
    marshmallow.meltStartTime = performance.now() * 0.001;
    if (gameState.meltingMarshmallows.length >= 2) {
      gameState.meltingMarshmallows.shift();
    }
    gameState.meltingMarshmallows.push(marshmallow);
    gameState.currentMarshmallow = null;
  }
  
  if (session.marshmallowHUD && marshmallow === gameState.currentMarshmallow) {
    session.marshmallowHUD.update(marshmallow);
  }
}