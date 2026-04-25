import * as THREE from 'three';
import { ENEMY_CYLINDER_RADIUS, ENEMY_CYLINDER_HEIGHT, ENEMY_SPAWN_RADIUS, ENEMY_HEIGHT, HOLE_RADIUS, CHUNK_RADIUS } from './constants.js';

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
  };
  
  // Create blood group (will be intersected with marshmallow)
  const bloodGroup = {
    id: bloodGroupId,
    type: 'group',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    operation: 'intersect',
    blendRadius: 0,
    parentId: null,
  };
  
  // Create blood core object (slightly larger sphere to ensure coverage)
  const bloodCore = {
    id: bloodCoreId,
    type: 'sphere',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: ENEMY_CYLINDER_RADIUS * 1.2, y: ENEMY_CYLINDER_RADIUS * 1.2, z: ENEMY_CYLINDER_RADIUS * 1.2 },
    color: '#8B0000', // Dark blood red
    operation: 'union',
    blendRadius: 0,
    parentId: bloodGroupId,
  };
  
  return {
    marshmallow,
    bloodGroup,
    bloodCore,
    holes: [],
    hitCount: 0,
    id: enemyId,
    bloodGroupId,
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
    color: '#000000',
    operation: 'subtract',
    blendRadius: 0.05,
    parentId: enemy.shellGroupId, // Subtraction belongs to the outer shell group
    noiseAmount: 0.4,
    noiseScale: 1.0,
    noiseOffset: { x: 0, y: 0, z: 0 },
  };
  
  enemy.holes.push(hole);
  enemy.hitCount++;
  return hole;
}

export function addChunkToEnemy(enemy, hitPoint) {
  const chunk = {
    id: nextId++,
    type: 'sphere',
    position: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_RADIUS, y: CHUNK_RADIUS, z: CHUNK_RADIUS },
    color: '#000000',
    operation: 'subtract',
    blendRadius: 0.1,
    parentId: enemy.shellGroupId, // Subtraction belongs to the outer shell group
    noiseAmount: 0.4,
    noiseScale: 1.0,
    noiseOffset: { x: 0, y: 0, z: 0 },
  };
  
  enemy.holes.push(chunk);
  enemy.hitCount += 2; // Chunks do more damage
  return chunk;
}