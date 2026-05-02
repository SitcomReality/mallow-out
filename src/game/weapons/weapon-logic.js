import { gameState } from '../state.js';

/**
 * Orchestrates all active weapon systems (cooldowns).
 */
export function updateWeaponSystems(delta) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) {
    ws.skewerCooldown = Math.max(0, ws.skewerCooldown - delta);
  }
}