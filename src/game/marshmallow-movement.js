import { gameState } from './state.js';
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

/**
 * Idle movement for the marshmallow pet: wandering around the marsh floor.
 */
export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  // 1. Handle Random Steering
  mov.turnTimer -= delta;
  if (mov.turnTimer <= 0) {
    // Pick a new random direction or steer back to center if too far
    const distSq = marsh.position.x * marsh.position.x + marsh.position.z * marsh.position.z;
    if (distSq > 16.0) { // Approx 4.0 radius
      // Face towards center
      mov.targetYaw = Math.atan2(-marsh.position.x, -marsh.position.z);
    } else {
      mov.targetYaw += (Math.random() - 0.5) * Math.PI;
    }
    mov.turnTimer = 2.0 + Math.random() * 4.0;
  }

  // Smoothly rotate towards target yaw
  let yawDiff = mov.targetYaw - mov.yaw;
  while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
  while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
  
  const turnSpeed = 0.8;
  mov.yaw += yawDiff * Math.min(1.0, delta * turnSpeed);
  marsh.rotation.y = mov.yaw;

  // 2. Move forward in the direction we are facing (forward = +sin(x) on X, -cos(x) on Z)
  const vx = Math.sin(mov.yaw) * mov.speed;
  const vz = -Math.cos(mov.yaw) * mov.speed;
  
  marsh.position.x += vx * delta;
  marsh.position.z += vz * delta;

  // Clamp to marsh boundaries (radius ~5.0)
  const dist = Math.sqrt(marsh.position.x * marsh.position.x + marsh.position.z * marsh.position.z);
  const maxRadius = 4.8;
  if (dist > maxRadius) {
    const factor = maxRadius / dist;
    marsh.position.x *= factor;
    marsh.position.z *= factor;
    mov.turnTimer = 0; // Force a turn immediately
  }

  // 3. Simple bobbing animation
  mov.bobPhase += delta * 2.0;
  const bobOffset = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  marsh.position.y = mov.baseY + bobOffset;
}