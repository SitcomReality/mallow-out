import * as THREE from 'three';
import { gameState } from '../state.js';
import { getAutomationConfig, AUTOMATION_TYPES } from './automation-types.js';
import { getUpgradeEffect } from '../upgrades/upgrade-calculator.js';
import { createRippleFX } from '../fx.js';
import { session, getTreatCost, buyMarshmallowTreat } from '../manager.js';
import { applySpatter, applyRoundChunk, applyHolepunch } from '../damage/actions.js';
import { healMarshmallow } from '../marshmallow.js';
import { awardPollen } from '../economy.js';

export const activeLasers = [];

export function clearLasers() {
  for (const laser of activeLasers) {
    if (session.tracerSystem) {
      session.tracerSystem.scene.remove(laser.lineGlow);
      session.tracerSystem.scene.remove(laser.lineCore);
      laser.lineGlow.geometry.dispose();
      laser.lineGlow.material.dispose();
      laser.lineCore.geometry.dispose();
      laser.lineCore.material.dispose();
    }
  }
  activeLasers.length = 0;
}

export function updateAutomations(delta) {
  for (let i = activeLasers.length - 1; i >= 0; i--) {
    const laser = activeLasers[i];
    laser.timer += delta;
    const t = Math.min(laser.timer / laser.duration, 1.0);
    
    const currentTarget = new THREE.Vector3().lerpVectors(laser.p1, laser.p2, t);
    
    const positions = new Float32Array([
      laser.origin.x, laser.origin.y, laser.origin.z,
      currentTarget.x, currentTarget.y, currentTarget.z
    ]);
    laser.lineGlow.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    laser.lineCore.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const currentTargetLocal = new THREE.Vector3().lerpVectors(laser.p1Local, laser.p2Local, t);
    const centerLocal = new THREE.Vector3().addVectors(laser.p1Local, currentTargetLocal).multiplyScalar(0.5);
    const width = laser.p1Local.distanceTo(currentTargetLocal);
    
    laser.hole.position = { x: centerLocal.x, y: centerLocal.y, z: centerLocal.z };
    laser.hole.scale.x = width / 2 + 0.001;
    
    if (session.particleSystem && Math.random() < 0.6) {
      const normal = laser.origin.clone().sub(currentTarget).normalize();
      session.particleSystem.createMallowSplatter(currentTarget, normal);
    }
    
    const targetHeal = laser.healAmount * t;
    const healDelta = targetHeal - laser.healedSoFar;
    laser.healedSoFar = targetHeal;
    
    if (laser.marshmallow) {
      healMarshmallow(laser.marshmallow, healDelta);
      if (session.marshmallowHUD) {
        session.marshmallowHUD.update(laser.marshmallow);
      }
    }
    
    if (t >= 1.0) {
      const pollenEarned = awardPollen(laser.healAmount);
      if (session.floatingTextSystem) {
        session.floatingTextSystem.createDamageText(laser.p2, pollenEarned, false);
      }
      
      if (laser.marshmallow && laser.marshmallow.holes) {
        const idx = laser.marshmallow.holes.indexOf(laser.hole);
        if (idx > -1) laser.marshmallow.holes.splice(idx, 1);
      }
      
      if (session.tracerSystem) {
        session.tracerSystem.scene.remove(laser.lineGlow);
        session.tracerSystem.scene.remove(laser.lineCore);
        laser.lineGlow.geometry.dispose();
        laser.lineGlow.material.dispose();
        laser.lineCore.geometry.dispose();
        laser.lineCore.material.dispose();
      }
      
      activeLasers.splice(i, 1);
    }
  }

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
  
  const mPos = new THREE.Vector3(
    marshmallow.marshmallow.position.x,
    marshmallow.marshmallow.position.y,
    marshmallow.marshmallow.position.z
  );
  
  const camPos = gameState.player.position;
  const camForward = new THREE.Vector3(
    Math.sin(gameState.player.yaw) * Math.cos(gameState.player.pitch),
    Math.sin(gameState.player.pitch),
    -Math.cos(gameState.player.yaw) * Math.cos(gameState.player.pitch)
  ).normalize();
  const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();
  const camUp = new THREE.Vector3().crossVectors(camRight, camForward).normalize();
  
  const R = marshmallow.marshmallow.scale.x + 0.6; 
  const randY = (Math.random() - 0.5) * marshmallow.marshmallow.scale.y;
  const randZ = (Math.random() - 0.5) * marshmallow.marshmallow.scale.x * 0.8;
  
  const p1 = mPos.clone().add(camRight.clone().multiplyScalar(-R)).add(camUp.clone().multiplyScalar(randY)).add(camForward.clone().multiplyScalar(randZ));
  const p2 = mPos.clone().add(camRight.clone().multiplyScalar(R)).add(camUp.clone().multiplyScalar(randY)).add(camForward.clone().multiplyScalar(randZ));
  
  const origin = p1.clone().add(camRight.clone().multiplyScalar(-20)).add(camUp.clone().multiplyScalar(2));
  
  let mQuatInv;
  if (marshmallow.marshmallow.rotation.w !== undefined) {
    mQuatInv = new THREE.Quaternion(marshmallow.marshmallow.rotation.x, marshmallow.marshmallow.rotation.y, marshmallow.marshmallow.rotation.z, marshmallow.marshmallow.rotation.w).invert();
  } else {
    mQuatInv = new THREE.Quaternion().setFromEuler(new THREE.Euler(marshmallow.marshmallow.rotation.x, marshmallow.marshmallow.rotation.y, marshmallow.marshmallow.rotation.z)).invert();
  }
  
  const p1Local = p1.clone().sub(mPos).applyQuaternion(mQuatInv);
  const p2Local = p2.clone().sub(mPos).applyQuaternion(mQuatInv);
  const originLocal = origin.clone().sub(mPos).applyQuaternion(mQuatInv);
  
  const boxX = new THREE.Vector3().subVectors(p2Local, p1Local).normalize();
  const centerLocal = new THREE.Vector3().addVectors(p1Local, p2Local).multiplyScalar(0.5);
  const rayDir = new THREE.Vector3().subVectors(centerLocal, originLocal).normalize();
  
  let boxY = new THREE.Vector3().crossVectors(boxX, rayDir);
  if (boxY.lengthSq() < 1e-6) {
    boxY = new THREE.Vector3(0, 1, 0);
  }
  boxY.normalize();
  
  const boxZ = new THREE.Vector3().crossVectors(boxX, boxY).normalize();
  
  const rotMatrix = new THREE.Matrix4().makeBasis(boxX, boxY, boxZ);
  const boxQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
  
  const hole = {
    id: 90000 + Math.floor(Math.random() * 10000),
    type: 'box',
    position: { x: p1Local.x, y: p1Local.y, z: p1Local.z },
    rotation: { x: boxQuat.x, y: boxQuat.y, z: boxQuat.z, w: boxQuat.w },
    scale: { x: 0.01, y: 0.02, z: 10.0 }, 
    color: '#ff0000',
    operation: 'subtract',
    blendRadius: 0.0,
    noiseAmount: 0.0,
    noiseScale: 1.0,
    parentId: marshmallow.id,
  };
  
  marshmallow.holes.push(hole);
  
  const geometry = new THREE.BufferGeometry().setFromPoints([origin, p1]);
  const materialGlow = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8, linewidth: 6 });
  const materialCore = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, linewidth: 2 });
  
  materialGlow.depthTest = false; materialGlow.depthWrite = false;
  materialCore.depthTest = false; materialCore.depthWrite = false;
  
  const lineGlow = new THREE.Line(geometry, materialGlow);
  const lineCore = new THREE.Line(geometry, materialCore);
  lineGlow.renderOrder = 9998;
  lineCore.renderOrder = 9999;
  
  if (session.tracerSystem) {
    session.tracerSystem.scene.add(lineGlow);
    session.tracerSystem.scene.add(lineCore);
  }
  
  activeLasers.push({
    timer: 0,
    duration: 0.8,
    p1, p2, origin,
    p1Local, p2Local,
    hole,
    marshmallow,
    lineGlow, lineCore,
    healAmount,
    healedSoFar: 0
  });
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