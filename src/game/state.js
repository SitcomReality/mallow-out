import * as THREE from 'three';

import { settings, worldState } from '../state.js'; // Re-export global settings/worldState for in-game modules

export const gameState = {
  player: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    yaw: 0,
    pitch: 0,
    recoilTime: 0,
    recoilPitchAmount: 0,
    recoilYawAmount: 0,
    recoilKickDuration: 0,
    recoilRecoveryDuration: 0,
    recoilReturnOffset: 0,
  },
  currentMarshmallow: null,
  meltingMarshmallows: [],
  objects: [],
  currentWeapon: 0,
  totalMarshmallowsDestroyed: 0,
  currencies: {
    pollen: 0,
    caramel: 0,
  },
  weaponStates: {
    skewerCooldown: 0
  },
  upgrades: {
    pollen_multiplier: 0,
    caramel_bonus: 0,
  },
  equippedPetals: [null, null, null, null, null], // 5 petal slots
};

// Re-export shared runtime config for convenience to avoid incorrect relative imports elsewhere
export { settings, worldState };