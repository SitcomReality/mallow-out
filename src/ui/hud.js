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
    
    <div class="weapon-bar wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4">
      <div class="weapon-slot active wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" data-weapon="0" title="Skewer">
        <span>🗡️</span>
      </div>
      <div class="weapon-slot wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" data-weapon="1" title="Globber" style="display:none;">
        <span>🟣</span>
      </div>
      <div class="weapon-slot wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" data-weapon="2" title="Spatterer" style="display:none;">
        <span>💥</span>
      </div>
      <div class="weapon-slot wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" data-weapon="3" title="Cleaver" style="display:none;">
        <span>🪓</span>
      </div>
      <div class="weapon-slot wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" data-weapon="4" title="Melter" style="display:none;">
        <span>🔥</span>
      </div>
    </div>
  `;
  
  return {
    show() {
      hud.style.display = 'block';
    },
    hide() {
      hud.style.display = 'none';
    },
    setActiveWeapon(index) {
      hud.querySelectorAll('.weapon-slot').forEach((slot, i) => {
        if (i === index) {
          slot.classList.add('active');
          slot.dataset.fill = '#ffff00';
          slot.dataset.stroke = '#000000';
          slot.style.display = 'flex';
        } else {
          slot.classList.remove('active');
          slot.dataset.fill = '#ffffff';
          slot.dataset.stroke = '#000000';
          slot.style.display = 'none';
        }
        // force wonky update
        if (window.updateWonkyUI) window.updateWonkyUI();
      });
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