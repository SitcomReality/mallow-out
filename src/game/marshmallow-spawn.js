import { ALL_MARSHMALLOW_TYPES, MARSHMALLOW_TYPES } from './marshmallow-types.js';
import { gameState } from './state.js';

export function selectMarshmallowType() {
  // Check for guaranteed floaty from Lucky Clover petal
  if (gameState.guaranteedFloaty) {
    gameState.guaranteedFloaty = false;
    return MARSHMALLOW_TYPES.FLOATY;
  }
  
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