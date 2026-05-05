import { gameState } from './state.js';
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

/**
 * Simple idle bobbing animation and wandering for the marshmallow pet.
 */
export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement) return;
  
  const mov = marshmallow.movement;
  const mesh = marshmallow.marshmallow;

  // 1. Bobbing animation (Vertical)
  mov.bobPhase += delta * 1.5; // Slightly slower bob
  const bobOffset = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  
  // Note: if spawning is currently in progress, spawning.js overrides mesh.position.y
  mesh.position.y = mov.baseY + bobOffset;
  
  // 2. Wandering logic (Horizontal XZ)
  // Skip horizontal movement if currently spawning
  if (marshmallow.spawnStartTime !== undefined) return;

  if (mov.waitTimer > 0) {
    mov.waitTimer -= delta;
    // Gentle idle rotation while waiting
    mesh.rotation.y += delta * 0.15;
    mov.isMoving = false;
  } else {
    // Calculate direction and distance to target
    const dx = mov.targetX - mesh.position.x;
    const dz = mov.targetZ - mesh.position.z;
    const distSq = dx * dx + dz * dz;
    
    // Reached destination threshold
    if (distSq < 0.05) {
      // Reached target, start waiting for 3-7 seconds
      mov.waitTimer = 3.0 + Math.random() * 4.0;
      mov.isMoving = false;
    } else {
      mov.isMoving = true;
      const dist = Math.sqrt(distSq);
      const moveDist = mov.moveSpeed * delta;
      
      // Step towards target
      const step = Math.min(moveDist / dist, 1.0);
      mesh.position.x += dx * step;
      mesh.position.z += dz * step;
      
      // Face the direction of movement smoothly
      const targetRotation = Math.atan2(dx, dz);
      let diff = targetRotation - mesh.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      mesh.rotation.y += diff * delta * 1.2;
    }
  }
  
  // If timer expired and we aren't moving, pick a new target
  if (mov.waitTimer <= 0 && !mov.isMoving) {
     const wanderRadius = 3.5; // Keep it within the main floor area
     const angle = Math.random() * Math.PI * 2;
     const radius = Math.random() * wanderRadius;
     mov.targetX = Math.cos(angle) * radius;
     mov.targetZ = Math.sin(angle) * radius;
  }
}