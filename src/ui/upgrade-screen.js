import { gameState } from '../game/state.js';
import { UPGRADE_CATEGORIES, getUpgradesByCategory } from '../game/upgrades/upgrade-types.js';
import { getUpgradeCost, isMaxLevel, canPurchaseUpgrade } from '../game/upgrades/upgrade-calculator.js';
import { saveGame } from '../game/persistence.js';
import { getCurrencySVG } from './currency-symbols.js';

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
        <div class="upgrade-row wonky ${canAfford && !locked ? '' : 'disabled'} ${maxed ? 'maxed' : ''} ${locked ? 'locked' : ''}" 
             data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" 
             data-id="${upgrade.id}" data-cost="${cost}">
          <div class="upgrade-info">
            <div class="upgrade-header-line">
              <h3 class="upgrade-name">${upgrade.name}</h3>
              <div class="upgrade-status-label">
                ${maxed ? 'MAXED' : locked ? 'LOCKED' : 'Lv ' + currentLevel}
              </div>
            </div>
            <p class="upgrade-description">${upgrade.description}</p>
            <div class="upgrade-benefit">${upgrade.shortDesc}</div>
          </div>
          <div class="upgrade-action">
            ${!maxed && !locked ? `
              <div class="upgrade-cost-pill">
                ${getCurrencySVG('caramel', 12)}
                <span>${cost}</span>
              </div>
            ` : ''}
          </div>
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
    // Preserve scroll position
    const container = screen.querySelector('.upgrade-categories-container');
    const scrollPos = container ? container.scrollTop : 0;

    const categoriesHTML = Object.values(UPGRADE_CATEGORIES)
      .map(cat => renderCategory(cat))
      .join('');
    
    screen.innerHTML = `
      <div class="upgrade-content wonky" data-fill="rgba(255,255,255,0.95)" data-stroke="#000000" data-stroke-width="8">
        <h2 class="upgrade-title">Permanent Upgrades</h2>
        <p class="upgrade-subtitle">
          ${getCurrencySVG('caramel', 16)} 
          ${gameState.currencies.caramel} Caramel
        </p>
        <div class="upgrade-categories-container">
          ${categoriesHTML}
        </div>
        <button class="continue-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="4" id="upgradeClose">Close</button>
      </div>
    `;
    
    screen.classList.add('active');
    
    // Immediately update wonky UI to prevent loading delay
    if (window.updateWonkyUI) window.updateWonkyUI();
    
    // Restore scroll position
    const newContainer = screen.querySelector('.upgrade-categories-container');
    if (newContainer) newContainer.scrollTop = scrollPos;

    const rows = screen.querySelectorAll('.upgrade-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        if (row.classList.contains('locked') || row.classList.contains('maxed')) return;
        
        const upgradeId = row.dataset.id;
        const currentLevel = gameState.upgrades[upgradeId] || 0;
        const cost = getUpgradeCost(upgradeId, currentLevel);
        
        if (row.classList.contains('disabled')) return;
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