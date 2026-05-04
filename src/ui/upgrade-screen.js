import { gameState } from '../game/state.js';
import { UPGRADE_CATEGORIES, getUpgradesByCategory } from '../game/upgrades/upgrade-types.js';
import { getUpgradeCost, isMaxLevel, canPurchaseUpgrade } from '../game/upgrades/upgrade-calculator.js';
import { saveGame } from '../game/persistence.js';

const CATEGORY_NAMES = {
  [UPGRADE_CATEGORIES.PLAYER]: 'Player',
  [UPGRADE_CATEGORIES.MARSHMALLOW]: 'Marshmallow',
  [UPGRADE_CATEGORIES.ECONOMY]: 'Economy',
  [UPGRADE_CATEGORIES.AUTOMATION]: 'Automation',
};

export function createUpgradeScreen() {
  const screen = document.getElementById('upgradeScreen');
  
  function renderCategory(category) {
    const upgrades = getUpgradesByCategory(category);
    const upgradeHTML = upgrades.map(upgrade => {
      const currentLevel = gameState.upgrades[upgrade.id] || 0;
      const cost = getUpgradeCost(upgrade.id, currentLevel);
      const maxed = isMaxLevel(upgrade.id, currentLevel);
      const canAfford = canPurchaseUpgrade(upgrade.id, currentLevel, gameState.currencies.caramel);
      const locked = upgrade.prerequisite && !(gameState.upgrades[upgrade.prerequisite] > 0);
      
      return `
        <div class="upgrade-card wonky ${canAfford && !locked ? '' : 'disabled'} ${maxed ? 'maxed' : ''} ${locked ? 'locked' : ''}" 
             data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4" 
             data-id="${upgrade.id}" data-cost="${cost}">
          <div class="upgrade-card-icon" style="font-size: 32px;">${upgrade.icon}</div>
          <h3 class="upgrade-card-name" style="font-size: 10px; color: #000000; margin: 8px 0;">${upgrade.name}</h3>
          <div class="upgrade-level wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
            ${maxed ? 'MAX' : locked ? '🔒 LOCKED' : 'Lv ' + currentLevel}
          </div>
          <p class="upgrade-card-desc" style="font-size: 8px; color: #000000; margin: 8px 0;">${upgrade.description}</p>
          <div class="upgrade-effect">${upgrade.shortDesc}</div>
          ${!maxed && !locked ? `
            <div class="upgrade-cost">
              <span class="currency-icon">🍯</span>
              <span>${cost}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    return `
      <div class="upgrade-category">
        <h3 class="category-title">${CATEGORY_NAMES[category]}</h3>
        <div class="category-upgrades">
          ${upgradeHTML}
        </div>
      </div>
    `;
  }
  
  function show() {
    const categoriesHTML = Object.values(UPGRADE_CATEGORIES)
      .map(cat => renderCategory(cat))
      .join('');
    
    screen.innerHTML = `
      <div class="upgrade-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="8">
        <h2 class="upgrade-title">Permanent Upgrades</h2>
        <p class="upgrade-subtitle">
          <span class="currency-icon">🍯</span> 
          ${gameState.currencies.caramel} Caramel Available
        </p>
        <div class="upgrade-categories-container">
          ${categoriesHTML}
        </div>
        <button class="continue-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="4" id="upgradeClose">Close</button>
      </div>
    `;
    
    screen.classList.add('active');
    
    const cards = screen.querySelectorAll('.upgrade-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('locked') || card.classList.contains('maxed')) return;
        
        const upgradeId = card.dataset.id;
        const currentLevel = gameState.upgrades[upgradeId] || 0;
        const cost = getUpgradeCost(upgradeId, currentLevel);
        
        if (card.classList.contains('disabled')) return;
        if (gameState.currencies.caramel < cost) return;
        
        gameState.currencies.caramel -= cost;
        gameState.upgrades[upgradeId] = currentLevel + 1;
        
        // Tutorial progress
        if (!gameState.tutorial.hasUpgraded) {
          gameState.tutorial.hasUpgraded = true;
          gameState.tutorial.currentStep = 4;
        }
        
        saveGame();
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