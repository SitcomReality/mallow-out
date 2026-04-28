import * as THREE from 'three';
import { ENEMY_CYLINDER_RADIUS, ENEMY_CYLINDER_HEIGHT, ENEMY_SPAWN_RADIUS, ENEMY_HEIGHT, HOLE_RADIUS, CHUNK_RADIUS } from './constants.js';
import { EXPRESSION_DEFAULT } from './face-constants.js';
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
    expression: EXPRESSION_DEFAULT,
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
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: 0.05,
    parentId: null,
    noiseAmount: 0.4,
    noiseScale: 1.0,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
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

function calculateSurfaceNormal(enemy, hitPoint) {
  const center = new THREE.Vector3(enemy.marshmallow.position.x, enemy.marshmallow.position.y, enemy.marshmallow.position.z);
  const euler = new THREE.Euler(enemy.marshmallow.rotation.x, enemy.marshmallow.rotation.y, enemy.marshmallow.rotation.z);
  const q = new THREE.Quaternion().setFromEuler(euler);
  const axisWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(q);

  const toHit = hitPoint.clone().sub(center);
  const proj = toHit.dot(axisWorld);

  let worldNormal = new THREE.Vector3();
  if (Math.abs(proj) >= enemy.marshmallow.scale.y - 0.01) {
    worldNormal.copy(axisWorld).multiplyScalar(Math.sign(proj));
  } else {
    const radial = toHit.clone().sub(axisWorld.clone().multiplyScalar(proj));
    if (radial.lengthSq() < 1e-6) {
      worldNormal.copy(axisWorld).multiplyScalar(1.0);
    } else {
      worldNormal.copy(radial).normalize();
    }
  }
  return worldNormal;
}

export function addChunkToEnemy(enemy, hitPoint) {
  const worldNormal = calculateSurfaceNormal(enemy, hitPoint);

  const chunk = {
    id: nextId++,
    type: 'sphere',
    position: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_RADIUS, y: CHUNK_RADIUS, z: CHUNK_RADIUS },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: CHUNK_REPAIR_INITIAL_BLEND,
    parentId: null,
    noiseAmount: 0.4,
    noiseScale: 1.0,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    repairData: {
      type: 'chunk',
      startTime: performance.now() * 0.001,
      normal: worldNormal,
      initialScale: CHUNK_RADIUS
    }
  };
  
  enemy.holes.push(chunk);
  enemy.hitCount += 2;
  return chunk;
}

export function addSpattererDamage(enemy, hitPoint, distance) {
  const worldNormal = calculateSurfaceNormal(enemy, hitPoint);
  
  // Range-based positioning: closer shots have sphere closer to surface
  const maxRange = 15;
  const minRange = 3;
  const rangeFactor = Math.max(0, Math.min(1, (distance - minRange) / (maxRange - minRange)));
  const offsetDistance = 0.2 + rangeFactor * 0.6; // 0.2 to 0.8 units from surface
  
  const damagePos = hitPoint.clone().add(worldNormal.clone().multiplyScalar(offsetDistance));
  
  const spatterer = {
    id: nextId++,
    type: 'sphere',
    position: { x: damagePos.x, y: damagePos.y, z: damagePos.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0.4, y: 0.4, z: 0.4 },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: 0.1,
    parentId: null,
    noiseAmount: 1.5,
    noiseScale: 5.0,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    repairData: {
      type: 'spatterer',
      startTime: performance.now() * 0.001,
      normal: worldNormal,
      initialNoiseAmount: 1.5,
      initialNoiseScale: 5.0,
      initialOffset: offsetDistance
    }
  };
  
  enemy.holes.push(spatterer);
  enemy.hitCount += 3;
  return spatterer;
}

export function addCleaverDamage(enemy, hitPoint, rayDirection) {
  const worldNormal = calculateSurfaceNormal(enemy, hitPoint);
  
  // Position cube so one corner penetrates the surface
  const penetrationDepth = 0.6;
  const cubePos = hitPoint.clone().add(rayDirection.clone().multiplyScalar(penetrationDepth));
  
  // Orient cube so corner points toward hit
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
  
  const cleaver = {
    id: nextId++,
    type: 'box',
    position: { x: cubePos.x, y: cubePos.y, z: cubePos.z },
    rotation: { x: rotationX + Math.PI / 4, y: rotationY, z: rotationZ + Math.PI / 4 },
    scale: { x: 0.8, y: 0.8, z: 0.8 },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: 0.3,
    parentId: null,
    noiseAmount: 0,
    noiseScale: 1.0,
    noiseOffset: { x: 0, y: 0, z: 0 },
    repairData: {
      type: 'cleaver',
      startTime: performance.now() * 0.001,
      normal: rayDirection.clone(),
      initialBlend: 0.3
    }
  };
  
  enemy.holes.push(cleaver);
  enemy.hitCount += 4;
  return cleaver;
}

export function addLaserDamage(enemy, hitPoint) {
  const worldNormal = calculateSurfaceNormal(enemy, hitPoint);
  
  const laser = {
    id: nextId++,
    type: 'sphere',
    position: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0.15, y: 0.15, z: 0.15 },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: 0.05,
    parentId: null,
    noiseAmount: 0.3,
    noiseScale: 2.0,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    repairData: {
      type: 'laser',
      startTime: performance.now() * 0.001,
      normal: worldNormal,
      initialScale: 0.15
    }
  };
  
  enemy.holes.push(laser);
  return laser;
}