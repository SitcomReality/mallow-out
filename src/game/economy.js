import { gameState } from './state.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';
import { saveGame } from './persistence.js';
import { session } from './manager.js';

// Base earning rates (rebalanced for incremental gameplay)
const BASE_MARSH_PER_SHOT = 1;
const BASE_POLLEN_PER_SHOT = 5;
const CARAMEL_CONVERSION_RATE = 100; // 100 pollen = 1 caramel

/**
 * Awards marsh currency for shooting the marsh floor
 */
export function awardMarsh() {
  const baseMarsh = BASE_MARSH_PER_SHOT;
  const upgradeBonus = getUpgradeEffect('marsh_reward', gameState.upgrades.marsh_reward || 0);
  const comboMult = 1; // Could add combo system later
  
  const marsh = Math.floor(baseMarsh * (1 + upgradeBonus) * comboMult);
  gameState.currencies.marsh += marsh;
  
  // Auto-convert excess marsh to caramel at a very high threshold for late game
  if (gameState.currencies.marsh > 10000) {
    const excess = gameState.currencies.marsh - 10000;
    const caramelBonus = Math.floor(excess / 1000);
    if (caramelBonus > 0) {
      gameState.currencies.caramel += caramelBonus;
      gameState.currencies.marsh -= caramelBonus * 1000;
    }
  }
  
  saveGame();
  return marsh;
}

/**
 * Awards pollen for shooting the marshmallow friend
 */
export function awardPollen() {
  const basePollen = BASE_POLLEN_PER_SHOT;
  const upgradeBonus = getUpgradeEffect('pollen_multiplier', gameState.upgrades.pollen_multiplier || 0);
  
  const pollen = Math.floor(basePollen * (1 + upgradeBonus));
  gameState.currencies.pollen += pollen;
  
  // Convert pollen to caramel at the conversion rate
  if (gameState.currencies.pollen >= CARAMEL_CONVERSION_RATE) {
    const caramelEarned = Math.floor(gameState.currencies.pollen / CARAMEL_CONVERSION_RATE);
    gameState.currencies.caramel += caramelEarned;
    gameState.currencies.pollen -= caramelEarned * CARAMEL_CONVERSION_RATE;
    
    if (session.notifications && caramelEarned > 0) {
      session.notifications.add({
        id: 'caramel_gain',
        sticky: false,
        title: 'Caramel Crystallized',
        text: `Converted {v} pollen into caramel!`,
        value: caramelEarned * CARAMEL_CONVERSION_RATE,
        color: '#ff8c00'
      });
    }
  }
  
  saveGame();
  return pollen;
}

/**
 * Awards caramel when a marshmallow is defeated.
 * This was added so manager.onMarshmallowDefeated can import awardCaramel().
 * The amount is derived from upgrades and a base reward tied to total destroyed.
 */
export function awardCaramel() {
  // Base caramel reward for defeating a marshmallow (scaled mildly by progression)
  const baseCaramel = 1;
  const progressBonus = Math.floor(gameState.totalMarshmallowsDestroyed / 10); // small milestone bonus
  const upgradeBonus = getUpgradeEffect('caramel_bonus', gameState.upgrades.caramel_bonus || 0);
  
  const caramel = Math.max(1, Math.floor((baseCaramel + progressBonus) * (1 + upgradeBonus)));
  gameState.currencies.caramel += caramel;
  
  if (session.notifications && caramel > 0) {
    session.notifications.add({
      id: 'caramel_from_defeat',
      sticky: false,
      title: 'Caramel Reward',
      text: `You gained ${caramel} caramel for defeating a marshmallow!`,
      value: caramel,
      color: '#ff8c00'
    });
  }
  
  saveGame();
  return caramel;
}