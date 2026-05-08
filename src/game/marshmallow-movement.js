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
  }

  // Determine target facing direction based on organic noise + soft centering
  const turnNoiseX = Math.sin(mov.time * 0.3 + mov.bobPhase) * 0.6;
  const turnNoiseZ = Math.cos(mov.time * 0.25 + mov.bobPhase * 1.1) * 0.6;
  const turnNoiseY = Math.sin(mov.time * 0.4 + mov.bobPhase * 0.8) * 0.3;

  let targetDir = new THREE.Vector3(turnNoiseX, turnNoiseY, turnNoiseZ).normalize();

  // Add gentle centering force to keep it in view
  const camPos = gameState.player.position;
  const camForward = new THREE.Vector3(
    Math.sin(gameState.player.yaw) * Math.cos(gameState.player.pitch),
    Math.sin(gameState.player.pitch),
    -Math.cos(gameState.player.yaw) * Math.cos(gameState.player.pitch)
  ).normalize();

  const viewCenter = camPos.clone().add(camForward.multiplyScalar(6.0));
  const toCenter = viewCenter.clone().sub(mov.position);
  const centerDist = toCenter.length();

  if (centerDist > 3.0) {
    const pull = Math.min(1.0, (centerDist - 3.0) * 0.2);
    targetDir.lerp(toCenter.normalize(), pull).normalize();
  }

  // Soft boundary from camera
  const toCam = mov.position.clone().sub(camPos);
  if (toCam.length() < MIN_CAMERA_DISTANCE + 1.0) {
    targetDir.lerp(toCam.normalize(), 0.5).normalize();
  }

  // Soft boundary from sphere edge
  const maxDist = SPHERE_RADIUS - INNER_MARGIN;
  if (mov.position.length() > maxDist) {
    const inward = mov.position.clone().normalize().multiplyScalar(-1);
    targetDir.lerp(inward, 0.8).normalize();
  }

  // Get current forward vector from orientation (Local +Y is forward for the cylinder face)
  const currentForward = new THREE.Vector3(0, 1, 0).applyQuaternion(mov.orientation);

  // Smoothly turn current forward towards target dir
  currentForward.lerp(targetDir, 0.8 * delta).normalize();

  // Build upright-constrained basis from the new forward
  const worldUp = new THREE.Vector3(0, 1, 0);
  let right = new THREE.Vector3().crossVectors(worldUp, currentForward);
  if (right.lengthSq() < 0.01) {
    right.set(1, 0, 0).cross(currentForward);
  }
  right.normalize();
  const up = new THREE.Vector3().crossVectors(currentForward, right).normalize();

  const targetMatrix = new THREE.Matrix4().makeBasis(right, up, currentForward.clone().negate());
  // Correction: We want local Y to be 'up' on the face, and local Z to be forward/back.
  // The cylinder is along Y. Let's make basis: X=right, Y=up(normal), Z=forward.
  targetMatrix.makeBasis(right, up, currentForward);
  const targetQ = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);

  // Extremely gentle slerp
  mov.orientation.slerp(targetQ, Math.min(1, 2.0 * delta));

  // Update visual rotation directly with quaternion
  marsh.rotation = { x: mov.orientation.x, y: mov.orientation.y, z: mov.orientation.z, w: mov.orientation.w };

  // Move exactly along the orientation's forward vector
  const moveForward = new THREE.Vector3(0, 1, 0).applyQuaternion(mov.orientation);
  const bobY = Math.cos(mov.time * 1.5 + mov.bobPhase) * 0.15;

  mov.velocity.copy(moveForward).multiplyScalar(DRIFT_SPEED);
  mov.velocity.y += bobY;

  mov.position.addScaledVector(mov.velocity, delta);

  // Hard limits
  if (mov.position.distanceTo(camPos) < MIN_CAMERA_DISTANCE) {
    mov.position.copy(camPos).add(mov.position.clone().sub(camPos).normalize().multiplyScalar(MIN_CAMERA_DISTANCE));
  }
  if (mov.position.length() > SPHERE_RADIUS - INNER_MARGIN) {
    mov.position.normalize().multiplyScalar(SPHERE_RADIUS - INNER_MARGIN);
  }

  marsh.position.x = mov.position.x;
  marsh.position.y = mov.position.y;
  marsh.position.z = mov.position.z;
}