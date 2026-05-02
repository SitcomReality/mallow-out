import { gameState } from './state.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';
import { saveGame } from './persistence.js';

const POLLEN_PER_DAMAGE = 2;
const BASE_CARAMEL_PER_KILL = 10;

export function awardPollen(damage) {
  const upgradeBonus = getUpgradeEffect('pollen_multiplier', gameState.upgrades.pollen_multiplier || 0);
  const totalMultiplier = (1 + upgradeBonus);
  
  const pollen = Math.floor(damage * POLLEN_PER_DAMAGE * totalMultiplier);
  gameState.currencies.pollen += pollen;
}

/**
 * Awards caramel based on kill, applying type bonuses and global upgrades.
 */
export function awardCaramel() {
  const marshmallow = gameState.currentMarshmallow || gameState.meltingMarshmallows[gameState.meltingMarshmallows.length - 1];
  const typeMultiplier = marshmallow && marshmallow.type ? marshmallow.type.rewardMultiplier : 1.0;
  
  const upgradeBonus = getUpgradeEffect('caramel_bonus', gameState.upgrades.caramel_bonus || 0);
  const totalCaramel = BASE_CARAMEL_PER_KILL * typeMultiplier * (1 + upgradeBonus);
  
  gameState.currencies.caramel += Math.floor(totalCaramel);
  saveGame();
}