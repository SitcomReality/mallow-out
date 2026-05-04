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
  // Random position on the marsh floor
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 4.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  const hitPoint = { x, y: 0, z };
  
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