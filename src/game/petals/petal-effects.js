import { gameState } from '../state.js';
import { 
  DAMAGE_BOOST_DURATION, 
  FIRE_RATE_BOOST_DURATION, 
  SLOW_MOTION_DURATION,
  POLLEN_MULTIPLIER_DURATION 
} from './petal-constants.js';

export function applyPetalEffect(petal) {
  switch (petal.id) {
    case 'caramel_burst':
      gameState.currencies.caramel += 20;
      break;
      
    case 'next_kill_bonus':
      gameState.nextKillBonus = true;
      break;
      
    case 'damage_boost':
      addTimedEffect({
        type: 'damage_boost',
        multiplier: 1.5,
        duration: DAMAGE_BOOST_DURATION,
        startTime: performance.now() * 0.001
      });
      break;
      
    case 'fire_rate_boost':
      addTimedEffect({
        type: 'fire_rate_boost',
        multiplier: 0.5, // 50% faster = 0.5x cooldown
        duration: FIRE_RATE_BOOST_DURATION,
        startTime: performance.now() * 0.001
      });
      break;
      
    case 'time_extension':
      // Time extension removed in endless mode, maybe award small currency bonus instead
      gameState.currencies.pollen += 25;
      break;
      
    case 'slow_motion':
      addTimedEffect({
        type: 'slow_motion',
        multiplier: 0.5,
        duration: SLOW_MOTION_DURATION,
        startTime: performance.now() * 0.001
      });
      break;
      
    case 'guaranteed_rare':
      gameState.guaranteedFloaty = true;
      break;
      
    case 'pollen_multiplier':
      addTimedEffect({
        type: 'pollen_multiplier',
        multiplier: 2.0,
        duration: POLLEN_MULTIPLIER_DURATION,
        startTime: performance.now() * 0.001
      });
      break;
  }
}

function addTimedEffect(effect) {
  gameState.activePetalEffects.push(effect);
}

export function updatePetalEffects(currentTime) {
  const toRemove = [];
  
  for (const effect of gameState.activePetalEffects) {
    const elapsed = currentTime - effect.startTime;
    if (elapsed >= effect.duration) {
      toRemove.push(effect);
    }
  }
  
  for (const effect of toRemove) {
    const idx = gameState.activePetalEffects.indexOf(effect);
    if (idx > -1) {
      gameState.activePetalEffects.splice(idx, 1);
    }
  }
}

export function getDamageMultiplier() {
  let mult = 1.0;
  for (const effect of gameState.activePetalEffects) {
    if (effect.type === 'damage_boost') {
      mult *= effect.multiplier;
    }
  }
  return mult;
}

export function getFireRateMultiplier() {
  let mult = 1.0;
  for (const effect of gameState.activePetalEffects) {
    if (effect.type === 'fire_rate_boost') {
      mult *= effect.multiplier;
    }
  }
  return mult;
}

export function getPollenMultiplier() {
  let mult = 1.0;
  for (const effect of gameState.activePetalEffects) {
    if (effect.type === 'pollen_multiplier') {
      mult *= effect.multiplier;
    }
  }
  return mult;
}