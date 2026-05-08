import * as THREE from 'three';
import { gameState } from '../state.js';
import { awardMarshMultiplier } from '../economy.js';
import { session } from '../manager.js';
import { createRippleFX } from '../fx.js';
import { intersectRaySphere } from './geometry-utils.js';
import { BUBBLE_OUTER_RADIUS } from '../bubble-constants.js';
import { getComboMultiplier } from '../combo-system.js';

/**
 * Handles bubble intersection and reward application.
 */
export function processBubbleHits(origin, direction, isCharged, particleSystem) {
  const maxBubbleDist = 60;
  for (const bubble of gameState.bubbles) {
    if (bubble.state === 'rising') {
      const radius = bubble.group.scale.x * BUBBLE_OUTER_RADIUS;
      const t = intersectRaySphere(origin, direction, bubble.group.position, radius);
      
      if (t !== false && t < maxBubbleDist) {
        bubble.state = 'popping';
        const comboMult = getComboMultiplier();
        const bubbleReward = awardMarshMultiplier(10 * comboMult);
        const bubbleHitPos = origin.clone().add(direction.clone().multiplyScalar(t));
        
        if (session.floatingTextSystem) {
          session.floatingTextSystem.createDamageText(bubbleHitPos, bubbleReward, true);
        }
        
        createRippleFX(bubbleHitPos, isCharged);
        particleSystem.createFloorSplash(bubbleHitPos);
      }
    }
  }
}