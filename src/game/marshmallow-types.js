export const MARSHMALLOW_TYPES = {
  STANDARD: {
    id: 'standard',
    name: 'Standard Marshmallow',
    rarity: 'common',
    color: { hue: 0.0, satMin: 0.8, satMax: 1.0, lightMin: 0.7, lightMax: 0.9 }, // Vibrant Pinks/Reds
    sizeMultiplier: { min: 0.9, max: 1.1 },
    speedMultiplier: { min: 0.8, max: 1.2 },
    movementPattern: 'wandering',
    rewardMultiplier: 1.0,
    weight: 50,
  },
  
  FRANTIC: {
    id: 'frantic',
    name: 'Frantic Marshmallow',
    rarity: 'common',
    color: { hue: 0.1, satMin: 0.8, satMax: 1.0, lightMin: 0.6, lightMax: 0.8 }, // Electric Orange
    sizeMultiplier: { min: 0.8, max: 0.95 },
    speedMultiplier: { min: 1.5, max: 2.0 },
    movementPattern: 'frantic',
    rewardMultiplier: 1.0,
    weight: 20,
  },
  
  SHY: {
    id: 'shy',
    name: 'Shy Marshmallow',
    rarity: 'uncommon',
    color: { hue: 0.6, satMin: 0.8, satMax: 1.0, lightMin: 0.7, lightMax: 0.9 }, // Neon Cyan
    sizeMultiplier: { min: 0.85, max: 1.0 },
    speedMultiplier: { min: 1.0, max: 1.3 },
    movementPattern: 'fleeing',
    rewardMultiplier: 1.0,
    weight: 15,
  },
  
  LONG: {
    id: 'long',
    name: 'Long Marshmallow',
    rarity: 'uncommon',
    color: { hue: 0.8, satMin: 0.8, satMax: 1.0, lightMin: 0.6, lightMax: 0.8 }, // Royal Purple
    sizeMultiplier: { min: 0.7, max: 0.85 },
    heightMultiplier: { min: 1.5, max: 1.8 },
    speedMultiplier: { min: 0.7, max: 0.9 },
    movementPattern: 'wandering',
    rewardMultiplier: 1.0,
    weight: 10,
  },
  
  FLOATY: {
    id: 'floaty',
    name: 'Floaty Marshmallow',
    rarity: 'rare',
    color: { hue: 0.15, satMin: 0.9, satMax: 1.0, lightMin: 0.5, lightMax: 0.7 }, // Golden Yellow
    sizeMultiplier: { min: 1.1, max: 1.3 },
    speedMultiplier: { min: 0.5, max: 0.7 },
    bobAmplitude: { min: 0.8, max: 1.2 },
    movementPattern: 'wandering',
    rewardMultiplier: 2.0,
    weight: 3,
  },
  
  FRIENDLY: {
    id: 'friendly',
    name: 'Friendly Marshmallow',
    rarity: 'rare',
    color: { hue: 0.3, satMin: 0.8, satMax: 1.0, lightMin: 0.6, lightMax: 0.8 }, // Radioactive Green
    sizeMultiplier: { min: 0.95, max: 1.15 },
    speedMultiplier: { min: 0.3, max: 0.6 },
    movementPattern: 'approaching',
    rewardMultiplier: 1.5,
    weight: 2,
  },
};

export const ALL_MARSHMALLOW_TYPES = Object.values(MARSHMALLOW_TYPES);