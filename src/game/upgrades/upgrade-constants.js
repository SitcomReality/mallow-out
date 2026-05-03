// Cost and effect formulas for each upgrade

export const UPGRADE_COSTS = {
  pollen_multiplier: {
    baseCost: 20,
    multiplier: 1.6
  },
  caramel_bonus: {
    baseCost: 35,
    multiplier: 1.7
  },
  marsh_reward: {
    baseCost: 100,
    multiplier: 1.5
  },
  shot_cooldown: {
    baseCost: 150,
    multiplier: 1.8
  },
  mallow_heal: {
    baseCost: 200,
    multiplier: 1.6
  },
  hit_protection: {
    baseCost: 180,
    multiplier: 1.7
  },
  health_regen: {
    baseCost: 250,
    multiplier: 1.8
  }
};

export const UPGRADE_EFFECTS = {
  pollen_multiplier: {
    perLevel: 0.2 // 20% more pollen
  },
  caramel_bonus: {
    perLevel: 0.2 // 20% more caramel
  },
  marsh_reward: {
    perLevel: 1.0 // +1 marsh per shot
  },
  shot_cooldown: {
    perLevel: 0.1 // -10% cooldown
  },
  mallow_heal: {
    perLevel: 0.25 // +25% healing
  },
  hit_protection: {
    perLevel: 0.5 // +0.5s protection
  },
  health_regen: {
    perLevel: 0.5 // 50% slower health loss
  }
};

export const MAX_UPGRADE_LEVELS = {
  pollen_multiplier: 999,
  caramel_bonus: 999,
  marsh_reward: 999,
  shot_cooldown: 8, // Max 80% reduction
  mallow_heal: 999,
  hit_protection: 10,
  health_regen: 999
};