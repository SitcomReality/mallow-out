import { gameState } from './state.js';
import { stopShooting } from './combat.js';
import { STARTING_WAVE, DEFAULT_WAVE_DURATION, TIME_BONUS_PER_KILL } from './wave-constants.js';
import { getUpgradeEffect } from './upgrades/upgrade-calculator.js';
import { createMarshmallow } from './marshmallow.js';
import { rebuildObjectList } from './combat.js';
import { clearAllFX } from './fx.js';
import { awardCaramel, resetWaveStats } from './economy.js';
import * as THREE from 'three';

/**
 * Central session state for UI and system references that aren't part of core game state.
 */
export const session = {
  isPlaying: false,
  isPaused: false,
  hud: null,
  bossHUD: null,
  upgradeScreen: null,
  weaponSelection: null,
  pauseMenu: null,
  particleSystem: null,
  mobileControls: null,
  renderFn: null
};

export function startWave() {
  stopShooting();
  // Clear any existing entities and effects from previous rounds for a clean restart
  gameState.currentMarshmallow = null;
  gameState.meltingMarshmallows = [];
  gameState.objects = [];
  gameState.projectiles = [];
  gameState.bubbles = [];
  
  if (session.particleSystem) session.particleSystem.clear();
  clearAllFX();
  
  gameState.marshmallowsSpawnedThisWave = 0;
  gameState.marshmallowsDestroyedThisWave = 0;
  gameState.petalTriggersThisWave = []; // Reset petal triggers for new wave
  gameState.waveEndReason = null;
  resetWaveStats();
  
  // Apply wave duration upgrade
  const durationBonus = getUpgradeEffect('wave_duration', gameState.upgrades.wave_duration || 0);
  const waveDuration = DEFAULT_WAVE_DURATION + durationBonus;
  
  gameState.waveTimer.start(waveDuration);
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
  marshmallow.spawnStartTime = performance.now() * 0.001;
  gameState.currentMarshmallow = marshmallow;
  gameState.marshmallowsSpawnedThisWave++;
  
  if (session.bossHUD) session.bossHUD.update(marshmallow);
  
  // Show spawn text
  if (session.floatingTextSystem && marshmallow.type) {
    const pos = new THREE.Vector3(
      marshmallow.marshmallow.position.x,
      marshmallow.marshmallow.position.y + 2,
      marshmallow.marshmallow.position.z
    );
    session.floatingTextSystem.createInfoText(pos, marshmallow.type.name, 'info');
  }
  
  rebuildObjectList();
}

export function onMarshmallowDefeated() {
  gameState.marshmallowsDestroyedThisWave++;
  gameState.waveTimer.addTimeBonus(TIME_BONUS_PER_KILL);
  awardCaramel();
  
  // Marshmallow will be moved to melting state by combat system
  // Next marshmallow spawns after check in loop
}

export function togglePause() {
  session.isPaused = !session.isPaused;
  if (session.isPaused) {
    stopShooting();
    session.pauseMenu.show();
  } else {
    session.pauseMenu.hide();
  }
}

export function quitToMenu() {
  stopShooting();
  session.isPlaying = false;
  session.isPaused = false;
  document.getElementById('menu').style.display = 'flex';
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('crosshair').style.display = 'none';
  
  if (session.hud) session.hud.hide();
  if (session.bossHUD) session.bossHUD.hide();
  if (session.upgradeScreen) session.upgradeScreen.hide();
  if (session.weaponSelection) session.weaponSelection.hide();
  if (session.pauseMenu) session.pauseMenu.hide();
  if (session.mobileControls) session.mobileControls.hide();
  
  gameState.currentMarshmallow = null;
  gameState.meltingMarshmallows = [];
  gameState.objects = [];
  gameState.projectiles = [];
  gameState.currentWave = STARTING_WAVE;
  gameState.selectedWeaponForWave = null;
  gameState.marshmallowsSpawnedThisWave = 0;
  gameState.marshmallowsDestroyedThisWave = 0;
  gameState.waveTimer.stop();
  gameState.player.recoilTime = 0;
  gameState.player.recoilPitchAmount = 0;
  gameState.player.recoilYawAmount = 0;
  gameState.player.recoilReturnOffset = 0;
  gameState.weaponStates = {
    skewerReady: true,
    globberCooldown: 0,
    spattererCooldown: 0,
    cleaverCharge: 0,
    cleaverCharging: false
  };
  gameState.upgrades = {
    pollen_multiplier: 0,
    wave_duration: 0,
    caramel_bonus: 0,
  };
  
  if (session.particleSystem) session.particleSystem.clear();
}