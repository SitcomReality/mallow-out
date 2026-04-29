import { UPGRADES_PER_SCREEN } from '../game/wave-constants.js';
import { gameState } from '../game/state.js';
import { ALL_UPGRADES } from '../game/upgrades/upgrade-types.js';
import { getUpgradeCost, getUpgradeEffect, isMaxLevel } from '../game/upgrades/upgrade-calculator.js';

export function createUpgradeScreen(onContinue) {
  const screen = document.getElementById('upgradeScreen');
  
  function show(wave) {
    // Filter out maxed upgrades, select random options
    const availableUpgrades = ALL_UPGRADES.filter(upgrade => 
      !isMaxLevel(upgrade.id, gameState.upgrades[upgrade.id] || 0)
    );
    
    const shuffled = [...availableUpgrades].sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, Math.min(UPGRADES_PER_SCREEN, shuffled.length));
    
    let selectedUpgrade = null;
    
    const optionsHTML = options.map(upgrade => {
      const currentLevel = gameState.upgrades[upgrade.id] || 0;
      const cost = getUpgradeCost(upgrade.id, currentLevel);
      const canAfford = gameState.currencies.caramel >= cost;
      const effect = getUpgradeEffect(upgrade.id, currentLevel + 1);
      
      return `
        <div class="upgrade-card ${canAfford ? '' : 'disabled'}" data-id="${upgrade.id}" data-cost="${cost}">
          <div class="upgrade-card-icon">${upgrade.icon}</div>
          <h3 class="upgrade-card-name">${upgrade.name}</h3>
          <div class="upgrade-level">Level ${currentLevel}</div>
          <p class="upgrade-card-desc">${upgrade.description}</p>
          <div class="upgrade-effect">${upgrade.shortDesc}</div>
          <div class="upgrade-cost">
            <span class="currency-icon">🍯</span>
            <span>${cost}</span>
          </div>
        </div>
      `;
    }).join('');
    
    screen.innerHTML = `
      <div class="upgrade-content">
        <h2 class="upgrade-title">Permanent Upgrades</h2>
        <p class="upgrade-subtitle">
          <span class="currency-icon">🍯</span> 
          ${gameState.currencies.caramel} Caramel Available
        </p>
        <div class="upgrade-options">
          ${optionsHTML}
        </div>
        <button class="continue-btn" id="upgradeSkip">Skip & Continue to Wave ${wave + 1}</button>
      </div>
    `;
    
    screen.classList.add('active');
    
    // Add click handlers
    const cards = screen.querySelectorAll('.upgrade-card');
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const upgradeId = card.dataset.id;
        const cost = parseInt(card.dataset.cost);
        
        if (card.classList.contains('disabled')) return;
        if (gameState.currencies.caramel < cost) return;
        
        // Purchase upgrade
        gameState.currencies.caramel -= cost;
        if (!gameState.upgrades[upgradeId]) gameState.upgrades[upgradeId] = 0;
        gameState.upgrades[upgradeId]++;
        
        // Refresh display
        show(wave);
      });
    });
    
    document.getElementById('upgradeSkip').addEventListener('click', () => {
      hide();
      onContinue(null);
    });
  }
  
  function hide() {
    screen.classList.remove('active');
  }
  
  function hide() {
    screen.classList.remove('active');
  }
  
  return { show, hide };
}