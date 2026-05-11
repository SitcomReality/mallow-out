import { gameState } from './state.js';
import * as THREE from 'three';

const SPHERE_RADIUS = 10.0;
const INNER_MARGIN = 2.0;
const MIN_CAMERA_DISTANCE = 3.5;
const DRIFT_SPEED = 0.55;

export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying || marshmallow.spawnStartTime !== undefined) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  mov.time += delta;

  // Initialize only if not already done by spawning script
  if (!mov.position) {
    mov.position = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
    mov.velocity = new THREE.Vector3(0, 0, 0);
    if (marsh.rotation.w !== undefined) {
      mov.orientation = new THREE.Quaternion(marsh.rotation.x, marsh.rotation.y, marsh.rotation.z, marsh.rotation.w);
    } else {
      mov.orientation = new THREE.Quaternion().setFromEuler(new THREE.Euler(marsh.rotation.x, marsh.rotation.y, marsh.rotation.z));
    }
  }

  // 1. Determine camera-relative targets
  const camPos = gameState.player.position;
  const camForward = new THREE.Vector3(
    Math.sin(gameState.player.yaw) * Math.cos(gameState.player.pitch),
    Math.sin(gameState.player.pitch),
    -Math.cos(gameState.player.yaw) * Math.cos(gameState.player.pitch)
  ).normalize();

  // Target a comfortable viewing area ~7 units ahead of camera
  const viewCenter = camPos.clone().add(camForward.multiplyScalar(7.0));
  
  // 2. Generate wandering target with organic noise
  const noiseX = Math.sin(mov.time * 0.4 + mov.bobPhase) * 1.8;
  const noiseY = Math.cos(mov.time * 0.3 + mov.bobPhase * 1.5) * 1.2;
  const noiseZ = Math.sin(mov.time * 0.5 + mov.bobPhase * 0.8) * 1.8;
  const wanderTarget = viewCenter.clone().add(new THREE.Vector3(noiseX, noiseY, noiseZ));

  // 3. Calculate steering direction
  let targetDir = wanderTarget.clone().sub(mov.position).normalize();

  // CENTERING: Strong pull if wandering too far from the screen center
  const toCenter = viewCenter.clone().sub(mov.position);
  const centerDist = toCenter.length();
  if (centerDist > 2.0) {
    const pullFactor = Math.min(1.0, (centerDist - 2.0) * 0.6);
    targetDir.lerp(toCenter.normalize(), pullFactor).normalize();
  }

  // REPEL FROM CAMERA: Keep a minimum distance
  const toCam = mov.position.clone().sub(camPos);
  const distToCam = toCam.length();
  if (distToCam < MIN_CAMERA_DISTANCE + 2.0) {
    const pushStrength = 1.0 - (distToCam - MIN_CAMERA_DISTANCE) / 2.0;
    targetDir.lerp(toCam.normalize(), Math.min(1.0, pushStrength * 0.9)).normalize();
  }

  // REPEL FROM SPHERE EDGE
  const sphereDist = mov.position.length();
  if (sphereDist > SPHERE_RADIUS - INNER_MARGIN) {
    const inward = mov.position.clone().normalize().multiplyScalar(-1);
    targetDir.lerp(inward, 0.9).normalize();
  }

  // 4. Update Orientation (Steering)
  const currentForward = new THREE.Vector3(0, 1, 0).applyQuaternion(mov.orientation);
  
  // Responsiveness of the head-turn
  const steerSpeed = 1.4;
  currentForward.lerp(targetDir, Math.min(1.0, steerSpeed * delta)).normalize();

  // Build stable upright basis
  const worldUp = new THREE.Vector3(0, 1, 0);
  let right = new THREE.Vector3().crossVectors(worldUp, currentForward);
  if (right.lengthSq() < 0.001) {
    right.set(1, 0, 0).cross(currentForward);
  }
  right.normalize();
  const up = new THREE.Vector3().crossVectors(currentForward, right).normalize();

  // Local basis: X=Up, Y=Forward, Z=Right (matches spawning script)
  const targetMatrix = new THREE.Matrix4().makeBasis(up, currentForward, right);
  const targetQ = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);

  // Smooth rotation blending
  mov.orientation.slerp(targetQ, Math.min(1.0, 1.8 * delta));
  marsh.rotation = { x: mov.orientation.x, y: mov.orientation.y, z: mov.orientation.z, w: mov.orientation.w };

  // 5. Update Position
  // Movement is always in the direction of the face's current orientation
  const actualForward = new THREE.Vector3(0, 1, 0).applyQuaternion(mov.orientation);
  mov.velocity.copy(actualForward).multiplyScalar(DRIFT_SPEED);
  
  // Gentle vertical bobbing
  const bob = Math.sin(mov.time * 1.8 + mov.bobPhase) * 0.12;
  mov.velocity.y += bob;

  mov.position.addScaledVector(mov.velocity, delta);

  // Hard safety boundaries
  if (mov.position.length() > SPHERE_RADIUS - 0.5) {
    mov.position.normalize().multiplyScalar(SPHERE_RADIUS - 0.5);
  }

  marsh.position.x = mov.position.x;
  marsh.position.y = mov.position.y;
  marsh.position.z = mov.position.z;
}