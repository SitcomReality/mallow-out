import * as THREE from 'three';
import { gameState } from './src/game/state.js';
import { createEnemy, addHoleToEnemy } from './src/game/enemy.js';
import { createRenderer } from './src/game/renderer.js';
import { initControls, updateControls } from './src/game/controls.js';
import { castRay, getEnemyDistanceAt } from './src/game/shooting.js';
import { HITS_TO_KILL } from './src/game/constants.js';
import { settings } from './src/state.js';

let isPlaying = false;
let controlsSetup = null;

document.getElementById('newGame').addEventListener('click', () => {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  document.getElementById('crosshair').style.display = 'block';
  startGame();
});

function startGame() {
  if (isPlaying) return;
  isPlaying = true;
  
  const container = document.getElementById('gameContainer');
  const { render, uniforms, renderer } = createRenderer(container);
  
  // Initialize controls
  controlsSetup = initControls(container);
  
  // Spawn first enemy
  spawnEnemy();
  
  // Shooting
  container.addEventListener('click', () => {
    if (document.pointerLockElement === container) {
      shoot();
    }
  });
  
  // Game loop
  let lastTime = performance.now();
  let frameCount = 0;
  let totalDelta = 0;

  function gameLoop(time) {
    const delta = (time - lastTime) * 0.001;
    lastTime = time;
    
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
    render(time);
    requestAnimationFrame(gameLoop);
  }
  
  requestAnimationFrame(gameLoop);
}

function spawnEnemy() {
  const enemy = createEnemy();
  gameState.enemy = enemy;
  rebuildObjectList();
}

function shoot() {
  if (!gameState.enemy) return;
  
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
    addHoleToEnemy(gameState.enemy, result.point, direction);
    rebuildObjectList();
    
    if (gameState.enemy.hitCount >= HITS_TO_KILL) {
      // Enemy destroyed, spawn new one
      setTimeout(() => {
        spawnEnemy();
      }, 100);
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