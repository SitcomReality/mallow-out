import * as THREE from 'three';
import { gameState } from '../state.js';
import { castRay, getEnemyDistanceAt } from '../shooting.js';
import { addHoleToMarshmallow } from '../marshmallow-damage.js';
import { session } from '../manager.js';
import { createRippleFX } from '../fx.js';
import { getDamageMultiplier } from '../petals/petal-effects.js';
import { rollCriticalHit } from '../upgrades/weapon-modifiers.js';
import { BASE_DAMAGE_HOLE } from '../combat-constants.js';
import { getSceneDistanceAt, rebuildObjectList } from './scene.js';
import { handleMarshmallowHit } from './logic.js';

export function shoot(screenX, screenY, particleSystem, marshmallowHUD, camera) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) return;
  
  // Set a small base cooldown for now
  ws.skewerCooldown = 0.2;

  // Unproject screen coordinates to find world ray
  const vec = new THREE.Vector3(screenX, screenY, 0.5);
  vec.unproject(camera);
  const direction = vec.sub(camera.position).normalize();
  const origin = camera.position.clone();

  const result = castRay(origin, direction, getSceneDistanceAt);
  
  // Visual tracer start position
  const visualOrigin = origin.clone().add(direction.clone().multiplyScalar(0.5));
  const effectEnd = result.hit ? result.point : origin.clone().add(direction.clone().multiplyScalar(60));

  if (session.tracerSystem) {
    session.tracerSystem.createTracer(visualOrigin, effectEnd, 0xffffff);
  }

  if (result.hit) {
    const hitMarshmallow = gameState.currentMarshmallow && getEnemyDistanceAt(gameState.currentMarshmallow, result.point) < 0.1;
    
    if (!hitMarshmallow) {
      // Floor hit
      gameState.currencies.caramel += 1;
      if (session.floatingTextSystem) {
        session.floatingTextSystem.createDamageText(result.point, 1, false);
      }
      createRippleFX(result.point);
      rebuildObjectList();
      return;
    }

    const isCritical = rollCriticalHit();
    let damage = BASE_DAMAGE_HOLE * getDamageMultiplier();
    if (isCritical) damage *= 2;

    addHoleToMarshmallow(gameState.currentMarshmallow, result.point, direction);
    particleSystem.createHoleSpray(result.point, direction);
    
    handleMarshmallowHit(result.point, damage, isCritical, particleSystem, marshmallowHUD);
    rebuildObjectList();
  }
}

export function stopShooting() {}
export function releaseCleaver() {}