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
      // Invert horizontal yaw so moving mouse right turns right (positive yaw)
      gameState.player.yaw += e.movementX * MOUSE_SENSITIVITY;
      // Keep vertical mouse (pitch) behavior unchanged (not inverted)
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
  // Basic WASD movement (fixed directions)
  const baseSpeed = 5;
  const speedBonus = gameState.upgrades.moveSpeed * 0.2;
  const speed = baseSpeed * (1 + speedBonus) * delta;
  const yaw = gameState.player.yaw;

  // Forward vector matches the ray direction used elsewhere: (sin(yaw), 0, -cos(yaw))
  const forwardX = Math.sin(yaw);
  const forwardZ = -Math.cos(yaw);

  // Right vector is perpendicular to forward on the XZ plane
  const rightX = Math.cos(yaw);
  const rightZ = Math.sin(yaw);

  if (keys['w']) {
    gameState.player.position.x += forwardX * speed;
    gameState.player.position.z += forwardZ * speed;
  }
  if (keys['s']) {
    gameState.player.position.x -= forwardX * speed;
    gameState.player.position.z -= forwardZ * speed;
  }
  if (keys['a']) {
    gameState.player.position.x -= rightX * speed;
    gameState.player.position.z -= rightZ * speed;
  }
  if (keys['d']) {
    gameState.player.position.x += rightX * speed;
    gameState.player.position.z += rightZ * speed;
  }
}