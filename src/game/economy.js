import { gameState } from './state.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';
import { saveGame } from './persistence.js';
import { session } from './manager.js';

// Base earning rates - rebalanced for distinct currencies
const BASE_MARSH_PER_SHOT = 1;
const BASE_POLLEN_PER_MALLOW = 2; // Pollen from marshmallow interaction
const BASE_CARAMEL_PER_COMBO = 1; // Caramel from combo chains

/**
 * Awards marsh currency for shooting the marsh floor.
 * Marsh is the basic currency earned from floor shots.
 */
export function awardMarshMultiplier(multiplier = 1.0) {
  const baseMarsh = BASE_MARSH_PER_SHOT;
  const upgradeBonus = getUpgradeEffect('marsh_reward', gameState.upgrades.marsh_reward || 0);
  
  const marsh = Math.floor(baseMarsh * (1 + upgradeBonus) * multiplier);
  gameState.currencies.marsh += marsh;
  
  saveGame();
  return marsh;
}

export function awardMarsh() {
  return awardMarshMultiplier(1.0);
}

/**
 * Awards pollen for shooting the marshmallow friend.
 * Pollen is earned from marshmallow interactions and used for cosmetics.
 */
export function awardPollen(amount = null, customMultiplier = 1.0) {
  const basePollen = BASE_POLLEN_PER_MALLOW;
  const raw = (amount !== null && !isNaN(amount)) ? Math.max(0, amount) : basePollen;
  const upgradeBonus = getUpgradeEffect('pollen_multiplier', gameState.upgrades.pollen_multiplier || 0);
  
  const pollen = Math.floor(raw * (1 + upgradeBonus) * customMultiplier);
  gameState.currencies.pollen += pollen;
  
  saveGame();
  return pollen;
}

/**
 * Awards caramel for combo chains and special achievements.
 * Caramel is the premium currency used for permanent upgrades.
 */
export function awardCaramel(amount = BASE_CARAMEL_PER_COMBO) {
  const upgradeBonus = getUpgradeEffect('caramel_bonus', gameState.upgrades.caramel_bonus || 0);
  const caramel = Math.floor(amount * (1 + upgradeBonus));
  
  gameState.currencies.caramel += caramel;
  
  // First caramel notification
  if (gameState.currencies.caramel === caramel && !gameState.milestones?.firstCaramel) {
    if (!gameState.milestones) gameState.milestones = {};
    gameState.milestones.firstCaramel = true;
    if (session.notifications) {
      session.notifications.add({
        id: 'first_caramel',
        sticky: true,
        title: '🍯 CARAMEL UNLOCKED! 🍯',
        text: 'You earned premium currency! Spend it on powerful upgrades!',
        color: '#ff8c00'
      });
    }
  }
  
  saveGame();
  return caramel;
}

/**
 * Currency conversion shop functions
 */
export const CONVERSION_RATES = {
  MARSH_TO_POLLEN: 10,    // 10 marsh = 1 pollen
  POLLEN_TO_MARSH: 5,     // 1 pollen = 5 marsh
  MARSH_TO_CARAMEL: 100,  // 100 marsh = 1 caramel
};

export function convertCurrency(from, to, amount) {
  const key = `${from.toUpperCase()}_TO_${to.toUpperCase()}`;
  const rate = CONVERSION_RATES[key];
  
  if (!rate) return false;
  
  const cost = amount * rate;
  if (gameState.currencies[from] < cost) return false;
  
  gameState.currencies[from] -= cost;
  gameState.currencies[to] += amount;
  
  saveGame();
  return true;
}