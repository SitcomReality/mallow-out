import { gameState } from './state.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';

// Currency reward rates
const POLLEN_PER_DAMAGE = 2;
const BASE_CARAMEL_PER_KILL = 10;

import { saveGame } from './persistence.js';

export function awardPollen(damage) {
  const upgradeBonus = getUpgradeEffect('pollen_multiplier', gameState.upgrades.pollen_multiplier || 0);
  const totalMultiplier = (1 + upgradeBonus);
  
  const pollen = Math.floor(damage * POLLEN_PER_DAMAGE * totalMultiplier);
  gameState.currencies.pollen += pollen;
}

export function awardCaramel(multiplier = 1.0) {
  let caramel = BASE_CARAMEL_PER_KILL * multiplier;
  
  const upgradeBonus = getUpgradeEffect('caramel_bonus', gameState.upgrades.caramel_bonus || 0);
  caramel = caramel * (1 + upgradeBonus);
  
  gameState.currencies.caramel += Math.floor(caramel);
  saveGame();
}