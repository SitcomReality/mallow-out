import nipplejs from 'nipplejs';
import { gameState } from '../game/state.js';
import { session } from '../game/manager.js';
import { shoot, releaseCleaver, stopShooting } from '../game/combat.js';

export function createMobileControls() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const container = document.createElement('div');
  container.id = 'mobileControls';
  container.className = 'mobile-controls';
  document.body.appendChild(container);
  
  container.innerHTML = `
    <div class="mobile-actions">
      <button id="mobileShootBtn" class="mobile-shoot-btn wonky" data-fill="#dc143c" data-stroke="#000000" data-stroke-width="6">
        <span class="shoot-icon">🎯</span>
      </button>
    </div>
  `;
  const shootBtn = container.querySelector('#mobileShootBtn');

  // Shooting logic for mobile
  shootBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!session.isPlaying || session.isPaused) return;
    
    shoot(session.particleSystem, session.bossHUD);
  });

  shootBtn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    stopShooting();
    if (gameState.currentWeapon === 3 && gameState.weaponStates.cleaverCharging) {
      releaseCleaver(session.particleSystem, session.bossHUD);
    }
  });

  return {
    show() {
      if (!isMobile) {
        container.style.display = 'none';
        return;
      }
      container.style.display = 'block';
    },
    hide() {
      container.style.display = 'none';
    }
  };
}