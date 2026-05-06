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
    const inwardNormal = enemy.spawnPosWorld.clone().normalize().multiplyScalar(-1);
    
    // Pick random tangent velocity
    const randomDir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
    mov.velocity = randomDir.projectOnPlane(inwardNormal).normalize();
    mov.targetVelocity = mov.velocity.clone();
  }

  const inwardNormal = enemy.spawnPosWorld.clone().normalize().multiplyScalar(-1);
  const tangentVelocity = mov.velocity.clone().projectOnPlane(inwardNormal).normalize();
  
  const right = new THREE.Vector3().crossVectors(inwardNormal, tangentVelocity).normalize();

  // Start orientation: Face first towards center
  const mStart = new THREE.Matrix4().makeBasis(
    tangentVelocity.clone().multiplyScalar(-1), // Up
    inwardNormal, // Forward
    right
  );
  const qStart = new THREE.Quaternion().setFromRotationMatrix(mStart);

  // End orientation: Wandering on surface
  const mEnd = new THREE.Matrix4().makeBasis(
    inwardNormal, // Up
    tangentVelocity, // Forward
    right
  );
  const qEnd = new THREE.Quaternion().setFromRotationMatrix(mEnd);

  const qCurrent = qStart.clone().slerp(qEnd, ease);
  const euler = new THREE.Euler().setFromQuaternion(qCurrent);
  
  marsh.rotation.x = euler.x;
  marsh.rotation.y = euler.y;
  marsh.rotation.z = euler.z;

  const padding = marsh.scale.x + 0.3;
  const startPos = enemy.spawnPosWorld.clone().add(inwardNormal.clone().multiplyScalar(-2.0)); // Deep inside wall
  const endPos = enemy.spawnPosWorld.clone().normalize().multiplyScalar(mov.radius - padding);

  const posVec = startPos.clone().lerp(endPos, ease);

  marsh.position.x = posVec.x;
  marsh.position.y = posVec.y;
  marsh.position.z = posVec.z;

  marsh.blendRadius = lerp(SPAWN_BLEND_START, SPAWN_BLEND_END, ease);

  if (t >= 1.0) {
    delete enemy.spawnStartTime;
    // Synchronize movement state to current position to prevent velocity spikes on handover.
    // Also initialize angular wander (theta/phi) from the final world position so the mallow
    // will continue smoothly from where it emerged rather than snapping to its default orbit.
    if (mov) {
      const finalPos = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
      mov.lastPos = finalPos.clone();

      // Derive spherical coordinates from world-space position
      const r = finalPos.length();
      const phi = r > 0.0001 ? Math.asin(THREE.MathUtils.clamp(finalPos.y / r, -1, 1)) : mov.phi || 0;
      const theta = Math.atan2(finalPos.z, finalPos.x);

      // Initialize angular state and targets to the spawn-aligned orientation
      mov.theta = theta;
      mov.phi = phi;
      mov.targetTheta = theta;
      mov.targetPhi = phi;

      // Use the final radius as the current orbit radius and pick a nearby target radius for gentle drifting
      mov.orbitRadius = r;
      // Keep the target modestly inward so it can gently wander without an abrupt radius jump
      mov.orbitRadiusTarget = Math.max(2.0, Math.min(r, 9.0));
    }
  }
}