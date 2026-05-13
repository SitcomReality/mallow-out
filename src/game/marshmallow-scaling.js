// Health scaling for active shooting gameplay
const BASE_MARSHMALLOW_HEALTH = 60;

export function getMarshmallowHealth(totalDestroyed) {
  // Progressive scaling: each marshmallow gets slightly tougher
  const scale = 1.0 + Math.floor(totalDestroyed / 5) * 0.15;
  return Math.floor(BASE_MARSHMALLOW_HEALTH * scale);
}