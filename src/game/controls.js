import * as THREE from 'three';
import { MOUSE_SENSITIVITY } from './constants.js';
import { gameState } from './state.js';
import { SPHERE_RADIUS, SPHERE_NOISE_SCALE, SPHERE_NOISE_AMOUNT } from '../world/constants.js';

const keys = {};

// Ported shader noise function directly into JS for precise 3D terrain-following physics 
function fract(x) { return x - Math.floor(x); }
function mix(a, b, t) { return a + (b - a) * t; }

function hash3(x, y, z) {
  let px = fract(x * 0.1031);
  let py = fract(y * 0.1030);
  let pz = fract(z * 0.0973);
  
  const d = px*(py + 33.33) + py*(px + 33.33) + pz*(pz + 33.33);
  px += d; py += d; pz += d;
  
  return fract((px + py) * pz);
}

function noise3D(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = fract(x), fy = fract(y), fz = fract(z);
  
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);
  const uz = fz * fz * (3.0 - 2.0 * fz);
  
  return mix(
    mix(
      mix(hash3(ix, iy, iz), hash3(ix+1, iy, iz), ux),
      mix(hash3(ix, iy+1, iz), hash3(ix+1, iy+1, iz), ux),
      uy
    ),
    mix(
      mix(hash3(ix, iy, iz+1), hash3(ix+1, iy, iz+1), ux),
      mix(hash3(ix, iy+1, iz+1), hash3(ix+1, iy+1, iz+1), ux),
      uy
    ),
    uz
  );
}

function fbm3D(x, y, z) {
  let v = 0.0;
  let a = 0.5;
  let px = x, py = y, pz = z;
  for (let i = 0; i < 3; i++) {
    v += a * noise3D(px, py, pz);
    // JS equivalent of GLSL matrix-vector multiplication (column-major layout)
    const nx = (0.00 * px - 0.80 * py - 0.60 * pz) * 2.0;
    const ny = (0.80 * px + 0.36 * py - 0.48 * pz) * 2.0;
    const nz = (0.60 * px - 0.48 * py + 0.64 * pz) * 2.0;
    px = nx; py = ny; pz = nz;
    a *= 0.5;
  }
  return v;
}

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
  const speed = 15 * delta;
  const pos = gameState.player.position;

  // Local "up" vector points towards the center of the sphere (we are inside it)
  const up = pos.clone().multiplyScalar(-1).normalize();

  // Establish a base reference frame for walking on the surface
  let forwardRef = new THREE.Vector3(0, 0, -1);
  if (Math.abs(up.dot(forwardRef)) > 0.99) {
    forwardRef = new THREE.Vector3(1, 0, 0); // Handle north/south pole singularity
  }

  const localRight = new THREE.Vector3().crossVectors(forwardRef, up).normalize();
  const localForward = new THREE.Vector3().crossVectors(up, localRight).normalize();

  // Map mouse yaw rotation onto our local spherical ground
  const yaw = gameState.player.yaw;
  const finalForward = localForward.clone().multiplyScalar(Math.cos(yaw)).add(localRight.clone().multiplyScalar(-Math.sin(yaw)));
  const finalRight = new THREE.Vector3().crossVectors(finalForward, up).normalize();

  const moveVec = new THREE.Vector3();
  if (keys['w']) moveVec.add(finalForward);
  if (keys['s']) moveVec.sub(finalForward);
  if (keys['a']) moveVec.sub(finalRight);
  if (keys['d']) moveVec.add(finalRight);

  if (moveVec.lengthSq() > 0) {
    moveVec.normalize().multiplyScalar(speed);
    pos.add(moveVec);
  }

  // Calculate matching terrain bump height via exact JS port of shader noise
  const noiseVal = fbm3D(pos.x * SPHERE_NOISE_SCALE, pos.y * SPHERE_NOISE_SCALE, pos.z * SPHERE_NOISE_SCALE) - 0.5;
  const targetRadius = SPHERE_RADIUS - (noiseVal * SPHERE_NOISE_AMOUNT) - 1.5;
  
  const distFromCenter = pos.length();
  if (distFromCenter > 0.01) {
    const normalizeScale = targetRadius / distFromCenter;
    const pullStrength = 0.15;
    pos.x += (pos.x * normalizeScale - pos.x) * pullStrength;
    pos.y += (pos.y * normalizeScale - pos.y) * pullStrength;
    pos.z += (pos.z * normalizeScale - pos.z) * pullStrength;
  }
}