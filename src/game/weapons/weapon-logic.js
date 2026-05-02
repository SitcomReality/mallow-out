import { gameState } from '../state.js';
import { getFireRateMultiplier } from '../petals/petal-effects.js';
import { getWeaponFireRateMultiplier } from '../upgrades/weapon-modifiers.js';
import { 
  CLEAVER_CHARGE_TIME
} from './weapon-stats.js';

/**
 * Orchestrates all active weapon systems (cooldowns).
 */
export function updateWeaponSystems(delta) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) {
    ws.skewerCooldown = Math.max(0, ws.skewerCooldown - delta);
  }
}