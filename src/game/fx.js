import * as THREE from 'three';
import {
  CHUNK_SPLASH_DURATION,
  CHUNK_SPLASH_SPEED,
  CHUNK_SPLASH_GROUP_INITIAL_BLEND,
  CHUNK_SPLASH_GROUP_FINAL_BLEND,
  CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS,
  CHUNK_SPLASH_SPHERE1_FINAL_RADIUS,
  CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_AMOUNT,
  CHUNK_SPLASH_SPHERE1_FINAL_NOISE_AMOUNT,
  CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_SCALE,
  CHUNK_SPLASH_SPHERE1_FINAL_NOISE_SCALE,
  CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS,
  CHUNK_SPLASH_SPHERE2_FINAL_RADIUS,
  CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_AMOUNT,
  CHUNK_SPLASH_SPHERE2_FINAL_NOISE_AMOUNT,
  CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_SCALE,
  CHUNK_SPLASH_SPHERE2_FINAL_NOISE_SCALE,
  CHUNK_SPLASH_SPHERE2_INITIAL_BLEND,
  CHUNK_SPLASH_SPHERE2_FINAL_BLEND,
} from './chunk-splash-constants.js';
import {
  HOLE_SPRAY_DURATION,
  HOLE_SPRAY_INITIAL_RADIUS,
  HOLE_SPRAY_FINAL_RADIUS,
  HOLE_SPRAY_SPEED,
  HOLE_SPRAY_INITIAL_NOISE_AMOUNT,
  HOLE_SPRAY_FINAL_NOISE_AMOUNT,
  HOLE_SPRAY_INITIAL_NOISE_SCALE,
  HOLE_SPRAY_FINAL_NOISE_SCALE,
  HOLE_SPRAY_INITIAL_BLEND,
  HOLE_SPRAY_FINAL_BLEND,
  DISSIPATE_NOISE_AMOUNT,
  DISSIPATE_NOISE_SCALE,
} from './fx-constants.js';

let nextFxId = 10000;

export const activeFX = [];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function createChunkSplashFX(position, direction, rotation) {
  const groupId = nextFxId++;
  const sphere1Id = nextFxId++;
  const sphere2Id = nextFxId++;
  
  // Group container
  const group = {
    id: groupId,
    type: 'group',
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#ff4d6d',
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
  
  // Sphere 1 (additive)
  const sphere1 = {
    id: sphere1Id,
    type: 'sphere',
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS, y: CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS, z: CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS },
    color: '#ff4d6d',
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
  
  // Sphere 2 (subtractive)
  const sphere2 = {
    id: sphere2Id,
    type: 'sphere',
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS, y: CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS, z: CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS },
    color: '#ff4d6d',
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

export function createHoleSprayFX(entryPoint, exitPoint, direction) {
  const id = nextFxId++;
  
  const fx = {
    id,
    type: 'sphere',
    position: { x: entryPoint.x, y: entryPoint.y, z: entryPoint.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: HOLE_SPRAY_INITIAL_RADIUS, y: HOLE_SPRAY_INITIAL_RADIUS, z: HOLE_SPRAY_INITIAL_RADIUS },
    color: '#ff4d6d',
    operation: 'union',
    blendRadius: HOLE_SPRAY_INITIAL_BLEND,
    noiseAmount: HOLE_SPRAY_INITIAL_NOISE_AMOUNT,
    noiseScale: HOLE_SPRAY_INITIAL_NOISE_SCALE,
    noiseOffset: { 
      x: Math.random() * 100, 
      y: Math.random() * 100, 
      z: Math.random() * 100 
    },
    
    fxData: {
      type: 'hole_spray',
      startTime: performance.now() * 0.001,
      duration: HOLE_SPRAY_DURATION,
      velocity: direction.clone().multiplyScalar(HOLE_SPRAY_SPEED),
      startPos: entryPoint.clone(),
      exitPoint: exitPoint.clone(),
    }
  };
  
  activeFX.push(fx);
  return fx;
}

export function updateFX(currentTime) {
  const toRemove = [];
  
  for (const fx of activeFX) {
    if (!fx.fxData) continue;
    
    const elapsed = currentTime - fx.fxData.startTime;
    const t = Math.min(elapsed / fx.fxData.duration, 1.0);
    
    if (t >= 1.0) {
      toRemove.push(fx);
      continue;
    }
    
    // Update position
    const dt = 1.0 / 60.0; // Approximate delta
    fx.position.x += fx.fxData.velocity.x * dt;
    fx.position.y += fx.fxData.velocity.y * dt;
    fx.position.z += fx.fxData.velocity.z * dt;
    
    // Update noise offset to animate noise in movement direction
    const noiseSpeed = 8.0;
    fx.noiseOffset.x += fx.fxData.velocity.x * dt * noiseSpeed;
    fx.noiseOffset.y += fx.fxData.velocity.y * dt * noiseSpeed;
    fx.noiseOffset.z += fx.fxData.velocity.z * dt * noiseSpeed;
    
    // Check if in dissipation phase (last 20%)
    const dissipateT = t > 0.8 ? (t - 0.8) / 0.2 : 0;
    
    if (fx.fxData.type === 'chunk_splash_group') {
      // Animate group blend
      fx.blendRadius = lerp(CHUNK_SPLASH_GROUP_INITIAL_BLEND, CHUNK_SPLASH_GROUP_FINAL_BLEND, t);
      
    } else if (fx.fxData.type === 'chunk_splash_sphere1') {
      // Animate sphere 1 (additive)
      const radius = lerp(CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS, CHUNK_SPLASH_SPHERE1_FINAL_RADIUS, t);
      fx.scale.x = fx.scale.y = fx.scale.z = radius;
      
      fx.noiseAmount = lerp(CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_AMOUNT, CHUNK_SPLASH_SPHERE1_FINAL_NOISE_AMOUNT, t);
      fx.noiseScale = lerp(CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_SCALE, CHUNK_SPLASH_SPHERE1_FINAL_NOISE_SCALE, t);
      
    } else if (fx.fxData.type === 'chunk_splash_sphere2') {
      // Animate sphere 2 (subtractive)
      const radius = lerp(CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS, CHUNK_SPLASH_SPHERE2_FINAL_RADIUS, t);
      fx.scale.x = fx.scale.y = fx.scale.z = radius;
      
      fx.noiseAmount = lerp(CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_AMOUNT, CHUNK_SPLASH_SPHERE2_FINAL_NOISE_AMOUNT, t);
      fx.noiseScale = lerp(CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_SCALE, CHUNK_SPLASH_SPHERE2_FINAL_NOISE_SCALE, t);
      fx.blendRadius = lerp(CHUNK_SPLASH_SPHERE2_INITIAL_BLEND, CHUNK_SPLASH_SPHERE2_FINAL_BLEND, t);
      
    } else if (fx.fxData.type === 'hole_spray') {
      // Animate sphere parameters
      fx.scale.x = fx.scale.y = fx.scale.z = lerp(HOLE_SPRAY_INITIAL_RADIUS, HOLE_SPRAY_FINAL_RADIUS, t);
      
      if (dissipateT > 0) {
        fx.noiseAmount = lerp(HOLE_SPRAY_FINAL_NOISE_AMOUNT, DISSIPATE_NOISE_AMOUNT, dissipateT);
        fx.noiseScale = lerp(HOLE_SPRAY_FINAL_NOISE_SCALE, DISSIPATE_NOISE_SCALE, dissipateT);
      } else {
        fx.noiseAmount = lerp(HOLE_SPRAY_INITIAL_NOISE_AMOUNT, HOLE_SPRAY_FINAL_NOISE_AMOUNT, t);
        fx.noiseScale = lerp(HOLE_SPRAY_INITIAL_NOISE_SCALE, HOLE_SPRAY_FINAL_NOISE_SCALE, t);
      }
      
      fx.blendRadius = lerp(HOLE_SPRAY_INITIAL_BLEND, HOLE_SPRAY_FINAL_BLEND, t);
    }
  }
  
  // Remove finished FX
  for (const fx of toRemove) {
    const index = activeFX.indexOf(fx);
    if (index > -1) {
      activeFX.splice(index, 1);
    }
  }
}

export function clearAllFX() {
  activeFX.length = 0;
}