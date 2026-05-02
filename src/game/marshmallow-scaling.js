import { 
  BASE_MARSHMALLOW_HEALTH
} from './wave-constants.js';

export function getMarshmallowHealth(totalDestroyed) {
  // Scaling health slightly based on progression instead of waves
  const scale = 1.0 + Math.floor(totalDestroyed / 5) * 0.2;
  return Math.floor(BASE_MARSHMALLOW_HEALTH * scale);
}