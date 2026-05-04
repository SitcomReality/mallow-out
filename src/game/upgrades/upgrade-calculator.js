import { UPGRADE_COSTS, UPGRADE_EFFECTS, MAX_UPGRADE_LEVELS } from './upgrade-constants.js';
import { getUpgradeById } from './upgrade-types.js';
import { gameState } from '../state.js';

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

export function canPurchaseUpgrade(upgradeId, currentLevel, caramelAmount) {
  if (isMaxLevel(upgradeId, currentLevel)) return false;
  
  const upgrade = getUpgradeById(upgradeId);
  if (upgrade && upgrade.prerequisite) {
    const prereqLevel = gameState.upgrades[upgrade.prerequisite] || 0;
    if (prereqLevel === 0) return false;
  }
  
  return canAffordUpgrade(upgradeId, currentLevel, caramelAmount);
}

export function getMaxLevel(upgradeId) {
  return MAX_UPGRADE_LEVELS[upgradeId] || 999;
}

export function isMaxLevel(upgradeId, currentLevel) {
  return currentLevel >= getMaxLevel(upgradeId);
}