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
  },

  MARSH_REWARD: {
    id: 'marsh_reward',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Marsh Bounty',
    icon: '💧',
    description: 'Increase marsh currency from floor shots',
    shortDesc: '+1 marsh per level'
  },

  SHOT_COOLDOWN: {
    id: 'shot_cooldown',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Quick Shot',
    icon: '⚡',
    description: 'Reduce cooldown between shots',
    shortDesc: '-10% cooldown per level'
  },

  MALLOW_HEAL: {
    id: 'mallow_heal',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Love Boost',
    icon: '💖',
    description: 'Increase health restored when shooting marshmallow',
    shortDesc: '+25% heal per level'
  },

  HIT_PROTECTION: {
    id: 'hit_protection',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Hit Protection',
    icon: '🛡️',
    description: 'Increase time before marshmallow loses health after being shot',
    shortDesc: '+0.5s protection per level'
  },

  HEALTH_REGEN: {
    id: 'health_regen',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Slow Melt',
    icon: '❄️',
    description: 'Reduce marshmallow health loss rate',
    shortDesc: '+50% slower loss per level'
  }
};

export const ALL_UPGRADES = Object.values(UPGRADE_TYPES);

export function getUpgradeById(id) {
  return ALL_UPGRADES.find(u => u.id === id) || null;
}