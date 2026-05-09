// Cost and effect formulas for each upgrade

export const UPGRADE_COSTS = {
  // Player
  shot_cooldown: { baseCost: 50, multiplier: 1.5 },
  combo_duration: { baseCost: 40, multiplier: 1.4 },
  
  // Marshmallow
  mallow_heal: { baseCost: 30, multiplier: 1.4 },
  hit_protection: { baseCost: 35, multiplier: 1.4 },
  health_regen: { baseCost: 40, multiplier: 1.5 },
  mallow_max_health: { baseCost: 25, multiplier: 1.3 },
  
  // Economy
  pollen_multiplier: { baseCost: 5, multiplier: 1.5 },
  caramel_bonus: { baseCost: 10, multiplier: 1.6 },
  marsh_reward: { baseCost: 15, multiplier: 1.4 },
  
  // Automation
  auto_shooter_unlock: { baseCost: 100, multiplier: 1.0 },
  auto_shooter_rate: { baseCost: 50, multiplier: 1.5 },
  auto_shooter_value: { baseCost: 35, multiplier: 1.4 },
  
  comet_unlock: { baseCost: 200, multiplier: 1.0 },
  comet_rate: { baseCost: 75, multiplier: 1.6 },
  comet_power: { baseCost: 60, multiplier: 1.5 },
  
  laser_unlock: { baseCost: 300, multiplier: 1.0 },
  laser_rate: { baseCost: 100, multiplier: 1.6 },
  laser_power: { baseCost: 80, multiplier: 1.5 },
  
  treat_dispenser_unlock: { baseCost: 150, multiplier: 1.0 },
  treat_dispenser_discount: { baseCost: 50, multiplier: 1.4 },
  
  // Player
  charge_speed: { baseCost: 60, multiplier: 1.5 },
};

export const UPGRADE_EFFECTS = {
  // Player
  shot_cooldown: { perLevel: 0.15 }, // -15% cooldown
  combo_duration: { perLevel: 0.5 }, // +0.5s combo window
  charge_speed: { perLevel: 0.15 }, // -15% charge time
  
  // Marshmallow
  mallow_heal: { perLevel: 0.3 }, // +30% healing
  hit_protection: { perLevel: 1.0 }, // +1s protection
  health_regen: { perLevel: 0.5 }, // 50% slower health loss
  mallow_max_health: { perLevel: 0.25 }, // +25% max HP
  
  // Economy (with diminishing returns built in via cost scaling)
  pollen_multiplier: { perLevel: 0.25 }, // +25% pollen
  caramel_bonus: { perLevel: 0.15 }, // +15% caramel
  marsh_reward: { perLevel: 0.5 }, // +50% marsh per shot
  
  // Automation
  auto_shooter_unlock: { perLevel: 1.0 }, // Unlock flag
  auto_shooter_rate: { perLevel: 0.25 }, // +25% fire rate
  auto_shooter_value: { perLevel: 0.2 }, // +20% value
  
  comet_unlock: { perLevel: 1.0 },
  comet_rate: { perLevel: 0.25 },
  comet_power: { perLevel: 0.3 },
  
  laser_unlock: { perLevel: 1.0 },
  laser_rate: { perLevel: 0.25 },
  laser_power: { perLevel: 0.3 },
  
  treat_dispenser_unlock: { perLevel: 1.0 },
  treat_dispenser_discount: { perLevel: 0.1 }, // -10% cost
};

export const MAX_UPGRADE_LEVELS = {
  // Player
  shot_cooldown: 8, // Max 80% reduction
  combo_duration: 10,
  charge_speed: 10,
  
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
  
  comet_unlock: 1,
  comet_rate: 999,
  comet_power: 999,
  
  laser_unlock: 1,
  laser_rate: 999,
  laser_power: 999,
  
  treat_dispenser_unlock: 1,
  treat_dispenser_discount: 999,
};