import * as THREE from 'three';
import { STARTING_WAVE } from './wave-constants.js';
import { WaveTimer } from './wave-timer.js';
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
  projectiles: [], // for globber projectiles
  currentWeapon: 0,
  selectedWeaponForWave: null,
  weaponChoicesOffered: [null, null],
  currentWave: STARTING_WAVE,
  waveTimer: new WaveTimer(),
  marshmallowsSpawnedThisWave: 0,
  marshmallowsDestroyedThisWave: 0,
  bubbles: [],
  currencies: {
    pollen: 0,
    caramel: 0,
  },
  currentWaveStats: {
    pollenEarned: 0,
    caramelEarned: 0,
    damageDealt: 0,
    bubblesPopped: 0,
  },
  weaponStates: {
    skewerReady: true,
    globberCooldown: 0,
    spattererCooldown: 0,
    cleaverCharge: 0,
    cleaverCharging: false
  },
  upgrades: {
    pollen_multiplier: 0,
    wave_duration: 0,
    caramel_bonus: 0,
  },
  waveInProgress: false,
  equippedPetals: [null, null, null, null, null], // 5 petal slots
  activePetalEffects: [], // Currently active timed effects
  petalTriggersThisWave: [], // Track which petals triggered for wave summary
  guaranteedFloaty: false, // Lucky Clover effect flag
  nextKillBonus: false, // Sweet Tooth effect flag
  waveEndReason: null, // 'TIME_OUT' or 'MALLOW_POP'
};

// Re-export shared runtime config for convenience to avoid incorrect relative imports elsewhere
export { settings, worldState };