import { gameState } from '../game/state.js';
import { ALL_PETALS } from '../game/petals/petal-types.js';
import { PETAL_SHOP_OFFERS, PETAL_SLOTS } from '../game/petals/petal-constants.js';

export function createPetalShop(onContinue) {
  const container = document.createElement('div');
  container.id = 'petalShop';
  container.className = 'wave-summary-overlay';
  document.body.appendChild(container);
  
  function show() {
    // Select random petals to offer
    const shuffled = [...ALL_PETALS].sort(() => Math.random() - 0.5);
    const offers = shuffled.slice(0, PETAL_SHOP_OFFERS);
    
    const offersHTML = offers.map(petal => {
      const canAfford = gameState.currencies.pollen >= petal.cost;
      return `
        <div class="upgrade-card petal-offer wonky ${canAfford ? '' : 'disabled'}" data-fill="#f8f9fa" data-stroke="#e9ecef" data-stroke-width="4" data-petal="${petal.id}">
          <div class="upgrade-card-icon">${petal.icon}</div>
          <h3 class="upgrade-card-name">${petal.name}</h3>
          <p class="upgrade-card-desc">${petal.description}</p>
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
        return `<div class="petal-slot filled wonky" data-fill="var(--mallow-white)" data-stroke="var(--mallow-white)" data-stroke-width="2" title="${petal?.name || ''}">${petal?.icon || '?'}</div>`;
      } else {
        return `<div class="petal-slot empty wonky" data-fill="rgba(255, 255, 255, 0.5)" data-stroke="var(--mallow-white)" data-stroke-width="2" title="Empty - will grant Caramel Vapor">💨</div>`;
      }
    }).join('');
    
    container.innerHTML = `
      <div class="upgrade-content wonky" data-fill="var(--mallow-white)" data-stroke="var(--marsh-mint)" data-stroke-width="8">
        <h2 class="upgrade-title">Petal Shop</h2>
        <p class="upgrade-subtitle">
          <span class="currency-icon">🌼</span> 
          ${gameState.currencies.pollen} Pollen Available
        </p>
        
        <div class="petal-inventory wonky" data-fill="rgba(183, 228, 199, 0.3)" data-stroke="transparent" data-stroke-width="0">
          <h3>Your Petals</h3>
          <div class="petal-slots">
            ${currentPetalsHTML}
          </div>
          <p class="petal-hint">Each popped bubble triggers a random slot. Empty slots grant Caramel Vapor!</p>
        </div>
        
        <div class="upgrade-options">
          ${offersHTML}
        </div>
        
        <button class="continue-btn wonky" data-fill="var(--mallow-pink)" data-stroke="var(--mallow-pink-deep)" data-stroke-width="4" id="petalShopContinue">Continue</button>
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
      onContinue();
    });
  }
  
  function hide() {
    container.style.display = 'none';
  }
  
  return { show, hide };
}