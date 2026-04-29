import { gameState } from './state.js';
import { POLLEN_PER_DAMAGE, BASE_CARAMEL_PER_KILL } from './economy-constants.js';
import { getPollenMultiplier } from './petals/petal-effects.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';

export function awardPollen(damage) {
  const petalMultiplier = getPollenMultiplier();
  const upgradeBonus = getUpgradeEffect('pollen_multiplier', gameState.upgrades.pollen_multiplier || 0);
  const totalMultiplier = petalMultiplier * (1 + upgradeBonus);
  
  const pollen = Math.floor(damage * POLLEN_PER_DAMAGE * totalMultiplier);
  gameState.currentWaveStats.pollenEarned += pollen;
  gameState.currentWaveStats.damageDealt += damage;
}

export function awardCaramel() {
  let caramel = BASE_CARAMEL_PER_KILL;
  
  // Apply upgrade bonus
  const upgradeBonus = getUpgradeEffect('caramel_bonus', gameState.upgrades.caramel_bonus || 0);
  caramel = Math.floor(caramel * (1 + upgradeBonus));
  
  // Apply next kill bonus if active
  if (gameState.nextKillBonus) {
    caramel *= 2;
    gameState.nextKillBonus = false;
  }
  
  gameState.currentWaveStats.caramelEarned += caramel;
}

export function finalizeWaveEarnings() {
  gameState.currencies.pollen += gameState.currentWaveStats.pollenEarned;
  gameState.currencies.caramel += gameState.currentWaveStats.caramelEarned;
}

export function resetWaveStats() {
  gameState.currentWaveStats.pollenEarned = 0;
  gameState.currentWaveStats.caramelEarned = 0;
  gameState.currentWaveStats.damageDealt = 0;
}