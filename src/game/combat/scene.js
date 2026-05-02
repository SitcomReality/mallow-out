import { gameState } from '../state.js';
import { activeFX } from '../fx.js';
import { getEnemyDistanceAt } from '../shooting.js';

/**
 * Syncs the visual object list for the raymarching renderer with the current game state.
 */
export function rebuildObjectList() {
  gameState.objects = [];
  if (gameState.currentMarshmallow) {
    gameState.objects.push(gameState.currentMarshmallow.marshmallow);
    gameState.objects.push(...gameState.currentMarshmallow.holes);
  }
  for (const melting of gameState.meltingMarshmallows) {
    gameState.objects.push(melting.marshmallow);
    gameState.objects.push(...melting.holes);
  }

  // Add active visual effects to the raymarching scene
  if (activeFX && activeFX.length > 0) {
    gameState.objects.push(...activeFX);
  }
}

/**
 * Global SDF query for the combat raycaster.
 */
export function getSceneDistanceAt(p) {
  let dist = 1e10;
  if (gameState.currentMarshmallow) {
    dist = Math.min(dist, getEnemyDistanceAt(gameState.currentMarshmallow, p));
  }
  return dist;
}