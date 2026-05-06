import { gameState } from './state.js';
import * as THREE from 'three';

export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement || marshmallow.isDying || marshmallow.spawnStartTime !== undefined) return;
  
  const mov = marshmallow.movement;
  const marsh = marshmallow.marshmallow;

  // 1. Target Management
  mov.wanderTimer -= delta;
  if (mov.wanderTimer <= 0) {
    mov.wanderTimer = 3.0 + Math.random() * 4.0;
    
    // Define a wander volume in front of the camera
    // Camera is at (0, 6.5, 8.5), looking slightly down at the origin.
    // We want the marshmallow to float in the central space (around Y=3, Z=2)
    mov.targetPos.set(
      (Math.random() - 0.5) * 8.0, // X Range
      2.0 + Math.random() * 4.0,   // Y Range
      -1.0 + Math.random() * 6.0   // Z Range
    );
  }

  // 2. Physics & Acceleration
  const toTarget = mov.targetPos.clone().sub(mov.currentPos);
  const dist = toTarget.length();
  
  // Gentle attraction
  if (dist > 0.1) {
    const force = toTarget.normalize().multiplyScalar(mov.speed * delta);
    mov.velocity.add(force);
  }
  
  // Drag to keep movement smooth and non-jittery
  mov.velocity.multiplyScalar(0.97);
  
  // Update current logical position
  mov.currentPos.add(mov.velocity.clone().multiplyScalar(delta * 2.0));

  // 3. Procedural Wobble (Sinusoids)
  mov.bobPhase += delta;
  const time = mov.bobPhase + mov.noiseSeed;
  
  // Position offsets
  const wobbleX = Math.sin(time * 0.7) * mov.bobAmplitude;
  const wobbleY = Math.cos(time * 0.85) * mov.bobAmplitude;
  const wobbleZ = Math.sin(time * 1.1) * mov.bobAmplitude;
  
  // Apply to actual visual object
  marsh.position.x = mov.currentPos.x + wobbleX;
  marsh.position.y = mov.currentPos.y + wobbleY;
  marsh.position.z = mov.currentPos.z + wobbleZ;

  // 4. Orientation
  // Face the direction of logical movement
  if (mov.velocity.lengthSq() > 0.001) {
    const forward = mov.velocity.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    
    // Smoothly interpolate forward direction to avoid snapping
    if (!mov.currentForward) mov.currentForward = forward.clone();
    mov.currentForward.lerp(forward, delta * 3.0).normalize();
    
    const right = new THREE.Vector3().crossVectors(up, mov.currentForward).normalize();
    const actualUp = new THREE.Vector3().crossVectors(mov.currentForward, right).normalize();
    
    // Add procedural "sway" to the rotation
    const swayX = Math.sin(time * 1.2) * 0.15;
    const swayZ = Math.cos(time * 0.9) * 0.15;
    
    const matrix = new THREE.Matrix4();
    // In our raymarching SDF, "Up" for a cylinder is its local Y-axis
    // We want the cylinder to move "face first", which means its cap (Y axis) is the forward dir.
    matrix.makeBasis(right, mov.currentForward, actualUp);
    
    const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
    
    // Apply sway offset
    const swayQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(swayX, 0, swayZ));
    q.multiply(swayQ);

    const euler = new THREE.Euler().setFromQuaternion(q);
    marsh.rotation.x = euler.x;
    marsh.rotation.y = euler.y;
    marsh.rotation.z = euler.z;
  }
}