import * as THREE from 'three';
import { gameState } from '../state.js';
import { getAutomationConfig, AUTOMATION_TYPES } from './automation-types.js';
import { getUpgradeEffect } from '../upgrades/upgrade-calculator.js';
import { createRippleFX } from '../fx.js';
import { session } from '../manager.js';

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
  
  // Future automations will be added here similarly
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