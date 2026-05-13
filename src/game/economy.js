import { gameState } from './state.js';
import { saveGame } from './persistence.js';

const BASE_CARAMEL_PER_HIT = 1;
const BASE_POLLEN_PER_HIT = 1;

/**
 * Ensure currency buckets exist before use.
 */
function ensureCurrencies() {
  if (!gameState.currencies) gameState.currencies = {};
  if (typeof gameState.currencies.caramel !== 'number') gameState.currencies.caramel = 0;
  if (typeof gameState.currencies.pollen !== 'number') gameState.currencies.pollen = 0;
}

/**
 * Awards caramel for successful hits on marshmallows.
 * Caramel is the currency used for permanent upgrades.
 */
export function awardCaramel(amount = BASE_CARAMEL_PER_HIT, multiplier = 1.0) {
  ensureCurrencies();
  const caramel = Math.floor(amount * multiplier);
  gameState.currencies.caramel += caramel;
  saveGame();
  return caramel;
}

/**
 * Awards pollen (used for cosmetics / ephemeral rewards).
 * Provided to satisfy legacy imports that expect awardPollen.
 */
export function awardPollen(amount = BASE_POLLEN_PER_HIT, multiplier = 1.0) {
  ensureCurrencies();
  const pollen = Math.floor(amount * multiplier);
  gameState.currencies.pollen += pollen;
  saveGame();
  return pollen;
}