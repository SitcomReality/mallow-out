import { UPGRADES_PER_SCREEN } from '../game/wave-constants.js';
import { gameState } from '../game/state.js';
import { ALL_UPGRADES } from '../game/upgrades/upgrade-types.js';
import { getUpgradeCost, getUpgradeEffect, isMaxLevel } from '../game/upgrades/upgrade-calculator.js';

export function createUpgradeScreen() {
  const screen = document.getElementById('upgradeScreen');
  let currentOptions = [];
  
  function show() {
    if (currentOptions.length === 0) {
      const availableUpgrades = ALL_UPGRADES.filter(upgrade => 
        !isMaxLevel(upgrade.id, gameState.upgrades[upgrade.id] || 0)
      );
      
      const shuffled = [...availableUpgrades].sort(() => Math.random() - 0.5);
      currentOptions = shuffled.slice(0, Math.min(UPGRADES_PER_SCREEN, shuffled.length));
    }
    
    const optionsHTML = currentOptions.map(upgrade => {
      const currentLevel = gameState.upgrades[upgrade.id] || 0;
      const cost = getUpgradeCost(upgrade.id, currentLevel);
      const maxed = isMaxLevel(upgrade.id, currentLevel);
      const canAfford = !maxed && gameState.currencies.caramel >= cost;
      
      return `
        <div class="upgrade-card wonky ${canAfford ? '' : 'disabled'} ${maxed ? 'maxed' : ''}" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4" data-id="${upgrade.id}" data-cost="${cost}">
          <div class="upgrade-card-icon" style="font-size: 32px;">${upgrade.icon}</div>
          <h3 class="upgrade-card-name" style="font-size: 10px; color: #000000; margin: 8px 0;">${upgrade.name}</h3>
          <div class="upgrade-level wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">${maxed ? 'MAX LEVEL' : 'Level ' + currentLevel}</div>
          <p class="upgrade-card-desc" style="font-size: 8px; color: #000000; margin: 8px 0;">${upgrade.description}</p>
          <div class="upgrade-effect">${upgrade.shortDesc}</div>
          ${!maxed ? `
            <div class="upgrade-cost">
              <span class="currency-icon">🍯</span>
              <span>${cost}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    screen.innerHTML = `
      <div class="upgrade-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="8">
        <h2 class="upgrade-title">Permanent Upgrades</h2>
        <p class="upgrade-subtitle">
          <span class="currency-icon">🍯</span> 
          ${gameState.currencies.caramel} Caramel Available
        </p>
        <div class="upgrade-options">
          ${optionsHTML}
        </div>
        <button class="continue-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="4" id="upgradeClose">Close</button>
      </div>
    `;
    
    screen.classList.add('active');
    
    // Add click handlers
    const cards = screen.querySelectorAll('.upgrade-card');
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const upgradeId = card.dataset.id;
        const currentLevel = gameState.upgrades[upgradeId] || 0;
        const cost = getUpgradeCost(upgradeId, currentLevel);
        
        if (card.classList.contains('disabled') || card.classList.contains('maxed') || card.classList.contains('purchased')) return;
        if (gameState.currencies.caramel < cost) return;
        
        // Purchase upgrade
        gameState.currencies.caramel -= cost;
        gameState.upgrades[upgradeId] = currentLevel + 1;
        
        // Re-render the same options
        show();
      });
    });
    
    document.getElementById('upgradeClose').addEventListener('click', () => {
      hide();
    });
  }
  
  function hide() {
    screen.classList.remove('active');
  }
  
  return { show, hide };
}