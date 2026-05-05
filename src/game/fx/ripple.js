import { activeFX, getNextFxId } from './state.js';
import {
  RIPPLE_DURATION,
  RIPPLE_INITIAL_RADIUS,
  RIPPLE_THICKNESS,
  RIPPLE_INITIAL_BLEND,
  RIPPLE_FINAL_RADIUS,
  CHARGED_RIPPLE_DURATION,
  CHARGED_RIPPLE_FINAL_RADIUS,
  CHARGED_RIPPLE_THICKNESS
} from '../fx-constants.js';

export function createRippleFX(position, isCharged = false) {
  const id = getNextFxId();
  
  const startY = 0.3;
  const endY = -0.4;
  
  const duration = isCharged ? CHARGED_RIPPLE_DURATION : RIPPLE_DURATION;
  const finalRadius = isCharged ? CHARGED_RIPPLE_FINAL_RADIUS : RIPPLE_FINAL_RADIUS;
  const thickness = isCharged ? CHARGED_RIPPLE_THICKNESS : RIPPLE_THICKNESS;

  const fx = {
    id,
    type: 'torus',
    position: { x: position.x, y: startY, z: position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: RIPPLE_INITIAL_RADIUS, y: thickness, z: 0 },
    color: '#8afdff',
    operation: 'union',
    blendRadius: RIPPLE_INITIAL_BLEND,
    noiseAmount: 0,
    noiseScale: 1,
    noiseOffset: { x: 0, y: 0, z: 0 },
    
    fxData: {
      type: 'ripple',
      startTime: performance.now() * 0.001,
      duration: duration,
      startY,
      endY,
      finalRadius,
      thickness
    }
  };
  
  activeFX.push(fx);
  return fx;
}