import * as THREE from 'three';
import { gameState } from './state.js';
import { MIN_APPROACH_DISTANCE } from './marshmallow-type-constants.js';

/**
 * Updates marshmallow movement based on its type and behavior
 */
export function updateMarshmallowMovement(marshmallow, delta) {
  if (!marshmallow.movement) return;
  
  const mov = marshmallow.movement;
  const pos = new THREE.Vector3(
    marshmallow.marshmallow.position.x,
    marshmallow.marshmallow.position.y,
    marshmallow.marshmallow.position.z
  );
  
  // Update bob phase (skip if currently spawning to avoid height conflict)
  if (marshmallow.spawnStartTime === undefined) {
    mov.bobPhase += delta * 2.0;
    const bobOffset = Math.sin(mov.bobPhase) * mov.bobAmplitude;
    marshmallow.marshmallow.position.y = mov.baseY + bobOffset;
  }
  
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
  mov.currentDirection.lerp(mov.targetDirection, delta * 2.0);
  mov.currentDirection.normalize();
  
  // Apply movement if not stationary
  if (mov.pattern !== 'stationary') {
    // Handle speed boost decay for smooth bounding
    if (mov.speedBoost > 0) {
      mov.speedBoost = Math.max(0, mov.speedBoost - delta * 2.5); // Decay over ~0.8s
    }

    let boostFactor = 1.0 + (mov.speedBoost || 0);
    let moveSpeed = mov.speed * boostFactor * delta;
    
    // Stop friendly marshmallows if they are at or within minimum range
    if (isFriendly && distToPlayer <= MIN_APPROACH_DISTANCE) {
      moveSpeed = 0;
    }

    marshmallow.marshmallow.position.x += mov.currentDirection.x * moveSpeed;
    marshmallow.marshmallow.position.z += mov.currentDirection.z * moveSpeed;
    
    // Face movement direction
    // Our marshmallow is a cylinder on its side (rot.z = PI/2), so local Y-cap is the "face" vector.
    // Initially local Y points to world (-1, 0, 0). To align it with currentDirection (dirX, dirZ),
    // we rotate around the Y-axis by atan2(dirZ, -dirX).
    const angle = Math.atan2(mov.currentDirection.z, -mov.currentDirection.x);
    marshmallow.marshmallow.rotation.y = angle;
  }
  
  // Occasional quick bound (except for shy/stationary)
  if (mov.pattern !== 'fleeing' && mov.pattern !== 'stationary') {
    mov.boundTimer += delta;
    if (mov.boundTimer > mov.boundInterval) {
      mov.boundTimer = 0;
      mov.boundInterval = 4.0 + Math.random() * 5.0;
      
      // Trigger smooth acceleration burst instead of teleporting
      mov.speedBoost = 2.0; 
    }
  }
  
  // Keep within bounds (loose boundary)
  const maxDist = 20; 
  const distFromOrigin = Math.sqrt(
    marshmallow.marshmallow.position.x ** 2 + 
    marshmallow.marshmallow.position.z ** 2
  );

  if (distFromOrigin > maxDist) {
    // Only hard clamp if they are way outside (failsafe)
    if (distFromOrigin > maxDist + 2.0) {
      const angle = Math.atan2(marshmallow.marshmallow.position.z, marshmallow.marshmallow.position.x);
      marshmallow.marshmallow.position.x = Math.cos(angle) * maxDist;
      marshmallow.marshmallow.position.z = Math.sin(angle) * maxDist;
    }
    
    // Smoothly turn toward center rather than snapping
    mov.targetDirection.set(-marshmallow.marshmallow.position.x, 0, -marshmallow.marshmallow.position.z).normalize();
    // Force a logic update for direction
    mov.moveTimer = mov.changeDirectionInterval;
  }
}