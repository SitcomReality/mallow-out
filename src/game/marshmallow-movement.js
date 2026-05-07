import { gameState } from './state.js';
import * as THREE from 'three';

const SPHERE_RADIUS = 10.0;
const INNER_MARGIN = 1.0;     // Keep a bit away from the sphere wall
const MIN_CAMERA_DISTANCE = 2.5; // Do not let the mallow get too close to the camera
const BACK_THETA = 4.71;
const BACK_PHI = -0.6;

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
      const phi = Math.asin(p.y / r);
      const theta = Math.atan2(p.z, p.x);
      mov.theta = theta;
      mov.phi = phi;
      mov.orbitRadius = r;
    } else {
      mov.theta = BACK_THETA;
      mov.phi = BACK_PHI;
    }
    mov.targetTheta = mov.theta;
    mov.targetPhi = mov.phi;
    mov.orbitRadiusTarget = mov.orbitRadius;
    mov.lastPos = p.clone();
  }

  // Gently retarget wander within a cone around the camera view
  mov.wanderTimer -= delta;
  if (mov.wanderTimer <= 0) {
    mov.wanderTimer = 2.0 + Math.random() * 3.0;

    // The "back wall" center for our fixed camera is roughly theta=4.71, phi=-0.6
    // Constrain wander to stay within view
    mov.targetTheta = BACK_THETA + (Math.random() - 0.5) * 1.0;
    mov.targetPhi = -0.5 + (Math.random() - 0.5) * 0.6;

    // Slightly vary the orbit radius so it drifts nearer/farther
    mov.orbitRadiusTarget = 5.5 + Math.random() * 2.0;
  }

  // Smoothly approach targets with much lower speeds for gentle wandering
  const angleLerpSpeed = 0.3;
  mov.theta += (mov.targetTheta - mov.theta) * Math.min(1, angleLerpSpeed * delta);
  mov.phi += (mov.targetPhi - mov.phi) * Math.min(1, angleLerpSpeed * delta);

  const radiusLerpSpeed = 0.2;
  mov.orbitRadius += (mov.orbitRadiusTarget - mov.orbitRadius) * Math.min(1, radiusLerpSpeed * delta);

  // Add subtle sine-based wobble to angles and radius
  const yawWave = 0.12 * Math.sin(mov.time * 0.7 + mov.bobPhase);
  const pitchWave = 0.08 * Math.sin(mov.time * 1.1 + mov.bobPhase * 1.7);
  const radialBob = mov.radialBobAmplitude * Math.sin(mov.time * 0.9 + mov.bobPhase * 2.3);

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

  // Compute velocity from last frame for orientation
  const vel = newPos.clone().sub(mov.lastPos);
  const speed = vel.length();
  let rawForward;
  if (speed > 1e-4) {
    rawForward = vel.normalize();
  } else {
    // If nearly stationary, face roughly toward the camera center
    rawForward = camPos.clone().sub(newPos).normalize();
  }

  // 1. Smooth the forward vector to reduce jitter (heavier damping)
  if (!mov.smoothForward) mov.smoothForward = rawForward.clone();
  mov.smoothForward.lerp(rawForward, Math.min(1, 2.5 * delta)).normalize();
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

  // 3. Gently guide 'up' towards the world vertical over time (uprightness)
  const worldUp = new THREE.Vector3(0, 1, 0);
  const projectedWorldUp = worldUp.clone().projectOnPlane(forward).normalize();
  if (projectedWorldUp.lengthSq() > 0.1) {
     // Slowly blend the calculated up with the world-relative up for a graceful upright posture
     up.lerp(projectedWorldUp, Math.min(1, 1.5 * delta)).normalize();
     // Re-calculate right to ensure orthogonality
     right.crossVectors(up, forward).normalize();
  }
  
  mov.lastUp.copy(up);

  // 4. Convert to rotation and slerp for maximum smoothness (lower slerp speed for grace)
  const matrix = new THREE.Matrix4();
  // local X = up, local Y = forward, local Z = right
  matrix.makeBasis(up, forward, right);
  const targetQ = new THREE.Quaternion().setFromRotationMatrix(matrix);
  
  if (!mov.currentQ) mov.currentQ = targetQ.clone();
  mov.currentQ.slerp(targetQ, Math.min(1, 3.5 * delta));

  const euler = new THREE.Euler().setFromQuaternion(mov.currentQ);

  marsh.position.x = newPos.x;
  marsh.position.y = newPos.y;
  marsh.position.z = newPos.z;

  marsh.rotation.x = euler.x;
  marsh.rotation.y = euler.y;
  marsh.rotation.z = euler.z;

  mov.lastPos.copy(newPos);
}