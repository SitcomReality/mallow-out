/**
 * MAIN ENTRYPOINT & CONNECTOR HUB
 */

import { gameState } from './src/game/state.js';
import { createRenderer } from './src/game/renderer.js';
import { initControls } from './src/game/controls.js';
import { createHUD } from './src/ui/hud.js';
import { createMarshmallowHUD } from './src/ui/marshmallow-hud.js';
import { createUpgradeScreen } from './src/ui/upgrade-screen.js';
import { createPauseMenu } from './src/ui/pause-menu.js';
import { ParticleSystem } from './src/effects/particles.js';
import { FloatingTextSystem } from './src/effects/floating-text.js';
import { FloatingTextRenderer } from './src/effects/floating-text-renderer.js';
import { session, quitToMenu, togglePause, spawnNextMarshmallow } from './src/game/manager.js';
import { runGameLoop } from './src/game/loop.js';
import { shoot } from './src/game/combat/actions.js';
import { createMobileControls } from './src/ui/mobile-controls.js';
import { createNotificationSystem } from './src/ui/notifications.js';
import { hasSaveGame, loadGame, clearSaveGame } from './src/game/persistence.js';
import { applyWonkyUI } from './src/ui/wonky.js';
import { createDevMenu } from './src/ui/dev-menu.js';
applyWonkyUI();
createDevMenu();

const mainBtn = document.getElementById('mainBtn');
const resetBtn = document.getElementById('resetGame');

function updateMenuUI() {
  mainBtn.disabled = false;
  if (hasSaveGame()) {
    mainBtn.textContent = 'Continue';
    resetBtn.style.display = 'block';
  } else {
    mainBtn.textContent = 'New Game';
    resetBtn.style.display = 'none';
  }
}

mainBtn.addEventListener('click', () => {
  if (hasSaveGame()) {
    loadGame();
  }
  enterGame();
});

resetBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to start a new game? This will erase all your progress!")) {
    clearSaveGame();
    window.location.reload(); 
  }
});

function enterGame() {
  document.getElementById('menu').style.display = 'none';
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.style.display = 'flex';
  
  setTimeout(() => {
    document.getElementById('gameContainer').style.display = 'block';
    startGame();
  }, 50);
}

updateMenuUI();

function startGame() {
  if (session.isPlaying) return;
  session.isPlaying = true;
  session.isPaused = false;
  
  const container = document.getElementById('gameContainer');
  const { render, tracerSystem, particleCamera } = createRenderer(container);
  
  session.renderFn = render;
  session.particleSystem = new ParticleSystem();
  session.floatingTextSystem = new FloatingTextSystem();
  session.tracerSystem = tracerSystem;
  
  session.hud = createHUD();
  session.hud.show();
  
  session.marshmallowHUD = createMarshmallowHUD();
  session.upgradeScreen = createUpgradeScreen();
  
  session.pauseMenu = createPauseMenu(
    () => togglePause(),
    () => quitToMenu()
  );
  
  const { camera } = initControls(container);
  
  session.floatingTextRenderer = new FloatingTextRenderer(particleCamera);
  session.mobileControls = createMobileControls();
  session.mobileControls.show();
  session.notifications = createNotificationSystem();
  
  document.addEventListener('keydown', (e) => {
    if (!session.isPlaying) return;
    if (e.key === 'Escape') togglePause();
  });
  
  container.addEventListener('mousedown', (e) => {
    if (session.isPaused) return;
    gameState.weaponStates.isCharging = true;
  });

  window.addEventListener('mouseup', (e) => {
    if (!gameState.weaponStates.isCharging || session.isPaused) return;
    gameState.weaponStates.isCharging = false;
    
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    shoot(x, y, session.particleSystem, session.marshmallowHUD, particleCamera);
  });

  document.getElementById('navUpgrades').addEventListener('click', () => {
    session.upgradeScreen.show();
  });

  // Spawn initial marshmallow
  import('./src/game/manager.js').then(m => {
    setTimeout(() => m.spawnNextMarshmallow(), 1000);
  });
  if (session.renderFn) {
    session.renderFn(performance.now(), session.particleSystem, session.floatingTextSystem);
  }
  
  document.getElementById('loadingOverlay').style.display = 'none';
  requestAnimationFrame(runGameLoop);
}