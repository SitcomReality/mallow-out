import { gameState } from './state.js';
import { createMarshmallow } from './marshmallow.js';
import { rebuildObjectList } from './combat.js';
import { awardCaramel } from './economy.js';

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
};

export function spawnNextMarshmallow() {
  if (gameState.currentMarshmallow) return;
  if (gameState.meltingMarshmallows.length > 1) return;
  
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
      text: `Shoot to damage! Build combos for bonus caramel!`,
      color: '#ff69b4'
    });
  }

  rebuildObjectList();
}

export function onMarshmallowDefeated() {
  gameState.totalMarshmallowsDestroyed++;
  const bonus = 20;
  awardCaramel(bonus);
  
  if (session.notifications) {
    session.notifications.add({
      id: 'mallow_defeated',
      sticky: false,
      title: `${gameState.currentMarshmallow?.name || 'Marshmallow'} Defeated!`,
      text: `+${bonus} caramel bonus! Score: ${gameState.totalMarshmallowsDestroyed}`,
      color: '#ff8c00'
    });
  }
  
  // Auto-spawn next marshmallow after a brief delay
  setTimeout(() => {
    spawnNextMarshmallow();
  }, 1500);
}

export function togglePause() {
  session.isPaused = !session.isPaused;
  if (session.isPaused) {
    session.pauseMenu.show();
  } else {
    session.pauseMenu.hide();
  }
}

export function quitToMenu() {
  session.isPlaying = false;
  session.isPaused = false;
  document.getElementById('menu').style.display = 'flex';
  document.getElementById('gameContainer').style.display = 'none';
  
  if (session.hud) session.hud.hide();
  if (session.marshmallowHUD) session.marshmallowHUD.hide();
  if (session.upgradeScreen) session.upgradeScreen.hide();
  if (session.pauseMenu) session.pauseMenu.hide();
  if (session.mobileControls) session.mobileControls.hide();
  
  gameState.currentMarshmallow = null;
  gameState.meltingMarshmallows = [];
  gameState.objects = [];
  
  if (session.particleSystem) session.particleSystem.clear();
}