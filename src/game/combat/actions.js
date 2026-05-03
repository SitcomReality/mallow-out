import * as THREE from 'three';
import { gameState } from '../state.js';
import { castRay, getEnemyDistanceAt } from '../shooting.js';
import { applyHolepunch } from '../damage/actions.js';
import { session } from '../manager.js';
import { createRippleFX } from '../fx.js';
import { rollCriticalHit, getUpgradeEffect } from '../upgrades/weapon-modifiers.js';
import { BASE_DAMAGE_HOLEPUNCH } from '../combat-constants.js';
import { getSceneDistanceAt, rebuildObjectList } from './scene.js';
import { handleMarshmallowHit } from './logic.js';

export function shoot(screenX, screenY, particleSystem, marshmallowHUD, camera) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) return;
  
  // Base cooldown with upgrade reduction
  const baseCooldown = 5.0;
  const cooldownReduction = getUpgradeEffect('shot_cooldown', gameState.upgrades.shot_cooldown || 0);
  ws.skewerCooldown = Math.max(0.5, baseCooldown * (1 - cooldownReduction));

  // Unproject screen coordinates to find world ray
  const vec = new THREE.Vector3(screenX, screenY, 0.5);
  vec.unproject(camera);
  const direction = vec.sub(camera.position).normalize();
  const origin = camera.position.clone();

  const result = castRay(origin, direction, getSceneDistanceAt);
  
  // Visual tracer start position: unproject a point at the bottom-center of the screen
  const tracerOriginNDC = new THREE.Vector3(0, -1, 0.99); // Near the bottom-center "lens"
  tracerOriginNDC.unproject(camera);
  const visualOrigin = tracerOriginNDC;

  const effectEnd = result.hit ? result.point : origin.clone().add(direction.clone().multiplyScalar(60));

  if (session.tracerSystem) {
    session.tracerSystem.createTracer(visualOrigin, effectEnd, 0xffff00);
  }

  if (result.hit) {
    const hitMarshmallow = gameState.currentMarshmallow && getEnemyDistanceAt(gameState.currentMarshmallow, result.point) < 0.1;
    
    if (!hitMarshmallow) {
      // Floor hit - award marsh currency
      const marshReward = 1 + getUpgradeEffect('marsh_reward', gameState.upgrades.marsh_reward || 0);
      gameState.currencies.marsh += marshReward;
      if (session.floatingTextSystem) {
        session.floatingTextSystem.createDamageText(result.point, marshReward, false);
      }
      createRippleFX(result.point);
      particleSystem.createFloorSplash(result.point);
      rebuildObjectList();
      return;
    }

    const isCritical = rollCriticalHit();
    const baseHeal = 3.0;
    const healBonus = getUpgradeEffect('mallow_heal', gameState.upgrades.mallow_heal || 0);
    const healAmount = baseHeal * (1 + healBonus);

    applyHolepunch(gameState.currentMarshmallow, result.point, direction);
    
    // Improved mallow splatter
    const hitNormal = direction.clone().multiplyScalar(-1);
    particleSystem.createMallowSplatter(result.point, hitNormal);
    
    // Heal instead of damage
    const { healMarshmallow } = await import('../marshmallow.js');
    healMarshmallow(gameState.currentMarshmallow, healAmount);
    
    if (session.floatingTextSystem) {
      session.floatingTextSystem.createDamageText(result.point, healAmount, false);
    }
    
    if (marshmallowHUD) {
      marshmallowHUD.update(gameState.currentMarshmallow);
    }
    
    rebuildObjectList();
  }
}

export function stopShooting() {}
export function releaseCleaver() {}