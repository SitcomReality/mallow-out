import * as THREE from 'three';
import { ENEMY_CYLINDER_RADIUS, ENEMY_CYLINDER_HEIGHT, ENEMY_SPAWN_RADIUS, ENEMY_HEIGHT, HOLE_RADIUS } from './constants.js';

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
  
  return {
    id: nextId++,
    type: 'cylinder',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: Math.PI / 2 }, // Standing upright on edge
    scale: { x: ENEMY_CYLINDER_RADIUS, y: ENEMY_CYLINDER_HEIGHT, z: 0 },
    color: '#' + color.getHexString(),
    operation: 'union',
    blendRadius: 0,
    parentId: null,
    holes: [],
    hitCount: 0,
  };
}

export function addHoleToEnemy(enemy, hitPoint, rayDirection) {
  // Create a cylinder along the ray direction that punches through the enemy
  const holeLength = ENEMY_CYLINDER_RADIUS * 3; // Long enough to go through
  
  // Calculate hole position (center of the penetrating cylinder)
  const holePos = hitPoint.clone().add(rayDirection.clone().multiplyScalar(holeLength / 2));
  
  // Calculate rotation to align cylinder with ray direction
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(up, rayDirection).normalize();
  const angle = Math.acos(up.dot(rayDirection));
  
  let rotationX = 0, rotationY = 0, rotationZ = 0;
  if (axis.length() > 0.001) {
    // Convert axis-angle to euler (simplified for this case)
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
    color: '#ffffff',
    operation: 'subtract',
    blendRadius: 0.05,
    parentId: enemy.id,
  };
  
  enemy.holes.push(hole);
  enemy.hitCount++;
  
  return hole;
}