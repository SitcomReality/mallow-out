import { gameState } from '../game/state.js';
import { getPetalById } from '../game/petals/petal-types.js';

export function createPetalHUD() {
  const container = document.createElement('div');
  container.id = 'petalHUD';
  container.className = 'petal-hud';
  document.body.appendChild(container);
  
  function update() {
    const petalsHTML = gameState.equippedPetals.map((petalId, idx) => {
      if (petalId) {
        const petal = getPetalById(petalId);
        return `
          <div class="petal-slot filled" title="${petal?.name || ''}: ${petal?.description || ''}">
            ${petal?.icon || '?'}
          </div>
        `;
      } else {
        return `
          <div class="petal-slot empty" title="Empty - will grant Caramel Vapor (20-30% of earned Caramel)">
            💨
          </div>
        `;
      }
    }).join('');
    
    container.innerHTML = `
      <div class="petal-display">
        <div class="petal-label">Petals</div>
        <div class="petal-slots">
          ${petalsHTML}
        </div>
      </div>
    `;
  }
  
  return {
    show() {
      container.style.display = 'block';
      update();
    },
    hide() {
      container.style.display = 'none';
    },
    update
  };
}