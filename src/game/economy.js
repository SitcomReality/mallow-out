import { gameState } from './state.js';
import { saveGame } from './persistence.js';

const BASE_CARAMEL_PER_HIT = 1;

/**
 * Awards caramel for successful hits on marshmallows.
 * Caramel is the currency used for permanent upgrades.
 */
export function awardCaramel(amount = BASE_CARAMEL_PER_HIT, multiplier = 1.0) {
  const caramel = Math.floor(amount * multiplier);
  
  gameState.currencies.caramel += caramel;
  saveGame();
  return caramel;
}