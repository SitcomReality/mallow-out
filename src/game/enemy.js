import * as THREE from 'three';
import { ENEMY_CYLINDER_RADIUS, ENEMY_CYLINDER_HEIGHT, ENEMY_SPAWN_RADIUS, ENEMY_HEIGHT, HOLE_RADIUS, CHUNK_RADIUS } from './constants.js';
import { EXPRESSION_DEFAULT_EYES } from './face-constants.js';
import { CHUNK_REPAIR_INITIAL_BLEND } from './repair-constants.js';

let nextId = 1;

export function createEnemy() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 3 + Math.random() * ENEMY_SPAWN_RADIUS;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  const hue = Math.random();
  const saturation = 0.6 + Math.random() * 0.4;
  const lightness = 0.4 + Math.random() * 0.3;
  const color = new THREE.Color().setHSL(hue, saturation, lightness);
  
  const enemyId = nextId++;
  const bloodGroupId = nextId++;
  const bloodCoreId = nextId++;
  
  // Create marshmallow shell (outer)
  const marshmallow = {
    id: enemyId,
    type: 'cylinder',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: Math.PI / 2 },
    scale: { x: ENEMY_CYLINDER_RADIUS, y: ENEMY_CYLINDER_HEIGHT, z: 0 },
    color: '#' + color.getHexString(),
    operation: 'union',
    blendRadius: 0,
    parentId: null,
    expression: EXPRESSION_DEFAULT_EYES,
  };
  
  return {
    marshmallow,
    holes: [],
    hitCount: 0,
    id: enemyId,
  };
}

export function addHoleToEnemy(enemy, hitPoint, rayDirection) {
  const holeLength = ENEMY_CYLINDER_RADIUS * 4; 
  const entryOverlap = 0.5;
  const holePos = hitPoint.clone().add(rayDirection.clone().multiplyScalar(holeLength / 2 - entryOverlap));
  
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(up, rayDirection).normalize();
  const angle = Math.acos(up.dot(rayDirection));
  
  let rotationX = 0, rotationY = 0, rotationZ = 0;
  if (axis.length() > 0.001) {
    const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    const euler = new THREE.Euler().setFromQuaternion(q);
    rotationX = euler.x;
    rotationY = euler.y;
    rotationZ = euler.z;
  }
  
  const hole = {
    id: nextId++,
    type: 'cylinder',
    position: { x: holePos.x, y: holePos.y, z: holePos.z },
    rotation: { x: rotationX, y: rotationY, z: rotationZ },
    scale: { x: HOLE_RADIUS, y: holeLength / 2, z: 0 },
    color: '#8B0000',
    operation: 'subtract',
    blendRadius: 0.05,
    parentId: null,
    noiseAmount: 0.4,
    noiseScale: 1.0,
    noiseOffset: { x: 0, y: 0, z: 0 },
    repairData: {
      type: 'hole',
      startTime: performance.now() * 0.001,
      initialRadius: HOLE_RADIUS,
      initialHeight: holeLength / 2
    }
  };
  
  enemy.holes.push(hole);
  enemy.hitCount++;
  return hole;
}

export function addChunkToEnemy(enemy, hitPoint) {
  // Calculate cylinder surface normal at intersection point in world-space.
  // We compute the vector from the marshmallow center to the hit point, project
  // it onto the marshmallow's local axis (which may be rotated), and decide if
  // the hit is on a cap (use axis direction) or on the side (use radial).
  const center = new THREE.Vector3(enemy.marshmallow.position.x, enemy.marshmallow.position.y, enemy.marshmallow.position.z);
  const euler = new THREE.Euler(enemy.marshmallow.rotation.x, enemy.marshmallow.rotation.y, enemy.marshmallow.rotation.z);
  const q = new THREE.Quaternion().setFromEuler(euler);
  const axisWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(q); // marshmallow local 'up' in world space

  const toHit = hitPoint.clone().sub(center);
  const proj = toHit.dot(axisWorld);

  let worldNormal = new THREE.Vector3();
  // If the hit is on the caps (near top/bottom), normal is along the axis direction
  if (Math.abs(proj) >= enemy.marshmallow.scale.y - 0.01) {
    worldNormal.copy(axisWorld).multiplyScalar(Math.sign(proj));
  } else {
    // Side hit: radial normal is the component perpendicular to the axis
    const radial = toHit.clone().sub(axisWorld.clone().multiplyScalar(proj));
    if (radial.lengthSq() < 1e-6) {
      // Fallback to axis if numerical issues occur
      worldNormal.copy(axisWorld).multiplyScalar(1.0);
    } else {
      worldNormal.copy(radial).normalize();
    }
  }

  const chunk = {
    id: nextId++,
    type: 'sphere',
    position: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_RADIUS, y: CHUNK_RADIUS, z: CHUNK_RADIUS },
    color: '#8B0000',
    operation: 'subtract',
    blendRadius: CHUNK_REPAIR_INITIAL_BLEND,
    parentId: null,
    noiseAmount: 0.4,
    noiseScale: 1.0,
    noiseOffset: { x: 0, y: 0, z: 0 },
    repairData: {
      type: 'chunk',
      startTime: performance.now() * 0.001,
      normal: worldNormal,
      initialScale: CHUNK_RADIUS
    }
  };
  
  enemy.holes.push(chunk);
  enemy.hitCount += 2; // Chunks do more damage
  return chunk;
}