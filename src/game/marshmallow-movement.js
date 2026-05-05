import { gameState } from './state.js';
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

/**
 * Idle movement for the marshmallow pet: wandering around the marsh floor.
 * Uses a "steering" approach for smooth, natural meandering.
 */
export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  // 1. Smooth Meandering Logic
  if (mov.yawVelocity === undefined) mov.yawVelocity = 0;

  // Add random "wobble" to the angular velocity (Brownian motion style)
  const wobbleAmount = 1.5; 
  mov.yawVelocity += (Math.random() - 0.5) * wobbleAmount * delta;
  
  // Apply friction/damping to keep turns from spiraling out of control
  mov.yawVelocity *= Math.pow(0.2, delta);

  // 2. Boundary Avoidance (Soft Steering)
  const dist = Math.sqrt(marsh.position.x * marsh.position.x + marsh.position.z * marsh.position.z);
  const boundaryThreshold = 3.8; // Start turning back before hitting the edge
  const hardBoundary = 4.8;

  if (dist > boundaryThreshold) {
    // Calculate angle towards the center of the marsh
    const angleToCenter = Math.atan2(-marsh.position.x, -marsh.position.z);
    
    // Calculate the difference between current yaw and angle to center
    // We treat yaw=0 as facing +X because of the rotation.z=PI/2 base.
    let angleDiff = angleToCenter - mov.yaw;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    // Steering force: increases as we get closer to the edge
    const steeringStrength = (dist - boundaryThreshold) * 12.0;
    mov.yawVelocity += angleDiff * steeringStrength * delta;
  }

  // Apply angular velocity to current yaw
  mov.yaw += mov.yawVelocity * delta;
  marsh.rotation.y = mov.yaw;

  // 3. Movement Execution
  // Face orientation alignment: 
  // Base rotation.z=PI/2 puts the "face" (Local +Y) at World +X when yaw is 0.
  // Standard rotation around Y maps World X to (cos, 0, -sin).
  const vx = Math.cos(mov.yaw) * mov.speed;
  const vz = -Math.sin(mov.yaw) * mov.speed;
  
  marsh.position.x += vx * delta;
  marsh.position.z += vz * delta;

  // Hard clamp to prevent map escapes (failsafe)
  if (dist > hardBoundary) {
    const factor = hardBoundary / dist;
    marsh.position.x *= factor;
    marsh.position.z *= factor;
    // Bounce the angular velocity to encourage turning away
    mov.yawVelocity *= -0.5;
  }

  // 4. Bobbing Animation
  mov.bobPhase += delta * 1.5;
  marsh.position.y = mov.baseY + Math.sin(mov.bobPhase) * mov.bobAmplitude;
}