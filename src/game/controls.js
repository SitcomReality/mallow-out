import { gameState } from './state.js';
import * as THREE from 'three';

export function initControls(container) {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  return { camera };
}

export function updateControls(delta) {
  // Controls functionality has been removed for incremental game conversion.
}