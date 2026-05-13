import * as THREE from 'three';

import { settings } from '../state.js';

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
    caramel: 0,
  },
  upgrades: {
    // Player
    shot_cooldown: 0,
    combo_duration: 0,
    charge_speed: 0,
    // Marshmallow
    mallow_max_health: 0,
  },
  
  // Combo tracking
  combo: {
    count: 0,
    timer: 0,
    type: null,
  },


  
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
    isCharging: false,
    chargeTimer: 0,
    maxChargeTime: 3.0,
    baseChargeTime: 3.0,
  },
};

export function updateWeaponCooldowns(delta) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) {
    ws.skewerCooldown = Math.max(0, ws.skewerCooldown - delta);
  }

  // Apply charge speed upgrade
  const chargeSpeedBonus = getUpgradeEffect('charge_speed', gameState.upgrades.charge_speed || 0);
  ws.maxChargeTime = Math.max(0.5, ws.baseChargeTime * (1 - chargeSpeedBonus));

  if (ws.isCharging && ws.skewerCooldown <= 0) {
    ws.chargeTimer = Math.min(ws.maxChargeTime, ws.chargeTimer + delta);
  } else {
    ws.chargeTimer = 0;
  }
}

import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';

export { settings };