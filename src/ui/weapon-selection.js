import { gameState } from '../game/state.js';
import { WEAPONS } from '../game/weapons/weapon-types.js';

export function createWeaponSelection(onSelect) {
  const container = document.createElement('div');
  container.id = 'weaponSelection';
  container.className = 'wave-summary-overlay';
  document.body.appendChild(container);
  
  function show() {
    const optionsHTML = gameState.weaponChoicesOffered.map(weaponIndex => {
      const weapon = WEAPONS[weaponIndex];
      return `
        <div class="upgrade-card weapon-option wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4" data-weapon="${weaponIndex}" style="flex: 1; max-width: 280px;">
          <div class="upgrade-card-icon" style="font-size: 48px; margin-bottom: 12px;">${weapon.icon}</div>
          <h3 class="upgrade-card-name" style="font-size: 12px; color: #000000; margin: 8px 0;">${weapon.name}</h3>
          <p class="upgrade-card-desc" style="font-size: 9px; color: #000000; margin: 8px 0;">${weapon.description}</p>
          <div class="upgrade-effect drawback" style="font-size: 8px;">Warning: ${weapon.drawback}</div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = `
      <div class="upgrade-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="8" style="text-align: center;">
        <h2 class="upgrade-title">Choose Your Weapon</h2>
        <p class="upgrade-subtitle">Select a weapon for Wave ${gameState.currentWave}</p>
        <div class="upgrade-options" style="display: flex; justify-content: center; gap: 24px; margin-bottom: 0; flex-wrap: wrap;">
          ${optionsHTML}
        </div>
      </div>
    `;
    
    container.style.display = 'flex';
    
    container.querySelectorAll('.weapon-option').forEach(card => {
      card.addEventListener('click', () => {
        const weaponIndex = parseInt(card.dataset.weapon, 10);
        hide();
        onSelect(weaponIndex);
        
        // Try to request pointer lock since this is a click event
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            gameContainer.requestPointerLock();
        }
      });
    });
  }
  
  function hide() {
    container.style.display = 'none';
  }
  
  return { show, hide };
}