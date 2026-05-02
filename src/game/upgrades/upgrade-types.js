// Upgrade type definitions with categories and properties
export const UPGRADE_CATEGORIES = {
  ECONOMY: 'economy',
};

export const UPGRADE_TYPES = {
  // Economy Upgrades
  POLLEN_MULTIPLIER: {
    id: 'pollen_multiplier',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Pollen Collector',
    icon: '🌼',
    description: 'Increase pollen earned from damage',
    shortDesc: '+20% pollen per level'
  },

  CARAMEL_BONUS: {
    id: 'caramel_bonus',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Sweet Rewards',
    icon: '🍯',
    description: 'Increase caramel earned from kills',
    shortDesc: '+20% caramel per level'
  }
};

export const ALL_UPGRADES = Object.values(UPGRADE_TYPES);

export function getUpgradeById(id) {
  return ALL_UPGRADES.find(u => u.id === id) || null;
}