import { gameState } from './state.js';
import { POLLEN_PER_DAMAGE, BASE_CARAMEL_PER_KILL } from './economy-constants.js';
import { getPollenMultiplier } from './petals/petal-effects.js';

export function awardPollen(damage) {
  const multiplier = getPollenMultiplier();
  const pollen = Math.floor(damage * POLLEN_PER_DAMAGE * multiplier);
  gameState.currentWaveStats.pollenEarned += pollen;
  gameState.currentWaveStats.damageDealt += damage;
}

export function awardCaramel() {
  let caramel = BASE_CARAMEL_PER_KILL;
  
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