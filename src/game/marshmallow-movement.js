import { gameState } from './state.js';
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

/**
 * Idle movement for the marshmallow pet: wandering around the marsh floor.
 * Uses a gentle "wander" steering approach and robust boundary correction to avoid getting stuck.
 */
import * as THREE from 'three';

export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying || marshmallow.spawnStartTime !== undefined) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  mov.wanderTimer -= delta;
  
  if (mov.wanderTimer <= 0) {
    mov.wanderTimer = 2.0 + Math.random() * 4.0;
    // Wander within a range on the back wall
    mov.targetTheta = Math.PI + (Math.random() - 0.5) * 1.8;
    mov.targetPhi = (Math.random() - 0.5) * 1.2;
  }

  // Smoothly lerp spherical coordinates
  mov.theta += (mov.targetTheta - mov.theta) * delta * mov.speed;
  mov.phi += (mov.targetPhi - mov.phi) * delta * mov.speed;

  mov.bobPhase += delta * 1.5;
  const bob = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  const r = mov.radius - bob; // "Floating" off the wall

  // Update position on the sphere
  marsh.position.x = Math.cos(mov.theta) * Math.cos(mov.phi) * r;
  marsh.position.y = Math.sin(mov.phi) * r;
  marsh.position.z = Math.sin(mov.theta) * Math.cos(mov.phi) * r;

  // Orient "face first" - height (Y) aligns with normal (outwards from center)
  const posVec = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
  const normal = posVec.clone().normalize();
  
  // Create rotation matrix where Up is the normal
  const matrix = new THREE.Matrix4();
  const up = normal;
  const tangent = new THREE.Vector3(0, 1, 0).cross(up).normalize();
  const bitangent = up.clone().cross(tangent).normalize();
  
  matrix.makeBasis(tangent, up, bitangent);
  const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
  const euler = new THREE.Euler().setFromQuaternion(q);
  
  marsh.rotation.x = euler.x;
  marsh.rotation.y = euler.y;
  marsh.rotation.z = euler.z;
}