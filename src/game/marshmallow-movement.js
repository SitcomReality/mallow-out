import * as THREE from 'three';
import { gameState } from './state.js';
import { MIN_APPROACH_DISTANCE } from './marshmallow-type-constants.js';

/**
 * Updates marshmallow movement based on its type and behavior
 * Changes:
 *  - Ensure bursts and boundary corrections are frame-rate dependent
 *  - Smoothly nudge out-of-bounds positions instead of instant snapping
 */

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement) return;
  
  const mov = marshmallow.movement;
  const pos = new THREE.Vector3(
    marshmallow.marshmallow.position.x,
    marshmallow.marshmallow.position.y,
    marshmallow.marshmallow.position.z
  );
  
  // Update bob phase
  mov.bobPhase += delta * 2.0;
  const bobOffset = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  marshmallow.marshmallow.position.y = mov.baseY + bobOffset;
  
  // Calculate relative player info
  const playerPos = gameState.player.position;
  const toPlayer = new THREE.Vector3().subVectors(playerPos, pos);
  const distToPlayer = toPlayer.length();
  toPlayer.normalize();

  // Handle immediate proximity avoidance (Panic retreat)
  const tooClose = distToPlayer < MIN_APPROACH_DISTANCE;
  const isFriendly = mov.pattern === 'approaching';

  if (tooClose && !isFriendly && mov.pattern !== 'stationary') {
    // If we're not friendly and too close, force retreat regardless of timer
    const retreatDir = toPlayer.clone().multiplyScalar(-1);
    mov.targetDirection.copy(retreatDir).normalize();
  }

  // Update movement timer
  mov.moveTimer += delta;
  
  // Occasionally change direction based on behavior
  if (mov.moveTimer > mov.changeDirectionInterval) {
    mov.moveTimer = 0;
    mov.changeDirectionInterval = 2.0 + Math.random() * 3.0;
    
    let newDir = new THREE.Vector3();
    
    if (mov.pattern === 'wandering') {
      // Default behavior: move perpendicular to player to circle at spawn distance
      const desiredDist = mov.spawnDistance;
      const distDiff = distToPlayer - desiredDist;
      
      // Get perpendicular direction (cross with up vector)
      const perpendicular = new THREE.Vector3().crossVectors(toPlayer, new THREE.Vector3(0, 1, 0)).normalize();
      
      // Maintain rotation direction (clockwise/counter-clockwise) to avoid erratic flips
      if (!mov.rotationSign) mov.rotationSign = Math.random() < 0.5 ? 1 : -1;
      perpendicular.multiplyScalar(mov.rotationSign);
      
      // Add slight radial component to maintain distance
      if (Math.abs(distDiff) > 1.0) {
        const radialBias = distDiff > 0 ? -0.4 : 0.4; // Move in/out to correct distance
        newDir.copy(perpendicular).multiplyScalar(0.7);
        newDir.addScaledVector(toPlayer, radialBias);
      } else {
        newDir.copy(perpendicular);
      }
      
      // Add randomness
      newDir.x += (Math.random() - 0.5) * 0.4;
      newDir.z += (Math.random() - 0.5) * 0.4;
      newDir.normalize();
      
    } else if (mov.pattern === 'fleeing') {
      // Shy type - move away from player
      newDir.copy(toPlayer).multiplyScalar(-1);
      newDir.x += (Math.random() - 0.5) * 0.3;
      newDir.z += (Math.random() - 0.5) * 0.3;
      newDir.normalize();
      
    } else if (mov.pattern === 'approaching') {
      // Friendly type - move toward player only if outside minimum distance
      if (distToPlayer > MIN_APPROACH_DISTANCE) {
        newDir.copy(toPlayer);
        newDir.x += (Math.random() - 0.5) * 0.3;
        newDir.z += (Math.random() - 0.5) * 0.3;
      } else {
        // Already at closest range, just stop
        newDir.set(0, 0, 0);
      }
      newDir.normalize();
      
    } else if (mov.pattern === 'frantic') {
      // Frantic type - completely random
      newDir.set(
        Math.random() - 0.5,
        0,
        Math.random() - 0.5
      ).normalize();
    }
    
    // Smoothly transition to new direction
    mov.targetDirection.copy(newDir);
  }
  
  // Smoothly interpolate current direction toward target
  mov.currentDirection.lerp(mov.targetDirection, Math.min(1, delta * 2.0));
  if (mov.currentDirection.lengthSq() > 0.000001) mov.currentDirection.normalize();
  
  // Apply movement if not stationary
  if (mov.pattern !== 'stationary') {
    let moveStep = mov.speed * delta;
    
    // Stop friendly marshmallows if they are at or within minimum range
    if (isFriendly && distToPlayer <= MIN_APPROACH_DISTANCE) {
      moveStep = 0;
    }

    marshmallow.marshmallow.position.x += mov.currentDirection.x * moveStep;
    marshmallow.marshmallow.position.z += mov.currentDirection.z * moveStep;
    
    // Face movement direction smoothly (interpolate rotation to avoid snap)
    const desiredAngle = Math.atan2(mov.currentDirection.z, -mov.currentDirection.x);
    // Shortest angle interpolation
    let currentAngle = marshmallow.marshmallow.rotation.y;
    let diff = desiredAngle - currentAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const rotSpeed = Math.PI * 4; // rad/s rotation responsiveness
    const maxStep = rotSpeed * delta;
    diff = Math.max(-maxStep, Math.min(maxStep, diff));
    marshmallow.marshmallow.rotation.y = currentAngle + diff;
  }
  
  // Occasional quick bound (except for shy/stationary)
  if (mov.pattern !== 'fleeing' && mov.pattern !== 'stationary') {
    mov.boundTimer += delta;
    if (mov.boundTimer > mov.boundInterval) {
      mov.boundTimer = 0;
      mov.boundInterval = 3.0 + Math.random() * 4.0;
      
      // Quick acceleration burst - frame-rate dependent and smoothed
      const burstSpeed = mov.speed * 2.0;
      const burstAmount = burstSpeed * 0.2 * delta; // scaled by delta
      marshmallow.marshmallow.position.x += mov.currentDirection.x * burstAmount;
      marshmallow.marshmallow.position.z += mov.currentDirection.z * burstAmount;
    }
  }
  
  // Keep within bounds (loose boundary) - nudge smoothly instead of teleport
  const maxDist = 4.5;
  const pX = marshmallow.marshmallow.position.x;
  const pZ = marshmallow.marshmallow.position.z;
  const distFromOrigin = Math.sqrt(pX * pX + pZ * pZ);
  if (distFromOrigin > maxDist) {
    const angle = Math.atan2(pZ, pX);
    const targetX = Math.cos(angle) * maxDist;
    const targetZ = Math.sin(angle) * maxDist;
    
    // Smoothly move towards the clamped position to avoid snapping
    const nudgeSpeed = 4.0; // units per second for corrective nudge
    const t = Math.min(1, nudgeSpeed * delta);
    marshmallow.marshmallow.position.x = lerp(pX, targetX, t);
    marshmallow.marshmallow.position.z = lerp(pZ, targetZ, t);
    
    // Turn toward center smoothly by biasing the target direction
    const centerDir = new THREE.Vector3(-marshmallow.marshmallow.position.x, 0, -marshmallow.marshmallow.position.z).normalize();
    mov.targetDirection.lerp(centerDir, 0.6); // bias strongly toward center
    mov.targetDirection.normalize();
  }
}