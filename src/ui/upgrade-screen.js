import { UPGRADES_PER_SCREEN } from '../game/wave-constants.js';

const availableUpgrades = [
  {
    id: 'damage',
    icon: '💥',
    name: 'More Damage',
    description: 'Deal +1 damage per hit'
  },
  {
    id: 'fire_rate',
    icon: '⚡',
    name: 'Rapid Fire',
    description: 'Reduce cooldown between shots'
  },
  {
    id: 'move_speed',
    icon: '👟',
    name: 'Quick Feet',
    description: 'Move 20% faster'
  },
  {
    id: 'health',
    icon: '❤️',
    name: 'Vitality',
    description: 'Increase max health (future)'
  },
  {
    id: 'splash',
    icon: '🌊',
    name: 'Splash Damage',
    description: 'Attacks create larger splashes'
  }
];

export function createUpgradeScreen(onContinue) {
  const screen = document.getElementById('upgradeScreen');
  
  function show(wave) {
    // Select random upgrades
    const shuffled = [...availableUpgrades].sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, UPGRADES_PER_SCREEN);
    
    let selectedUpgrade = null;
    
    const optionsHTML = options.map(upgrade => `
      <div class="upgrade-card" data-id="${upgrade.id}">
        <div class="upgrade-card-icon">${upgrade.icon}</div>
        <h3 class="upgrade-card-name">${upgrade.name}</h3>
        <p class="upgrade-card-desc">${upgrade.description}</p>
      </div>
    `).join('');
    
    screen.innerHTML = `
      <div class="upgrade-content">
        <h2 class="upgrade-title">Wave ${wave} Complete!</h2>
        <p class="upgrade-subtitle">Choose an upgrade</p>
        <div class="upgrade-options">
          ${optionsHTML}
        </div>
        <button class="continue-btn" disabled>Select an upgrade to continue</button>
      </div>
    `;
    
    screen.classList.add('active');
    
    // Add click handlers
    const cards = screen.querySelectorAll('.upgrade-card');
    const continueBtn = screen.querySelector('.continue-btn');
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        // Deselect all
        cards.forEach(c => c.style.borderColor = 'var(--marsh-water)');
        // Select this one
        card.style.borderColor = 'var(--marshmallow-white)';
        selectedUpgrade = card.dataset.id;
        continueBtn.disabled = false;
        continueBtn.textContent = 'Continue to Next Wave';
      });
    });
    
    continueBtn.addEventListener('click', () => {
      if (selectedUpgrade) {
        hide();
        onContinue(selectedUpgrade);
      }
    });
  }
  
  function hide() {
    screen.classList.remove('active');
  }
  
  return { show, hide };
}