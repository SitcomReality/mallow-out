import { gameState } from './state.js';
import * as THREE from 'three';

const SPHERE_RADIUS = 10.0;
const INNER_MARGIN = 1.5;
const MIN_CAMERA_DISTANCE = 2.5;
const DRIFT_SPEED = 0.6;
const FLOAT_HEIGHT_VARIANCE = 2.5;

export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying || marshmallow.spawnStartTime !== undefined) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  mov.time += delta;

  // Initialize on first wandering frame
  if (!mov.position) {
    mov.position = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
    mov.velocity = new THREE.Vector3(0, 0, 0);
    mov.orientation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(marsh.rotation.x, marsh.rotation.y, marsh.rotation.z)
    );
    mov.lastForward = new THREE.Vector3(0, 0, 1);
  }

  // Gentle continuous drift using multiple sine waves for organic motion
  const driftX = 0.3 * Math.sin(mov.time * 0.4 + mov.bobPhase);
  const driftY = 0.2 * Math.sin(mov.time * 0.5 + mov.bobPhase * 1.3);
  const driftZ = 0.3 * Math.sin(mov.time * 0.35 + mov.bobPhase * 0.7);
  
  const drift = new THREE.Vector3(driftX, driftY, driftZ);
  
  // Slowly blend velocity toward drift direction
  mov.velocity.lerp(drift, Math.min(1, 0.5 * delta));
  
  // Apply velocity with very gentle damping
  mov.position.addScaledVector(mov.velocity, DRIFT_SPEED * delta);

  // Camera-relative centering force to keep marshmallow in view
  const camPos = gameState.player.position;
  const camForward = new THREE.Vector3(
    Math.sin(gameState.player.yaw) * Math.cos(gameState.player.pitch),
    Math.sin(gameState.player.pitch),
    -Math.cos(gameState.player.yaw) * Math.cos(gameState.player.pitch)
  ).normalize();
  
  const viewCenter = camPos.clone().add(camForward.multiplyScalar(6.0));
  const toCenter = viewCenter.clone().sub(mov.position);
  const centerDist = toCenter.length();
  
  // Very gentle pull toward view center if drifting too far
  if (centerDist > 3.5) {
    const pullStrength = Math.min(0.3, (centerDist - 3.5) * 0.15);
    mov.velocity.addScaledVector(toCenter.normalize(), pullStrength * delta);
  }

  // Keep away from camera
  const toCam = mov.position.clone().sub(camPos);
  const distToCam = toCam.length();
  if (distToCam < MIN_CAMERA_DISTANCE) {
    const pushDir = toCam.lengthSq() > 0.01 ? toCam.normalize() : new THREE.Vector3(0, 0, -1);
    mov.position.copy(camPos).add(pushDir.multiplyScalar(MIN_CAMERA_DISTANCE));
  }

  // Keep inside sphere with soft boundary
  const distFromCenter = mov.position.length();
  const maxDist = SPHERE_RADIUS - INNER_MARGIN;
  if (distFromCenter > maxDist) {
    const excess = distFromCenter - maxDist;
    const inward = mov.position.clone().normalize().multiplyScalar(-excess * 0.8);
    mov.position.add(inward);
    // Dampen velocity component pointing outward
    const normal = mov.position.clone().normalize();
    const outwardComponent = mov.velocity.dot(normal);
    if (outwardComponent > 0) {
      mov.velocity.addScaledVector(normal, -outwardComponent * 0.7);
    }
  }

  // Update physical position
  marsh.position.x = mov.position.x;
  marsh.position.y = mov.position.y;
  marsh.position.z = mov.position.z;

  // Orientation: face the direction of movement while keeping face upright
  const velMag = mov.velocity.length();
  let forward = new THREE.Vector3();
  
  if (velMag > 0.05) {
    forward.copy(mov.velocity).normalize();
    // Blend with previous forward to smooth out jitter
    if (mov.lastForward) {
      forward.lerp(mov.lastForward, 0.8).normalize();
    }
    mov.lastForward.copy(forward);
  } else {
    forward.copy(mov.lastForward || new THREE.Vector3(0, 0, 1));
  }

  // Build upright-constrained basis
  const worldUp = new THREE.Vector3(0, 1, 0);
  let right = new THREE.Vector3().crossVectors(worldUp, forward);
  if (right.lengthSq() < 0.001) {
    right.set(1, 0, 0).cross(forward);
  }
  right.normalize();
  
  const up = new THREE.Vector3().crossVectors(forward, right).normalize();
  
  const targetMatrix = new THREE.Matrix4().makeBasis(up, forward, right);
  const targetQ = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);
  
  // Very gentle slerp for ultra-smooth rotation
  mov.orientation.slerp(targetQ, Math.min(1, 1.5 * delta));
  
  const euler = new THREE.Euler().setFromQuaternion(mov.orientation);
  marsh.rotation.x = euler.x;
  marsh.rotation.y = euler.y;
  marsh.rotation.z = euler.z;
}