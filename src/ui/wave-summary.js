import { gameState } from '../game/state.js';
import { finalizeWaveEarnings } from '../game/economy.js';

export function createWaveSummary(onContinue) {
  const container = document.createElement('div');
  container.id = 'waveSummary';
  container.className = 'wave-summary-overlay';
  document.body.appendChild(container);
  
  function show() {
    const stats = gameState.currentWaveStats;
    
    container.innerHTML = `
      <div class="wave-summary-content">
        <h2 class="wave-summary-title">Wave ${gameState.currentWave} Complete!</h2>
        
        <div class="wave-stats">
          <div class="stat-row">
            <span class="stat-label">Marshmallows Destroyed:</span>
            <span class="stat-value">${gameState.marshmallowsDestroyedThisWave}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Total Damage Dealt:</span>
            <span class="stat-value">${Math.floor(stats.damageDealt)}</span>
          </div>
        </div>
        
        <div class="currency-earned">
          <div class="currency-row pollen">
            <span class="currency-icon">🌼</span>
            <span class="currency-label">Pollen Earned:</span>
            <span class="currency-amount" data-currency="pollen">0</span>
          </div>
          <div class="currency-row caramel">
            <span class="currency-icon">🍯</span>
            <span class="currency-label">Caramel Earned:</span>
            <span class="currency-amount" data-currency="caramel">0</span>
          </div>
        </div>
        
        <button class="continue-btn" id="summaryContBtn">Continue to Shop</button>
      </div>
    `;
    
    container.style.display = 'flex';
    
    // Animate currency count-up
    animateCountUp('pollen', stats.pollenEarned, 1000);
    animateCountUp('caramel', stats.caramelEarned, 1000);
    
    document.getElementById('summaryContBtn').addEventListener('click', () => {
      finalizeWaveEarnings();
      hide();
      onContinue();
    });
  }
  
  function hide() {
    container.style.display = 'none';
  }
  
  function animateCountUp(currency, target, duration) {
    const element = container.querySelector(`[data-currency="${currency}"]`);
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.floor(eased * target);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }
    
    requestAnimationFrame(update);
  }
  
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  return { show, hide };
}