 // Game constants for easy tuning
export const CONSTANTS = {
  // Player
  PLAYER_HEIGHT: 1.6,
  PLAYER_SPEED: 4.0,
  PLAYER_SPRINT_MULT: 1.8,
  MOUSE_SENSITIVITY: 0.002,
  
  // Weapons
  GUN_DAMAGE_RADIUS: 0.15,
  GUN_DAMAGE_LENGTH: 2.0,
  GUN_FIRE_RATE: 0.15, // seconds between shots
  GUN_RANGE: 100,
  
  FLAME_LENGTH: 4.0,
  FLAME_RADIUS: 0.8,
  FLAME_NOISE_SCALE: 2.0,
  FLAME_NOISE_SPEED: 8.0,
  FLAME_DAMAGE_RATE: 0.05, // seconds between damage ticks
  FLAME_DAMAGE_RADIUS: 0.1,
  
  // Enemies (flattened disc-like)
  ENEMY_SPAWN_DISTANCE: 30,
  ENEMY_MAX_COUNT: 1,
  ENEMY_SPAWN_INTERVAL: 3.0,
  ENEMY_MOVE_SPEED: 2.0,
  ENEMY_RADIUS: 1.2,    // Radius of the "face" circle
  ENEMY_HEIGHT: 0.3,    // Thickness of the disc
  ENEMY_HEALTH: 5,      // number of hits to kill
  
  // Effects
  MELT_EFFECT_SPEED: 2.0,
  BLOOD_SPLATTER_SIZE: 0.5,
  BLOOD_DECAY_TIME: 3.0,
};