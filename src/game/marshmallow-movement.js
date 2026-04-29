import * as THREE from 'three';
import { gameState } from './state.js';

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
  
  // Update bob phase
  mov.bobPhase += delta * 2.0;
  const bobOffset = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  marshmallow.marshmallow.position.y = mov.baseY + bobOffset;
  
  // Update movement timer
  mov.moveTimer += delta;
  
  // Occasionally change direction based on behavior
  if (mov.moveTimer > mov.changeDirectionInterval) {
    mov.moveTimer = 0;
    mov.changeDirectionInterval = 2.0 + Math.random() * 3.0;
    
    // Calculate desired direction based on behavior
    const playerPos = gameState.player.position;
    const toPlayer = new THREE.Vector3().subVectors(playerPos, pos);
    const distToPlayer = toPlayer.length();
    toPlayer.normalize();
    
    let newDir = new THREE.Vector3();
    
    if (mov.pattern === 'wandering') {
      // Default behavior: move perpendicular to player to circle at spawn distance
      const desiredDist = mov.spawnDistance;
      const distDiff = distToPlayer - desiredDist;
      
      // Get perpendicular direction (cross with up vector)
      const perpendicular = new THREE.Vector3().crossVectors(toPlayer, new THREE.Vector3(0, 1, 0)).normalize();
      
      // Randomly pick clockwise or counter-clockwise
      if (Math.random() < 0.5) perpendicular.multiplyScalar(-1);
      
      // Add slight radial component to maintain distance
      if (Math.abs(distDiff) > 1.0) {
        const radialBias = distDiff > 0 ? -0.3 : 0.3; // Move in/out to correct distance
        newDir.copy(perpendicular).multiplyScalar(1 - Math.abs(radialBias));
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
      // Friendly type - move toward player
      newDir.copy(toPlayer);
      newDir.x += (Math.random() - 0.5) * 0.3;
      newDir.z += (Math.random() - 0.5) * 0.3;
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
    const moveSpeed = mov.speed * delta;
    marshmallow.marshmallow.position.x += mov.currentDirection.x * moveSpeed;
    marshmallow.marshmallow.position.z += mov.currentDirection.z * moveSpeed;
    
    // Face movement direction
    const angle = Math.atan2(mov.currentDirection.x, -mov.currentDirection.z);
    marshmallow.marshmallow.rotation.y = angle;
  }
  
  // Occasional quick bound (except for shy/stationary)
  if (mov.pattern !== 'fleeing' && mov.pattern !== 'stationary') {
    mov.boundTimer += delta;
    if (mov.boundTimer > mov.boundInterval) {
      mov.boundTimer = 0;
      mov.boundInterval = 3.0 + Math.random() * 4.0;
      
      // Quick acceleration burst
      const burstSpeed = mov.speed * 2.0;
      marshmallow.marshmallow.position.x += mov.currentDirection.x * burstSpeed * 0.2;
      marshmallow.marshmallow.position.z += mov.currentDirection.z * burstSpeed * 0.2;
    }
  }
  
  // Keep within bounds (loose boundary)
  const maxDist = 15;
  const distFromOrigin = Math.sqrt(
    marshmallow.marshmallow.position.x ** 2 + 
    marshmallow.marshmallow.position.z ** 2
  );
  if (distFromOrigin > maxDist) {
    const angle = Math.atan2(marshmallow.marshmallow.position.z, marshmallow.marshmallow.position.x);
    marshmallow.marshmallow.position.x = Math.cos(angle) * maxDist;
    marshmallow.marshmallow.position.z = Math.sin(angle) * maxDist;
    
    // Turn toward center
    mov.targetDirection.set(-marshmallow.marshmallow.position.x, 0, -marshmallow.marshmallow.position.z).normalize();
  }
}