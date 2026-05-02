export const MARSHMALLOW_TYPES = {
  STANDARD: {
    id: 'standard',
    name: 'Standard Marshmallow',
    rarity: 'common',
    color: { hue: 0.0, satMin: 0.8, satMax: 1.0, lightMin: 0.7, lightMax: 0.9 }, // Vibrant Pinks/Reds
    rewardMultiplier: 1.0,
    weight: 90,
  },
  
  GOLDEN: {
    id: 'golden',
    name: 'Golden Marshmallow',
    rarity: 'rare',
    color: { hue: 0.12, satMin: 0.9, satMax: 1.0, lightMin: 0.5, lightMax: 0.7 }, // Rich Gold
    rewardMultiplier: 5.0,
    weight: 10,
  },
};

export const ALL_MARSHMALLOW_TYPES = Object.values(MARSHMALLOW_TYPES);