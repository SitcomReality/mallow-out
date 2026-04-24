import { MOUSE_SENSITIVITY } from './constants.js';
import { gameState } from './state.js';

const keys = {};

export function initControls(container) {
  // Pointer lock
  container.addEventListener('click', () => {
    container.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== container) {
      // Lost pointer lock
    }
  });

  // Mouse movement
  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === container) {
      gameState.player.yaw -= e.movementX * MOUSE_SENSITIVITY;
      gameState.player.pitch -= e.movementY * MOUSE_SENSITIVITY;
      gameState.player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, gameState.player.pitch));
      
      gameState.player.rotation.y = gameState.player.yaw;
      gameState.player.rotation.x = gameState.player.pitch;
    }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  return { keys };
}

export function updateControls(delta) {
  // Basic WASD movement (placeholder for now)
  const speed = 5 * delta;
  const forward = Math.cos(gameState.player.yaw);
  const right = Math.sin(gameState.player.yaw);

  if (keys['w']) {
    gameState.player.position.x += forward * speed;
    gameState.player.position.z -= Math.sin(gameState.player.yaw) * speed;
  }
  if (keys['s']) {
    gameState.player.position.x -= forward * speed;
    gameState.player.position.z += Math.sin(gameState.player.yaw) * speed;
  }
  if (keys['a']) {
    gameState.player.position.x -= right * speed;
    gameState.player.position.z -= Math.cos(gameState.player.yaw) * speed;
  }
  if (keys['d']) {
    gameState.player.position.x += right * speed;
    gameState.player.position.z += Math.cos(gameState.player.yaw) * speed;
  }
}