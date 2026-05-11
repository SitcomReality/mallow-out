import * as THREE from 'three';
import { gameState } from '../state.js';
import { applyHolepunch, applyRoundChunk } from '../damage/actions.js';
import { healMarshmallow } from '../marshmallow.js';
import { registerHit, getComboMultiplier } from '../combo-system.js';
import { awardMarsh, awardPollen, awardMarshMultiplier } from '../economy.js';
import { spawnNextMarshmallowAt, session } from '../manager.js';
import { getUpgradeEffect } from '../upgrades/weapon-modifiers.js';
import { createRippleFX } from '../fx.js';

/**
 * Applies logic for a successful hit on the marshmallow pet.
 */
export function handleMarshmallowImpact(resultPoint, direction, isCharged, particleSystem, marshmallowHUD) {
  if (!gameState.currentMarshmallow) return;

  registerHit('marshmallow');
  
  // Base values for heal/pollen
  const baseHeal = isCharged ? 25.0 : 5.0;
  const pollenMult = isCharged ? 5.0 : 1.0;
  const healBonus = getUpgradeEffect('mallow_heal', gameState.upgrades.mallow_heal || 0);
  const comboMult = getComboMultiplier();
  const healAmount = baseHeal * (1 + healBonus) * comboMult;
  
  // Milestone notifications
  const totalPollen = gameState.currencies.pollen;
  if (totalPollen >= 100 && totalPollen < 150 && !gameState.milestones?.pollen100) {
    if (!gameState.milestones) gameState.milestones = {};
    gameState.milestones.pollen100 = true;
    if (session.notifications) {
      session.notifications.add({
        id: 'milestone_pollen_100',
        sticky: true,
        title: '🌟 100 POLLEN! 🌟',
        text: 'You\'re a natural! Open a lootbox in Cosmetics to unlock new looks!',
        color: '#ffd700'
      });
    }
  }

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

/**
 * Applies logic for a hit on the marsh floor.
 */
export function handleFloorImpact(floorPoint, isCharged, usedAmmo, particleSystem) {
  registerHit('marsh');
  const marshReward = awardMarshMultiplier(getComboMultiplier());
  
  if (!gameState.tutorial.hasShot) {
    gameState.tutorial.hasShot = true;
    gameState.tutorial.currentStep = 1;
    
    if (session.notifications) {
      session.notifications.add({
        id: 'first_shot',
        sticky: false,
        title: '💥 FIRST SHOT! 💥',
        text: `+${marshReward} marsh! Keep tapping to build a COMBO!`,
        color: '#8afdff'
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
  
  if (usedAmmo === 'treat') {
    spawnNextMarshmallowAt(floorPoint);
    
    if (session.notifications) {
      session.notifications.add({
        id: 'treat_deployed',
        sticky: false,
        title: '🍬 TREAT DEPLOYED! 🍬',
        text: 'Your marshmallow friend is emerging! Show it some love!',
        color: '#ff69b4'
      });
    }
  }

  if (session.floatingTextSystem) {
    session.floatingTextSystem.createDamageText(floorPoint, marshReward, false);
  }
  
  createRippleFX(floorPoint, isCharged);
  particleSystem.createFloorSplash(floorPoint);
}