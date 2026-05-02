import { gameState } from '../game/state.js';
import { togglePause } from '../game/manager.js';

export function createHUD() {
  const hud = document.getElementById('hud');
  
  hud.innerHTML = `
    <div class="hud-top">
      <div class="currency-display">
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">
          <span class="currency-icon">🌼</span>
          <span class="currency-value" id="pollenDisplay">0</span>
        </div>
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">
          <span class="currency-icon">🍯</span>
          <span class="currency-value" id="caramelDisplay">0</span>
        </div>
      </div>
      <div class="nav-buttons">
         <button id="navShop" class="nav-btn wonky" data-fill="#00ff7f" data-stroke="#000000" data-stroke-width="3">Shop</button>
         <button id="navUpgrades" class="nav-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="3">Upgrades</button>
         <button id="navSettings" class="nav-btn wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">Settings</button>
      </div>
    </div>
  `;
  
  // Wire up the settings button to open the pause/change menu (same action as pressing Esc)
  const settingsBtn = hud.querySelector('#navSettings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      togglePause();
    });
  }

  return {
    show() {
      hud.style.display = 'block';
    },
    hide() {
      hud.style.display = 'none';
    },

    update() {
      document.getElementById('pollenDisplay').textContent = Math.floor(gameState.currencies.pollen);
      document.getElementById('caramelDisplay').textContent = Math.floor(gameState.currencies.caramel);
    }
  };
}