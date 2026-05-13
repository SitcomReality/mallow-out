import { gameState } from './state.js';
import { devState } from './dev-state.js';
import * as THREE from 'three';

const SPHERE_RADIUS = 10.0;
const INNER_MARGIN = 2.0;
const MIN_CAMERA_DISTANCE = 3.5;
const DRIFT_SPEED = 0.2;

export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying || marshmallow.spawnStartTime !== undefined) return;
  if (devState.freezeMovement) return;
  
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

  // Target a comfortable viewing area ~6.5 units ahead of camera
  const viewCenter = camPos.clone().add(camForward.multiplyScalar(6.5));
  
  // 2. Generate wandering target with organic noise
  const noiseX = Math.sin(mov.time * 0.5 + mov.bobPhase) * 2.5;
  const noiseY = Math.cos(mov.time * 0.4 + mov.bobPhase * 1.5) * 1.5;
  const noiseZ = Math.sin(mov.time * 0.6 + mov.bobPhase * 0.8) * 1.5;
  const wanderTarget = viewCenter.clone().add(new THREE.Vector3(noiseX, noiseY, noiseZ));

  // 3. Smoothly move position towards wanderTarget (spring-like logic)
  const toWander = wanderTarget.clone().sub(mov.position);
  mov.velocity.copy(toWander).multiplyScalar(1.2); 

  // Apply hit knockback if active
  if (marshmallow.hitReaction && marshmallow.hitReaction.active) {
    mov.velocity.add(marshmallow.hitReaction.knockbackVelocity);
    marshmallow.hitReaction.knockbackVelocity.multiplyScalar(0.85); // Decay
  }

  mov.position.addScaledVector(mov.velocity, delta);

  // Hard safety boundaries
  if (mov.position.length() > SPHERE_RADIUS - 0.5) {
    mov.position.normalize().multiplyScalar(SPHERE_RADIUS - 0.5);
  }

  marsh.position.x = mov.position.x;
  marsh.position.y = mov.position.y;
  marsh.position.z = mov.position.z;

  // 4. Update Orientation (Face the camera with some wandering rotation)
  let targetDir = camPos.clone().sub(mov.position).normalize();
  
  // Add gentle rotation variation over time to show off different angles
  const rotationPhase = mov.time * 0.3;
  const yawOffset = Math.sin(rotationPhase) * 0.4; // ±23 degrees
  const pitchOffset = Math.cos(rotationPhase * 0.7) * 0.2; // ±11 degrees
  
  // Create rotation offsets
  const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawOffset);
  const pitchAxis = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), targetDir).normalize();
  const pitchQuat = new THREE.Quaternion().setFromAxisAngle(pitchAxis, pitchOffset);
  
  // Apply offsets to target direction
  targetDir.applyQuaternion(yawQuat).applyQuaternion(pitchQuat).normalize();
  
  const currentForward = new THREE.Vector3(0, 1, 0).applyQuaternion(mov.orientation);
  currentForward.lerp(targetDir, Math.min(1.0, 2.5 * delta)).normalize();

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

  mov.orientation.slerp(targetQ, Math.min(1.0, 4.0 * delta));
  marsh.rotation = { x: mov.orientation.x, y: mov.orientation.y, z: mov.orientation.z, w: mov.orientation.w };
  
  // Apply visual bulge effect from hit reaction
  if (marshmallow.hitReaction && marshmallow.hitReaction.bulgeTimer > 0) {
    const bulgeT = marshmallow.hitReaction.bulgeTimer / 0.25;
    const bulgeFactor = 1.0 + Math.sin(bulgeT * Math.PI) * 0.25;
    marsh.scale.x = marshmallow.meltStartScale ? marshmallow.meltStartScale.x * bulgeFactor : marsh.scale.x * bulgeFactor;
    marsh.scale.y = marshmallow.meltStartScale ? marshmallow.meltStartScale.y * bulgeFactor : marsh.scale.y * bulgeFactor;
  } else if (marshmallow.meltStartScale) {
    // Reset to base scale
    marsh.scale.x = marshmallow.meltStartScale.x;
    marsh.scale.y = marshmallow.meltStartScale.y;
  }
}