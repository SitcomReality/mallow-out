// Upgrade type definitions with categories and properties
export const UPGRADE_CATEGORIES = {
  WEAPON: 'weapon',
  ECONOMY: 'economy',
  MARSHMALLOW: 'marshmallow'
};

export const UPGRADE_TYPES = {
  // Weapon Upgrades (apply to all weapons)
  DAMAGE: {
    id: 'damage',
    category: UPGRADE_CATEGORIES.WEAPON,
    name: 'Damage Boost',
    icon: '💥',
    description: 'Increase damage dealt by all weapons',
    shortDesc: '+1 damage per level'
  },
  FIRE_RATE: {
    id: 'fire_rate',
    category: UPGRADE_CATEGORIES.WEAPON,
    name: 'Fire Rate',
    icon: '⚡',
    description: 'Reduce cooldown between shots',
    shortDesc: '10% faster per level'
  },
  CRIT_CHANCE: {
    id: 'crit_chance',
    category: UPGRADE_CATEGORIES.WEAPON,
    name: 'Critical Chance',
    icon: '🎯',
    description: 'Chance to deal double damage',
    shortDesc: '+5% crit chance per level'
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
  WAVE_DURATION: {
    id: 'wave_duration',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Time Extension',
    icon: '⏰',
    description: 'Start waves with more time',
    shortDesc: '+5 seconds per level'
  },
  CARAMEL_BONUS: {
    id: 'caramel_bonus',
    category: UPGRADE_CATEGORIES.ECONOMY,
    name: 'Sweet Rewards',
    icon: '🍯',
    description: 'Increase caramel earned from kills',
    shortDesc: '+20% caramel per level'
  },
  
  // Marshmallow Upgrades
  MOVE_SPEED: {
    id: 'move_speed',
    category: UPGRADE_CATEGORIES.MARSHMALLOW,
    name: 'Quick Feet',
    icon: '👟',
    description: 'Move faster around the marsh',
    shortDesc: '+20% speed per level'
  }
};

export const ALL_UPGRADES = Object.values(UPGRADE_TYPES);

export function getUpgradeById(id) {
  return ALL_UPGRADES.find(u => u.id === id) || null;
}