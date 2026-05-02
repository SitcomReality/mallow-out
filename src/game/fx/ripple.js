import { activeFX, getNextFxId } from './state.js';
import {
  RIPPLE_DURATION,
  RIPPLE_INITIAL_RADIUS,
  RIPPLE_THICKNESS,
  RIPPLE_INITIAL_BLEND,
} from '../fx-constants.js';

export function createRippleFX(position) {
  const id = getNextFxId();
  
  const startY = 0.1;
  const endY = -0.6;
  
  const fx = {
    id,
    type: 'torus',
    position: { x: position.x, y: startY, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: RIPPLE_INITIAL_RADIUS, y: RIPPLE_THICKNESS, z: 0 },
    color: '#8afdff',
    operation: 'union',
    blendRadius: RIPPLE_INITIAL_BLEND,
    noiseAmount: 0,
    noiseScale: 1,
    noiseOffset: { x: 0, y: 0, z: 0 },
    
    fxData: {
      type: 'ripple',
      startTime: performance.now() * 0.001,
      duration: RIPPLE_DURATION,
      startY,
      endY
    }
  };
  
  activeFX.push(fx);
  return fx;
}