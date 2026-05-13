import { gameState } from './state.js';

const SAVE_KEY = 'mallow_out_savegame';

export function saveGame() {
  const saveData = {
    totalMarshmallowsDestroyed: gameState.totalMarshmallowsDestroyed,
    currencies: { caramel: gameState.currencies.caramel },
    upgrades: { ...gameState.upgrades },
    playerMarshmallowName: gameState.playerMarshmallowName || null,
    tutorial: { ...gameState.tutorial },
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
    gameState.currencies = { caramel: (data.currencies && data.currencies.caramel) || 0 };
    gameState.upgrades = data.upgrades || {};
    gameState.playerMarshmallowName = data.playerMarshmallowName || null;
    gameState.tutorial = data.tutorial || {
      completed: false,
      currentStep: 0,
      hasShot: false,
      hasShotMarshmallow: false,
      hasUpgraded: false,
    };
    
    // Normalize tutorial.currentStep
    let completedStep = 0;
    if (gameState.tutorial.hasShot) completedStep = 1;
    if (gameState.tutorial.hasShotMarshmallow) completedStep = 2;
    if (gameState.tutorial.hasUpgraded) completedStep = 3;
    gameState.tutorial.currentStep = Math.min(gameState.tutorial.currentStep || 0, completedStep);
    
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