import { gameState } from './state.js';
import {
  SPAWN_DURATION,
  SPAWN_BLEND_START,
  SPAWN_BLEND_END
} from './spawn-constants.js';
import * as THREE from 'three';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function updateSpawningMarshmallows(currentTime) {
  const enemy = gameState.currentMarshmallow;
  if (!enemy || enemy.spawnStartTime === undefined) return;

  const elapsed = currentTime - enemy.spawnStartTime;
  const t = Math.min(elapsed / SPAWN_DURATION, 1.0);
  const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const mov = enemy.movement;
  const marsh = enemy.marshmallow;

  if (!enemy.spawnPosWorld) {
    enemy.spawnPosWorld = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
    const spawnRadius = enemy.spawnPosWorld.length();
    
    // Initialize movement state to match spawn
    mov.position = enemy.spawnPosWorld.clone();
    mov.velocity = new THREE.Vector3(0, 0, 0);
    
    // Face inward with upright orientation
    const inward = enemy.spawnPosWorld.clone().normalize().multiplyScalar(-1);
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(worldUp, inward).normalize();
    const up = new THREE.Vector3().crossVectors(inward, right).normalize();
    
    const matrix = new THREE.Matrix4().makeBasis(up, inward, right);
    mov.orientation = new THREE.Quaternion().setFromRotationMatrix(matrix);
  }

  const padding = marsh.scale.x + 0.3;
  const targetRadius = 6.0;
  const startPos = enemy.spawnPosWorld.clone().normalize().multiplyScalar(10.0 + 2.0);
  const endPos = enemy.spawnPosWorld.clone().normalize().multiplyScalar(targetRadius);

  mov.position.copy(startPos).lerp(endPos, ease);
  
  marsh.position.x = mov.position.x;
  marsh.position.y = mov.position.y;
  marsh.position.z = mov.position.z;
  marsh.blendRadius = lerp(SPAWN_BLEND_START, SPAWN_BLEND_END, ease);

  // Keep face upright and pointing inward during spawn
  const inward = mov.position.clone().normalize().multiplyScalar(-1);
  const worldUp = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(worldUp, inward);
  if (right.lengthSq() < 0.01) {
    right.set(1, 0, 0).cross(inward);
  }
  right.normalize();
  const up = new THREE.Vector3().crossVectors(inward, right).normalize();
  
  const targetMatrix = new THREE.Matrix4().makeBasis(up, inward, right);
  const targetQ = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);
  mov.orientation.slerp(targetQ, Math.min(1, 8.0 * (1.0/60.0)));
  
  marsh.rotation = { x: mov.orientation.x, y: mov.orientation.y, z: mov.orientation.z, w: mov.orientation.w };

  if (t >= 1.0) {
    // Finish spawn state
    delete enemy.spawnStartTime;

    // Ensure movement state is fully initialized
    if (!mov.position) {
      mov.position = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
    }
    if (!mov.orientation) {
      const inward = mov.position.clone().normalize().multiplyScalar(-1);
      const worldUp = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(worldUp, inward).normalize();
      const up = new THREE.Vector3().crossVectors(inward, right).normalize();
      const matrix = new THREE.Matrix4().makeBasis(up, inward, right);
      mov.orientation = new THREE.Quaternion().setFromRotationMatrix(matrix);
    }
    if (!mov.velocity) mov.velocity = new THREE.Vector3(0, 0, 0);

    // Start gentle wandering: mostly tangent to the sphere surface with a small randomized
    // lateral and upward component so the marshmallow drifts softly in front of the camera.
    const tangent = new THREE.Vector3(-inward.z, 0, inward.x).normalize();

    const rand = () => (Math.random() - 0.5);
    const lateral = new THREE.Vector3(rand(), 0.12 * (0.5 + Math.random() * 0.5), rand());

    // Compose final velocity with conservative magnitudes to avoid it flying out of view.
    mov.velocity.copy(tangent).multiplyScalar(0.35).add(lateral.multiplyScalar(0.18));

    // Small initial bob phase/time offset so motion feels organic
    mov.bobPhase = mov.bobPhase || (Math.random() * Math.PI * 2);
    mov.time = mov.time || 0;

    // Write final transform back to the SDF marsh object so the shader sees the orientation/position immediately
    marsh.position.x = mov.position.x;
    marsh.position.y = mov.position.y;
    marsh.position.z = mov.position.z;
    marsh.rotation = { x: mov.orientation.x, y: mov.orientation.y, z: mov.orientation.z, w: mov.orientation.w };
  }
}