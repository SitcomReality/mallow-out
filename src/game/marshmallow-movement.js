import { gameState } from './state.js';
import * as THREE from 'three';

const SPHERE_RADIUS = 15.0;
const INNER_MARGIN = 1.5;     // Keep a bit away from the sphere wall
const MIN_CAMERA_DISTANCE = 3; // Do not let the mallow get too close to the camera
const BACK_THETA = 4.71;
const BACK_PHI = -0.6;

// Tuning constants to reduce abrupt motion
const MIN_WANDER_INTERVAL = 2.0;
const MAX_WANDER_INTERVAL = 4.0;
const MAX_TARGET_JUMP = 0.9;      // radians - cap how far a new target can jump
const ANGLE_LERP_SPEED = 0.6;     // slower angle lerp for gentler turning
const RADIUS_LERP_SPEED = 0.3;    // slower radius changes
const FORWARD_SMOOTH_SPEED = 3.5; // reduce responsiveness to smooth velocity
const UP_BLEND_SPEED = 1.2;       // slower up blending to avoid snaps
const ORIENTATION_SLERP = 6.0;    // slerp speed for quaternion smoothing

export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying || marshmallow.spawnStartTime !== undefined) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  mov.time += delta;

  // Initialise angular state the first time, based on current position if available
  if (mov.lastPos === null) {
    const p = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
    if (p.lengthSq() > 0.0001) {
      const r = p.length();
      const phi = Math.asin(THREE.MathUtils.clamp(p.y / r, -1, 1));
      const theta = Math.atan2(p.z, p.x);
      mov.theta = theta;
      mov.phi = phi;
    } else {
      mov.theta = BACK_THETA;
      mov.phi = BACK_PHI;
    }
    mov.targetTheta = mov.theta;
    mov.targetPhi = mov.phi;
    mov.orbitRadiusTarget = mov.orbitRadius;
    mov.lastPos = (new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z)).clone();
  }

  // Gently retarget wander within a cone around the camera view
  mov.wanderTimer -= delta;
  if (mov.wanderTimer <= 0) {
    mov.wanderTimer = MIN_WANDER_INTERVAL + Math.random() * (MAX_WANDER_INTERVAL - MIN_WANDER_INTERVAL);

    // New raw targets within view cone
    const rawTheta = BACK_THETA + (Math.random() - 0.5) * 1.0;
    const rawPhi = -0.5 + (Math.random() - 0.5) * 0.6;
    // Clamp jumps so a single retarget can't cause a huge angular teleport
    const dTheta = THREE.MathUtils.clamp(rawTheta - mov.theta, -MAX_TARGET_JUMP, MAX_TARGET_JUMP);
    const dPhi = THREE.MathUtils.clamp(rawPhi - mov.phi, -MAX_TARGET_JUMP * 0.6, MAX_TARGET_JUMP * 0.6);
    mov.targetTheta = mov.theta + dTheta;
    mov.targetPhi = mov.phi + dPhi;

    // Slightly vary the orbit radius so it drifts nearer/farther, but modestly
    const rawRadius = 8.0 + Math.random() * 3.0;
    mov.orbitRadiusTarget = THREE.MathUtils.clamp(rawRadius, 3.0, SPHERE_RADIUS - INNER_MARGIN - 1.0);
  }

  // Smoothly approach targets with gentle speeds to avoid sudden accelerations
  mov.theta += (mov.targetTheta - mov.theta) * Math.min(1, ANGLE_LERP_SPEED * delta);
  mov.phi += (mov.targetPhi - mov.phi) * Math.min(1, ANGLE_LERP_SPEED * delta);

  mov.orbitRadius += (mov.orbitRadiusTarget - mov.orbitRadius) * Math.min(1, RADIUS_LERP_SPEED * delta);

  // Add subtle sine-based wobble to angles and radius (low amplitude)
  const yawWave = 0.08 * Math.sin(mov.time * 0.6 + mov.bobPhase);
  const pitchWave = 0.05 * Math.sin(mov.time * 0.9 + mov.bobPhase * 1.4);
  const radialBob = Math.max(0, mov.radialBobAmplitude * 0.6) * Math.sin(mov.time * 0.7 + mov.bobPhase * 1.8);

  const theta = mov.theta + yawWave;
  const phi = mov.phi + pitchWave;

  // Clamp phi to avoid flipping over poles
  const maxPhi = Math.PI / 2 - 0.25;
  const minPhi = -maxPhi;
  const clampedPhi = Math.max(minPhi, Math.min(maxPhi, phi));

  let r = mov.orbitRadius + radialBob;
  r = Math.max(2.0, Math.min(SPHERE_RADIUS - INNER_MARGIN, r));

  // Convert spherical -> Cartesian (sphere centered at origin)
  const cosPhi = Math.cos(clampedPhi);
  const x = r * Math.cos(theta) * cosPhi;
  const y = r * Math.sin(clampedPhi);
  const z = r * Math.sin(theta) * cosPhi;

  const newPos = new THREE.Vector3(x, y, z);

  // Keep away from the camera so it doesn't fill the whole screen
  const camPos = gameState.player.position;
  const toMallow = newPos.clone().sub(camPos);
  const distToCam = toMallow.length();
  if (distToCam < MIN_CAMERA_DISTANCE) {
    const pushDir = toMallow.lengthSq() > 0.0001 ? toMallow.normalize() : new THREE.Vector3(0, 0, -1);
    newPos.copy(camPos).add(pushDir.multiplyScalar(MIN_CAMERA_DISTANCE));
  }

  // Ensure we remain inside the sphere
  const distFromCenter = newPos.length();
  if (distFromCenter > SPHERE_RADIUS - INNER_MARGIN) {
    newPos.multiplyScalar((SPHERE_RADIUS - INNER_MARGIN) / distFromCenter);
  }

  // Compute velocity from last frame for orientation (and cap it)
  const vel = newPos.clone().sub(mov.lastPos);
  // Limit instantaneous teleport-like velocities by clamping displacement per frame
  const maxFrameMove = 4.0 * delta; // units per second scaled per-frame
  if (vel.length() > maxFrameMove) {
    vel.setLength(maxFrameMove);
    newPos.copy(mov.lastPos).add(vel);
  }

  const speed = vel.length();
  let rawForward;
  if (speed > 1e-4) {
    rawForward = vel.normalize();
  } else {
    // If nearly stationary, face gently toward the camera center
    rawForward = camPos.clone().sub(newPos).normalize();
  }

  // 1. Smooth the forward vector to reduce jitter (stronger smoothing)
  if (!mov.smoothForward) mov.smoothForward = rawForward.clone();
  mov.smoothForward.lerp(rawForward, Math.min(1, FORWARD_SMOOTH_SPEED * delta)).normalize();
  const forward = mov.smoothForward;

  // 2. Build a stable basis using a persistent 'up' vector to avoid snaps
  if (!mov.lastUp) mov.lastUp = new THREE.Vector3(0, 1, 0);
  
  // Project last up onto plane perpendicular to forward to maintain continuity
  let right = new THREE.Vector3().crossVectors(mov.lastUp, forward);
  if (right.lengthSq() < 1e-6) {
    // Fallback if forward is aligned with lastUp
    const fallbackUp = Math.abs(forward.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    right.crossVectors(fallbackUp, forward);
  }
  right.normalize();
  
  const up = new THREE.Vector3().crossVectors(forward, right).normalize();

  // 3. Slowly blend the calculated up towards world-up on a gentle timescale to avoid flips
  const worldUp = new THREE.Vector3(0, 1, 0);
  const projectedWorldUp = worldUp.clone().projectOnPlane(forward);
  if (projectedWorldUp.lengthSq() > 1e-6) {
    projectedWorldUp.normalize();
    up.lerp(projectedWorldUp, Math.min(1, UP_BLEND_SPEED * delta)).normalize();
    right.crossVectors(up, forward).normalize();
  }
  
  mov.lastUp.copy(up);

  // 4. Convert to rotation and slerp for maximum smoothness; cap slerp fraction to avoid instant flips
  const matrix = new THREE.Matrix4();
  // local X = up, local Y = forward, local Z = right
  matrix.makeBasis(up, forward, right);
  const targetQ = new THREE.Quaternion().setFromRotationMatrix(matrix);
  
  if (!mov.currentQ) mov.currentQ = targetQ.clone();
  const slerpT = Math.min(1, ORIENTATION_SLERP * delta);
  mov.currentQ.slerp(targetQ, slerpT);

  const euler = new THREE.Euler().setFromQuaternion(mov.currentQ);

  // Apply final position and rotation
  marsh.position.x = newPos.x;
  marsh.position.y = newPos.y;
  marsh.position.z = newPos.z;

  marsh.rotation.x = euler.x;
  marsh.rotation.y = euler.y;
  marsh.rotation.z = euler.z;

  mov.lastPos.copy(newPos);
}