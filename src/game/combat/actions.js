import * as THREE from 'three';
import { gameState } from '../state.js';
import { castRay, getEnemyDistanceAt, getBubbleDistanceAt } from '../shooting.js';
import { applyHolepunch } from '../damage/actions.js';
import { session } from '../manager.js';
import { createRippleFX } from '../fx.js';
import { getUpgradeEffect } from '../upgrades/weapon-modifiers.js';
import { getSceneDistanceAt, rebuildObjectList } from './scene.js';
import { healMarshmallow } from '../marshmallow.js';
import { registerHit, getComboMultiplier } from '../combo-system.js';
import { awardMarsh, awardPollen, awardMarshMultiplier } from '../economy.js';
import { spawnNextMarshmallowAt } from '../manager.js';

import { applyRoundChunk } from '../damage/actions.js';
import { BUBBLE_OUTER_RADIUS } from '../bubble-constants.js';

function intersectRaySphere(ro, rd, center, radius) {
  const oc = new THREE.Vector3().subVectors(center, ro);
  const tca = oc.dot(rd);
  const d2 = oc.dot(oc) - tca * tca;
  const r2 = radius * radius;
  if (d2 > r2) return false;
  const thc = Math.sqrt(r2 - d2);
  let t0 = tca - thc;
  let t1 = tca + thc;
  if (t0 < 0) t0 = t1;
  if (t0 < 0) return false;
  return t0;
}

export function shoot(screenX, screenY, particleSystem, marshmallowHUD, camera) {
  const ws = gameState.weaponStates;
  if (ws.skewerCooldown > 0) return;
  
  const isCharged = ws.chargeTimer >= ws.maxChargeTime;
  
  // Always use standard base cooldown after firing (charged shots no longer impose an extended cooldown)
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

  // Raycast against the floor specifically
  const floorResult = castRay(origin, direction, (p) => {
    const dx = Math.sqrt(p.x * p.x + p.z * p.z) - 5.5;
    const dy = Math.abs(p.y + 0.1) - 0.1;
    return Math.min(Math.max(dx, dy), 0.0) + Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
  });

  // Raycast against the current marshmallow specifically
  let mallowResult = { hit: false };
  if (gameState.currentMarshmallow) {
    mallowResult = castRay(origin, direction, (p) => getEnemyDistanceAt(gameState.currentMarshmallow, p));
  }

  // Visual tracer start position
  const tracerOriginNDC = new THREE.Vector3(0, -1, 0.99);
  tracerOriginNDC.unproject(camera);
  const visualOrigin = tracerOriginNDC;

  const usedAmmo = ws.activeAmmo || 'standard';
  ws.activeAmmo = 'standard';

  // 1. Process Bubbles (Transparent, don't stop the bullet)
  const maxBubbleDist = 60;
  for (const bubble of gameState.bubbles) {
    if (bubble.state === 'rising') {
      const radius = bubble.group.scale.x * BUBBLE_OUTER_RADIUS;
      const t = intersectRaySphere(origin, direction, bubble.group.position, radius);
      if (t !== false && t < maxBubbleDist) {
        bubble.state = 'popping';
        const bubbleReward = awardMarshMultiplier(10);
        const bubbleHitPos = origin.clone().add(direction.clone().multiplyScalar(t));
        if (session.floatingTextSystem) {
          session.floatingTextSystem.createDamageText(bubbleHitPos, bubbleReward, true);
        }
        createRippleFX(bubbleHitPos, isCharged);
        particleSystem.createFloorSplash(bubbleHitPos);
      }
    }
  }

  // 2. Solid Hit Detection Logic
  // A hit on the floor is prioritized if it's the first solid hit, OR if we penetrate the mallow.
  const hitFloorFirst = floorResult.hit && (!mallowResult.hit || floorResult.distance < mallowResult.distance);
  const hitMallow = mallowResult.hit && !hitFloorFirst;
  const hitFloorThrough = isCharged && mallowResult.hit && floorResult.hit && floorResult.distance > mallowResult.distance;
  const finalFloorHit = hitFloorFirst || hitFloorThrough;

  // 3. Apply Marshmallow Hit
  if (hitMallow) {
    const resultPoint = mallowResult.point;
    registerHit('marshmallow');
    
    // Base values for heal/damage
    const baseHeal = isCharged ? 25.0 : 5.0;
    const pollenMult = isCharged ? 5.0 : 1.0;
    const healBonus = getUpgradeEffect('mallow_heal', gameState.upgrades.mallow_heal || 0);
    const comboMult = getComboMultiplier();
    const healAmount = baseHeal * (1 + healBonus) * comboMult;

    if (isCharged) {
      const hole = applyHolepunch(gameState.currentMarshmallow, resultPoint, direction);
      if (hole && hole.repairData) {
        hole.repairData.delay = gameState.weaponStates.maxChargeTime || gameState.weaponStates.maxChargeTime === 0 ? gameState.weaponStates.maxChargeTime : 3.0;
      }
    } else {
      const chunk = applyRoundChunk(gameState.currentMarshmallow, resultPoint);
      chunk.scale = { x: 0.05, y: 0.05, z: 0.05 }; 
      if (chunk.repairData) {
        chunk.repairData.initialScale = 0.05;
        chunk.repairData.delay = gameState.weaponStates.maxCooldown || gameState.weaponStates.maxCooldown === 0 ? gameState.weaponStates.maxCooldown : 1.0;
      }
    }
    
    const particleMult = isCharged ? 1.5 : 1.0;
    const hitNormal = direction.clone().multiplyScalar(-1);
    for(let i=0; i<particleMult; i++) {
        particleSystem.createMallowSplatter(resultPoint, hitNormal);
    }
    
    healMarshmallow(gameState.currentMarshmallow, healAmount);
    const pollenEarned = awardPollen(healAmount, pollenMult);
    if (session.floatingTextSystem) {
      session.floatingTextSystem.createDamageText(resultPoint, pollenEarned, isCharged);
    }
    
    if (!gameState.tutorial.hasShotMarshmallow) {
      gameState.tutorial.hasShotMarshmallow = true;
      gameState.tutorial.currentStep = 3;
    }
    
    if (marshmallowHUD) {
      marshmallowHUD.update(gameState.currentMarshmallow);
    }
  }

  // 4. Apply Floor Hit (Penetration included)
  if (finalFloorHit) {
    const floorPoint = floorResult.point;
    registerHit('marsh');
    const marshReward = awardMarsh();
    
    if (!gameState.tutorial.hasShot) {
      gameState.tutorial.hasShot = true;
      gameState.tutorial.currentStep = 1;
    }
    
    if (usedAmmo === 'treat') {
      spawnNextMarshmallowAt(floorPoint);
    }

    if (session.floatingTextSystem) {
      session.floatingTextSystem.createDamageText(floorPoint, marshReward, false);
    }
    createRippleFX(floorPoint, isCharged);
    particleSystem.createFloorSplash(floorPoint);
  }

  // 5. Visual Tracer Calculation
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