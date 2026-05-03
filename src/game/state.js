import * as THREE from 'three';

import { settings, worldState } from '../state.js';

export const gameState = {
  player: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    yaw: 0,
    pitch: 0,
  },
  // Current active marshmallow and melting queue
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

  // Weapon state used by shooting/combat logic (prevents undefined accesses)
  weaponStates: {
    skewerCooldown: 0,
    // future weapon-related flags can go here
  },
};

export { settings, worldState };