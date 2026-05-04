// Health scaling for the marshmallow pet (much higher base)
const BASE_MARSHMALLOW_HEALTH = 100;

export function getMarshmallowHealth(totalDestroyed) {
  // Very slow scaling to maintain gameplay balance
  const scale = 1.0 + Math.floor(totalDestroyed / 10) * 0.1;
  const healthBonus = getUpgradeEffect('mallow_max_health', gameState.upgrades.mallow_max_health || 0);
  return Math.floor(BASE_MARSHMALLOW_HEALTH * scale * (1 + healthBonus));
}

// Import needed for upgrade effect
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';
import { gameState } from './state.js';