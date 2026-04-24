import * as THREE from 'three';
import { gameState } from './src/game/state.js';
import { createEnemy, addHoleToEnemy } from './src/game/enemy.js';
import { createRenderer } from './src/game/renderer.js';
import { initControls, updateControls } from './src/game/controls.js';
import { castRay, getEnemyDistanceAt } from './src/game/shooting.js';
import { HITS_TO_KILL } from './src/game/constants.js';
import { settings } from './src/state.js';
import { createHUD } from './src/ui/hud.js';
import { createPauseMenu } from './src/ui/pause-menu.js';

let isPlaying = false;
let isPaused = false;
let controlsSetup = null;
let hud = null;
let pauseMenu = null;

document.getElementById('newGame').addEventListener('click', () => {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  document.getElementById('crosshair').style.display = 'block';
  startGame();
});

function quitToMenu() {
  isPlaying = false;
  isPaused = false;
  document.getElementById('menu').style.display = 'flex';
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('crosshair').style.display = 'none';
  if (hud) hud.hide();
  if (pauseMenu) pauseMenu.hide();
  // Reset game state
  gameState.enemy = null;
  gameState.objects = [];
}

function startGame() {
  if (isPlaying) return;
  isPlaying = true;
  isPaused = false;
  
  const container = document.getElementById('gameContainer');
  const { render, uniforms, renderer } = createRenderer(container);
  
  // Initialize UI
  hud = createHUD();
  hud.show();
  
  pauseMenu = createPauseMenu(
    () => togglePause(), // Resume
    () => quitToMenu()   // Quit
  );
  
  // Initialize controls
  controlsSetup = initControls(container);
  
  // Keyboard listeners
  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;

    if (e.key === 'Escape') {
      togglePause();
    }
    
    // Weapon switching
    if (!isPaused) {
      if (e.key === '1') switchWeapon(0);
      if (e.key === '2') switchWeapon(1);
      if (e.key === '3') switchWeapon(2);
    }
  });
  
  // Spawn first enemy
  spawnEnemy();
  
  // Shooting
  container.addEventListener('click', () => {
    if (document.pointerLockElement === container && !isPaused) {
      shoot();
    }
  });
  
  // Game loop
  let lastTime = performance.now();
  let frameCount = 0;
  let totalDelta = 0;

  function gameLoop(time) {
    if (!isPlaying) return; // Stop loop if quit
    
    const delta = (time - lastTime) * 0.001;
    lastTime = time;
    
    // Only update game logic if not paused
    if (!isPaused) {
      // Performance monitoring for dynamic resolution
      if (settings.dynamicRes) {
        frameCount++;
        totalDelta += delta;
        if (frameCount >= 30) {
          const avgDelta = totalDelta / frameCount;
          const targetDelta = 1.0 / settings.targetFPS;
          
          if (avgDelta > targetDelta * 1.1) { // Running slow
            settings.renderScale = Math.max(settings.minScale, settings.renderScale - 0.05);
          } else if (avgDelta < targetDelta * 0.8) { // Running well
            settings.renderScale = Math.min(settings.maxScale, settings.renderScale + 0.02);
          }
          frameCount = 0;
          totalDelta = 0;
        }
      }

      updateControls(delta);
    }
    
    render(time);
    requestAnimationFrame(gameLoop);
  }
  
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    pauseMenu.show();
    document.exitPointerLock();
  } else {
    pauseMenu.hide();
  }
}

function switchWeapon(index) {
  gameState.currentWeapon = index;
  if (hud) hud.setActiveWeapon(index);
}

function spawnEnemy() {
  const enemy = createEnemy();
  gameState.enemy = enemy;
  rebuildObjectList();
}

import { addChunkToEnemy } from './src/game/enemy.js';

function shoot() {
  if (!gameState.enemy) return;
  if (gameState.currentWeapon === 2) {
    // Lava hose placeholder: maybe just a continuous stream of small subtractions?
    // For now, let's just return.
    return;
  }
  
  const player = gameState.player;
  const origin = player.position.clone();
  const direction = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  const distFunc = (p) => getEnemyDistanceAt(gameState.enemy, p);
  const result = castRay(origin, direction, distFunc);
  
  if (result.hit) {
    if (gameState.currentWeapon === 0) {
      addChunkToEnemy(gameState.enemy, result.point);
    } else {
      addHoleToEnemy(gameState.enemy, result.point, direction);
    }
    
    rebuildObjectList();
    
    if (gameState.enemy.hitCount >= HITS_TO_KILL) {
      // Enemy destroyed, spawn new one
      const deadEnemy = gameState.enemy;
      gameState.enemy = null;
      rebuildObjectList();
      setTimeout(() => {
        spawnEnemy();
      }, 500);
    }
  }
}

function rebuildObjectList() {
  gameState.objects = [];
  if (gameState.enemy) {
    gameState.objects.push(gameState.enemy);
    gameState.objects.push(...gameState.enemy.holes);
  }
}