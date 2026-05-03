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
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">
          <span class="currency-icon">💧</span>
          <span class="currency-value" id="marshDisplay">0</span>
        </div>
      </div>
      <div class="nav-buttons">
         <button id="navUpgrades" class="nav-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="3">Upgrades</button>
         <button id="navSettings" class="nav-btn wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">Settings</button>
      </div>
    </div>
    <div class="hud-bottom">
      <div id="cooldownIndicator" class="cooldown-indicator" style="display: none;">
        <div class="cooldown-bar wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">
          <div class="cooldown-fill" style="width: 0%; background: #ffd700;"></div>
        </div>
        <div class="cooldown-text" style="text-align: center; font-size: 8px; color: #000; margin-top: 4px;">Ready!</div>
      </div>
    </div>
  `;
  
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
      document.getElementById('marshDisplay').textContent = Math.floor(gameState.currencies.marsh);
      
      // Update cooldown indicator
      const ws = gameState.weaponStates;
      const cooldownEl = document.getElementById('cooldownIndicator');
      if (cooldownEl) {
        if (ws.skewerCooldown > 0) {
          cooldownEl.style.display = 'block';
          const percent = ((ws.maxCooldown - ws.skewerCooldown) / ws.maxCooldown) * 100;
          const fill = cooldownEl.querySelector('.cooldown-fill');
          const text = cooldownEl.querySelector('.cooldown-text');
          if (fill) fill.style.width = `${percent}%`;
          if (text) text.textContent = `Cooldown: ${ws.skewerCooldown.toFixed(1)}s`;
        } else {
          const fill = cooldownEl.querySelector('.cooldown-fill');
          const text = cooldownEl.querySelector('.cooldown-text');
          if (fill) fill.style.width = '100%';
          if (text) text.textContent = 'Ready!';
        }
      }
    }
  };
}