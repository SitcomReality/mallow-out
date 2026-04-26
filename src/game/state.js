import * as THREE from 'three';
import { STARTING_WAVE } from './wave-constants.js';

export const gameState = {
  player: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    yaw: 0,
    pitch: 0,
  },
  boss: null,
  meltingEnemies: [],
  objects: [],
  currentWeapon: 0,
  currentWave: STARTING_WAVE,
  upgrades: {
    damage: 0,
    fireRate: 0,
    moveSpeed: 0,
    health: 0,
    splash: 0,
  },
  waveInProgress: false,
};