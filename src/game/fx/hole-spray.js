import { activeFX, getNextFxId } from './state.js';
import {
  HOLE_SPRAY_DURATION,
  HOLE_SPRAY_INITIAL_RADIUS,
  HOLE_SPRAY_SPEED,
  HOLE_SPRAY_INITIAL_NOISE_AMOUNT,
  HOLE_SPRAY_INITIAL_NOISE_SCALE,
  HOLE_SPRAY_INITIAL_BLEND,
} from '../fx-constants.js';

export function createHoleSprayFX(entryPoint, exitPoint, direction) {
  const id = getNextFxId();
  
  const fx = {
    id,
    type: 'sphere',
    position: { x: entryPoint.x, y: entryPoint.y, z: entryPoint.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: HOLE_SPRAY_INITIAL_RADIUS, y: HOLE_SPRAY_INITIAL_RADIUS, z: HOLE_SPRAY_INITIAL_RADIUS },
    color: '#ff00ff',
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