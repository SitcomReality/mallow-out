import { ALL_MARSHMALLOW_TYPES, MARSHMALLOW_TYPES } from './marshmallow-types.js';
import { gameState } from './state.js';

export function selectMarshmallowType() {
  // Weighted random selection
  const totalWeight = ALL_MARSHMALLOW_TYPES.reduce((sum, type) => sum + type.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const type of ALL_MARSHMALLOW_TYPES) {
    random -= type.weight;
    if (random <= 0) {
      return type;
    }
  }
  
  // Fallback to standard
  return MARSHMALLOW_TYPES.STANDARD;
}