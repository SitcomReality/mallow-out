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
import { createPauseMenu } from './src/ui/pause-menu.js';
import { ParticleSystem } from './src/effects/particles.js';
import { session, spawnBoss, quitToMenu, togglePause, switchWeapon } from './src/game/manager.js';
import { runGameLoop } from './src/game/loop.js';
import { shoot } from './src/game/combat.js';

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
    spawnBoss();
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
    }
  });
  
  // Mouse Click / Shooting
  container.addEventListener('click', () => {
    if (document.pointerLockElement === container && !session.isPaused) {
      shoot(session.particleSystem, session.bossHUD);
    }
  });
  
  // Begin the adventure
  spawnBoss();
  requestAnimationFrame(runGameLoop);
}