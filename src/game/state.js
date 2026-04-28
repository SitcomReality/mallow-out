import * as THREE from 'three';
import { STARTING_WAVE } from './wave-constants.js';

export const gameState = {
  player: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    yaw: 0,
    pitch: 0,
    recoilTime: 0, // for skewer recoil
    recoilAmount: 0,
  },
  boss: null,
  meltingEnemies: [],
  objects: [],
  projectiles: [], // for globber projectiles
  currentWeapon: 0,
  currentWave: STARTING_WAVE,
  weaponStates: {
    skewerReady: true,
    spattererCooldown: 0,
    cleaverCharge: 0,
    cleaverCharging: false,
    melterHeat: 0,
    melterOverheated: false,
  },
  upgrades: {
    damage: 0,
    fireRate: 0,
    moveSpeed: 0,
    health: 0,
    splash: 0,
  },
  waveInProgress: false,
};