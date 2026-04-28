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
import { ParticleSystem } from './src/effects/particles.js';
import { session, startWave, quitToMenu, togglePause, switchWeapon } from './src/game/manager.js';
import { runGameLoop } from './src/game/loop.js';
import { shoot, releaseCleaver } from './src/game/combat.js';

// Setup Main Menu
document.getElementById('newGame').addEventListener('click', () => {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  document.getElementById('crosshair').style.display = 'block';
  startGame();
});

/**
 * Initializes all systems and starts the game session.
 */
function startGame() {
  if (session.isPlaying) return;
  session.isPlaying = true;
  session.isPaused = false;
  
  const container = document.getElementById('gameContainer');
  const { render } = createRenderer(container);
  
  session.renderFn = render;
  session.particleSystem = new ParticleSystem();
  
  // Initialize UI components
  session.hud = createHUD();
  session.hud.show();
  
  session.bossHUD = createBossHUD();
  
  session.waveSummary = createWaveSummary(() => {
    // After wave summary, show upgrade screen
    if (session.upgradeScreen) {
      session.upgradeScreen.show(gameState.currentWave);
    }
  });
  
  session.upgradeScreen = createUpgradeScreen((upgradeId) => {
    // Apply selected upgrade
    if (gameState.upgrades.hasOwnProperty(upgradeId)) {
        gameState.upgrades[upgradeId]++;
    } else if (upgradeId === 'fire_rate') {
        gameState.upgrades.fireRate++;
    } else if (upgradeId === 'move_speed') {
        gameState.upgrades.moveSpeed++;
    }
    
    gameState.currentWave++;
    startWave();
  });
  
  session.pauseMenu = createPauseMenu(
    () => togglePause(),
    () => quitToMenu()
  );
  
  // Initialize Controls
  initControls(container);
  
  // Keyboard Bindings
  document.addEventListener('keydown', (e) => {
    if (!session.isPlaying) return;
    if (e.key === 'Escape') togglePause();
    
    if (!session.isPaused) {
      if (e.key === '1') switchWeapon(0);
      if (e.key === '2') switchWeapon(1);
      if (e.key === '3') switchWeapon(2);
      if (e.key === '4') switchWeapon(3);
      if (e.key === '5') switchWeapon(4);
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (!session.isPlaying || session.isPaused) return;
    
    // Release cleaver when mouse button released while charging
    if (gameState.currentWeapon === 3 && gameState.weaponStates.cleaverCharging) {
      releaseCleaver(session.particleSystem, session.bossHUD);
    }
  });
  
  // Mouse Click / Shooting
  let mouseDown = false;
  
  container.addEventListener('mousedown', () => {
    if (document.pointerLockElement === container && !session.isPaused) {
      mouseDown = true;
      shoot(session.particleSystem, session.bossHUD);
    }
  });
  
  container.addEventListener('mouseup', () => {
    mouseDown = false;
    if (gameState.currentWeapon === 3 && gameState.weaponStates.cleaverCharging) {
      releaseCleaver(session.particleSystem, session.bossHUD);
    }
  });
  
  // Continuous firing for melter
  setInterval(() => {
    if (session.isPlaying && !session.isPaused && mouseDown && document.pointerLockElement === container) {
      if (gameState.currentWeapon === 4) {
        shoot(session.particleSystem, session.bossHUD);
      }
    }
  }, 1000/30); // 30 FPS for continuous beam
  
  // Begin the adventure
  startWave();
  requestAnimationFrame(runGameLoop);
}