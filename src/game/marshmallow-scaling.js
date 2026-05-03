// Health scaling for the marshmallow pet
const BASE_MARSHMALLOW_HEALTH = 12;

export function getMarshmallowHealth(totalDestroyed) {
  const scale = 1.0 + Math.floor(totalDestroyed / 5) * 0.2;
  return Math.floor(BASE_MARSHMALLOW_HEALTH * scale);
}