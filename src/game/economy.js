import { gameState } from './state.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';
import { saveGame } from './persistence.js';
import { session } from './manager.js';

const POLLEN_PER_DAMAGE = 2;
const BASE_CARAMEL_PER_KILL = 10;

export function awardPollen(damage) {
  const upgradeBonus = getUpgradeEffect('pollen_multiplier', gameState.upgrades.pollen_multiplier || 0);
  const totalMultiplier = (1 + upgradeBonus);
  
  const pollen = Math.floor(damage * POLLEN_PER_DAMAGE * totalMultiplier);
  gameState.currencies.pollen += pollen;

  if (session.notifications) {
    session.notifications.add({
      id: 'pollen_gain',
      sticky: false,
      title: 'Pollen Gathered',
      text: 'Collected {v} pollen from hits.',
      value: pollen,
      color: '#ffd700'
    });
  }
}

/**
 * Awards caramel based on kill, applying type bonuses and global upgrades.
 */
export function awardCaramel() {
  const marshmallow = gameState.currentMarshmallow || gameState.meltingMarshmallows[gameState.meltingMarshmallows.length - 1];
  const typeMultiplier = marshmallow && marshmallow.type ? marshmallow.type.rewardMultiplier : 1.0;
  
  const upgradeBonus = getUpgradeEffect('caramel_bonus', gameState.upgrades.caramel_bonus || 0);
  const totalCaramel = Math.floor(BASE_CARAMEL_PER_KILL * typeMultiplier * (1 + upgradeBonus));
  
  gameState.currencies.caramel += totalCaramel;

  if (session.notifications) {
    session.notifications.add({
      id: 'caramel_gain',
      sticky: false,
      title: 'Sweet Reward',
      text: 'Gained {v} Caramel!',
      value: totalCaramel,
      color: '#ff8c00'
    });
  }

  saveGame();
}