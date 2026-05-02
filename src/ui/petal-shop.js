import { gameState } from '../game/state.js';

export function createPetalShop() {
  const container = document.createElement('div');
  container.id = 'petalShop';
  container.className = 'wave-summary-overlay';
  document.body.appendChild(container);
  
  function show() {
    container.innerHTML = `
      <div class="upgrade-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="8">
        <h2 class="upgrade-title">Petal Shop</h2>
        <p class="upgrade-subtitle" style="margin-bottom: 40px;">
          The shop is currently empty. Check back later!
        </p>
        <button class="continue-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="4" id="petalShopContinue">Back</button>
      </div>
    `;
    
    container.style.display = 'flex';
    
    document.getElementById('petalShopContinue').addEventListener('click', () => {
      hide();
    });
  }
  
  function hide() {
    container.style.display = 'none';
  }
  
  return { show, hide };
}