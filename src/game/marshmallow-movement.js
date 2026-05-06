import { gameState } from './state.js';
import * as THREE from 'three';

export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying || marshmallow.spawnStartTime !== undefined) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  const posVec = new THREE.Vector3(marsh.position.x, marsh.position.y, marsh.position.z);
  const inwardNormal = posVec.clone().normalize().multiplyScalar(-1);

  if (!mov.velocity) {
    const randomDir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
    mov.velocity = randomDir.projectOnPlane(inwardNormal).normalize();
    mov.targetVelocity = mov.velocity.clone();
  }

  mov.wanderTimer -= delta;
  
  if (mov.wanderTimer <= 0) {
    mov.wanderTimer = 2.0 + Math.random() * 3.0;
    
    // Pick a new target direction tangent to the surface
    const randomDir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
    // Bias the random direction slightly towards the front so it doesn't just jitter in place
    randomDir.add(mov.velocity).normalize(); 
    mov.targetVelocity = randomDir.projectOnPlane(inwardNormal).normalize();
  }

  // Smoothly rotate velocity towards target
  mov.velocity.lerp(mov.targetVelocity, delta * 2.0).projectOnPlane(inwardNormal).normalize();

  // Move position along velocity
  posVec.add(mov.velocity.clone().multiplyScalar(mov.speed * delta));

  mov.bobPhase += delta * 2.0;
  const bob = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  
  // Padding: cylinder radius (scale.x) + some extra to prevent clipping into the sphere wall
  const padding = marsh.scale.x + 0.3;
  const currentRadius = mov.radius - padding + bob; 

  // Snap back to spherical surface
  posVec.normalize().multiplyScalar(currentRadius);

  marsh.position.x = posVec.x;
  marsh.position.y = posVec.y;
  marsh.position.z = posVec.z;

  // Re-calculate inward normal at new position
  const newInwardNormal = posVec.clone().normalize().multiplyScalar(-1);

  // Orient "upright" relative to the sphere wall.
  // localX = Up (inwardNormal)
  // localY = Forward (velocity)
  // localZ = Right
  const up = newInwardNormal;
  const forward = mov.velocity.clone().projectOnPlane(up).normalize();
  const right = new THREE.Vector3().crossVectors(up, forward).normalize();
  forward.crossVectors(right, up).normalize();

  const matrix = new THREE.Matrix4();
  matrix.makeBasis(up, forward, right);
  const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
  const euler = new THREE.Euler().setFromQuaternion(q);
  
  marsh.rotation.x = euler.x;
  marsh.rotation.y = euler.y;
  marsh.rotation.z = euler.z;
}