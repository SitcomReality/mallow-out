import * as THREE from 'three';
import { gameState } from './state.js';
import { 
  BASE_MOVEMENT_SPEED, 
  BASE_BOB_AMPLITUDE,
  MIN_APPROACH_DISTANCE 
} from './marshmallow-type-constants.js';

/**
 * Updates marshmallow movement based on a unified behavior pattern.
 * All marshmallows now share the same movement logic.
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

  // Update movement timer
  mov.moveTimer += delta;
  
  // Occasionally change direction
  if (mov.moveTimer > mov.changeDirectionInterval) {
    mov.moveTimer = 0;
    mov.changeDirectionInterval = 2.0 + Math.random() * 3.0;
    
    let newDir = new THREE.Vector3();
    
    // Unified behavior: circle the player at spawn distance
    const desiredDist = mov.spawnDistance;
    const distDiff = distToPlayer - desiredDist;
    
    // Get perpendicular direction (cross with up vector)
    const perpendicular = new THREE.Vector3().crossVectors(toPlayer, new THREE.Vector3(0, 1, 0)).normalize();
    
    // Maintain rotation direction (clockwise/counter-clockwise)
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
    
    // Add slight randomness
    newDir.x += (Math.random() - 0.5) * 0.4;
    newDir.z += (Math.random() - 0.5) * 0.4;
    newDir.normalize();
    
    mov.targetDirection.copy(newDir);
  }
  
  // Smoothly interpolate current direction toward target
  mov.currentDirection.lerp(mov.targetDirection, Math.min(1, delta * 2.0));
  if (mov.currentDirection.lengthSq() > 0.000001) mov.currentDirection.normalize();
  
  // Apply movement
  const moveStep = mov.speed * delta;
  marshmallow.marshmallow.position.x += mov.currentDirection.x * moveStep;
  marshmallow.marshmallow.position.z += mov.currentDirection.z * moveStep;
  
  // Face movement direction smoothly
  const desiredAngle = Math.atan2(mov.currentDirection.z, -mov.currentDirection.x);
  let currentAngle = marshmallow.marshmallow.rotation.y;
  let diff = desiredAngle - currentAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const rotSpeed = Math.PI * 4;
  const maxStep = rotSpeed * delta;
  diff = Math.max(-maxStep, Math.min(maxStep, diff));
  marshmallow.marshmallow.rotation.y = currentAngle + diff;
  
  // Occasional quick bound
  mov.boundTimer += delta;
  if (mov.boundTimer > mov.boundInterval) {
    mov.boundTimer = 0;
    mov.boundInterval = 3.0 + Math.random() * 4.0;
    const burstAmount = mov.speed * 2.0 * 0.2 * delta;
    marshmallow.marshmallow.position.x += mov.currentDirection.x * burstAmount;
    marshmallow.marshmallow.position.z += mov.currentDirection.z * burstAmount;
  }
  
  // Keep within bounds
  const maxDist = 4.5;
  const pX = marshmallow.marshmallow.position.x;
  const pZ = marshmallow.marshmallow.position.z;
  const distFromOrigin = Math.sqrt(pX * pX + pZ * pZ);
  if (distFromOrigin > maxDist) {
    const angle = Math.atan2(pZ, pX);
    const targetX = Math.cos(angle) * maxDist;
    const targetZ = Math.sin(angle) * maxDist;
    const t = Math.min(1, 4.0 * delta);
    marshmallow.marshmallow.position.x = lerp(pX, targetX, t);
    marshmallow.marshmallow.position.z = lerp(pZ, targetZ, t);
    
    const centerDir = new THREE.Vector3(-pX, 0, -pZ).normalize();
    mov.targetDirection.lerp(centerDir, 0.6);
    mov.targetDirection.normalize();
  }
}