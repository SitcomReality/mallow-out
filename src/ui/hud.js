import { gameState } from '../game/state.js';

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
      <div class="timer-display wonky" data-fill="#dc143c" data-stroke="#000000" data-stroke-width="4" id="timerDisplay">30</div>
    </div>
    
  `;
  
  return {
    show() {
      hud.style.display = 'block';
    },
    hide() {
      hud.style.display = 'none';
    },

    update() {
      document.getElementById('pollenDisplay').textContent = gameState.currencies.pollen;
      document.getElementById('caramelDisplay').textContent = gameState.currencies.caramel;
      
      if (gameState.waveTimer.active) {
        const remaining = Math.ceil(gameState.waveTimer.getRemainingTime());
        document.getElementById('timerDisplay').textContent = remaining;
      }
    }
  };
}