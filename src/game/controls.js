import { MOUSE_SENSITIVITY } from './constants.js';
import { gameState } from './state.js';
import { SPHERE_RADIUS } from '../world/constants.js';

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
  // Basic WASD movement with outward gravity
  const speed = 5 * delta;
  const yaw = gameState.player.yaw;

  // Calculate forward and right vectors
  const forwardX = Math.sin(yaw);
  const forwardZ = -Math.cos(yaw);
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
  
  // Apply outward "gravity" - keep player on inner surface of sphere
  const pos = gameState.player.position;
  const distFromCenter = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
  
  if (distFromCenter > 0.01) {
    // Target radius is slightly inside the sphere wall
    const targetRadius = SPHERE_RADIUS - 1.5;
    const normalizeScale = targetRadius / distFromCenter;
    
    // Smoothly pull player to sphere surface
    const pullStrength = 0.1;
    pos.x += (pos.x * normalizeScale - pos.x) * pullStrength;
    pos.y += (pos.y * normalizeScale - pos.y) * pullStrength;
    pos.z += (pos.z * normalizeScale - pos.z) * pullStrength;
  }
}