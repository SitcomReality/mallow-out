// Upgrade type definitions with categories and properties
export const UPGRADE_CATEGORIES = {
  PLAYER: 'player',
};

export const UPGRADE_TYPES = {
  // Player Upgrades
  SHOT_COOLDOWN: {
    id: 'shot_cooldown',
    category: UPGRADE_CATEGORIES.PLAYER,
    name: 'Quick Shot',
    description: 'Reduce cooldown between shots',
    shortDesc: '-15% cooldown'
  },

  COMBO_DURATION: {
    id: 'combo_duration',
    category: UPGRADE_CATEGORIES.PLAYER,
    name: 'Combo Master',
    description: 'Increase time window for combo chain',
    shortDesc: '+0.5s combo window'
  },

  CHARGE_SPEED: {
    id: 'charge_speed',
    category: UPGRADE_CATEGORIES.PLAYER,
    name: 'Fast Charge',
    description: 'Reduce time to fully charge shot',
    shortDesc: '-15% charge time'
  },
};

export const ALL_UPGRADES = Object.values(UPGRADE_TYPES);

export function getUpgradeById(id) {
  return ALL_UPGRADES.find(u => u.id === id) || null;
}

export function getUpgradesByCategory(category) {
  return ALL_UPGRADES.filter(u => u.category === category);
}