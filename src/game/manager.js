import { gameState } from './state.js';
import { stopShooting } from './combat.js';
import { createMarshmallow } from './marshmallow.js';
import { rebuildObjectList } from './combat.js';
import { awardCaramel } from './economy.js';
import { saveGame } from './persistence.js';
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

/**
 * Treat cost is stored in gameState.marshmallowTreatCost and increments by 1 after each purchase.
 * Default starting cost is 1.
 */

export function canSpawnMarshmallow() {
  const cost = gameState.marshmallowTreatCost || 1;
  return !gameState.currentMarshmallow &&
         gameState.meltingMarshmallows.length <= 1 &&
         gameState.currencies.marsh >= cost;
}

export function buyMarshmallowTreat() {
  const cost = gameState.marshmallowTreatCost || 1;
  if (gameState.currencies.marsh < cost) {
    if (session.notifications) {
      session.notifications.add({
        id: 'need_marsh_buy',
        sticky: false,
        title: 'Cannot Afford',
        text: `You need ${cost} marsh currency for a treat!`,
        color: '#8afdff'
      });
    }
    return;
  }

  gameState.currencies.marsh -= cost;
  gameState.currencies.treats = (gameState.currencies.treats || 0) + 1;
  gameState.marshmallowTreatCost++;
  saveGame();
}

export function equipMarshmallowTreat() {
  if ((gameState.currencies.treats || 0) <= 0) return;
  if (gameState.weaponStates.activeAmmo === 'treat') return;

  gameState.weaponStates.activeAmmo = 'treat';
  gameState.currencies.treats--;
  
  if (session.notifications) {
    session.notifications.add({
      id: 'treat_equipped',
      sticky: false,
      title: 'Treat Loaded!',
      text: 'Next shot will deploy the marshmallow treat!',
      color: '#ff69b4'
    });
  }
}

export function spawnNextMarshmallowAt(point) {
  if (gameState.currentMarshmallow) return;
  if (gameState.meltingMarshmallows.length > 1) return;
  
  const marshmallow = createMarshmallow(gameState.totalMarshmallowsDestroyed);
  // Set the spawn point to where the treat hit
  marshmallow.marshmallow.position.x = point.x;
  marshmallow.marshmallow.position.z = point.z;
  
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

// Deprecated alias for compatibility if needed, but we prefer the specific ones above
export function spawnNextMarshmallow() {
  equipMarshmallowTreat();
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