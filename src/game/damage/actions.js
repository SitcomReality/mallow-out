import * as THREE from 'three';
import { DAMAGE_TYPES } from './types.js';
import { HOLE_RADIUS, CHUNK_RADIUS } from '../marshmallow-constants.js';
import { CHUNK_REPAIR_INITIAL_BLEND } from '../repair-constants.js';
import { getLocalTransform, calculateSurfaceNormal } from '../marshmallow-utils.js';

let nextId = 5000;

/**
 * HOLEPUNCH: A cylindrical hole through the marshmallow.
 */
export function applyHolepunch(marshmallowEntity, hitPoint, rayDirection) {
  const marshmallow = marshmallowEntity.marshmallow;
  const r = marshmallow.scale.x;
  const h = marshmallow.scale.y;

  // Calculate local ray to find exact exit point and prevent over-penetration (hitting ground)
  const mPos = new THREE.Vector3(marshmallow.position.x, marshmallow.position.y, marshmallow.position.z);
  const mRot = new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z);
  const mQuatInv = new THREE.Quaternion().setFromEuler(mRot).invert();
  
  const localO = hitPoint.clone().sub(mPos).applyQuaternion(mQuatInv);
  const localD = rayDirection.clone().applyQuaternion(mQuatInv).normalize();

  // 1. Intersect with infinite cylinder side: x^2 + z^2 = r^2
  let tSide = Infinity;
  const A = localD.x * localD.x + localD.z * localD.z;
  const B = 2 * (localO.x * localD.x + localO.z * localD.z);
  const C = localO.x * localO.x + localO.z * localO.z - r * r;
  
  if (Math.abs(A) > 0.00001) {
    const disc = B * B - 4 * A * C;
    if (disc >= 0) {
      const sqrtD = Math.sqrt(disc);
      const t1 = (-B - sqrtD) / (2 * A);
      const t2 = (-B + sqrtD) / (2 * A);
      // Pick the exit point (positive t, skipping the entry point t~0)
      if (t1 > 0.005) tSide = t1;
      else if (t2 > 0.005) tSide = t2;
    }
  }

  // 2. Intersect with top/bottom planes: y = +/- h
  let tCap = Infinity;
  if (Math.abs(localD.y) > 0.00001) {
    const targetY = localD.y > 0 ? h : -h;
    const tc = (targetY - localO.y) / localD.y;
    if (tc > 0.005) tCap = tc;
  }

  // The true exit point is the closest positive intersection with the cylinder boundary
  let exitT = Math.min(tSide, tCap);
  if (exitT === Infinity || exitT < 0) exitT = 2.0; // Fallback to safe depth
  
  // Center the hole halfway along its penetration depth, adding a tiny overlap for clean CSG
  const padding = 0.1;
  const halfLen = exitT / 2;
  const holePosWorld = hitPoint.clone().add(rayDirection.clone().multiplyScalar(halfLen));
  
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(up, rayDirection).normalize();
  const angle = Math.acos(up.dot(rayDirection));
  
  const worldQuat = new THREE.Quaternion();
  if (axis.length() > 0.001) {
    worldQuat.setFromAxisAngle(axis, angle);
  }

  const local = getLocalTransform(holePosWorld, worldQuat, marshmallow);
  
  const hole = {
    id: nextId++,
    type: 'cylinder',
    position: local.position,
    rotation: local.rotation,
    scale: { x: HOLE_RADIUS, y: halfLen + padding, z: 0 },
    color: '#ff00ff',
    operation: 'subtract',
    blendRadius: 0.05,
    parentId: marshmallow.id,
    noiseAmount: 0.4,
    noiseScale: 1.0,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    repairData: {
      type: DAMAGE_TYPES.HOLEPUNCH,
      startTime: performance.now() * 0.001,
      initialRadius: HOLE_RADIUS,
      initialHeight: halfLen + padding
    }
  };
  
  marshmallowEntity.holes.push(hole);
  marshmallowEntity.hitCount++;
  return hole;
}

/**
 * ROUND CHUNK: A spherical subtraction from the marshmallow surface.
 */
export function applyRoundChunk(marshmallowEntity, hitPoint) {
  const marshmallow = marshmallowEntity.marshmallow;
  const worldNormal = calculateSurfaceNormal(marshmallow, hitPoint);
  
  const mRot = new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z);
  const mQuatInv = new THREE.Quaternion().setFromEuler(mRot).invert();
  
  const localPos = hitPoint.clone().sub(new THREE.Vector3(marshmallow.position.x, marshmallow.position.y, marshmallow.position.z)).applyQuaternion(mQuatInv);
  const localNormal = worldNormal.clone().applyQuaternion(mQuatInv);

  const chunk = {
    id: nextId++,
    type: 'sphere',
    position: { x: localPos.x, y: localPos.y, z: localPos.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_RADIUS, y: CHUNK_RADIUS, z: CHUNK_RADIUS },
    color: '#ff00ff',
    operation: 'subtract',
    blendRadius: CHUNK_REPAIR_INITIAL_BLEND,
    parentId: marshmallow.id,
    noiseAmount: 0.4,
    noiseScale: 1.0,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    repairData: {
      type: DAMAGE_TYPES.ROUND_CHUNK,
      startTime: performance.now() * 0.001,
      normal: localNormal,
      initialScale: CHUNK_RADIUS
    }
  };
  
  marshmallowEntity.holes.push(chunk);
  marshmallowEntity.hitCount += 2;
  return chunk;
}

/**
 * SPATTER: A noisy spherical subtraction, typical of spread/spatter effects.
 */
export function applySpatter(marshmallowEntity, hitPoint, distance) {
  const marshmallow = marshmallowEntity.marshmallow;
  const worldNormal = calculateSurfaceNormal(marshmallow, hitPoint);
  
  const mRot = new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z);
  const mQuatInv = new THREE.Quaternion().setFromEuler(mRot).invert();
  
  const maxRange = 15;
  const minRange = 3;
  const rangeFactor = Math.max(0, Math.min(1, (distance - minRange) / (maxRange - minRange)));
  const offsetDistance = 0.2 + rangeFactor * 0.6;
  
  const damagePosWorld = hitPoint.clone().add(worldNormal.clone().multiplyScalar(offsetDistance));
  const localPos = damagePosWorld.clone().sub(new THREE.Vector3(marshmallow.position.x, marshmallow.position.y, marshmallow.position.z)).applyQuaternion(mQuatInv);
  const localNormal = worldNormal.clone().applyQuaternion(mQuatInv);
  
  const spatter = {
    id: nextId++,
    type: 'sphere',
    position: { x: localPos.x, y: localPos.y, z: localPos.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0.4, y: 0.4, z: 0.4 },
    color: '#ff00ff',
    operation: 'subtract',
    blendRadius: 0.1,
    parentId: marshmallow.id,
    noiseAmount: 1.5,
    noiseScale: 5.0,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    repairData: {
      type: DAMAGE_TYPES.SPATTER,
      startTime: performance.now() * 0.001,
      normal: localNormal,
      initialNoiseAmount: 1.5,
      initialNoiseScale: 5.0,
      initialOffset: offsetDistance
    }
  };
  
  marshmallowEntity.holes.push(spatter);
  marshmallowEntity.hitCount += 3;
  return spatter;
}

/**
 * KERF CHUNK: A boxy/angled cut into the marshmallow.
 */
export function applyKerfChunk(marshmallowEntity, hitPoint, rayDirection) {
  const marshmallow = marshmallowEntity.marshmallow;
  const worldNormal = calculateSurfaceNormal(marshmallow, hitPoint);
  
  const up = new THREE.Vector3(0, 1, 0);
  const orientQuat = new THREE.Quaternion().setFromUnitVectors(up, worldNormal);
  
  const angle45 = Math.PI / 4;
  const cornerQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(angle45, angle45, angle45));
  const worldQuat = orientQuat.multiply(cornerQuat);
  
  const penetrationOffset = 0.55; 
  const cubePosWorld = hitPoint.clone().add(worldNormal.clone().multiplyScalar(penetrationOffset));
  
  const local = getLocalTransform(cubePosWorld, worldQuat, marshmallow);
  
  const mRot = new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z);
  const mQuatInv = new THREE.Quaternion().setFromEuler(mRot).invert();
  const localNormal = worldNormal.clone().applyQuaternion(mQuatInv);

  const kerf = {
    id: nextId++,
    type: 'box',
    position: local.position,
    rotation: local.rotation,
    scale: { x: 0.8, y: 0.8, z: 0.8 },
    color: '#ff00ff',
    operation: 'subtract',
    blendRadius: 0.3,
    parentId: marshmallow.id,
    noiseAmount: 0,
    noiseScale: 1.0,
    noiseOffset: { x: 0, y: 0, z: 0 },
    repairData: {
      type: DAMAGE_TYPES.KERF_CHUNK,
      startTime: performance.now() * 0.001,
      normal: localNormal,
      initialBlend: 0.3
    }
  };
  
  marshmallowEntity.holes.push(kerf);
  marshmallowEntity.hitCount += 4;
  return kerf;
}