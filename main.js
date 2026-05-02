/**
 * MAIN ENTRYPOINT & CONNECTOR HUB
 * 
 * Keep this file simple! Business logic should be refactored into discrete files.
 */

import { gameState } from './src/game/state.js';
import { createRenderer } from './src/game/renderer.js';
import { initControls } from './src/game/controls.js';
import { createHUD } from './src/ui/hud.js';
import { createBossHUD } from './src/ui/boss-hud.js';
import { createUpgradeScreen } from './src/ui/upgrade-screen.js';
import { createWaveSummary } from './src/ui/wave-summary.js';
import { createPauseMenu } from './src/ui/pause-menu.js';
import { createPetalShop } from './src/ui/petal-shop.js';
import { createPetalHUD } from './src/ui/petal-hud.js';
import { ParticleSystem } from './src/effects/particles.js';
import { FloatingTextSystem } from './src/effects/floating-text.js';
import { FloatingTextRenderer } from './src/effects/floating-text-renderer.js';
import { session, startWave, quitToMenu, togglePause } from './src/game/manager.js';
import { createWeaponSelection } from './src/ui/weapon-selection.js';
import { offerWeaponChoices, selectWeapon } from './src/game/weapon-selection.js';
import { runGameLoop } from './src/game/loop.js';
import { shoot, releaseCleaver, stopShooting } from './src/game/combat.js';
import { createMobileControls } from './src/ui/mobile-controls.js';
import { createWeaponStatus } from './src/ui/weapon-status.js';
import { hasSaveGame, loadGame, clearSaveGame } from './src/game/persistence.js';
import { applyWonkyUI } from './src/ui/wonky.js';
applyWonkyUI();

// Setup Main Menu
const mainBtn = document.getElementById('mainBtn');
const resetBtn = document.getElementById('resetGame');

function updateMenuUI() {
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
  if (confirm("Are you sure you want to start a new game? This will erase all your progress, upgrades, and petals!")) {
    clearSaveGame();
    // Refresh to clear state or just call enterGame after wiping
    window.location.reload(); 
  }
});

function enterGame() {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  document.getElementById('crosshair').style.display = 'block';
  startGame();
}

updateMenuUI();

/**
 * Initializes all systems and starts the game session.
 */
function startGame() {
  if (session.isPlaying) return;
  session.isPlaying = true;
  session.isPaused = false;
  
  const container = document.getElementById('gameContainer');
  const { render, tracerSystem, projectileRenderer, particleCamera, particleScene } = createRenderer(container);
  
  session.renderFn = render;
  session.particleSystem = new ParticleSystem();
  session.floatingTextSystem = new FloatingTextSystem();
  session.tracerSystem = tracerSystem;
  session.projectileRenderer = projectileRenderer;
  
  // Initialize UI components
  session.hud = createHUD();
  session.hud.show();
  
  session.bossHUD = createBossHUD();
  
  session.waveSummary = createWaveSummary(() => {
    // After wave summary, show petal shop
    if (session.petalShop) {
      session.petalShop.show();
    }
  });
  
  session.petalShop = createPetalShop(() => {
    // After petal shop, show upgrade screen
    if (session.upgradeScreen) {
      session.upgradeScreen.show(gameState.currentWave);
    }
  });
  
  session.petalHUD = createPetalHUD();
  session.petalHUD.show();
  
  session.weaponStatus = createWeaponStatus();
  
  session.upgradeScreen = createUpgradeScreen(() => {
    // Continue to next wave (upgrades are purchased in the shop UI)
    gameState.currentWave++;
    offerWeaponChoices();
    session.weaponSelection.show();
  });

  session.weaponSelection = createWeaponSelection((weaponIndex) => {
    selectWeapon(weaponIndex);
    if (session.hud) session.hud.setActiveWeapon(weaponIndex);
    startWave();
  });
  
  session.pauseMenu = createPauseMenu(
    () => togglePause(),
    () => quitToMenu()
  );
  
  // Initialize Controls
  const { camera } = initControls(container);
  
  // Initialize floating text renderer (needs camera for projection)
  session.floatingTextRenderer = new FloatingTextRenderer(particleCamera);
  
  session.mobileControls = createMobileControls();
  session.mobileControls.show();
  
  // Keyboard Bindings
  document.addEventListener('keydown', (e) => {
    if (!session.isPlaying) return;
    if (e.key === 'Escape') togglePause();
  });
  
  document.addEventListener('keyup', (e) => {
    if (!session.isPlaying || session.isPaused) return;
  });
  
  // Mouse Click / Shooting
  let mouseDown = false;
  
  container.addEventListener('mousedown', () => {
    if (!session.isPaused) {
      mouseDown = true;
      shoot(session.particleSystem, session.bossHUD);
    }
  });
  
  container.addEventListener('mouseup', () => {
    mouseDown = false;
    stopShooting();
    if (gameState.currentWeapon === 3 && gameState.weaponStates.cleaverCharging) {
      releaseCleaver(session.particleSystem, session.bossHUD);
    }
  });
  

  // Begin the adventure
  offerWeaponChoices();
  session.weaponSelection.show();
  requestAnimationFrame(runGameLoop);
}