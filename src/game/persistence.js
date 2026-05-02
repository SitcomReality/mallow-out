import { gameState } from './state.js';
import { STARTING_WAVE } from './wave-constants.js';

const SAVE_KEY = 'mallow_out_savegame';

export function saveGame() {
  const saveData = {
    totalMarshmallowsDestroyed: gameState.totalMarshmallowsDestroyed,
    currencies: { ...gameState.currencies },
    upgrades: { ...gameState.upgrades },
    equippedPetals: [...gameState.equippedPetals],
  };
  
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('[Persistence] Game saved successfully at Wave', gameState.currentWave);
  } catch (e) {
    console.error('[Persistence] Failed to save game:', e);
  }
}

/**
 * Loads game progression from localStorage into the gameState.
 */
export function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    
    const data = JSON.parse(saved);
    
    // Merge data into state
    gameState.totalMarshmallowsDestroyed = data.totalMarshmallowsDestroyed || 0;
    gameState.currencies = data.currencies || { pollen: 0, caramel: 0 };
    gameState.upgrades = data.upgrades || {};
    gameState.equippedPetals = data.equippedPetals || [null, null, null, null, null];
    
    console.log('[Persistence] Game loaded successfully from Wave', gameState.currentWave);
    return true;
  } catch (e) {
    console.error('[Persistence] Failed to load game:', e);
    return false;
  }
}

/**
 * Checks if a save exists.
 */
export function hasSaveGame() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Deletes the save data.
 */
export function clearSaveGame() {
  localStorage.removeItem(SAVE_KEY);
  console.log('[Persistence] Save data cleared.');
}