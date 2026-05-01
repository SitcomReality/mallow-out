import { gameState } from './state.js';
import { getPollenMultiplier } from './petals/petal-effects.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';

// Currency reward rates
const POLLEN_PER_DAMAGE = 2;
const BASE_CARAMEL_PER_KILL = 10;

export function awardPollen(damage) {
  const petalMultiplier = getPollenMultiplier();
  const upgradeBonus = getUpgradeEffect('pollen_multiplier', gameState.upgrades.pollen_multiplier || 0);
  const totalMultiplier = petalMultiplier * (1 + upgradeBonus);
  
  const pollen = Math.floor(damage * POLLEN_PER_DAMAGE * totalMultiplier);
  gameState.currentWaveStats.pollenEarned += pollen;
  gameState.currentWaveStats.damageDealt += damage;
}

export function awardCaramel(multiplier = 1.0) {
  let caramel = BASE_CARAMEL_PER_KILL * multiplier;
  
  // Apply upgrade bonus
  const upgradeBonus = getUpgradeEffect('caramel_bonus', gameState.upgrades.caramel_bonus || 0);
  caramel = caramel * (1 + upgradeBonus);
  
  // Apply next kill bonus if active (only apply for full kills, multiplier >= 1)
  if (gameState.nextKillBonus && multiplier >= 1.0) {
    caramel *= 2;
    gameState.nextKillBonus = false;
  }
  
  gameState.currentWaveStats.caramelEarned += Math.floor(caramel);
}

import { saveGame } from './persistence.js';

export function finalizeWaveEarnings() {
  gameState.currencies.pollen += gameState.currentWaveStats.pollenEarned;
  gameState.currencies.caramel += gameState.currentWaveStats.caramelEarned;
  
  // Persist progress whenever earnings are finalized (end of wave)
  saveGame();
}

export function resetWaveStats() {
  gameState.currentWaveStats.pollenEarned = 0;
  gameState.currentWaveStats.caramelEarned = 0;
  gameState.currentWaveStats.damageDealt = 0;
  gameState.currentWaveStats.bubblesPopped = 0;
}