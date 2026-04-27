import { gameState } from './state.js';
import { STARTING_WAVE } from './wave-constants.js';
import { createBoss } from './boss.js';
import { rebuildObjectList } from './combat.js';

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

export function spawnBoss() {
  const boss = createBoss(gameState.currentWave);
  gameState.boss = boss;
  gameState.waveInProgress = true;
  if (session.bossHUD) session.bossHUD.update(boss);
  rebuildObjectList();
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
  
  gameState.boss = null;
  gameState.meltingEnemies = [];
  gameState.objects = [];
  gameState.currentWave = STARTING_WAVE;
  gameState.upgrades = {
    damage: 0,
    fireRate: 0,
    moveSpeed: 0,
    health: 0,
    splash: 0,
  };
  
  if (session.particleSystem) session.particleSystem.clear();
}