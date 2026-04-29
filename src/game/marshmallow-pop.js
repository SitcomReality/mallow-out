import * as THREE from 'three';
import { gameState } from './state.js';
import { POP_HEALTH_THRESHOLD, POP_WARNING_DURATION, POP_KILL_DISTANCE } from './marshmallow-type-constants.js';
import { getMarshmallowHealthPercent } from './marshmallow.js';
import { awardCaramel, awardPollen } from './economy.js';
import { createHoleSprayFX } from './fx.js';
import { onMarshmallowDefeated } from './manager.js';

export function updateMarshmallowPop(marshmallow, delta, particleSystem) {
  if (!marshmallow) return false;
  
  const healthPercent = getMarshmallowHealthPercent(marshmallow);
  
  // Start countdown if health is low
  if (healthPercent <= POP_HEALTH_THRESHOLD && !marshmallow.isAboutToPop) {
    marshmallow.isAboutToPop = true;
    marshmallow.popTimer = POP_WARNING_DURATION;
    marshmallow.originalColor = marshmallow.marshmallow.color;
  }

  if (marshmallow.isAboutToPop) {
    marshmallow.popTimer -= delta;
    
    // Pulsating visual effect
    const t = 1.0 - (marshmallow.popTimer / POP_WARNING_DURATION);
    const pulseFreq = 2.0 + t * 15.0; // Speeds up as time runs out
    const flash = Math.sin(performance.now() * 0.01 * pulseFreq) > 0;
    
    if (flash) {
      marshmallow.marshmallow.color = '#ff0000'; // Flash bright red
    } else {
      marshmallow.marshmallow.color = marshmallow.originalColor;
    }

    if (marshmallow.popTimer <= 0) {
      return explodeMarshmallow(marshmallow, particleSystem);
    }
  }
  
  return false;
}

function explodeMarshmallow(marshmallow, particleSystem) {
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
  
  // Award full remaining health as pollen and standard caramel
  awardPollen(marshmallow.currentHealth);
  awardCaramel();
  
  // Cleanup
  if (gameState.meltingMarshmallows.length >= 2) {
    gameState.meltingMarshmallows.shift();
  }
  
  const deadMarshmallow = gameState.currentMarshmallow;
  deadMarshmallow.meltStartTime = performance.now() * 0.001;
  // Restore original color for melting state so it doesn't stay red
  deadMarshmallow.marshmallow.color = deadMarshmallow.originalColor || deadMarshmallow.marshmallow.color;
  
  gameState.meltingMarshmallows.push(deadMarshmallow);
  gameState.currentMarshmallow = null;
  onMarshmallowDefeated();
  
  return true;
}