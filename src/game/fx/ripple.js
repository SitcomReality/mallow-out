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

  // Align with sphere normal. Ensure torus Y-axis matches the surface normal
  const normal = posVec.clone().normalize();

  // Build an orthonormal basis where Y = normal. We prefer the bitangent as X to avoid a 90° twist.
  // Use a robust fallback when normal is nearly parallel to world-up.
  const worldUp = new THREE.Vector3(0, 1, 0);
  let tangent = new THREE.Vector3().crossVectors(worldUp, normal);
  if (tangent.lengthSq() < 1e-6) {
    // normal is nearly parallel to worldUp — pick a different vector for cross
    tangent = new THREE.Vector3(1, 0, 0).cross(normal);
  }
  tangent.normalize();

  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

  // Make basis so the torus' local Y-axis equals the surface normal (ring lies in the tangent plane).
  // Use tangent as X and bitangent as Z to keep consistent handedness with shader conventions.
  const matrix = new THREE.Matrix4();
  matrix.makeBasis(tangent, normal, bitangent);
  const q = new THREE.Quaternion().setFromRotationMatrix(matrix);
  const euler = new THREE.Euler().setFromQuaternion(q, 'XYZ');

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