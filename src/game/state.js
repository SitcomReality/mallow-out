import * as THREE from 'three';

import { settings, worldState } from '../state.js';

export const gameState = {
  player: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    yaw: 0,
    pitch: 0,
  },
  currentMarshmallow: null,
  meltingMarshmallows: [],
  objects: [],
  totalMarshmallowsDestroyed: 0,
  currencies: {
    pollen: 0,
    caramel: 0,
  },
  upgrades: {
    pollen_multiplier: 0,
    caramel_bonus: 0,
  },
};

export { settings, worldState };