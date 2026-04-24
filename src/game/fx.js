import * as THREE from 'three';
import {
  CHUNK_SPLASH_DURATION,
  CHUNK_SPLASH_INITIAL_RADIUS,
  CHUNK_SPLASH_FINAL_RADIUS,
  CHUNK_SPLASH_TUBE_RADIUS,
  CHUNK_SPLASH_SPEED,
  CHUNK_SPLASH_INITIAL_NOISE_AMOUNT,
  CHUNK_SPLASH_FINAL_NOISE_AMOUNT,
  CHUNK_SPLASH_INITIAL_NOISE_SCALE,
  CHUNK_SPLASH_FINAL_NOISE_SCALE,
  CHUNK_SPLASH_INITIAL_BLEND,
  CHUNK_SPLASH_FINAL_BLEND,
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

export function createChunkSplashFX(position, direction) {
  const id = nextFxId++;
  
  // Compute perpendicular vector for torus orientation
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(direction, up).normalize();
  if (right.length() < 0.01) {
    right.set(1, 0, 0);
  }
  const actualUp = new THREE.Vector3().crossVectors(direction, right).normalize();
  
  const fx = {
    id,
    type: 'torus',
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: CHUNK_SPLASH_INITIAL_RADIUS, y: CHUNK_SPLASH_TUBE_RADIUS, z: 0 },
    color: '#8B0000',
    operation: 'union',
    blendRadius: CHUNK_SPLASH_INITIAL_BLEND,
    noiseAmount: CHUNK_SPLASH_INITIAL_NOISE_AMOUNT,
    noiseScale: CHUNK_SPLASH_INITIAL_NOISE_SCALE,
    noiseOffset: { x: 0, y: 0, z: 0 },
    
    fxData: {
      type: 'chunk_splash',
      startTime: performance.now() * 0.001,
      duration: CHUNK_SPLASH_DURATION,
      velocity: direction.clone().multiplyScalar(CHUNK_SPLASH_SPEED),
      startPos: position.clone(),
    }
  };
  
  // Compute rotation to align torus normal with direction
  const euler = new THREE.Euler();
  const matrix = new THREE.Matrix4();
  matrix.lookAt(new THREE.Vector3(0, 0, 0), direction, actualUp);
  euler.setFromRotationMatrix(matrix);
  fx.rotation.x = euler.x;
  fx.rotation.y = euler.y;
  fx.rotation.z = euler.z;
  
  activeFX.push(fx);
  return fx;
}

export function createHoleSprayFX(entryPoint, exitPoint, direction) {
  const id = nextFxId++;
  
  const fx = {
    id,
    type: 'sphere',
    position: { x: entryPoint.x, y: entryPoint.y, z: entryPoint.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: HOLE_SPRAY_INITIAL_RADIUS, y: HOLE_SPRAY_INITIAL_RADIUS, z: HOLE_SPRAY_INITIAL_RADIUS },
    color: '#8B0000',
    operation: 'union',
    blendRadius: HOLE_SPRAY_INITIAL_BLEND,
    noiseAmount: HOLE_SPRAY_INITIAL_NOISE_AMOUNT,
    noiseScale: HOLE_SPRAY_INITIAL_NOISE_SCALE,
    noiseOffset: { x: 0, y: 0, z: 0 },
    
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
    
    if (fx.fxData.type === 'chunk_splash') {
      // Animate torus parameters
      fx.scale.x = lerp(CHUNK_SPLASH_INITIAL_RADIUS, CHUNK_SPLASH_FINAL_RADIUS, t);
      
      if (dissipateT > 0) {
        fx.noiseAmount = lerp(CHUNK_SPLASH_FINAL_NOISE_AMOUNT, DISSIPATE_NOISE_AMOUNT, dissipateT);
        fx.noiseScale = lerp(CHUNK_SPLASH_FINAL_NOISE_SCALE, DISSIPATE_NOISE_SCALE, dissipateT);
      } else {
        fx.noiseAmount = lerp(CHUNK_SPLASH_INITIAL_NOISE_AMOUNT, CHUNK_SPLASH_FINAL_NOISE_AMOUNT, t);
        fx.noiseScale = lerp(CHUNK_SPLASH_INITIAL_NOISE_SCALE, CHUNK_SPLASH_FINAL_NOISE_SCALE, t);
      }
      
      fx.blendRadius = lerp(CHUNK_SPLASH_INITIAL_BLEND, CHUNK_SPLASH_FINAL_BLEND, t);
      
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