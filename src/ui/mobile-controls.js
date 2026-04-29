import nipplejs from 'nipplejs';
import { gameState } from '../game/state.js';
import { session } from '../game/manager.js';
import { shoot, releaseCleaver } from '../game/combat.js';

export function createMobileControls() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const container = document.createElement('div');
  container.id = 'mobileControls';
  container.className = 'mobile-controls';
  document.body.appendChild(container);
  
  container.innerHTML = `
    <div id="joystickZone" class="joystick-zone"></div>
    <div class="mobile-actions">
      <button id="mobileShootBtn" class="mobile-shoot-btn">
        <span class="shoot-icon">🎯</span>
      </button>
    </div>
  `;

  let manager = null;
  const shootBtn = container.querySelector('#mobileShootBtn');

  // Shooting logic for mobile
  shootBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!session.isPlaying || session.isPaused) return;
    
    shoot(session.particleSystem, session.bossHUD);
    
    // For automatic weapons like the melter, we can check if it's held
    if (gameState.currentWeapon === 4) {
       shootBtn.isPressed = true;
    }
  });

  shootBtn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    shootBtn.isPressed = false;
    if (gameState.currentWeapon === 3 && gameState.weaponStates.cleaverCharging) {
      releaseCleaver(session.particleSystem, session.bossHUD);
    }
  });

  // Continuous fire for Melter on mobile
  const fireInterval = setInterval(() => {
    if (shootBtn.isPressed && gameState.currentWeapon === 4 && session.isPlaying && !session.isPaused) {
      shoot(session.particleSystem, session.bossHUD);
    }
  }, 1000/30);

  function initJoystick() {
    if (manager) manager.destroy();
    
    manager = nipplejs.create({
      zone: document.getElementById('joystickZone'),
      mode: 'static',
      position: { left: '80px', bottom: '80px' },
      color: 'white',
      size: 120
    });

    manager.on('move', (evt, data) => {
      if (!data.vector) return;
      // Map joystick to look delta
      gameState.joystickDelta = {
        x: data.vector.x * data.force * 1.5,
        y: data.vector.y * data.force * 1.5
      };
    });

    manager.on('end', () => {
      gameState.joystickDelta = null;
    });
  }

  return {
    show() {
      if (!isMobile) {
        container.style.display = 'none';
        return;
      }
      container.style.display = 'block';
      initJoystick();
    },
    hide() {
      container.style.display = 'none';
      if (manager) manager.destroy();
    }
  };
}