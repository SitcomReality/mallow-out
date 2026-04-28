import { gameState } from './state.js';
import { POLLEN_PER_DAMAGE, BASE_CARAMEL_PER_KILL } from './economy-constants.js';

export function awardPollen(damage) {
  const pollen = Math.floor(damage * POLLEN_PER_DAMAGE);
  gameState.currentWaveStats.pollenEarned += pollen;
  gameState.currentWaveStats.damageDealt += damage;
}

export function awardCaramel() {
  const caramel = BASE_CARAMEL_PER_KILL;
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