import { gameState } from './state.js';
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

/**
 * Idle movement for the marshmallow pet: wandering around the marsh floor.
 * Uses a gentle "wander" steering approach and robust boundary correction to avoid getting stuck.
 */
export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  if (mov.wanderTimer === undefined) mov.wanderTimer = 0;
  if (mov.wanderTargetYaw === undefined) mov.wanderTargetYaw = mov.yaw || 0;

  const dist = Math.hypot(marsh.position.x, marsh.position.z);
  const boundaryThreshold = 3.5;
  const hardBoundary = 4.5;

  mov.wanderTimer -= delta;
  
  // If we hit the hard boundary, immediately override to face center and stop trying to push through
  if (dist > hardBoundary) {
    const angle = Math.atan2(marsh.position.z, marsh.position.x);
    marsh.position.x = Math.cos(angle) * hardBoundary;
    marsh.position.z = Math.sin(angle) * hardBoundary;
    
    // Corrected logic: Since vx = -cos(yaw) and vz = sin(yaw), the yaw that 
    // points to center (0,0) is atan2(-z, x).
    const angleToCenter = Math.atan2(-marsh.position.z, marsh.position.x);
    mov.wanderTargetYaw = angleToCenter + (Math.random() - 0.5) * 0.2;
    mov.wanderTimer = 1.5 + Math.random() * 1.0;
  } else if (mov.wanderTimer <= 0) {
    mov.wanderTimer = 2.0 + Math.random() * 4.0;
    if (dist > boundaryThreshold) {
      // Pick a direction towards the center
      const angleToCenter = Math.atan2(-marsh.position.z, marsh.position.x);
      mov.wanderTargetYaw = angleToCenter + (Math.random() - 0.5) * 1.0;
    } else {
      // Pick a random direction
      mov.wanderTargetYaw = mov.yaw + (Math.random() - 0.5) * Math.PI * 1.5;
    }
  }

  // Smoothly rotate towards target yaw
  let toTarget = mov.wanderTargetYaw - mov.yaw;
  while (toTarget < -Math.PI) toTarget += Math.PI * 2;
  while (toTarget > Math.PI) toTarget -= Math.PI * 2;
  
  // Use significantly faster turning when near the boundary to prevent getting trapped
  const turnSpeed = dist > boundaryThreshold ? 5.0 : 1.5;
  mov.yaw += toTarget * Math.min(1, turnSpeed * delta);
  marsh.rotation.y = mov.yaw;

  // Move forward
  const vx = -Math.cos(mov.yaw) * mov.speed;
  const vz = Math.sin(mov.yaw) * mov.speed;

  marsh.position.x += vx * delta;
  marsh.position.z += vz * delta;

  // 4. Bobbing animation
  mov.bobPhase += delta * 1.5;
  marsh.position.y = mov.baseY + Math.sin(mov.bobPhase) * mov.bobAmplitude;
}