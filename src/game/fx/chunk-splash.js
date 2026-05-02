import * as THREE from 'three';
import { activeFX, getNextFxId } from './state.js';
import {
  CHUNK_SPLASH_DURATION,
  CHUNK_SPLASH_SPEED,
  CHUNK_SPLASH_GROUP_INITIAL_BLEND,
  CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS,
  CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_AMOUNT,
  CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_SCALE,
  CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS,
  CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_AMOUNT,
  CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_SCALE,
  CHUNK_SPLASH_SPHERE2_INITIAL_BLEND,
} from '../chunk-splash-constants.js';

export function createChunkSplashFX(position, direction, rotation) {
  const groupId = getNextFxId();
  const sphere1Id = getNextFxId();
  const sphere2Id = getNextFxId();
  
  const group = {
    id: groupId,
    type: 'group',
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#ff00ff',
    operation: 'union',
    blendRadius: CHUNK_SPLASH_GROUP_INITIAL_BLEND,
    noiseAmount: 0,
    noiseScale: 1,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    fxData: {
      type: 'chunk_splash_group',
      startTime: performance.now() * 0.001,
      duration: CHUNK_SPLASH_DURATION,
      velocity: direction.clone().multiplyScalar(-CHUNK_SPLASH_SPEED),
      startPos: position.clone(),
    }
  };
  
  const sphere1 = {
    id: sphere1Id,
    type: 'sphere',
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS, y: CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS, z: CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS },
    color: '#ff00ff',
    operation: 'union',
    blendRadius: 0,
    noiseAmount: CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_AMOUNT,
    noiseScale: CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_SCALE,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    parentId: groupId,
    fxData: {
      type: 'chunk_splash_sphere1',
      startTime: performance.now() * 0.001,
      duration: CHUNK_SPLASH_DURATION,
      velocity: direction.clone().multiplyScalar(-CHUNK_SPLASH_SPEED),
      startPos: position.clone(),
    }
  };
  
  const sphere2 = {
    id: sphere2Id,
    type: 'sphere',
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS, y: CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS, z: CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS },
    color: '#ff00ff',
    operation: 'subtract',
    blendRadius: CHUNK_SPLASH_SPHERE2_INITIAL_BLEND,
    noiseAmount: CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_AMOUNT,
    noiseScale: CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_SCALE,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    parentId: groupId,
    fxData: {
      type: 'chunk_splash_sphere2',
      startTime: performance.now() * 0.001,
      duration: CHUNK_SPLASH_DURATION,
      velocity: direction.clone().multiplyScalar(-CHUNK_SPLASH_SPEED),
      startPos: position.clone(),
    }
  };
  
  activeFX.push(group, sphere1, sphere2);
  return { group, sphere1, sphere2 };
}