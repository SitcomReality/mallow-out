import { gameState } from '../game/state.js';
import { buyMarshmallowTreat } from '../game/manager.js';
import { saveGame } from '../game/persistence.js';
import { getCurrencySVG } from './currency-symbols.js';
import { getTreatCost } from '../game/manager.js';

export function createShop() {
  const overlay = document.createElement('div');
  overlay.id = 'shopOverlay';
  overlay.className = 'shop-overlay';
  document.body.appendChild(overlay);
  
  function show() {
    const cost = getTreatCost();
    const canAffordTreat = gameState.currencies.marsh >= cost;
    
    overlay.innerHTML = `
      <div class="shop-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="8">
        <h2 class="shop-title">Shop</h2>
        <p class="shop-subtitle">
          ${getCurrencySVG('marsh', 14)} 
          ${gameState.currencies.marsh} Marsh Available
        </p>
        
        <div class="shop-items">
          <div class="shop-item wonky ${canAffordTreat ? '' : 'disabled'}" 
               data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4"
               data-action="buy-treat">
            <div class="shop-item-icon">${getCurrencySVG('treat', 48)}</div>
            <div class="shop-item-info">
              <h3 class="shop-item-name">Marshmallow Treat</h3>
              <p class="shop-item-desc">Summon your marshmallow friend</p>
              <div class="shop-item-stock">Stock: ${gameState.currencies.treats || 0}</div>
            </div>
            <div class="shop-item-cost">
              ${getCurrencySVG('marsh', 18)}
              <span>${cost}</span>
            </div>
          </div>
        </div>
        
        <button class="continue-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="4" id="shopClose">Close</button>
      </div>
    `;
    
    overlay.classList.add('active');
    
    const treatItem = overlay.querySelector('[data-action="buy-treat"]');
    if (treatItem) {
      treatItem.addEventListener('click', () => {
        if (!treatItem.classList.contains('disabled')) {
          buyMarshmallowTreat();
          show(); // Refresh display
        }
      });
    }
    
    const closeBtn = overlay.querySelector('#shopClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => hide());
    }
  }
  
  function hide() {
    overlay.classList.remove('active');
  }
  
  return { show, hide };
}