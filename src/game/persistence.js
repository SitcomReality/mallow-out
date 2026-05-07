import { gameState } from './state.js';

const SAVE_KEY = 'mallow_out_savegame';

export function saveGame() {
  const saveData = {
    totalMarshmallowsDestroyed: gameState.totalMarshmallowsDestroyed,
    currencies: { ...gameState.currencies },
    upgrades: { ...gameState.upgrades },
    cosmetics: { ...gameState.cosmetics },
    playerMarshmallowName: gameState.playerMarshmallowName || null,
    marshmallowTreatCost: gameState.marshmallowTreatCost || 10,
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
    gameState.currencies = data.currencies || { pollen: 0, caramel: 0, marsh: 0, treats: 0 };
    gameState.upgrades = data.upgrades || {};
    gameState.cosmetics = data.cosmetics || {
      unlocked: ['skin_pink'],
      equipped: { skin: 'skin_pink', pattern: null, accessory: null }
    };
    gameState.playerMarshmallowName = data.playerMarshmallowName || null;
    gameState.marshmallowTreatCost = data.marshmallowTreatCost || 10;
    gameState.tutorial = data.tutorial || {
      completed: false,
      currentStep: 0,
      hasShot: false,
      hasBoughtTreat: false,
      hasShotMarshmallow: false,
      hasUpgraded: false,
    };
    
    // Normalize tutorial.currentStep so it reflects completed milestones,
    // preventing the UI from showing an upcoming step the player hasn't actually reached.
    // Determine highest completed step (0..4)
    let completedStep = 0;
    if (gameState.tutorial.hasShot) completedStep = 1;
    if (gameState.tutorial.hasBoughtTreat) completedStep = 2;
    if (gameState.tutorial.hasShotMarshmallow) completedStep = 3;
    if (gameState.tutorial.hasUpgraded) completedStep = 4;
    // Clamp stored currentStep to the highest completed step to avoid advancing the tutorial prematurely.
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