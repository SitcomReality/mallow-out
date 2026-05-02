import { MARSHMALLOW_TYPES } from './marshmallow-types.js';

/**
 * Selects a marshmallow type based on simple weighted rarity.
 * Standardized to only Standard and Golden Rare.
 */
export function selectMarshmallowType() {
  const roll = Math.random() * 100;
  
  if (roll < MARSHMALLOW_TYPES.GOLDEN.weight) {
    return MARSHMALLOW_TYPES.GOLDEN;
  }
  
  return MARSHMALLOW_TYPES.STANDARD;
}