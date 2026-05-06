import { gameState } from './state.js';
import * as THREE from 'three';

const SPHERE_RADIUS = 15.0;
const INNER_MARGIN = 1.5;     // Keep a bit away from the sphere wall
const MIN_CAMERA_DISTANCE = 3; // Do not let the mallow get too close to the camera
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
    } else {
      mov.theta = BACK_THETA;
      mov.phi = BACK_PHI;
    }
    mov.targetTheta = mov.theta;
    mov.targetPhi = mov.phi;
    mov.orbitRadiusTarget = mov.orbitRadius;
    mov.lastPos = p.clone();
    
    // Initialise stable orientation from current mesh state
    mov.currentQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(marsh.rotation.x, marsh.rotation.y, marsh.rotation.z));
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
    mov.orbitRadiusTarget = 8.0 + Math.random() * 3.0;
  }

  // Smoothly approach targets
  const angleLerpSpeed = 0.8;
  mov.theta += (mov.targetTheta - mov.theta) * Math.min(1, angleLerpSpeed * delta);
  mov.phi += (mov.targetPhi - mov.phi) * Math.min(1, angleLerpSpeed * delta);

  const radiusLerpSpeed = 0.5;
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

  // Compute orientation vectors
  const vel = newPos.clone().sub(mov.lastPos);
  const speed = vel.length();
  
  // Blend target forward direction between velocity and camera-focus
  // This prevents snaps when the marshmallow stops or starts moving.
  const lookAtCamera = camPos.clone().sub(newPos).normalize();
  const velDir = speed > 1e-4 ? vel.clone().normalize() : lookAtCamera;
  
  const forward = new THREE.Vector3();
  const weight = Math.min(1.0, speed * 10.0); // Bias towards velocity as it moves faster
  forward.lerpVectors(lookAtCamera, velDir, weight).normalize();

  // Build a stable basis: local Y = forward (cylinder axis).
  // We want the face (local X) to stay generally "upright" relative to the world.
  let worldUp = new THREE.Vector3(0, 1, 0);
  if (Math.abs(forward.dot(worldUp)) > 0.98) {
    worldUp.set(0, 0, 1); // Avoid gimbal lock at world poles
  }
  
  const targetRight = new THREE.Vector3().crossVectors(worldUp, forward).normalize();
  const targetUp = new THREE.Vector3().crossVectors(forward, targetRight).normalize();

  const targetMatrix = new THREE.Matrix4();
  targetMatrix.makeBasis(targetUp, forward, targetRight);
  const targetQuat = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);

  // Slerp the persistent quaternion to eliminate any remaining basis-flip jolts
  const rotationSmoothSpeed = 4.0;
  mov.currentQuat.slerp(targetQuat, Math.min(1, rotationSmoothSpeed * delta));
  
  const euler = new THREE.Euler().setFromQuaternion(mov.currentQuat);

  marsh.position.x = newPos.x;
  marsh.position.y = newPos.y;
  marsh.position.z = newPos.z;

  marsh.rotation.x = euler.x;
  marsh.rotation.y = euler.y;
  marsh.rotation.z = euler.z;

  mov.lastPos.copy(newPos);
}