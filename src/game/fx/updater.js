import { activeFX } from './state.js';
import {
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
} from '../chunk-splash-constants.js';
import {
  HOLE_SPRAY_INITIAL_RADIUS,
  HOLE_SPRAY_FINAL_RADIUS,
  HOLE_SPRAY_INITIAL_NOISE_AMOUNT,
  HOLE_SPRAY_FINAL_NOISE_AMOUNT,
  HOLE_SPRAY_INITIAL_NOISE_SCALE,
  HOLE_SPRAY_FINAL_NOISE_SCALE,
  HOLE_SPRAY_INITIAL_BLEND,
  HOLE_SPRAY_FINAL_BLEND,
  DISSIPATE_NOISE_AMOUNT,
  DISSIPATE_NOISE_SCALE,
  RIPPLE_INITIAL_RADIUS,
  RIPPLE_FINAL_RADIUS,
  RIPPLE_THICKNESS,
  RIPPLE_INITIAL_BLEND,
  RIPPLE_FINAL_BLEND,
} from '../fx-constants.js';

import * as THREE from 'three';

function lerp(a, b, t) {
  return a + (b - a) * t;
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
    
    const vel = fx.fxData.velocity || { x: 0, y: 0, z: 0 };
    const dt = 1.0 / 60.0;
    
    fx.position.x = (fx.position.x || 0) + (vel.x || 0) * dt;
    fx.position.y = (fx.position.y || 0) + (vel.y || 0) * dt;
    fx.position.z = (fx.position.z || 0) + (vel.z || 0) * dt;
    
    if (!fx.noiseOffset) fx.noiseOffset = { x: 0, y: 0, z: 0 };
    
    const noiseSpeed = 8.0;
    fx.noiseOffset.x += (vel.x || 0) * dt * noiseSpeed;
    fx.noiseOffset.y += (vel.y || 0) * dt * noiseSpeed;
    fx.noiseOffset.z += (vel.z || 0) * dt * noiseSpeed;
    
    const dissipateT = t > 0.8 ? (t - 0.8) / 0.2 : 0;
    
    if (fx.fxData.type === 'chunk_splash_group') {
      fx.blendRadius = lerp(CHUNK_SPLASH_GROUP_INITIAL_BLEND, CHUNK_SPLASH_GROUP_FINAL_BLEND, t);
    } else if (fx.fxData.type === 'chunk_splash_sphere1') {
      const radius = lerp(CHUNK_SPLASH_SPHERE1_INITIAL_RADIUS, CHUNK_SPLASH_SPHERE1_FINAL_RADIUS, t);
      fx.scale.x = fx.scale.y = fx.scale.z = radius;
      fx.noiseAmount = lerp(CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_AMOUNT, CHUNK_SPLASH_SPHERE1_FINAL_NOISE_AMOUNT, t);
      fx.noiseScale = lerp(CHUNK_SPLASH_SPHERE1_INITIAL_NOISE_SCALE, CHUNK_SPLASH_SPHERE1_FINAL_NOISE_SCALE, t);
    } else if (fx.fxData.type === 'chunk_splash_sphere2') {
      const radius = lerp(CHUNK_SPLASH_SPHERE2_INITIAL_RADIUS, CHUNK_SPLASH_SPHERE2_FINAL_RADIUS, t);
      fx.scale.x = fx.scale.y = fx.scale.z = radius;
      fx.noiseAmount = lerp(CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_AMOUNT, CHUNK_SPLASH_SPHERE2_FINAL_NOISE_AMOUNT, t);
      fx.noiseScale = lerp(CHUNK_SPLASH_SPHERE2_INITIAL_NOISE_SCALE, CHUNK_SPLASH_SPHERE2_FINAL_NOISE_SCALE, t);
      fx.blendRadius = lerp(CHUNK_SPLASH_SPHERE2_INITIAL_BLEND, CHUNK_SPLASH_SPHERE2_FINAL_BLEND, t);
    } else if (fx.fxData.type === 'hole_spray') {
      fx.scale.x = fx.scale.y = fx.scale.z = lerp(HOLE_SPRAY_INITIAL_RADIUS, HOLE_SPRAY_FINAL_RADIUS, t);
      if (dissipateT > 0) {
        fx.noiseAmount = lerp(HOLE_SPRAY_FINAL_NOISE_AMOUNT, DISSIPATE_NOISE_AMOUNT, dissipateT);
        fx.noiseScale = lerp(HOLE_SPRAY_FINAL_NOISE_SCALE, DISSIPATE_NOISE_SCALE, dissipateT);
      } else {
        fx.noiseAmount = lerp(HOLE_SPRAY_INITIAL_NOISE_AMOUNT, HOLE_SPRAY_FINAL_NOISE_AMOUNT, t);
        fx.noiseScale = lerp(HOLE_SPRAY_INITIAL_NOISE_SCALE, HOLE_SPRAY_FINAL_NOISE_SCALE, t);
      }
      fx.blendRadius = lerp(HOLE_SPRAY_INITIAL_BLEND, HOLE_SPRAY_FINAL_BLEND, t);
    } else if (fx.fxData.type === 'ripple') {
      const finalR = fx.fxData.finalRadius || RIPPLE_FINAL_RADIUS;
      const radius = lerp(RIPPLE_INITIAL_RADIUS, finalR, t);
      fx.scale.x = radius;
      const baseThickness = fx.fxData.thickness || RIPPLE_THICKNESS;
      const thickness = baseThickness * (1.0 - t * t);
      fx.scale.y = thickness;
      fx.blendRadius = lerp(RIPPLE_INITIAL_BLEND, RIPPLE_FINAL_BLEND, t);
      // Sink into the wall
      if (fx.fxData.initialPos === undefined) {
          fx.fxData.initialPos = { x: fx.position.x, y: fx.position.y, z: fx.position.z };
      }
      const p = new THREE.Vector3(fx.fxData.initialPos.x, fx.fxData.initialPos.y, fx.fxData.initialPos.z);
      const normal = p.clone().normalize();
      // Move the ripple outward from the sphere surface over its lifetime (positive normal)
      const currentPos = p.clone().add(normal.multiplyScalar(0.4 * t));
      fx.position.x = currentPos.x;
      fx.position.y = currentPos.y;
      fx.position.z = currentPos.z;
    }
  }
  
  for (const fx of toRemove) {
    const index = activeFX.indexOf(fx);
    if (index > -1) {
      activeFX.splice(index, 1);
    }
  }
}