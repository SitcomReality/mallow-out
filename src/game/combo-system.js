import { gameState } from './state.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';

const BASE_COMBO_WINDOW = 2.0; // seconds
const COMBO_MULTIPLIER_PER_HIT = 0.1; // +10% per combo level

export function updateComboSystem(delta) {
  if (gameState.combo.timer > 0) {
    gameState.combo.timer -= delta;
    
    if (gameState.combo.timer <= 0) {
      resetCombo();
    }
  }
}

export function registerHit(type = 'marshmallow') {
  const windowBonus = getUpgradeEffect('combo_duration', gameState.upgrades.combo_duration || 0);
  const comboWindow = BASE_COMBO_WINDOW + windowBonus;
  
  if (gameState.combo.timer > 0) {
    gameState.combo.count++;
  } else {
    gameState.combo.count = 1;
  }
  
  gameState.combo.timer = comboWindow;
  gameState.combo.type = type;
}

export function getComboMultiplier() {
  if (gameState.combo.count <= 1) return 1.0;
  
  return 1.0 + (gameState.combo.count - 1) * COMBO_MULTIPLIER_PER_HIT;
}

export function resetCombo() {
  gameState.combo.count = 0;
  gameState.combo.timer = 0;
  gameState.combo.type = null;
}

export function getComboInfo() {
  return {
    count: gameState.combo.count,
    multiplier: getComboMultiplier(),
    active: gameState.combo.timer > 0,
  };
}