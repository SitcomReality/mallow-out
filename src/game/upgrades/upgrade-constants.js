// Cost and effect formulas for each upgrade

export const UPGRADE_COSTS = {
  // Player
  shot_cooldown: { baseCost: 150, multiplier: 1.8 },
  combo_duration: { baseCost: 100, multiplier: 1.6 },
  
  // Marshmallow
  mallow_heal: { baseCost: 200, multiplier: 1.6 },
  hit_protection: { baseCost: 180, multiplier: 1.7 },
  health_regen: { baseCost: 250, multiplier: 1.8 },
  mallow_max_health: { baseCost: 300, multiplier: 1.7 },
  
  // Economy
  pollen_multiplier: { baseCost: 20, multiplier: 1.6 },
  caramel_bonus: { baseCost: 35, multiplier: 1.7 },
  marsh_reward: { baseCost: 100, multiplier: 1.5 },
  
  // Automation
  auto_shooter_unlock: { baseCost: 500, multiplier: 1.0 },
  auto_shooter_rate: { baseCost: 200, multiplier: 1.6 },
  auto_shooter_value: { baseCost: 150, multiplier: 1.5 },
};

export const UPGRADE_EFFECTS = {
  // Player
  shot_cooldown: { perLevel: 0.1 }, // -10% cooldown
  combo_duration: { perLevel: 0.5 }, // +0.5s combo window
  
  // Marshmallow
  mallow_heal: { perLevel: 0.25 }, // +25% healing
  hit_protection: { perLevel: 0.5 }, // +0.5s protection
  health_regen: { perLevel: 0.5 }, // 50% slower health loss
  mallow_max_health: { perLevel: 0.2 }, // +20% max HP
  
  // Economy
  pollen_multiplier: { perLevel: 0.2 }, // +20% pollen
  caramel_bonus: { perLevel: 0.2 }, // +20% caramel
  marsh_reward: { perLevel: 1.0 }, // +1 marsh per shot
  
  // Automation
  auto_shooter_unlock: { perLevel: 1.0 }, // Unlock flag
  auto_shooter_rate: { perLevel: 0.2 }, // +20% fire rate
  auto_shooter_value: { perLevel: 0.1 }, // +10% value
};

export const MAX_UPGRADE_LEVELS = {
  // Player
  shot_cooldown: 8, // Max 80% reduction
  combo_duration: 10,
  
  // Marshmallow
  mallow_heal: 999,
  hit_protection: 10,
  health_regen: 999,
  mallow_max_health: 999,
  
  // Economy
  pollen_multiplier: 999,
  caramel_bonus: 999,
  marsh_reward: 999,
  
  // Automation
  auto_shooter_unlock: 1, // One-time unlock
  auto_shooter_rate: 999,
  auto_shooter_value: 999,
};