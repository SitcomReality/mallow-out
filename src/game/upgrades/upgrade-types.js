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
    description: 'Reduce cooldown between shots',
    shortDesc: '-10% cooldown'
  },

  COMBO_DURATION: {
    id: 'combo_duration',
    category: UPGRADE_CATEGORIES.PLAYER,
    name: 'Combo Master',
    description: 'Increase time window for combo chain',
    shortDesc: '+0.5s combo window'
  },

  // Marshmallow Upgrades
  MALLOW_HEAL: {
    id: 'mallow_heal',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Love Boost',
    description: 'Increase health restored when shooting marshmallow',
    shortDesc: '+25% heal'
  },

  HIT_PROTECTION: {
    id: 'hit_protection',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Hit Protection',
    description: 'Increase time before marshmallow loses health after being shot',
    shortDesc: '+0.5s protection'
  },

  HEALTH_REGEN: {
    id: 'health_regen',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Slow Melt',
    description: 'Reduce marshmallow health loss rate',
    shortDesc: '+50% slower loss'
  },

  MALLOW_MAX_HEALTH: {
    id: 'mallow_max_health',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Hardy Mallow',
    description: 'Increase marshmallow maximum health',
    shortDesc: '+20% max HP'
  },

  // Economy Upgrades
  POLLEN_MULTIPLIER: {
    id: 'pollen_multiplier',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Pollen Collector',
    description: 'Increase pollen earned from marshmallow interactions',
    shortDesc: '+20% pollen'
  },

  CARAMEL_BONUS: {
    id: 'caramel_bonus',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Sweet Rewards',
    description: 'Increase caramel earned from combos',
    shortDesc: '+20% caramel'
  },

  MARSH_REWARD: {
    id: 'marsh_reward',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Marsh Bounty',
    description: 'Increase marsh currency from floor shots',
    shortDesc: '+1 marsh'
  },

  // Automation Upgrades
  AUTO_SHOOTER_UNLOCK: {
    id: 'auto_shooter_unlock',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Auto Shooter',
    description: 'Unlock automatic marsh shooter',
    shortDesc: 'Unlocks automation',
    maxLevel: 1
  },

  AUTO_SHOOTER_RATE: {
    id: 'auto_shooter_rate',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Shooter Speed',
    description: 'Increase auto shooter fire rate',
    shortDesc: '+20% fire rate',
    prerequisite: 'auto_shooter_unlock'
  },

  AUTO_SHOOTER_VALUE: {
    id: 'auto_shooter_value',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Shooter Power',
    description: 'Increase auto shooter marsh reward',
    shortDesc: '+10% value',
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