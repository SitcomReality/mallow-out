import { UPGRADES_PER_SCREEN } from '../game/wave-constants.js';
import { gameState } from '../game/state.js';
import { ALL_UPGRADES } from '../game/upgrades/upgrade-types.js';
import { getUpgradeCost, getUpgradeEffect, isMaxLevel } from '../game/upgrades/upgrade-calculator.js';

export function createUpgradeScreen(onContinue) {
  const screen = document.getElementById('upgradeScreen');
  let currentOptions = []; // Persist options across purchases in a single wave
  let purchasedThisWave = new Set();
  
  function show(wave) {
    // If we're entering the shop for the first time this wave, pick 3 random upgrades
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
      const alreadyPurchased = purchasedThisWave.has(upgrade.id);
      const canAfford = !maxed && !alreadyPurchased && gameState.currencies.caramel >= cost;
      
      return `
        <div class="upgrade-card wonky ${canAfford ? '' : 'disabled'} ${maxed ? 'maxed' : ''} ${alreadyPurchased ? 'purchased' : ''}" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4" data-id="${upgrade.id}" data-cost="${cost}">
          <div class="upgrade-card-icon" style="font-size: 32px;">${upgrade.icon}</div>
          <h3 class="upgrade-card-name" style="font-size: 10px; color: #000000; margin: 8px 0;">${upgrade.name}</h3>
          <div class="upgrade-level wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">${maxed ? 'MAX LEVEL' : alreadyPurchased ? 'PURCHASED' : 'Level ' + currentLevel}</div>
          <p class="upgrade-card-desc" style="font-size: 8px; color: #000000; margin: 8px 0;">${upgrade.description}</p>
          <div class="upgrade-effect">${upgrade.shortDesc}</div>
          ${(!maxed && !alreadyPurchased) ? `
            <div class="upgrade-cost">
              <span class="currency-icon">🍯</span>
              <span>${cost}</span>
            </div>
          ` : ''}
          ${alreadyPurchased ? '<div class="upgrade-purchased-badge">✓ Bought</div>' : ''}
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
        <button class="continue-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="4" id="upgradeSkip">Continue to Wave ${wave + 1}</button>
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
        purchasedThisWave.add(upgradeId);
        
        // Re-render the same options
        show(wave);
      });
    });
    
    document.getElementById('upgradeSkip').addEventListener('click', () => {
      // Clear options for next wave's shop visit
      currentOptions = [];
      purchasedThisWave.clear();
      hide();
      onContinue(null);
    });
  }
  
  function hide() {
    screen.classList.remove('active');
  }
  
  return { show, hide };
}