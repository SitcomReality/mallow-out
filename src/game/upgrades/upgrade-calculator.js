import { UPGRADE_COSTS, UPGRADE_EFFECTS, MAX_UPGRADE_LEVELS } from './upgrade-constants.js';

export function getUpgradeCost(upgradeId, currentLevel) {
  const config = UPGRADE_COSTS[upgradeId];
  if (!config) return 0;
  
  return Math.floor(config.baseCost * Math.pow(config.multiplier, currentLevel));
}

export function getUpgradeEffect(upgradeId, level) {
  const config = UPGRADE_EFFECTS[upgradeId];
  if (!config) return 0;
  
  return config.perLevel * level;
}

export function canAffordUpgrade(upgradeId, currentLevel, caramelAmount) {
  const cost = getUpgradeCost(upgradeId, currentLevel);
  return caramelAmount >= cost;
}

export function getMaxLevel(upgradeId) {
  return MAX_UPGRADE_LEVELS[upgradeId] || 999;
}

export function isMaxLevel(upgradeId, currentLevel) {
  return currentLevel >= getMaxLevel(upgradeId);
}