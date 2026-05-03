import { gameState } from '../game/state.js';
import { togglePause, spawnNextMarshmallow } from '../game/manager.js';

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
         <button id="buyTreat" class="nav-btn wonky" data-fill="#32cd32" data-stroke="#000000" data-stroke-width="3">Buy Treat (💧1)</button>
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

  const buyTreatBtn = hud.querySelector('#buyTreat');
  if (buyTreatBtn) {
    buyTreatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Attempt to spawn/purchase a marshmallow immediately
      spawnNextMarshmallow();
      // Update HUD to reflect new currency/cost
      document.getElementById('pollenDisplay') && (document.getElementById('pollenDisplay').textContent = Math.floor(gameState.currencies.pollen));
      document.getElementById('caramelDisplay') && (document.getElementById('caramelDisplay').textContent = Math.floor(gameState.currencies.caramel));
      document.getElementById('marshDisplay') && (document.getElementById('marshDisplay').textContent = Math.floor(gameState.currencies.marsh));
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

      // Update Buy Treat button to show current cost and afford state
      const buyBtn = document.getElementById('buyTreat');
      if (buyBtn) {
        const cost = gameState.marshmallowTreatCost || 1;
        buyBtn.textContent = `Buy Treat (💧${cost})`;
        if (gameState.currencies.marsh >= cost) {
          buyBtn.disabled = false;
          buyBtn.style.opacity = '1';
        } else {
          buyBtn.disabled = true;
          buyBtn.style.opacity = '0.6';
        }
      }
      
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