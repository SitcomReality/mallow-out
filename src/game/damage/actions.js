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

  const mPos = new THREE.Vector3(marshmallow.position.x, marshmallow.position.y, marshmallow.position.z);
  let mQuatInv;
  if (marshmallow.rotation.w !== undefined) {
    mQuatInv = new THREE.Quaternion(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z, marshmallow.rotation.w).invert();
  } else {
    mQuatInv = new THREE.Quaternion().setFromEuler(new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z)).invert();
  }
  
  const localOrigin = hitPoint.clone().sub(mPos).applyQuaternion(mQuatInv);
  const localDir = rayDirection.clone().applyQuaternion(mQuatInv).normalize();

  let t_y_out = Infinity;
  if (Math.abs(localDir.y) > 1e-6) {
    const t_y1 = (h - localOrigin.y) / localDir.y;
    const t_y2 = (-h - localOrigin.y) / localDir.y;
    t_y_out = Math.max(t_y1, t_y2);
  }

  let t_xz_out = Infinity;
  const a = localDir.x * localDir.x + localDir.z * localDir.z;
  if (a > 1e-6) {
    const b = 2 * (localOrigin.x * localDir.x + localOrigin.z * localDir.z);
    const c = localOrigin.x * localOrigin.x + localOrigin.z * localOrigin.z - r * r;
    const desc = b * b - 4 * a * c;
    if (desc >= 0) {
      t_xz_out = (-b + Math.sqrt(desc)) / (2 * a);
    }
  }

  let rayTravelDistance = Math.min(t_y_out, t_xz_out);
  if (rayTravelDistance < 0 || rayTravelDistance > 10) {
    rayTravelDistance = 2.0 * Math.sqrt(r * r + h * h);
  }

  const bufferLength = 0.5;
  const holeLength = rayTravelDistance + bufferLength;
  const entryOverlap = bufferLength / 2;
  const holePosWorld = hitPoint.clone().add(rayDirection.clone().multiplyScalar(holeLength / 2 - entryOverlap));
  
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
    scale: { x: HOLE_RADIUS, y: holeLength / 2, z: 0 },
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
      initialHeight: holeLength / 2
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
  
  let mQuatInv;
  if (marshmallow.rotation.w !== undefined) {
    mQuatInv = new THREE.Quaternion(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z, marshmallow.rotation.w).invert();
  } else {
    mQuatInv = new THREE.Quaternion().setFromEuler(new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z)).invert();
  }
  
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
    // Reduced noise for more consistent circular chunks
    noiseAmount: 0.2,
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
  
  let mQuatInv;
  if (marshmallow.rotation.w !== undefined) {
    mQuatInv = new THREE.Quaternion(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z, marshmallow.rotation.w).invert();
  } else {
    mQuatInv = new THREE.Quaternion().setFromEuler(new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z)).invert();
  }
  
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

