// Upgrade type definitions with categories and properties
export const UPGRADE_CATEGORIES = {
  PLAYER: 'player',
  MARSHMALLOW: 'marshmallow',
  ECONOMY: 'economy',
  AUTOMATION: 'automation',
};

export const UPGRADE_TYPES = {
  // Player Upgrades
  SHOT_COOLDOWN: {
    id: 'shot_cooldown',
    category: UPGRADE_CATEGORIES.PLAYER,
    name: 'Quick Shot',
    icon: '⚡',
    description: 'Reduce cooldown between shots',
    shortDesc: '-10% cooldown per level'
  },

  COMBO_DURATION: {
    id: 'combo_duration',
    category: UPGRADE_CATEGORIES.PLAYER,
    name: 'Combo Master',
    icon: '🎯',
    description: 'Increase time window for combo chain',
    shortDesc: '+0.5s combo window per level'
  },

  // Marshmallow Upgrades
  MALLOW_HEAL: {
    id: 'mallow_heal',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Love Boost',
    icon: '💖',
    description: 'Increase health restored when shooting marshmallow',
    shortDesc: '+25% heal per level'
  },

  HIT_PROTECTION: {
    id: 'hit_protection',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Hit Protection',
    icon: '🛡️',
    description: 'Increase time before marshmallow loses health after being shot',
    shortDesc: '+0.5s protection per level'
  },

  HEALTH_REGEN: {
    id: 'health_regen',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Slow Melt',
    icon: '❄️',
    description: 'Reduce marshmallow health loss rate',
    shortDesc: '+50% slower loss per level'
  },

  MALLOW_MAX_HEALTH: {
    id: 'mallow_max_health',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Hardy Mallow',
    icon: '💪',
    description: 'Increase marshmallow maximum health',
    shortDesc: '+20% max HP per level'
  },

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

  // Automation Upgrades
  AUTO_SHOOTER_UNLOCK: {
    id: 'auto_shooter_unlock',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Auto Shooter',
    icon: '🔫',
    description: 'Unlock automatic marsh shooter',
    shortDesc: 'Unlocks automation (one-time)',
    maxLevel: 1
  },

  AUTO_SHOOTER_RATE: {
    id: 'auto_shooter_rate',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Shooter Speed',
    icon: '💨',
    description: 'Increase auto shooter fire rate',
    shortDesc: '+20% fire rate per level',
    prerequisite: 'auto_shooter_unlock'
  },

  AUTO_SHOOTER_VALUE: {
    id: 'auto_shooter_value',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Shooter Power',
    icon: '💥',
    description: 'Increase auto shooter marsh reward',
    shortDesc: '+10% value per level',
    prerequisite: 'auto_shooter_unlock'
  },
};

export const ALL_UPGRADES = Object.values(UPGRADE_TYPES);

export function getUpgradeById(id) {
  return ALL_UPGRADES.find(u => u.id === id) || null;
}

export function getUpgradesByCategory(category) {
  return ALL_UPGRADES.filter(u => u.category === category);
}