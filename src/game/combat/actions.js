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

  const result = castRay(origin, direction, getSceneDistanceAt);
  
  // Visual tracer start position
  const tracerOriginNDC = new THREE.Vector3(0, -1, 0.99);
  tracerOriginNDC.unproject(camera);
  const visualOrigin = tracerOriginNDC;

  const effectEnd = result.hit ? result.point : origin.clone().add(direction.clone().multiplyScalar(60));

  if (session.tracerSystem) {
    session.tracerSystem.createTracer(visualOrigin, effectEnd, 0xffff00, isCharged);
  }

  const usedAmmo = ws.activeAmmo || 'standard';
  ws.activeAmmo = 'standard';

  if (result.hit) {
    // Check for bubble hit
    let hitBubble = null;
    for (const bubble of gameState.bubbles) {
      if (bubble.state === 'rising' && getBubbleDistanceAt(bubble, result.point) < 0.1) {
        hitBubble = bubble;
        break;
      }
    }

    if (hitBubble) {
      hitBubble.state = 'popping';
      const bubbleReward = awardMarshMultiplier(10);
      if (session.floatingTextSystem) {
        session.floatingTextSystem.createDamageText(result.point, bubbleReward, true);
      }
      createRippleFX(result.point, isCharged);
      particleSystem.createFloorSplash(result.point);
      rebuildObjectList();
      return;
    }

    const hitMarshmallow = gameState.currentMarshmallow && getEnemyDistanceAt(gameState.currentMarshmallow, result.point) < 0.1;
    
    // Always check for a floor hit (the marsh)
    const floorResult = castRay(origin, direction, (p) => {
      const dx = Math.sqrt(p.x * p.x + p.z * p.z) - 5.5;
      const dy = Math.abs(p.y + 0.1) - 0.1;
      return Math.min(Math.max(dx, dy), 0.0) + Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
    });

    if (floorResult.hit) {
      registerHit('marsh');
      const marshReward = awardMarsh();
      
      if (!gameState.tutorial.hasShot) {
        gameState.tutorial.hasShot = true;
        gameState.tutorial.currentStep = 1;
      }
      
      if (usedAmmo === 'treat') {
        spawnNextMarshmallowAt(floorResult.point);
      }

      if (session.floatingTextSystem) {
        session.floatingTextSystem.createDamageText(floorResult.point, marshReward, false);
      }
      createRippleFX(floorResult.point, isCharged);
      particleSystem.createFloorSplash(floorResult.point);
    }

    if (!hitMarshmallow) {
      rebuildObjectList();
      return;
    }

    // Marshmallow hit logic
    registerHit('marshmallow');
    
    // Base values for heal/damage
    const baseHeal = isCharged ? 25.0 : 5.0;
    const pollenMult = isCharged ? 5.0 : 1.0;
    
    const healBonus = getUpgradeEffect('mallow_heal', gameState.upgrades.mallow_heal || 0);
    const comboMult = getComboMultiplier();
    const healAmount = baseHeal * (1 + healBonus) * comboMult;

    if (isCharged) {
      applyHolepunch(gameState.currentMarshmallow, result.point, direction);
    } else {
      const chunk = applyRoundChunk(gameState.currentMarshmallow, result.point);
      chunk.scale = { x: 0.25, y: 0.25, z: 0.25 }; // Small chunk
      chunk.repairData.noDelay = true; // Heals quickly
    }
    
    // Particles
    const particleMult = isCharged ? 1.5 : 1.0;
    const hitNormal = direction.clone().multiplyScalar(-1);
    for(let i=0; i<particleMult; i++) {
        particleSystem.createMallowSplatter(result.point, hitNormal);
    }
    
    healMarshmallow(gameState.currentMarshmallow, healAmount);
    const pollenEarned = awardPollen(healAmount, pollenMult);
    
    if (session.floatingTextSystem) {
      session.floatingTextSystem.createDamageText(result.point, pollenEarned, isCharged);
    }
    
    if (!gameState.tutorial.hasShotMarshmallow) {
      gameState.tutorial.hasShotMarshmallow = true;
      gameState.tutorial.currentStep = 3;
    }
    
    if (marshmallowHUD) {
      marshmallowHUD.update(gameState.currentMarshmallow);
    }
    
    rebuildObjectList();
  }
}