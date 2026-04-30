import { gameState } from '../state.js';
import { getUpgradeEffect } from './upgrade-calculator.js';

export function getWeaponDamageBonus() {
  return 0; // Removed from upgrades
}

export function getWeaponFireRateMultiplier() {
  return 1; // Removed from upgrades
}

export function getCriticalHitChance() {
  return 0; // Removed from upgrades
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