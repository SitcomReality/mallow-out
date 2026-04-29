import { gameState } from '../state.js';
import { getUpgradeEffect } from './upgrade-calculator.js';

export function getWeaponDamageBonus() {
  // Flat damage bonus from upgrades
  return getUpgradeEffect('damage', gameState.upgrades.damage || 0);
}

export function getWeaponFireRateMultiplier() {
  // Fire rate multiplier (lower = faster)
  const fireRateBonus = getUpgradeEffect('fire_rate', gameState.upgrades.fire_rate || 0);
  return 1 - fireRateBonus;
}

export function getCriticalHitChance() {
  return getUpgradeEffect('crit_chance', gameState.upgrades.crit_chance || 0);
}

export function rollCriticalHit() {
  const chance = getCriticalHitChance();
  return Math.random() < chance;
}

export function applyCriticalMultiplier(damage) {
  if (rollCriticalHit()) {
    return damage * 2; // Critical hits do 2x damage
  }
  return damage;
}