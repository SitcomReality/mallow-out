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

  // Initialize movement state if missing
  if (mov.yawVelocity === undefined) mov.yawVelocity = 0;
  if (mov.wanderTimer === undefined) mov.wanderTimer = 0;
  if (mov.wanderTargetYaw === undefined) mov.wanderTargetYaw = mov.yaw || 0;

  // 1. Wander target: occasionally pick a new subtle heading
  mov.wanderTimer -= delta;
  if (mov.wanderTimer <= 0) {
    mov.wanderTimer = 1.5 + Math.random() * 2.5; // pick new target every ~1.5-4s
    // Small random offset from current heading to keep it meandering
    mov.wanderTargetYaw = mov.yaw + (Math.random() - 0.5) * 1.2;
  }

  // Steering towards wander target (gentle)
  let toTarget = mov.wanderTargetYaw - mov.yaw;
  while (toTarget < -Math.PI) toTarget += Math.PI * 2;
  while (toTarget > Math.PI) toTarget -= Math.PI * 2;
  const wanderStrength = 0.9; // gentle influence
  mov.yawVelocity += toTarget * wanderStrength * delta;

  // Add small random wobble to avoid perfectly smooth motion
  const wobbleAmount = 0.7;
  mov.yawVelocity += (Math.random() - 0.5) * wobbleAmount * delta;

  // Apply damping so velocities decay naturally
  mov.yawVelocity *= Math.pow(0.2, delta);

  // 2. Boundary avoidance: softly steer inward when near edge, using a capped torque
  const dist = Math.hypot(marsh.position.x, marsh.position.z);
  const boundaryThreshold = 3.2; // start steering earlier
  const hardBoundary = 4.6; // slightly inside the visual edge to avoid clipping

  if (dist > boundaryThreshold) {
    const angleToCenter = Math.atan2(-marsh.position.z, -marsh.position.x);
    let angleDiff = angleToCenter - mov.yaw;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    // Scale steering smoothly with how far outside the comfortable zone we are
    const t = Math.max(0, Math.min(1, (dist - boundaryThreshold) / (hardBoundary - boundaryThreshold)));
    const steeringStrength = 3.5 + 6.0 * t; // modest base, increases as it nears hard boundary
    // Cap contribution to avoid jitter
    mov.yawVelocity += Math.max(-1, Math.min(1, angleDiff)) * steeringStrength * delta;
  }

  // Apply angular velocity to current yaw and update rotation
  mov.yaw += mov.yawVelocity * delta;
  marsh.rotation.y = mov.yaw;

  // 3. Movement execution: move forward slowly along yaw, then gently nudge back if escaping
  const vx = -Math.cos(mov.yaw) * mov.speed;
  const vz = Math.sin(mov.yaw) * mov.speed;

  marsh.position.x += vx * delta;
  marsh.position.z += vz * delta;

  // If we've slipped beyond the hard boundary, gently project back inside with smoothing (avoids sticking)
  const postDist = Math.hypot(marsh.position.x, marsh.position.z);
  if (postDist > hardBoundary) {
    // Compute a safe point on the circle slightly inside the hard boundary
    const safeRadius = hardBoundary - 0.15;
    const angle = Math.atan2(marsh.position.z, marsh.position.x);
    const targetX = Math.cos(angle) * safeRadius;
    const targetZ = Math.sin(angle) * safeRadius;

    // Smoothly move a fraction towards the safe point to avoid teleport snaps
    const pushFactor = 0.28; // how strongly we nudge back (0.0..1.0)
    marsh.position.x = marsh.position.x * (1 - pushFactor) + targetX * pushFactor;
    marsh.position.z = marsh.position.z * (1 - pushFactor) + targetZ * pushFactor;

    // Reduce forward velocity and encourage turning inward
    mov.yawVelocity *= -0.35;
    // Also bias the wander target toward center so subsequent motion heads inward
    mov.wanderTargetYaw = Math.atan2(-marsh.position.z, -marsh.position.x);
  }

  // 4. Bobbing animation (unchanged)
  mov.bobPhase += delta * 1.5;
  marsh.position.y = mov.baseY + Math.sin(mov.bobPhase) * mov.bobAmplitude;
}