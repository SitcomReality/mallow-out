import { gameState } from './state.js';
import {
  SPAWN_DURATION,
  SPAWN_START_Y,
  SPAWN_END_Y,
  SPAWN_BLEND_START,
  SPAWN_BLEND_END,
  SPAWN_NOISE_START,
  SPAWN_NOISE_END
} from './spawn-constants.js';
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

import * as THREE from 'three';

/**
 * Handles the "popping out of wall" animation for newly spawned marshmallows.
 */
export function updateSpawningMarshmallows(currentTime) {
  const enemy = gameState.currentMarshmallow;
  if (!enemy || enemy.spawnStartTime === undefined) return;

  const elapsed = currentTime - enemy.spawnStartTime;
  const t = Math.min(elapsed / SPAWN_DURATION, 1.0);

  const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // Animate distance from wall (spawn from inside the wall toward the center)
  const mov = enemy.movement;
  // Radius 15 is the wall. Start at 16 (inside wall) and move to ~13.8 (standing on wall)
  const startR = 16.0;
  const endR = mov.radius - 1.2;
  const r = lerp(startR, endR, ease);
  
  enemy.marshmallow.position.x = Math.cos(mov.theta) * Math.cos(mov.phi) * r;
  enemy.marshmallow.position.y = Math.sin(mov.phi) * r;
  enemy.marshmallow.position.z = Math.sin(mov.theta) * Math.cos(mov.phi) * r;

  // Align rotation to inward normal
  const posVec = new THREE.Vector3(enemy.marshmallow.position.x, enemy.marshmallow.position.y, enemy.marshmallow.position.z);
  const inwardNormal = posVec.clone().normalize().multiplyScalar(-1);
  const matrix = new THREE.Matrix4();
  const up = inwardNormal;
  const worldUp = new THREE.Vector3(0, 1, 0);
  let tangent = new THREE.Vector3().crossVectors(worldUp, up).normalize();
  if (tangent.lengthSq() < 0.001) tangent.set(1, 0, 0);
  const bitangent = new THREE.Vector3().crossVectors(up, tangent).normalize();
  matrix.makeBasis(tangent, up, bitangent);
  const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
  const euler = new THREE.Euler().setFromQuaternion(q);
  enemy.marshmallow.rotation.x = euler.x;
  enemy.marshmallow.rotation.y = euler.y;
  enemy.marshmallow.rotation.z = euler.z;

  enemy.marshmallow.blendRadius = lerp(SPAWN_BLEND_START, SPAWN_BLEND_END, ease);

  if (t >= 1.0) {
    delete enemy.spawnStartTime;
  }
}