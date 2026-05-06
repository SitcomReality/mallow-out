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

import * as THREE from 'three';

export function createRippleFX(position, isCharged = false) {
  const id = getNextFxId();
  
  const duration = isCharged ? CHARGED_RIPPLE_DURATION : RIPPLE_DURATION;
  const finalRadius = isCharged ? CHARGED_RIPPLE_FINAL_RADIUS : RIPPLE_FINAL_RADIUS;
  const thickness = isCharged ? CHARGED_RIPPLE_THICKNESS : RIPPLE_THICKNESS;

  // Align with sphere normal
  const normal = position.clone().normalize();
  const matrix = new THREE.Matrix4();
  const tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
  const bitangent = normal.clone().cross(tangent).normalize();
  matrix.makeBasis(tangent, normal, bitangent);
  const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
  const euler = new THREE.Euler().setFromQuaternion(q);

  const fx = {
    id,
    type: 'torus',
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { x: euler.x, y: euler.y, z: euler.z },
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
      finalRadius,
      thickness
    }
  };
  
  activeFX.push(fx);
  return fx;
}