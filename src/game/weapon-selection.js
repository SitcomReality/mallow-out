import { gameState } from './state.js';

export function offerWeaponChoices() {
  const allIndices = [0, 1, 2, 3, 4];
  // Fisher-Yates shuffle
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }
  gameState.weaponChoicesOffered = [allIndices[0], allIndices[1]];
}

export function selectWeapon(weaponIndex) {
  gameState.selectedWeaponForWave = weaponIndex;
  gameState.currentWeapon = weaponIndex;
  
  // Reset weapon states
  const ws = gameState.weaponStates;
  ws.skewerReady = true;
  ws.spattererCooldown = 0;
  ws.cleaverCharge = 0;
  ws.cleaverCharging = false;
  ws.melterHeat = 0;
  ws.melterOverheated = false;
}