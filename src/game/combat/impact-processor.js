import * as THREE from 'three';
import { gameState } from '../state.js';
import { devState } from '../dev-state.js';
import { applyHolepunch, applyRoundChunk } from '../damage/actions.js';
import { damageMarshmallow } from '../marshmallow.js';
import { registerHit, getComboMultiplier } from '../combo-system.js';
import { awardCaramel } from '../economy.js';
import { session, onMarshmallowDefeated } from '../manager.js';
import { createRippleFX } from '../fx.js';

/**
 * Applies logic for a successful hit on the marshmallow.
 */
export function handleMarshmallowImpact(resultPoint, direction, isCharged, particleSystem, marshmallowHUD) {
  if (!gameState.currentMarshmallow) return;

  registerHit('marshmallow');
  
  // Apply hit reaction with knockback
  const marshmallow = gameState.currentMarshmallow;
  
  if (!devState.disableHitEffects) {
    const knockbackStrength = isCharged ? 18.0 : 4.0;
    const knockbackDir = direction.clone().multiplyScalar(-knockbackStrength);
    
    if (!marshmallow.hitReaction) {
      marshmallow.hitReaction = {
        active: false,
        timer: 0,
        knockbackVelocity: new THREE.Vector3(),
        flashTimer: 0,
        bulgeTimer: 0,
      };
    }
    
    marshmallow.hitReaction.active = true;
    marshmallow.hitReaction.timer = 0.3;
    marshmallow.hitReaction.knockbackVelocity.copy(knockbackDir);
    marshmallow.hitReaction.flashTimer = 0.15;
    marshmallow.hitReaction.bulgeTimer = 0.25;
    
    // Store base scale for bulge effect
    if (!marshmallow.meltStartScale) {
      marshmallow.meltStartScale = {
        x: marshmallow.marshmallow.scale.x,
        y: marshmallow.marshmallow.scale.y,
        z: marshmallow.marshmallow.scale.z || marshmallow.marshmallow.scale.x
      };
    }
  }
  
  // Deal damage
  const baseDamage = isCharged ? 25.0 : 5.0;
  const comboMult = getComboMultiplier();
  const damage = baseDamage * comboMult;
  
  const defeated = damageMarshmallow(marshmallow, damage, particleSystem);
  
  // Award caramel for hitting
  const caramelEarned = awardCaramel(Math.floor(damage / 5), comboMult);
  
  if (isCharged) {
    const hole = applyHolepunch(gameState.currentMarshmallow, resultPoint, direction);
    if (hole && hole.repairData) {
      hole.repairData.delay = gameState.weaponStates.maxChargeTime || 3.0;
    }
  } else {
    const chunk = applyRoundChunk(gameState.currentMarshmallow, resultPoint);
    chunk.scale = { x: 0.05, y: 0.05, z: 0.05 }; 
    if (chunk.repairData) {
      chunk.repairData.initialScale = 0.05;
      chunk.repairData.delay = gameState.weaponStates.maxCooldown || 1.0;
    }
  }
  
  const particleMult = isCharged ? 1.5 : 1.0;
  const hitNormal = direction.clone().multiplyScalar(-1);
  for(let i=0; i < particleMult; i++) {
    particleSystem.createMallowSplatter(resultPoint, hitNormal);
  }
  
  if (session.floatingTextSystem) {
    session.floatingTextSystem.createDamageText(resultPoint, caramelEarned, isCharged);
  }
  
  if (!gameState.tutorial.hasShotMarshmallow) {
    gameState.tutorial.hasShotMarshmallow = true;
    gameState.tutorial.currentStep = 2;
  }
  
  if (defeated) {
    onMarshmallowDefeated();
  } else if (marshmallowHUD) {
    marshmallowHUD.update(gameState.currentMarshmallow);
  }
}

/**
 * Applies logic for a hit on the marsh floor.
 */
export function handleFloorImpact(floorPoint, isCharged, particleSystem) {
  registerHit('floor');
  
  // Award small caramel for floor shots
  const comboMult = getComboMultiplier();
  const caramelReward = Math.floor(1 * comboMult);
  awardCaramel(caramelReward);
  
  if (!gameState.tutorial.hasShot) {
    gameState.tutorial.hasShot = true;
    gameState.tutorial.currentStep = 1;
    
    if (session.notifications) {
      session.notifications.add({
        id: 'first_shot',
        sticky: false,
        title: '💥 FIRST SHOT! 💥',
        text: `+${caramelReward} caramel! Build combos for more!`,
        color: '#ff8c00'
      });
    }
  }
  
  // Combo milestones
  if (gameState.combo.count === 5 && !gameState.milestones?.combo5) {
    if (!gameState.milestones) gameState.milestones = {};
    gameState.milestones.combo5 = true;
    if (session.notifications) {
      session.notifications.add({
        id: 'combo_5',
        sticky: false,
        title: '🔥 5-HIT COMBO! 🔥',
        text: 'You\'re on FIRE! Higher combos = MORE REWARDS!',
        color: '#ff4500'
      });
    }
  }

  if (session.floatingTextSystem) {
    session.floatingTextSystem.createDamageText(floorPoint, caramelReward, false);
  }
  
  createRippleFX(floorPoint, isCharged);
  particleSystem.createFloorSplash(floorPoint);
}