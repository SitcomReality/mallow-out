import * as THREE from 'three';
import { gameState } from './state.js';
import { POP_HEALTH_THRESHOLD, POP_CHANCE, POP_KILL_DISTANCE } from './marshmallow-type-constants.js';
import { getMarshmallowHealthPercent } from './marshmallow.js';
import { awardCaramel } from './economy.js';
import { createHoleSprayFX } from './fx.js';

export function checkMarshmallowPop(marshmallow, particleSystem) {
  const healthPercent = getMarshmallowHealthPercent(marshmallow);
  
  if (healthPercent > POP_HEALTH_THRESHOLD) return false;
  
  // Roll for pop chance
  if (Math.random() > POP_CHANCE) return false;
  
  // Marshmallow pops!
  const marshmallowPos = new THREE.Vector3(
    marshmallow.marshmallow.position.x,
    marshmallow.marshmallow.position.y,
    marshmallow.marshmallow.position.z
  );
  
  // Create explosion effect
  const numBursts = 8;
  for (let i = 0; i < numBursts; i++) {
    const angle = (Math.PI * 2 * i) / numBursts;
    const direction = new THREE.Vector3(
      Math.cos(angle),
      0.3,
      Math.sin(angle)
    ).normalize();
    
    createHoleSprayFX(marshmallowPos, marshmallowPos.clone(), direction);
    if (particleSystem) {
      particleSystem.createBloodSplatter(marshmallowPos, direction);
    }
  }
  
  // Check if player is too close
  const distToPlayer = marshmallowPos.distanceTo(gameState.player.position);
  
  if (distToPlayer < POP_KILL_DISTANCE) {
    // Player dies - end wave immediately
    console.log('[Pop] Player was too close to popping marshmallow! Wave ended.');
    gameState.waveEndReason = 'MALLOW_POP';
    gameState.waveTimer.remaining = 0;
  }
  
  // Still award caramel for the pop
  awardCaramel();
  
  return true;
}