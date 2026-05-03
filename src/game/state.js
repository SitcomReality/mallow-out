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
    marsh: 0, // New currency from shooting the marsh
  },
  upgrades: {
    pollen_multiplier: 0,
    caramel_bonus: 0,
    shot_cooldown: 0,
    marsh_reward: 0,
    mallow_heal: 0,
    hit_protection: 0,
    health_regen: 0,
  },

  // Dynamic cost for marshmallow treats (starts at 1 and increases by 1 each purchase)
  marshmallowTreatCost: 1,
  // Persisted player marshmallow identity (keeps name across respawns / savegames)
  playerMarshmallowName: null,

  // Weapon state used by shooting/combat logic (prevents undefined accesses)
  weaponStates: {
    skewerCooldown: 0,
    maxCooldown: 5.0,
  },
};

export function updateWeaponCooldowns(delta) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) {
    ws.skewerCooldown = Math.max(0, ws.skewerCooldown - delta);
  }
}

export { settings, worldState };