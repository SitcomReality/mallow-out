import { gameState } from '../state.js';
import { activeFX } from '../fx.js';
import { getEnemyDistanceAt, getBubbleDistanceAt } from '../shooting.js';

/**
 * Syncs the visual object list for the raymarching renderer with the current game state.
 */
export function rebuildObjectList() {
  gameState.objects = [];
  if (gameState.currentMarshmallow) {
    gameState.objects.push(gameState.currentMarshmallow.marshmallow);
    if (gameState.currentMarshmallow.goo) gameState.objects.push(gameState.currentMarshmallow.goo);
    gameState.objects.push(...gameState.currentMarshmallow.holes);
  }
  for (const melting of gameState.meltingMarshmallows) {
    gameState.objects.push(melting.marshmallow);
    if (melting.goo) gameState.objects.push(melting.goo);
    gameState.objects.push(...melting.holes);
  }

  // Add bubbles
  for (const bubble of gameState.bubbles) {
    gameState.objects.push(bubble.group, bubble.skin, bubble.voidObj);
  }

  // Add active visual effects to the raymarching scene
  if (activeFX && activeFX.length > 0) {
    gameState.objects.push(...activeFX);
  }
}

function sdCylinder(p, r, h) {
  const dx = Math.sqrt(p.x * p.x + p.z * p.z) - r;
  const dy = Math.abs(p.y) - h;
  return Math.min(Math.max(dx, dy), 0.0) + Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
}

/**
 * Global SDF query for the combat raycaster.
 * Must match the shader's map() function for accurate collision detection.
 */
export function getSceneDistanceAt(p) {
  let dist = 1e10;

  // 1. Floor distance (matching shader: sdCylinder(p + vec3(0.0, 0.1, 0.0), 5.5, 0.1))
  const floorDist = sdCylinder({ x: p.x, y: p.y + 0.1, z: p.z }, 5.5, 0.1);
  dist = Math.min(dist, floorDist);

  // 2. Current active marshmallow
  if (gameState.currentMarshmallow) {
    dist = Math.min(dist, getEnemyDistanceAt(gameState.currentMarshmallow, p));
  }

  // 3. Melting marshmallows (optional, but improves collision consistency)
  for (const melting of gameState.meltingMarshmallows) {
    dist = Math.min(dist, getEnemyDistanceAt(melting, p));
  }

  // 4. Bubbles (only if rising)
  for (const bubble of gameState.bubbles) {
    if (bubble.state === 'rising') {
      dist = Math.min(dist, getBubbleDistanceAt(bubble, p));
    }
  }

  return dist;
}