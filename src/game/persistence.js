import { gameState } from './state.js';

const SAVE_KEY = 'mallow_out_savegame';

export function saveGame() {
  const saveData = {
    totalMarshmallowsDestroyed: gameState.totalMarshmallowsDestroyed,
    currencies: { ...gameState.currencies },
    upgrades: { ...gameState.upgrades },
    // Persist player's marshmallow identity, current treat cost, and inventory
    playerMarshmallowName: gameState.playerMarshmallowName || null,
    marshmallowTreatCost: gameState.marshmallowTreatCost || 1,
    hasShownSpawnNotification: false,
  };
  
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('[Persistence] Game saved successfully');
  } catch (e) {
    console.error('[Persistence] Failed to save game:', e);
  }
}

export function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    
    const data = JSON.parse(saved);
    
    gameState.totalMarshmallowsDestroyed = data.totalMarshmallowsDestroyed || 0;
    // Ensure currencies are restored
    gameState.currencies = data.currencies || { pollen: 0, caramel: 0, marsh: 0, treats: 0 };
    gameState.upgrades = data.upgrades || {};
    // Restore persisted marshmallow identity and treat cost if present
    gameState.playerMarshmallowName = data.playerMarshmallowName || null;
    gameState.marshmallowTreatCost = data.marshmallowTreatCost || (gameState.marshmallowTreatCost || 1);
    
    console.log('[Persistence] Game loaded successfully');
    return true;
  } catch (e) {
    console.error('[Persistence] Failed to load game:', e);
    return false;
  }
}

export function hasSaveGame() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function clearSaveGame() {
  localStorage.removeItem(SAVE_KEY);
  console.log('[Persistence] Save data cleared.');
}