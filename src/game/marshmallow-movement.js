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

  // Add random "wobble" to the angular velocity
  const wobbleAmount = 2.0; 
  mov.yawVelocity += (Math.random() - 0.5) * wobbleAmount * delta;
  
  // Apply friction/damping to keep turns smooth
  mov.yawVelocity *= Math.pow(0.1, delta);

  // 2. Boundary Avoidance (Soft Steering)
  const dist = Math.sqrt(marsh.position.x * marsh.position.x + marsh.position.z * marsh.position.z);
  const boundaryThreshold = 3.2; // Turn back earlier
  const hardBoundary = 4.8;

  if (dist > boundaryThreshold) {
    // Corrected target angle towards center (0,0)
    const angleToCenter = Math.atan2(-marsh.position.z, -marsh.position.x);
    
    // Calculate the difference between current yaw and angle to center
    let angleDiff = angleToCenter - mov.yaw;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    // Stronger steering force to ensure it turns inward
    const steeringStrength = (dist - boundaryThreshold) * 15.0;
    mov.yawVelocity += angleDiff * steeringStrength * delta;
  }

  // Apply angular velocity to current yaw
  mov.yaw += mov.yawVelocity * delta;
  marsh.rotation.y = mov.yaw;

  // 3. Movement Execution
  // Inverting original math to fix "walking backwards"
  // Based on rotation.z=PI/2 and the shader's face placement:
  const vx = -Math.cos(mov.yaw) * mov.speed;
  const vz = Math.sin(mov.yaw) * mov.speed;
  
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