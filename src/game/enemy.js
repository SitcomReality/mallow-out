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

function getLocalTransform(worldPos, worldQuat, marshmallow) {
  const mPos = new THREE.Vector3(marshmallow.position.x, marshmallow.position.y, marshmallow.position.z);
  const mRot = new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z);
  const mQuat = new THREE.Quaternion().setFromEuler(mRot);
  const mQuatInv = mQuat.clone().invert();

  const localPos = worldPos.clone().sub(mPos).applyQuaternion(mQuatInv);
  const localQuat = mQuatInv.multiply(worldQuat);
  const localRot = new THREE.Euler().setFromQuaternion(localQuat);

  return { 
    position: { x: localPos.x, y: localPos.y, z: localPos.z },
    rotation: { x: localRot.x, y: localRot.y, z: localRot.z }
  };
}

export function addHoleToEnemy(enemy, hitPoint, rayDirection) {
  const holeLength = ENEMY_CYLINDER_RADIUS * 4; 
  const entryOverlap = 0.5;
  const holePosWorld = hitPoint.clone().add(rayDirection.clone().multiplyScalar(holeLength / 2 - entryOverlap));
  
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(up, rayDirection).normalize();
  const angle = Math.acos(up.dot(rayDirection));
  
  const worldQuat = new THREE.Quaternion();
  if (axis.length() > 0.001) {
    worldQuat.setFromAxisAngle(axis, angle);
  }

  const local = getLocalTransform(holePosWorld, worldQuat, enemy.marshmallow);
  
  const hole = {
    id: nextId++,
    type: 'cylinder',
    position: local.position,
    rotation: local.rotation,
    scale: { x: HOLE_RADIUS, y: holeLength / 2, z: 0 },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: 0.05,
    parentId: enemy.marshmallow.id,
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
  
  const mRot = new THREE.Euler(enemy.marshmallow.rotation.x, enemy.marshmallow.rotation.y, enemy.marshmallow.rotation.z);
  const mQuatInv = new THREE.Quaternion().setFromEuler(mRot).invert();
  
  const localPos = hitPoint.clone().sub(new THREE.Vector3(enemy.marshmallow.position.x, enemy.marshmallow.position.y, enemy.marshmallow.position.z)).applyQuaternion(mQuatInv);
  const localNormal = worldNormal.clone().applyQuaternion(mQuatInv);

  const chunk = {
    id: nextId++,
    type: 'sphere',
    position: { x: localPos.x, y: localPos.y, z: localPos.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_RADIUS, y: CHUNK_RADIUS, z: CHUNK_RADIUS },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: CHUNK_REPAIR_INITIAL_BLEND,
    parentId: enemy.marshmallow.id,
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
      normal: localNormal,
      initialScale: CHUNK_RADIUS
    }
  };
  
  enemy.holes.push(chunk);
  enemy.hitCount += 2;
  return chunk;
}

export function addSpattererDamage(enemy, hitPoint, distance) {
  const worldNormal = calculateSurfaceNormal(enemy, hitPoint);
  
  const mRot = new THREE.Euler(enemy.marshmallow.rotation.x, enemy.marshmallow.rotation.y, enemy.marshmallow.rotation.z);
  const mQuatInv = new THREE.Quaternion().setFromEuler(mRot).invert();
  
  const maxRange = 15;
  const minRange = 3;
  const rangeFactor = Math.max(0, Math.min(1, (distance - minRange) / (maxRange - minRange)));
  const offsetDistance = 0.2 + rangeFactor * 0.6;
  
  const damagePosWorld = hitPoint.clone().add(worldNormal.clone().multiplyScalar(offsetDistance));
  const localPos = damagePosWorld.clone().sub(new THREE.Vector3(enemy.marshmallow.position.x, enemy.marshmallow.position.y, enemy.marshmallow.position.z)).applyQuaternion(mQuatInv);
  const localNormal = worldNormal.clone().applyQuaternion(mQuatInv);
  
  const spatterer = {
    id: nextId++,
    type: 'sphere',
    position: { x: localPos.x, y: localPos.y, z: localPos.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0.4, y: 0.4, z: 0.4 },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: 0.1,
    parentId: enemy.marshmallow.id,
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
      normal: localNormal,
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
  const penetrationDepth = 0.15; // Shallower penetration creates a cleaner diamond profile at the surface
  const cubePosWorld = hitPoint.clone().add(rayDirection.clone().multiplyScalar(penetrationDepth));
  
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(up, rayDirection).normalize();
  const angle = Math.acos(up.dot(rayDirection));
  
  const worldQuat = new THREE.Quaternion();
  if (axis.length() > 0.001) {
    worldQuat.setFromAxisAngle(axis, angle);
  }
  
  const local = getLocalTransform(cubePosWorld, worldQuat, enemy.marshmallow);
  
  const mRot = new THREE.Euler(enemy.marshmallow.rotation.x, enemy.marshmallow.rotation.y, enemy.marshmallow.rotation.z);
  const mQuatInv = new THREE.Quaternion().setFromEuler(mRot).invert();
  
  // Use surface normal for repair direction so the wound retreats from the cylinder instead of digging deeper
  const worldNormal = calculateSurfaceNormal(enemy, hitPoint);
  const localNormal = worldNormal.clone().applyQuaternion(mQuatInv);

  const cleaver = {
    id: nextId++,
    type: 'box',
    position: local.position,
    rotation: { x: local.rotation.x + Math.PI / 4, y: local.rotation.y, z: local.rotation.z + Math.PI / 4 },
    scale: { x: 0.8, y: 0.8, z: 0.8 },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: 0.3,
    parentId: enemy.marshmallow.id,
    noiseAmount: 0,
    noiseScale: 1.0,
    noiseOffset: { x: 0, y: 0, z: 0 },
    repairData: {
      type: 'cleaver',
      startTime: performance.now() * 0.001,
      normal: localNormal,
      initialBlend: 0.3
    }
  };
  
  enemy.holes.push(cleaver);
  enemy.hitCount += 4;
  return cleaver;
}

export function addLaserDamage(enemy, hitPoint) {
  const worldNormal = calculateSurfaceNormal(enemy, hitPoint);
  
  const mRot = new THREE.Euler(enemy.marshmallow.rotation.x, enemy.marshmallow.rotation.y, enemy.marshmallow.rotation.z);
  const mQuatInv = new THREE.Quaternion().setFromEuler(mRot).invert();
  
  const localPos = hitPoint.clone().sub(new THREE.Vector3(enemy.marshmallow.position.x, enemy.marshmallow.position.y, enemy.marshmallow.position.z)).applyQuaternion(mQuatInv);
  const localNormal = worldNormal.clone().applyQuaternion(mQuatInv);
  
  const laser = {
    id: nextId++,
    type: 'sphere',
    position: { x: localPos.x, y: localPos.y, z: localPos.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0.15, y: 0.15, z: 0.15 },
    color: '#ff4d6d',
    operation: 'subtract',
    blendRadius: 0.05,
    parentId: enemy.marshmallow.id,
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
      normal: localNormal,
      initialScale: 0.15
    }
  };
  
  enemy.holes.push(laser);
  return laser;
}