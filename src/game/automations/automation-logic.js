import * as THREE from 'three';
import { gameState } from '../state.js';
import { getAutomationConfig, AUTOMATION_TYPES } from './automation-types.js';
import { getUpgradeEffect } from '../upgrades/upgrade-calculator.js';
import { createRippleFX } from '../fx.js';
import { session, getTreatCost, buyMarshmallowTreat } from '../manager.js';
import { applySpatter, applyRoundChunk, applyHolepunch } from '../damage/actions.js';
import { healMarshmallow } from '../marshmallow.js';
import { awardPollen } from '../economy.js';

export function updateAutomations(delta) {
  // Auto Shooter
  if (gameState.upgrades.auto_shooter_unlock > 0) {
    gameState.automationTimers.auto_shooter = (gameState.automationTimers.auto_shooter || 0) + delta;
    
    const config = getAutomationConfig(AUTOMATION_TYPES.AUTO_SHOOTER);
    const rateBonus = getUpgradeEffect('auto_shooter_rate', gameState.upgrades.auto_shooter_rate || 0);
    const interval = config.baseInterval / (1 + rateBonus);
    
    if (gameState.automationTimers.auto_shooter >= interval) {
      gameState.automationTimers.auto_shooter = 0;
      fireAutoShooter();
    }
  }
  
  // Comet Strike
  if (gameState.upgrades.comet_unlock > 0 && gameState.currentMarshmallow) {
    gameState.automationTimers.comet = (gameState.automationTimers.comet || 0) + delta;
    
    const config = getAutomationConfig(AUTOMATION_TYPES.COMET);
    const rateBonus = getUpgradeEffect('comet_rate', gameState.upgrades.comet_rate || 0);
    const interval = config.baseInterval / (1 + rateBonus);
    
    if (gameState.automationTimers.comet >= interval) {
      gameState.automationTimers.comet = 0;
      fireComet();
    }
  }
  
  // Laser Beam
  if (gameState.upgrades.laser_unlock > 0 && gameState.currentMarshmallow) {
    gameState.automationTimers.laser = (gameState.automationTimers.laser || 0) + delta;
    
    const config = getAutomationConfig(AUTOMATION_TYPES.LASER);
    const rateBonus = getUpgradeEffect('laser_rate', gameState.upgrades.laser_rate || 0);
    const interval = config.baseInterval / (1 + rateBonus);
    
    if (gameState.automationTimers.laser >= interval) {
      gameState.automationTimers.laser = 0;
      fireLaser();
    }
  }
  
  // Treat Dispenser
  if (gameState.upgrades.treat_dispenser_unlock > 0) {
    gameState.automationTimers.treat_dispenser = (gameState.automationTimers.treat_dispenser || 0) + delta;
    
    const config = getAutomationConfig(AUTOMATION_TYPES.TREAT_DISPENSER);
    
    if (gameState.automationTimers.treat_dispenser >= config.checkInterval) {
      gameState.automationTimers.treat_dispenser = 0;
      
      if (!gameState.treatDispenserPaused) {
        checkAndBuyTreat();
      }
    }
  }
}

function fireAutoShooter() {
  // Use camera orientation to find a point on the "back wall" of the sphere relative to the player
  const player = gameState.player;
  const forward = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();

  // Constrain random spread to keep shots within the camera's view
  const spread = 0.8;
  const targetDir = forward.clone().add(new THREE.Vector3(
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread
  )).normalize();

  // World sphere radius is 10.0
  const hitPoint = targetDir.clone().multiplyScalar(10.0);
  
  // Calculate reward
  const baseMarsh = 1 + getUpgradeEffect('marsh_reward', gameState.upgrades.marsh_reward || 0);
  const config = getAutomationConfig(AUTOMATION_TYPES.AUTO_SHOOTER);
  const valueBonus = getUpgradeEffect('auto_shooter_value', gameState.upgrades.auto_shooter_value || 0);
  const reward = Math.max(1, Math.floor(baseMarsh * config.baseValue * (1 + valueBonus)));
  
  gameState.currencies.marsh += reward;
  
  createRippleFX(hitPoint);
  if (session.particleSystem) {
    session.particleSystem.createFloorSplash(hitPoint);
  }
  
  if (session.floatingTextSystem) {
    session.floatingTextSystem.createDamageText(hitPoint, reward, false);
  }
}

function fireComet() {
  const marshmallow = gameState.currentMarshmallow;
  if (!marshmallow) return;
  
  const config = getAutomationConfig(AUTOMATION_TYPES.COMET);
  const powerBonus = getUpgradeEffect('comet_power', gameState.upgrades.comet_power || 0);
  const healAmount = config.baseHeal * (1 + powerBonus);
  
  // Pick random point on marshmallow
  const mallowPos = new THREE.Vector3(
    marshmallow.marshmallow.position.x,
    marshmallow.marshmallow.position.y,
    marshmallow.marshmallow.position.z
  );
  
  // Random offset on surface
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  const radius = marshmallow.marshmallow.scale.x;
  const offset = new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta) * radius,
    Math.cos(phi) * marshmallow.marshmallow.scale.y,
    Math.sin(phi) * Math.sin(theta) * radius
  );
  
  const hitPoint = mallowPos.clone().add(offset);
  
  // Apply round chunk damage (comet impact)
  const chunk = applyRoundChunk(marshmallow, hitPoint);
  chunk.scale = { x: 0.4, y: 0.4, z: 0.4 };
  if (chunk.repairData) {
    chunk.repairData.initialScale = 0.4;
  }
  
  // Particles
  if (session.particleSystem) {
    const normal = offset.clone().normalize();
    session.particleSystem.createMallowSplatter(hitPoint, normal);
  }
  
  // Heal and award pollen
  healMarshmallow(marshmallow, healAmount);
  const pollenEarned = awardPollen(healAmount);
  
  if (session.floatingTextSystem) {
    session.floatingTextSystem.createDamageText(hitPoint, pollenEarned, false);
  }
  
  if (session.marshmallowHUD) {
    session.marshmallowHUD.update(marshmallow);
  }
}

function fireLaser() {
  const marshmallow = gameState.currentMarshmallow;
  if (!marshmallow) return;
  
  const config = getAutomationConfig(AUTOMATION_TYPES.LASER);
  const powerBonus = getUpgradeEffect('laser_power', gameState.upgrades.laser_power || 0);
  const healAmount = config.baseHeal * (1 + powerBonus);
  
  // Pick random point on marshmallow for laser entry
  const mallowPos = new THREE.Vector3(
    marshmallow.marshmallow.position.x,
    marshmallow.marshmallow.position.y,
    marshmallow.marshmallow.position.z
  );
  
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  const radius = marshmallow.marshmallow.scale.x;
  const offset = new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta) * radius,
    Math.cos(phi) * marshmallow.marshmallow.scale.y,
    Math.sin(phi) * Math.sin(theta) * radius
  );
  
  const hitPoint = mallowPos.clone().add(offset);
  // Laser direction points through the marshmallow from the hit point
  const direction = offset.clone().normalize().negate();
  
  const hole = applyHolepunch(marshmallow, hitPoint, direction);
  if (hole && hole.repairData) {
    hole.repairData.type = 'laser';
    hole.repairData.initialScale = hole.scale.y; // For the laser repair logic
  }
  
  // Particles
  if (session.particleSystem) {
    const normal = direction.clone().multiplyScalar(-1);
    session.particleSystem.createMallowSplatter(hitPoint, normal);
  }
  
  // Heal and award pollen
  healMarshmallow(marshmallow, healAmount);
  const pollenEarned = awardPollen(healAmount);
  
  if (session.floatingTextSystem) {
    session.floatingTextSystem.createDamageText(hitPoint, pollenEarned, false);
  }
  
  if (session.marshmallowHUD) {
    session.marshmallowHUD.update(marshmallow);
  }
}

function checkAndBuyTreat() {
  const discount = getUpgradeEffect('treat_dispenser_discount', gameState.upgrades.treat_dispenser_discount || 0);
  const baseCost = getTreatCost();
  const cost = Math.floor(baseCost * (1 - discount));
  
  if (gameState.currencies.marsh >= cost && !gameState.currentMarshmallow) {
    // Manually deduct and award treat
    gameState.currencies.marsh -= cost;
    gameState.currencies.treats = (gameState.currencies.treats || 0) + 1;
    
    if (session.notifications) {
      session.notifications.add({
        id: 'auto_treat',
        sticky: false,
        title: 'Auto-Buy',
        text: `Treat Dispenser purchased a treat!`,
        color: '#ffd700'
      });
    }
  }
}