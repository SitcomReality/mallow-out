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

  if (marshmallow.movement) {
    updateMarshmallowMovement(marshmallow, delta);
  }

  // Health degeneration system (much slower base rate)
  if (marshmallow.lastHitTime !== undefined) {
    const timeSinceHit = performance.now() * 0.001 - marshmallow.lastHitTime;
    const hitProtectionDuration = 3.0 + getUpgradeEffect('hit_protection', gameState.upgrades.hit_protection || 0);
    
    if (timeSinceHit > hitProtectionDuration) {
      // Start losing health (much slower than before)
      const baseHealthLossRate = 0.5; // HP per second (was 2.0)
      const healthLossRate = baseHealthLossRate / (1 + getUpgradeEffect('health_regen', gameState.upgrades.health_regen || 0));
      
      marshmallow.currentHealth = Math.max(0, marshmallow.currentHealth - healthLossRate * delta);
      
      if (marshmallow.currentHealth <= 0 && !marshmallow.isDying) {
        marshmallow.isDying = true;
        // Marshmallow retreats to marsh
        if (session.marshmallowHUD) session.marshmallowHUD.hide();
        if (session.notifications) {
          session.notifications.add({
            id: 'mallow_retreat',
            sticky: true,
            title: `${marshmallow.name} Retreated!`,
            text: 'Your marshmallow friend needs rest. Purchase a Marshmallow Treat to call them back!',
            color: '#ff69b4'
          });
        }
        
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
  }
}