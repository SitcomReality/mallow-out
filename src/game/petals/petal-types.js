export const PETAL_TYPES = {
  CARAMEL_BURST: {
    id: 'caramel_burst',
    name: 'Caramel Burst',
    rarity: 'common',
    cost: 50,
    icon: '🍯',
    description: 'Instantly gain +20 Caramel',
  },
  NEXT_KILL_BONUS: {
    id: 'next_kill_bonus',
    name: 'Sweet Tooth',
    rarity: 'common',
    cost: 60,
    icon: '🍬',
    description: 'Next kill awards 2x Caramel',
  },
  DAMAGE_BOOST: {
    id: 'damage_boost',
    name: 'Power Petal',
    rarity: 'uncommon',
    cost: 80,
    icon: '⚡',
    description: '+50% damage for 10 seconds',
  },
  FIRE_RATE_BOOST: {
    id: 'fire_rate_boost',
    name: 'Rapid Bloom',
    rarity: 'uncommon',
    cost: 75,
    icon: '🌸',
    description: 'Weapon cooldowns 50% faster for 15 seconds',
  },
  TIME_EXTENSION: {
    id: 'time_extension',
    name: 'Chronos Petal',
    rarity: 'rare',
    cost: 120,
    icon: '⏰',
    description: 'Add +10 seconds to wave timer',
  },
  SLOW_MOTION: {
    id: 'slow_motion',
    name: 'Sticky Sap',
    rarity: 'common',
    cost: 45,
    icon: '🍯',
    description: 'Marshmallows move 50% slower for 8 seconds',
  },
  GUARANTEED_RARE: {
    id: 'guaranteed_rare',
    name: 'Lucky Clover',
    rarity: 'rare',
    cost: 150,
    icon: '🍀',
    description: 'Next marshmallow is guaranteed Floaty (2x rewards)',
  },
  POLLEN_MULTIPLIER: {
    id: 'pollen_multiplier',
    name: 'Golden Petal',
    rarity: 'uncommon',
    cost: 90,
    icon: '🌼',
    description: '+100% Pollen earned for 12 seconds',
  },
};

// Array for easy iteration
export const ALL_PETALS = Object.values(PETAL_TYPES);

// Helper to get petal by ID
export function getPetalById(id) {
  return ALL_PETALS.find(p => p.id === id) || null;
}