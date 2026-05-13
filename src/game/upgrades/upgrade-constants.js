// Cost and effect formulas for each upgrade

export const UPGRADE_COSTS = {
  // Player
  shot_cooldown: { baseCost: 10, multiplier: 1.5 },
  combo_duration: { baseCost: 15, multiplier: 1.4 },
  charge_speed: { baseCost: 20, multiplier: 1.5 },
  
  // Marshmallow
  mallow_max_health: { baseCost: 5, multiplier: 1.3 },
};

export const UPGRADE_EFFECTS = {
  // Player
  shot_cooldown: { perLevel: 0.15 }, // -15% cooldown
  combo_duration: { perLevel: 0.5 }, // +0.5s combo window
  charge_speed: { perLevel: 0.15 }, // -15% charge time
  
  // Marshmallow
  mallow_max_health: { perLevel: 0.25 }, // +25% max HP
};

export const MAX_UPGRADE_LEVELS = {
  // Player
  shot_cooldown: 6,
  combo_duration: 10,
  charge_speed: 6,
  
  // Marshmallow
  mallow_max_health: 999,
};