import { gameState } from '../game/state.js';
import { COSMETIC_CATEGORIES, COSMETIC_RARITIES, getCosmeticsByCategory } from '../game/cosmetics/cosmetics-types.js';
import { openLootbox, equipCosmetic, LOOTBOX_COST, canAffordLootbox } from '../game/cosmetics/lootbox-logic.js';
import { getCurrencySVG } from './currency-symbols.js';

export function createCosmeticsScreen() {
  const screen = document.createElement('div');
  screen.id = 'cosmeticsScreen';
  screen.className = 'cosmetics-overlay';
  document.body.appendChild(screen);
  
  function renderCategory(category, categoryName) {
    const cosmetics = getCosmeticsByCategory(category);
    
    const itemsHTML = cosmetics.map(cosmetic => {
      const isUnlocked = gameState.cosmetics.unlocked.includes(cosmetic.id);
      const isEquipped = gameState.cosmetics.equipped[category] === cosmetic.id;
      const rarity = COSMETIC_RARITIES[cosmetic.rarity.toUpperCase()];
      
      return `
        <div class="cosmetic-item wonky ${!isUnlocked ? 'locked' : ''} ${isEquipped ? 'equipped' : ''}" 
             data-fill="${isUnlocked ? '#ffffff' : '#cccccc'}" 
             data-stroke="${rarity.color}" 
             data-stroke-width="3"
             data-id="${cosmetic.id}">
          <div class="cosmetic-preview" style="background: ${cosmetic.color || '#ffffff'};">
            ${isEquipped ? '<div class="equipped-badge">EQUIPPED</div>' : ''}
            ${!isUnlocked ? '<div class="locked-icon">🔒</div>' : ''}
          </div>
          <div class="cosmetic-name" style="font-size: 8px; color: #000000; margin-top: 4px;">
            ${cosmetic.name}
          </div>
          <div class="cosmetic-rarity" style="font-size: 7px; color: ${rarity.color};">
            ${cosmetic.rarity.toUpperCase()}
          </div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="cosmetic-category">
        <h3 class="category-title">${categoryName}</h3>
        <div class="cosmetic-grid">
          ${itemsHTML}
        </div>
      </div>
    `;
  }
  
  function show() {
    const canAfford = canAffordLootbox();
    const unlockedCount = gameState.cosmetics.unlocked.length;
    const totalCount = Object.values(require('../game/cosmetics/cosmetics-types.js').COSMETIC_ITEMS).length;
    
    screen.innerHTML = `
      <div class="cosmetics-content wonky" data-fill="rgba(255,255,255,0.95)" data-stroke="#000000" data-stroke-width="8">
        <h2 class="cosmetics-title">Cosmetics</h2>
        <p class="cosmetics-subtitle">
          Unlocked: ${unlockedCount}/${totalCount} | 
          ${getCurrencySVG('pollen', 14)} ${gameState.currencies.pollen} Pollen
        </p>
        
        <div class="lootbox-section wonky" data-fill="#ffd700" data-stroke="#000000" data-stroke-width="4">
          <div class="lootbox-info">
            <h3 style="font-size: 12px; margin: 0;">Cosmetic Lootbox</h3>
            <p style="font-size: 8px; margin: 4px 0;">Random cosmetic item!</p>
          </div>
          <button id="openLootbox" class="lootbox-btn wonky ${canAfford ? '' : 'disabled'}" 
                  data-fill="#32cd32" data-stroke="#000000" data-stroke-width="3">
            ${getCurrencySVG('pollen', 16)} ${LOOTBOX_COST}
          </button>
        </div>
        
        <div id="lootboxResult" class="lootbox-result" style="display: none;"></div>
        
        <div class="cosmetics-container">
          ${renderCategory(COSMETIC_CATEGORIES.SKIN, 'Skin Colors')}
        </div>
        
        <button class="continue-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="4" id="cosmeticsClose">Close</button>
      </div>
    `;
    
    screen.classList.add('active');
    
    // Immediately update wonky UI to prevent loading delay
    if (window.updateWonkyUI) window.updateWonkyUI();
    
    document.getElementById('openLootbox')?.addEventListener('click', () => {
      if (!canAfford) return;
      
      const result = openLootbox();
      const resultDiv = document.getElementById('lootboxResult');
      
      if (result.refund) {
        resultDiv.innerHTML = `
          <div class="wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3" style="padding: 16px;">
            <p style="font-size: 10px; color: #000000;">All cosmetics unlocked! Refunded ${LOOTBOX_COST} pollen.</p>
          </div>
        `;
      } else if (result.item) {
        const rarity = COSMETIC_RARITIES[result.item.rarity.toUpperCase()];
        resultDiv.innerHTML = `
          <div class="wonky" data-fill="${rarity.color}" data-stroke="#000000" data-stroke-width="4" style="padding: 16px; animation: slideInRight 0.3s;">
            <h3 style="font-size: 14px; color: #000000; margin: 0;">NEW COSMETIC!</h3>
            <p style="font-size: 10px; color: #000000; margin: 8px 0 0;">${result.item.name}</p>
            <p style="font-size: 8px; color: #000000;">${result.item.rarity.toUpperCase()}</p>
          </div>
        `;
      }
      
      resultDiv.style.display = 'block';
      if (window.updateWonkyUI) window.updateWonkyUI();
      
      setTimeout(() => {
        show(); // Refresh display
      }, 2000);
    });
    
    screen.querySelectorAll('.cosmetic-item:not(.locked)').forEach(item => {
      item.addEventListener('click', () => {
        const cosmeticId = item.dataset.id;
        equipCosmetic(cosmeticId);
        show(); // Refresh to show equipped state
      });
    });
    
    document.getElementById('cosmeticsClose')?.addEventListener('click', () => hide());
  }
  
  function hide() {
    screen.classList.remove('active');
  }
  
  return { show, hide };
}