import { gameState } from './state.js';
import { stopShooting } from './combat.js';
import { createMarshmallow } from './marshmallow.js';
import { rebuildObjectList } from './combat.js';
import { awardCaramel } from './economy.js';
import * as THREE from 'three';

export const session = {
  isPlaying: false,
  isPaused: false,
  hud: null,
  marshmallowHUD: null,
  upgradeScreen: null,
  pauseMenu: null,
  particleSystem: null,
  mobileControls: null,
  renderFn: null,
  hasShownSpawnNotification: false,
};

const MARSHMALLOW_SPAWN_COST = 50; // Marsh currency needed

export function canSpawnMarshmallow() {
  return !gameState.currentMarshmallow && 
         gameState.meltingMarshmallows.length <= 1 && 
         gameState.currencies.marsh >= MARSHMALLOW_SPAWN_COST;
}

export function spawnNextMarshmallow() {
  if (gameState.currentMarshmallow) return;
  if (gameState.meltingMarshmallows.length > 1) return;
  
  // Check if player can afford
  if (gameState.currencies.marsh < MARSHMALLOW_SPAWN_COST) {
    if (session.notifications && !session.hasShownSpawnNotification) {
      session.hasShownSpawnNotification = true;
      session.notifications.add({
        id: 'need_marsh',
        sticky: true,
        title: 'Marshmallow Treat Needed!',
        text: `Shoot the marsh to gather ${MARSHMALLOW_SPAWN_COST} marsh currency, then your friend will emerge!`,
        color: '#8afdff'
      });
    }
    return;
  }
  
  // Deduct cost
  gameState.currencies.marsh -= MARSHMALLOW_SPAWN_COST;
  session.hasShownSpawnNotification = false;
  
  const marshmallow = createMarshmallow(gameState.totalMarshmallowsDestroyed);
  marshmallow.spawnStartTime = performance.now() * 0.001;
  gameState.currentMarshmallow = marshmallow;
  
  if (session.marshmallowHUD) {
    session.marshmallowHUD.update(marshmallow);
    session.marshmallowHUD.show();
  }
  
  if (session.notifications) {
    session.notifications.add({
      id: `spawn_${marshmallow.name}`,
      sticky: true,
      title: `${marshmallow.name} Emerged!`,
      text: `Your marshmallow friend has come out to play!`,
      color: '#ff69b4'
    });
  }
  
  rebuildObjectList();
}

export function onMarshmallowDefeated() {
  gameState.totalMarshmallowsDestroyed++;
  awardCaramel();
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
  if (session.marshmallowHUD) session.marshmallowHUD.hide();
  if (session.upgradeScreen) session.upgradeScreen.hide();
  if (session.pauseMenu) session.pauseMenu.hide();
  if (session.mobileControls) session.mobileControls.hide();
  
  gameState.currentMarshmallow = null;
  gameState.meltingMarshmallows = [];
  gameState.objects = [];
  
  gameState.upgrades = {
    pollen_multiplier: 0,
    caramel_bonus: 0,
  };
  
  if (session.particleSystem) session.particleSystem.clear();
}