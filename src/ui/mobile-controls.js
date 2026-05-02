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
    
    // For mobile simplified, we tap the center or just use the center-screen projection for the shoot button
    shoot(0, 0, session.particleSystem, session.marshmallowHUD, session.particleCamera);
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