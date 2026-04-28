import { gameState } from './state.js';
import { STARTING_WAVE, DEFAULT_WAVE_DURATION, TIME_BONUS_PER_KILL } from './wave-constants.js';
import { createMarshmallow } from './marshmallow.js';
import { rebuildObjectList } from './combat.js';
import { clearAllFX } from './fx.js';
import { awardCaramel, resetWaveStats } from './economy.js';

/**
 * Central session state for UI and system references that aren't part of core game state.
 */
export const session = {
  isPlaying: false,
  isPaused: false,
  hud: null,
  bossHUD: null,
  upgradeScreen: null,
  pauseMenu: null,
  particleSystem: null,
  renderFn: null
};

export function startWave() {
  // Clear any existing entities and effects from previous rounds for a clean restart
  gameState.currentMarshmallow = null;
  gameState.meltingMarshmallows = [];
  gameState.objects = [];
  gameState.projectiles = [];
  
  if (session.particleSystem) session.particleSystem.clear();
  clearAllFX();
  
  gameState.marshmallowsSpawnedThisWave = 0;
  gameState.marshmallowsDestroyedThisWave = 0;
  gameState.petalTriggersThisWave = []; // Reset petal triggers for new wave
  resetWaveStats();
  gameState.waveTimer.start(DEFAULT_WAVE_DURATION);
  gameState.waveInProgress = true;
  
  rebuildObjectList();
  spawnNextMarshmallow();
  
  // Update petal HUD at wave start
  if (session.petalHUD) session.petalHUD.update();
}

export function spawnNextMarshmallow() {
  // Don't spawn if there's already an active marshmallow or more than 1 melting
  if (gameState.currentMarshmallow) return;
  if (gameState.meltingMarshmallows.length > 1) return;
  
  const marshmallow = createMarshmallow(gameState.currentWave, gameState.marshmallowsSpawnedThisWave);
  gameState.currentMarshmallow = marshmallow;
  gameState.marshmallowsSpawnedThisWave++;
  
  if (session.bossHUD) session.bossHUD.update(marshmallow);
  rebuildObjectList();
}

export function onMarshmallowDefeated() {
  gameState.marshmallowsDestroyedThisWave++;
  gameState.waveTimer.addTimeBonus(TIME_BONUS_PER_KILL);
  awardCaramel();
  
  // Trigger random petal on marshmallow death
  const { triggerRandomPetal } = require('./petals/petal-trigger.js');
  triggerRandomPetal();
  
  // Update petal HUD after trigger
  if (session.petalHUD) session.petalHUD.update();
  
  // Marshmallow will be moved to melting state by combat system
  // Next marshmallow spawns after check in loop
}

export function switchWeapon(index) {
  gameState.currentWeapon = index;
  if (session.hud) session.hud.setActiveWeapon(index);
}

export function togglePause() {
  session.isPaused = !session.isPaused;
  if (session.isPaused) {
    session.pauseMenu.show();
    document.exitPointerLock();
  } else {
    session.pauseMenu.hide();
  }
}

export function quitToMenu() {
  session.isPlaying = false;
  session.isPaused = false;
  document.getElementById('menu').style.display = 'flex';
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('crosshair').style.display = 'none';
  
  if (session.hud) session.hud.hide();
  if (session.bossHUD) session.bossHUD.hide();
  if (session.upgradeScreen) session.upgradeScreen.hide();
  if (session.pauseMenu) session.pauseMenu.hide();
  
  gameState.currentMarshmallow = null;
  gameState.meltingMarshmallows = [];
  gameState.objects = [];
  gameState.projectiles = [];
  gameState.currentWave = STARTING_WAVE;
  gameState.marshmallowsSpawnedThisWave = 0;
  gameState.marshmallowsDestroyedThisWave = 0;
  gameState.waveTimer.stop();
  gameState.weaponStates = {
    skewerReady: true,
    spattererCooldown: 0,
    cleaverCharge: 0,
    cleaverCharging: false,
    melterHeat: 0,
    melterOverheated: false,
  };
  gameState.upgrades = {
    damage: 0,
    fireRate: 0,
    moveSpeed: 0,
    health: 0,
    splash: 0,
  };
  
  if (session.particleSystem) session.particleSystem.clear();
}