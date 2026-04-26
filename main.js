import * as THREE from 'three';
import { gameState } from './src/game/state.js';
import { addHoleToEnemy } from './src/game/enemy.js';
import { createBoss, damageBoss } from './src/game/boss.js';
import { createRenderer } from './src/game/renderer.js';
import { initControls, updateControls } from './src/game/controls.js';
import { castRay, getEnemyDistanceAt } from './src/game/shooting.js';
import { BASE_DAMAGE_CHUNK, BASE_DAMAGE_HOLE } from './src/game/constants.js';
import { settings } from './src/state.js';
import { createHUD } from './src/ui/hud.js';
import { createBossHUD } from './src/ui/boss-hud.js';
import { createUpgradeScreen } from './src/ui/upgrade-screen.js';
import { createPauseMenu } from './src/ui/pause-menu.js';
import { activeFX, updateFX, clearAllFX, createChunkSplashFX, createHoleSprayFX } from './src/game/fx.js';
import { updateMeltingEnemies } from './src/game/melting.js';
import { updateRepairs } from './src/game/repair.js';
import { STARTING_WAVE } from './src/game/wave-constants.js';

let isPlaying = false;
let isPaused = false;
let controlsSetup = null;
let hud = null;
let bossHUD = null;
let upgradeScreen = null;
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
  if (bossHUD) bossHUD.hide();
  if (upgradeScreen) upgradeScreen.hide();
  if (pauseMenu) pauseMenu.hide();
  // Reset game state
  gameState.boss = null;
  gameState.meltingEnemies = [];
  gameState.objects = [];
  gameState.currentWave = STARTING_WAVE;
  gameState.upgrades = {
    damage: 0,
    fireRate: 0,
    moveSpeed: 0,
    health: 0,
    splash: 0,
  };
  clearAllFX();
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
  
  bossHUD = createBossHUD();
  
  upgradeScreen = createUpgradeScreen((upgradeId) => {
    // Apply upgrade
    if (upgradeId === 'damage') gameState.upgrades.damage++;
    else if (upgradeId === 'fire_rate') gameState.upgrades.fireRate++;
    else if (upgradeId === 'move_speed') gameState.upgrades.moveSpeed++;
    else if (upgradeId === 'health') gameState.upgrades.health++;
    else if (upgradeId === 'splash') gameState.upgrades.splash++;
    
    // Start next wave
    gameState.currentWave++;
    spawnBoss();
  });
  
  pauseMenu = createPauseMenu(
    () => togglePause(),
    () => quitToMenu()
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
  
  // Spawn first boss
  spawnBoss();
  
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
      // Check for wave completion: Boss is dead and all melting animations finished
      if (gameState.waveInProgress && !gameState.boss && gameState.meltingEnemies.length === 0) {
        gameState.waveInProgress = false;
        if (upgradeScreen) {
          upgradeScreen.show(gameState.currentWave);
        }
      }

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
      updateFX(time * 0.001);
      updateMeltingEnemies(time * 0.001);
      updateRepairs(time * 0.001, delta);
      rebuildObjectList();
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

function spawnBoss() {
  const boss = createBoss(gameState.currentWave);
  gameState.boss = boss;
  gameState.waveInProgress = true;
  if (bossHUD) bossHUD.update(boss);
  rebuildObjectList();
}

import { addChunkToEnemy } from './src/game/enemy.js';

function shoot() {
  if (!gameState.boss) return;
  if (gameState.currentWeapon === 2) {
    return;
  }
  
  const player = gameState.player;
  const origin = player.position.clone();
  const direction = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  const distFunc = (p) => getEnemyDistanceAt(gameState.boss, p);
  const result = castRay(origin, direction, distFunc);
  
  if (result.hit) {
    let damage = 0;
    
    if (gameState.currentWeapon === 0) {
      addChunkToEnemy(gameState.boss, result.point);
      createChunkSplashFX(result.point, direction, gameState.boss.rotation);
      damage = BASE_DAMAGE_CHUNK + gameState.upgrades.damage;
    } else {
      const hole = addHoleToEnemy(gameState.boss, result.point, direction);
      const holeLength = hole.scale.y * 2;
      const exitPoint = result.point.clone().add(direction.clone().multiplyScalar(holeLength));
      createHoleSprayFX(result.point, exitPoint, direction);
      damage = BASE_DAMAGE_HOLE + gameState.upgrades.damage;
    }
    
    const defeated = damageBoss(gameState.boss, damage);
    if (bossHUD) bossHUD.update(gameState.boss);
    
    rebuildObjectList();
    
    if (defeated) {
      if (gameState.meltingEnemies.length >= 2) {
        gameState.meltingEnemies.shift();
      }
      
      const deadBoss = gameState.boss;
      deadBoss.meltStartTime = performance.now() * 0.001;
      gameState.meltingEnemies.push(deadBoss);
      gameState.boss = null;
      if (bossHUD) bossHUD.hide();
      
      rebuildObjectList();
    }
  }
}

function rebuildObjectList() {
  gameState.objects = [];
  if (gameState.boss) {
    gameState.objects.push(gameState.boss.marshmallow);
    gameState.objects.push(...gameState.boss.holes);
  }
  for (const melting of gameState.meltingEnemies) {
    gameState.objects.push(melting.marshmallow);
    gameState.objects.push(...melting.holes);
  }
  gameState.objects.push(...activeFX);
}