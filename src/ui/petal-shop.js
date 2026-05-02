import { gameState } from '../game/state.js';
import { ALL_PETALS } from '../game/petals/petal-types.js';
import { PETAL_SHOP_OFFERS, PETAL_SLOTS } from '../game/petals/petal-constants.js';

export function createPetalShop() {
  const container = document.createElementNS ? document.createElement('div') : null;
  container.id = 'petalShop';
  container.className = 'wave-summary-overlay';
  document.body.appendChild(container);
  
  let offers = [];
  
  function show() {
    if (offers.length === 0) {
      const shuffled = [...ALL_PETALS].sort(() => Math.random() - 0.5);
      offers = shuffled.slice(0, PETAL_SHOP_OFFERS);
    }
    
    const offersHTML = offers.map(petal => {
      const canAfford = gameState.currencies.pollen >= petal.cost;
      return `
        <div class="upgrade-card petal-offer wonky ${canAfford ? '' : 'disabled'}" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4" data-petal="${petal.id}">
          <div class="upgrade-card-icon" style="font-size: 32px;">${petal.icon}</div>
          <h3 class="upgrade-card-name" style="font-size: 10px; color: #000000; margin: 8px 0;">${petal.name}</h3>
          <p class="upgrade-card-desc" style="font-size: 8px; color: #000000; margin: 8px 0;">${petal.description}</p>
          <div class="petal-cost">
            <span class="currency-icon">🌼</span>
            <span>${petal.cost}</span>
          </div>
        </div>
      `;
    }).join('');
    
    const currentPetalsHTML = gameState.equippedPetals.map((petalId, idx) => {
      if (petalId) {
        const petal = ALL_PETALS.find(p => p.id === petalId);
        return `<div class="petal-slot filled wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" title="${petal?.name || ''}">${petal?.icon || '?'}</div>`;
      } else {
        return `<div class="petal-slot empty wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" title="Empty - will grant Caramel Vapor">💨</div>`;
      }
    }).join('');
    
    container.innerHTML = `
      <div class="upgrade-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="8">
        <h2 class="upgrade-title">Petal Shop</h2>
        <p class="upgrade-subtitle">
          <span class="currency-icon">🌼</span> 
          ${gameState.currencies.pollen} Pollen Available
        </p>
        
        <div class="petal-inventory wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <h3 style="font-size: 10px; color: #000000; margin: 0 0 8px;">Your Petals</h3>
          <div class="petal-slots">
            ${currentPetalsHTML}
          </div>
          <p class="petal-hint">Each popped bubble triggers a random slot. Empty slots grant Caramel Vapor!</p>
        </div>
        
        <div class="upgrade-options">
          ${offersHTML}
        </div>
        
        <button class="continue-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="4" id="petalShopContinue">Continue</button>
      </div>
    `;
    
    container.style.display = 'flex';
    
    // Add click handlers for purchasing
    container.querySelectorAll('.petal-offer').forEach(card => {
      card.addEventListener('click', () => {
        const petalId = card.dataset.petal;
        const petal = ALL_PETALS.find(p => p.id === petalId);
        
        if (!petal || gameState.currencies.pollen < petal.cost) return;
        if (card.classList.contains('disabled')) return;
        
        // Find first empty slot
        const emptySlot = gameState.equippedPetals.findIndex(p => p === null);
        if (emptySlot === -1) {
          alert('All petal slots are full! Petals will be consumed when triggered.');
          return;
        }
        
        // Purchase petal
        gameState.currencies.pollen -= petal.cost;
        gameState.equippedPetals[emptySlot] = petal.id;
        
        // Refresh display
        show();
      });
    });
    
    document.getElementById('petalShopContinue').addEventListener('click', () => {
      hide();
    });
  }
  
  function hide() {
    container.style.display = 'none';
  }
  
  return { show, hide };
}