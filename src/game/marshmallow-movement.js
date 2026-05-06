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
    mov.wanderTimer = 3.0 + Math.random() * 5.0;
    // The "back wall" center for our fixed camera is roughly theta=4.71, phi=-0.6
    // We constrain wander to stay within view (approx +/- 0.6 rad from center)
    mov.targetTheta = 4.71 + (Math.random() - 0.5) * 1.0; 
    mov.targetPhi = -0.5 + (Math.random() - 0.5) * 0.6;
  }

  // Smoothly lerp spherical coordinates for a gentle wander
  mov.theta += (mov.targetTheta - mov.theta) * delta * mov.speed;
  mov.phi += (mov.targetPhi - mov.phi) * delta * mov.speed;

  mov.bobPhase += delta * 2.0;
  const bob = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  // Offset from sphere wall (radius 15) so it stands *inside*
  const currentRadius = mov.radius - 1.2 + bob; 

  // Update position on the sphere
  marsh.position.x = Math.cos(mov.theta) * Math.cos(mov.phi) * currentRadius;
  marsh.position.y = Math.sin(mov.phi) * currentRadius;
  marsh.position.z = Math.sin(mov.theta) * Math.cos(mov.phi) * currentRadius;

  // Orient "upright" relative to the sphere wall. 
  // In a hollow sphere, "Up" for a character standing on the wall is toward the center.
  const posVec = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
  const inwardNormal = posVec.clone().normalize().multiplyScalar(-1);
  
  // Create rotation matrix where Cylinder Y (height) matches inwardNormal
  const matrix = new THREE.Matrix4();
  const up = inwardNormal;
  // Use world-up to keep the mallow "standing" upright relative to the horizon where possible
  const worldUp = new THREE.Vector3(0, 1, 0);
  let tangent = new THREE.Vector3().crossVectors(worldUp, up).normalize();
  if (tangent.lengthSq() < 0.001) tangent.set(1, 0, 0);
  const bitangent = new THREE.Vector3().crossVectors(up, tangent).normalize();
  
  matrix.makeBasis(tangent, up, bitangent);
  const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
  const euler = new THREE.Euler().setFromQuaternion(q);
  
  marsh.rotation.x = euler.x;
  marsh.rotation.y = euler.y;
  marsh.rotation.z = euler.z;
}