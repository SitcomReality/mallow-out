/**
 * MAIN ENTRYPOINT & CONNECTOR HUB
 * 
 * Keep this file simple! Business logic should be refactored into discrete files.
 */

import { gameState, applyGraphicsPreset } from './src/game/state.js';
import { createRenderer } from './src/game/renderer.js';
import { initControls } from './src/game/controls.js';
import { createHUD } from './src/ui/hud.js';
import { createMarshmallowHUD } from './src/ui/marshmallow-hud.js';
import { createUpgradeScreen } from './src/ui/upgrade-screen.js';
import { createPauseMenu } from './src/ui/pause-menu.js';
import { createPetalShop } from './src/ui/petal-shop.js';
import { createPetalHUD } from './src/ui/petal-hud.js';
import { ParticleSystem } from './src/effects/particles.js';
import { FloatingTextSystem } from './src/effects/floating-text.js';
import { FloatingTextRenderer } from './src/effects/floating-text-renderer.js';
import { session, quitToMenu, togglePause, spawnNextMarshmallow } from './src/game/manager.js';
import { runGameLoop } from './src/game/loop.js';
import { shoot } from './src/game/combat.js';
import { createMobileControls } from './src/ui/mobile-controls.js';
import { createNotificationSystem } from './src/ui/notifications.js';
import { hasSaveGame, loadGame, clearSaveGame } from './src/game/persistence.js';
import { applyWonkyUI } from './src/ui/wonky.js';
applyWonkyUI();

// Setup Main Menu
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
  const selectedQuality = document.querySelector('input[name="graphicsQuality"]:checked').value;
  applyGraphicsPreset(selectedQuality);
  
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
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.style.display = 'flex';
  
  // Allow UI to render the loading screen before blocking the thread with shader compilation
  setTimeout(() => {
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('crosshair').style.display = 'block';
    startGame();
  }, 50);
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
  const { render, tracerSystem, particleCamera, particleScene } = createRenderer(container);
  
  session.renderFn = render;
  session.particleSystem = new ParticleSystem();
  session.floatingTextSystem = new FloatingTextSystem();
  session.tracerSystem = tracerSystem;
  
  // Initialize UI components
  session.hud = createHUD();
  session.hud.show();
  
  session.marshmallowHUD = createMarshmallowHUD();
  
  session.petalShop = createPetalShop();
  
  session.upgradeScreen = createUpgradeScreen();

  session.petalHUD = createPetalHUD();
  session.petalHUD.show();
  
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

  session.notifications = createNotificationSystem();
  
  // Keyboard Bindings
  document.addEventListener('keydown', (e) => {
    if (!session.isPlaying) return;
    if (e.key === 'Escape') togglePause();
  });
  
  document.addEventListener('keyup', (e) => {
    if (!session.isPlaying || session.isPaused) return;
  });
  
  // Mouse Click / Shooting
  container.addEventListener('mousedown', (e) => {
    if (session.isPaused) return;
    
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    shoot(x, y, session.particleSystem, session.marshmallowHUD, particleCamera);
  });

  // Hook up navigation buttons
  document.getElementById('navShop').addEventListener('click', () => {
    session.petalShop.show();
  });
  document.getElementById('navUpgrades').addEventListener('click', () => {
    session.upgradeScreen.show();
  });

  // Begin the adventure
  spawnNextMarshmallow();
  
  // Force a synchronous render to compile shaders
  if (session.renderFn) {
    session.renderFn(performance.now(), session.particleSystem, session.floatingTextSystem);
  }
  
  document.getElementById('loadingOverlay').style.display = 'none';

  requestAnimationFrame(runGameLoop);
}