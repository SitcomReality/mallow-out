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
    marsh: 0,
    treats: 0, // Stackable inventory items
  },
  upgrades: {
    // Player
    shot_cooldown: 0,
    combo_duration: 0,
    // Marshmallow
    mallow_heal: 0,
    hit_protection: 0,
    health_regen: 0,
    mallow_max_health: 0,
    // Economy
    pollen_multiplier: 0,
    caramel_bonus: 0,
    marsh_reward: 0,
    // Automation
    auto_shooter_unlock: 0,
    auto_shooter_rate: 0,
    auto_shooter_value: 0,
  },

  // Automation timers
  automationTimers: {
    auto_shooter: 0,
    comet: 0,
    laser: 0,
  },
  
  // Combo tracking
  combo: {
    count: 0,
    timer: 0,
    type: null,
  },

  // Dynamic cost for marshmallow treats (starts at 10 and increases by 20% each purchase)
  marshmallowTreatCost: 10,
  
  // Tutorial state
  tutorial: {
    completed: false,
    currentStep: 0,
    hasShot: false,
    hasBoughtTreat: false,
    hasShotMarshmallow: false,
    hasUpgraded: false,
  },
  // Persisted player marshmallow identity (keeps name across respawns / savegames)
  playerMarshmallowName: null,

  bubbles: [],
  nextBubbleSpawnTime: 0,

  // Weapon state used by shooting/combat logic
  weaponStates: {
    skewerCooldown: 0,
    maxCooldown: 1.0,
    activeAmmo: 'standard', // 'standard' or 'treat'
    isCharging: false,
    chargeTimer: 0,
    maxChargeTime: 3.0,
  },
};

export function updateWeaponCooldowns(delta) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) {
    ws.skewerCooldown = Math.max(0, ws.skewerCooldown - delta);
  }

  if (ws.isCharging && ws.skewerCooldown <= 0) {
    ws.chargeTimer = Math.min(ws.maxChargeTime, ws.chargeTimer + delta);
  } else {
    ws.chargeTimer = 0;
  }
}

export { settings, worldState };