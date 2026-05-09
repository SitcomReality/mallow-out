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
    shortDesc: '+25% fire rate',
    prerequisite: 'auto_shooter_unlock'
  },

  AUTO_SHOOTER_VALUE: {
    id: 'auto_shooter_value',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Shooter Power',
    description: 'Increase auto shooter marsh reward',
    shortDesc: '+20% value',
    prerequisite: 'auto_shooter_unlock'
  },

  // Comet Automation
  COMET_UNLOCK: {
    id: 'comet_unlock',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Comet Strike',
    description: 'Unlock comet strikes that damage marshmallow',
    shortDesc: 'Unlocks automation',
    maxLevel: 1
  },

  COMET_RATE: {
    id: 'comet_rate',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Comet Frequency',
    description: 'Increase comet strike frequency',
    shortDesc: '+25% fire rate',
    prerequisite: 'comet_unlock'
  },

  COMET_POWER: {
    id: 'comet_power',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Comet Power',
    description: 'Increase comet damage and healing',
    shortDesc: '+30% power',
    prerequisite: 'comet_unlock'
  },

  // Laser Automation
  LASER_UNLOCK: {
    id: 'laser_unlock',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Laser Beam',
    description: 'Unlock precision laser that carves marshmallow',
    shortDesc: 'Unlocks automation',
    maxLevel: 1
  },

  LASER_RATE: {
    id: 'laser_rate',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Laser Speed',
    description: 'Increase laser fire rate',
    shortDesc: '+25% fire rate',
    prerequisite: 'laser_unlock'
  },

  LASER_POWER: {
    id: 'laser_power',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Laser Intensity',
    description: 'Increase laser healing and pollen',
    shortDesc: '+30% power',
    prerequisite: 'laser_unlock'
  },

  // Treat Dispenser
  TREAT_DISPENSER_UNLOCK: {
    id: 'treat_dispenser_unlock',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Treat Dispenser',
    description: 'Auto-buy treats when you can afford them',
    shortDesc: 'Unlocks automation',
    maxLevel: 1
  },

  TREAT_DISPENSER_DISCOUNT: {
    id: 'treat_dispenser_discount',
    category: UPGRADE_CATEGORIES.AUTOMATION,
    name: 'Bulk Discount',
    description: 'Reduce cost of auto-purchased treats',
    shortDesc: '-10% cost',
    prerequisite: 'treat_dispenser_unlock'
  },

  // Player Charged Shot
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