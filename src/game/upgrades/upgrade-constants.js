// Cost and effect formulas for each upgrade

export const UPGRADE_COSTS = {
  pollen_multiplier: {
    baseCost: 20,
    multiplier: 1.6
  },
  wave_duration: {
    baseCost: 50,
    multiplier: 1.9
  },
  caramel_bonus: {
    baseCost: 35,
    multiplier: 1.7
  }
};

export const UPGRADE_EFFECTS = {
  pollen_multiplier: {
    perLevel: 0.2 // 20% more pollen
  },
  wave_duration: {
    perLevel: 5 // +5 seconds
  },
  caramel_bonus: {
    perLevel: 0.2 // 20% more caramel
  }
};

export const MAX_UPGRADE_LEVELS = {
  pollen_multiplier: 999,
  wave_duration: 8, // Max +40 seconds
  caramel_bonus: 999
};