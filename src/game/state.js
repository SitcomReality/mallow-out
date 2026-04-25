import * as THREE from 'three';

export const gameState = {
  player: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    yaw: 0,
    pitch: 0,
  },
  enemy: null,
  meltingEnemies: [],
  objects: [],
  currentWeapon: 0, // 0: Chunk, 1: Puncture, 2: Lava
};