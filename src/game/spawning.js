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
    delete enemy.spawnStartTime;
    // Seamlessly transition to wandering with gentle initial drift
    const tangent = new THREE.Vector3(-inward.z, 0, inward.x).normalize();

    // Add a small randomized lateral + upward component so the marshmallow
    // doesn't continue in a perfectly straight line — gives gentle "floaty" wandering.
    const rand = () => (Math.random() - 0.5);
    const lateral = new THREE.Vector3(rand(), 0.15 * (0.3 + Math.random() * 0.7), rand()).normalize();
    // Blend the tangent with the lateral jitter and keep overall speed modest
    mov.velocity.copy(tangent).multiplyScalar(0.45).add(lateral.multiplyScalar(0.25));
  }
}