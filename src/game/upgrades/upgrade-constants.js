// Cost and effect formulas for each upgrade

export const UPGRADE_COSTS = {
  damage: {
    baseCost: 25,
    multiplier: 1.6
  },
  fire_rate: {
    baseCost: 30,
    multiplier: 1.7
  },
  crit_chance: {
    baseCost: 40,
    multiplier: 1.8
  },
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
  },
  move_speed: {
    baseCost: 15,
    multiplier: 1.5
  }
};

export const UPGRADE_EFFECTS = {
  damage: {
    perLevel: 1 // +1 flat damage
  },
  fire_rate: {
    perLevel: 0.1 // 10% faster (0.9x cooldown)
  },
  crit_chance: {
    perLevel: 0.05 // 5% crit chance
  },
  pollen_multiplier: {
    perLevel: 0.2 // 20% more pollen
  },
  wave_duration: {
    perLevel: 5 // +5 seconds
  },
  caramel_bonus: {
    perLevel: 0.2 // 20% more caramel
  },
  move_speed: {
    perLevel: 0.2 // 20% faster
  }
};

export const MAX_UPGRADE_LEVELS = {
  damage: 999,
  fire_rate: 10,
  crit_chance: 10, // Max 50% crit
  pollen_multiplier: 999,
  wave_duration: 8, // Max +40 seconds
  caramel_bonus: 999,
  move_speed: 5 // Max +100% speed
};