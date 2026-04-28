import { 
  BASE_MARSHMALLOW_HEALTH, 
  HEALTH_INCREASE_PER_WAVE, 
  HEALTH_INCREASE_PER_SPAWN 
} from './wave-constants.js';

export function getMarshmallowHealth(waveNumber, spawnIndex) {
  const baseHealth = BASE_MARSHMALLOW_HEALTH;
  const waveMultiplier = Math.pow(1 + HEALTH_INCREASE_PER_WAVE, waveNumber - 1);
  const spawnMultiplier = Math.pow(1 + HEALTH_INCREASE_PER_SPAWN, spawnIndex);
  
  return Math.floor(baseHealth * waveMultiplier * spawnMultiplier);
}