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
  petalShop: null,
  pauseMenu: null,
  particleSystem: null,
  mobileControls: null,
  renderFn: null
};

export function spawnNextMarshmallow() {
  if (gameState.currentMarshmallow) return;
  if (gameState.meltingMarshmallows.length > 1) return;
  
  const marshmallow = createMarshmallow(gameState.totalMarshmallowsDestroyed);
  marshmallow.spawnStartTime = performance.now() * 0.001;
  gameState.currentMarshmallow = marshmallow;
  
  if (session.marshmallowHUD) session.marshmallowHUD.update(marshmallow);
  
  // Show spawn text and notification
  if (session.floatingTextSystem && marshmallow.type) {
    const pos = new THREE.Vector3(
      marshmallow.marshmallow.position.x,
      marshmallow.marshmallow.position.y + 2,
      marshmallow.marshmallow.position.z
    );
    session.floatingTextSystem.createInfoText(pos, marshmallow.type.name, 'info');
    
    if (session.notifications) {
      const isRare = marshmallow.type.rarity === 'rare';
      session.notifications.add({
        id: `spawn_${marshmallow.type.id}`,
        sticky: true,
        title: isRare ? '✨ RARE SPAWN ✨' : 'Marshmallow Spawned',
        text: isRare ? `A ${marshmallow.type.name} appeared!` : `A new standard marshmallow arrived.`,
        color: isRare ? '#ffd700' : '#ffffff'
      });
    }
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
  
  // Reset gameplay state (remove active entities, particles, and current selection)
  gameState.currentMarshmallow = null;
  gameState.meltingMarshmallows = [];
  gameState.objects = [];
  
  // Reset weapon state and upgrades to sane defaults for a fresh menu state
  gameState.weaponStates = {
    skewerCooldown: 0
  };
  gameState.upgrades = {
    pollen_multiplier: 0,
    wave_duration: 0,
    caramel_bonus: 0,
  };
  
  if (session.particleSystem) session.particleSystem.clear();
}