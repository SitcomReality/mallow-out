import * as THREE from 'three';
import { gameState } from './state.js';
import { 
  BASE_MOVEMENT_SPEED, 
  BASE_BOB_AMPLITUDE
} from './marshmallow-type-constants.js';

/**
 * Marshmallow movement simplified to be mostly random and independent of the player.
 * Movement and turning speeds reduced for a gentler, wandering motion.
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
  
  // Update bob phase (unchanged)
  mov.bobPhase += delta * 2.0;
  const bobOffset = Math.sin(mov.bobPhase) * mov.bobAmplitude;
  marshmallow.marshmallow.position.y = mov.baseY + bobOffset;
  
  // Update movement timer
  mov.moveTimer += delta;
  
  // Occasionally pick a new random direction (no player-avoidance logic)
  if (mov.moveTimer > mov.changeDirectionInterval) {
    mov.moveTimer = 0;
    mov.changeDirectionInterval = 2.0 + Math.random() * 3.0;
    
    // Pick a mostly tangential random direction with gentle bias so they wander
    const randAngle = Math.random() * Math.PI * 2;
    const jitter = 0.4;
    const newDir = new THREE.Vector3(
      Math.cos(randAngle) + (Math.random() - 0.5) * jitter,
      0,
      Math.sin(randAngle) + (Math.random() - 0.5) * jitter
    ).normalize();
    
    // Ensure a rotation sign exists to provide mild circling variety
    if (!mov.rotationSign) mov.rotationSign = Math.random() < 0.5 ? 1 : -1;
    // Slightly bias perpendicular motion for a more organic circle-like wander
    const perp = new THREE.Vector3(-newDir.z, 0, newDir.x).multiplyScalar(0.2 * mov.rotationSign);
    newDir.add(perp).normalize();
    
    mov.targetDirection.copy(newDir);
  }
  
  // Smoothly interpolate current direction toward target, but slower (reduced turning speed)
  mov.currentDirection.lerp(mov.targetDirection, Math.min(1, delta * 1.0)); // slower blending
  if (mov.currentDirection.lengthSq() > 0.000001) mov.currentDirection.normalize();
  
  // Apply reduced movement speed
  const speedMultiplier = 0.6; // slower overall
  const moveStep = mov.speed * speedMultiplier * delta;
  marshmallow.marshmallow.position.x += mov.currentDirection.x * moveStep;
  marshmallow.marshmallow.position.z += mov.currentDirection.z * moveStep;
  
  // Face movement direction smoothly with reduced rotational agility
  const desiredAngle = Math.atan2(mov.currentDirection.z, -mov.currentDirection.x);
  let currentAngle = marshmallow.marshmallow.rotation.y;
  let diff = desiredAngle - currentAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const rotSpeed = Math.PI * 2; // reduced from previous value
  const maxStep = rotSpeed * delta;
  diff = Math.max(-maxStep, Math.min(maxStep, diff));
  marshmallow.marshmallow.rotation.y = currentAngle + diff;
  
  // Occasional small bounds-aware nudge (keeps them inside arena without aggressive correction)
  const maxDist = 4.5;
  const pX = marshmallow.marshmallow.position.x;
  const pZ = marshmallow.marshmallow.position.z;
  const distFromOrigin = Math.sqrt(pX * pX + pZ * pZ);
  if (distFromOrigin > maxDist) {
    // Gently nudge back toward the playable area
    const angle = Math.atan2(pZ, pX);
    const targetX = Math.cos(angle) * maxDist;
    const targetZ = Math.sin(angle) * maxDist;
    const t = Math.min(1, 1.5 * delta); // gentler lerp
    marshmallow.marshmallow.position.x = lerp(pX, targetX, t);
    marshmallow.marshmallow.position.z = lerp(pZ, targetZ, t);
    
    // Slightly bias direction back inward rather than snapping
    const centerDir = new THREE.Vector3(-pX, 0, -pZ).normalize();
    mov.targetDirection.lerp(centerDir, 0.15);
    mov.targetDirection.normalize();
  }
}