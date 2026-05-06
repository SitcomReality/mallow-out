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

  // Normalize incoming position: accept THREE.Vector3 or plain {x,y,z}
  const posVec = (position && typeof position.clone === 'function')
    ? position.clone()
    : new THREE.Vector3(position.x || 0, position.y || 0, position.z || 0);

  // Align with sphere normal
  const normal = posVec.clone().normalize();
  const matrix = new THREE.Matrix4();
  const tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
  const bitangent = normal.clone().cross(tangent).normalize();
  matrix.makeBasis(tangent, normal, bitangent);
  const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
  const euler = new THREE.Euler().setFromQuaternion(q);

  const fx = {
    id,
    type: 'torus',
    position: { x: posVec.x, y: posVec.y, z: posVec.z },
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
      thickness,
      initialPos: { x: posVec.x, y: posVec.y, z: posVec.z }
    }
  };
  
  activeFX.push(fx);
  return fx;
}