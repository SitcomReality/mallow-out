import * as THREE from 'three';
import { gameState } from '../state.js';
import { castRay, getEnemyDistanceAt } from '../shooting.js';
import { session } from '../manager.js';
import { getUpgradeEffect } from '../upgrades/weapon-modifiers.js';
import { rebuildObjectList } from './scene.js';
import { processBubbleHits } from './bubble-processor.js';
import { handleMarshmallowImpact, handleFloorImpact } from './impact-processor.js';

/**
 * Main shoot entry point. Orchestrates the raycasting and impact logic.
 */
export function shoot(screenX, screenY, particleSystem, marshmallowHUD, camera) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) return;
  
  const isCharged = ws.chargeTimer >= ws.maxChargeTime;
  
  // Set standard base cooldown after firing
  const STANDARD_BASE_COOLDOWN = 1.0;
  const cooldownReduction = getUpgradeEffect('shot_cooldown', gameState.upgrades.shot_cooldown || 0);
  ws.skewerCooldown = Math.max(0.2, STANDARD_BASE_COOLDOWN * (1 - cooldownReduction));

  // Reset charging
  ws.chargeTimer = 0;

  // Unproject screen coordinates to find world ray
  const vec = new THREE.Vector3(screenX, screenY, 0.5);
  vec.unproject(camera);
  const direction = vec.sub(camera.position).normalize();
  const origin = camera.position.clone();

  const floorResult = castRay(origin, direction, (p) => {
    const radius = 10.0; // Matches WORLD_BOUNDS.radius
    const distFromCenter = p.length();
    return radius - distFromCenter;
  });

  // Raycast against the current marshmallow specifically
  let mallowResult = { hit: false };
  if (gameState.currentMarshmallow) {
    mallowResult = castRay(origin, direction, (p) => getEnemyDistanceAt(gameState.currentMarshmallow, p));
  }

  // 1. Process Bubbles (Transparent, don't stop the bullet)
  processBubbleHits(origin, direction, isCharged, particleSystem);

  // 2. Solid Hit Detection Logic
  const hitFloorFirst = floorResult.hit && (!mallowResult.hit || floorResult.distance < mallowResult.distance);
  const hitMallow = mallowResult.hit && !hitFloorFirst;
  const hitFloorThrough = isCharged && mallowResult.hit && floorResult.hit && floorResult.distance > mallowResult.distance;
  const finalFloorHit = hitFloorFirst || hitFloorThrough;

  // 3. Apply Impacts
  if (hitMallow) {
    handleMarshmallowImpact(mallowResult.point, direction, isCharged, particleSystem, marshmallowHUD);
  }

  if (finalFloorHit) {
    handleFloorImpact(floorResult.point, isCharged, particleSystem);
  }

  // 4. Visual Tracer Calculation
  const tracerOriginNDC = new THREE.Vector3(0, -1, 0.99);
  tracerOriginNDC.unproject(camera);
  const visualOrigin = tracerOriginNDC;

  let effectEnd;
  if (finalFloorHit) {
    effectEnd = floorResult.point;
  } else if (hitMallow) {
    effectEnd = mallowResult.point;
  } else {
    effectEnd = origin.clone().add(direction.clone().multiplyScalar(60));
  }

  if (session.tracerSystem) {
    session.tracerSystem.createTracer(visualOrigin, effectEnd, 0xffff00, isCharged);
  }

  rebuildObjectList();
}