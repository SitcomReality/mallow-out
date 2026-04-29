import { gameState } from '../game/state.js';

export function createHUD() {
  const hud = document.getElementById('hud');
  
  hud.innerHTML = `
    <div class="hud-top">
      <div class="currency-display">
        <div class="currency-item">
          <span class="currency-icon">🌼</span>
          <span class="currency-value" id="pollenDisplay">0</span>
        </div>
        <div class="currency-item">
          <span class="currency-icon">🍯</span>
          <span class="currency-value" id="caramelDisplay">0</span>
        </div>
      </div>
      <div class="timer-display" id="timerDisplay">30</div>
    </div>
    
    <div class="weapon-bar">
      <div class="weapon-slot active" data-weapon="0" title="Skewer">
        <span>🗡️</span>
      </div>
      <div class="weapon-slot" data-weapon="1" title="Globber" style="display:none;">
        <span>🟣</span>
      </div>
      <div class="weapon-slot" data-weapon="2" title="Spatterer" style="display:none;">
        <span>💥</span>
      </div>
      <div class="weapon-slot" data-weapon="3" title="Cleaver" style="display:none;">
        <span>🪓</span>
      </div>
      <div class="weapon-slot" data-weapon="4" title="Melter" style="display:none;">
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
          slot.style.display = 'flex';
        } else {
          slot.classList.remove('active');
          slot.style.display = 'none';
        }
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