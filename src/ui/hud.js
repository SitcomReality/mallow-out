import { gameState } from '../game/state.js';
import { togglePause, spawnNextMarshmallow } from '../game/manager.js';
import { getCurrencySVG } from './currency-symbols.js';

export function createHUD() {
  const hud = document.getElementById('hud');
  
  hud.innerHTML = `
    <div id="tutorialOverlay" class="tutorial-overlay" style="display: none;">
      <div class="tutorial-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="6">
        <div class="tutorial-text" id="tutorialText"></div>
        <button id="tutorialNext" class="tutorial-btn wonky" data-fill="#32cd32" data-stroke="#000000" data-stroke-width="3">Got it!</button>
      </div>
    </div>
    
    <div class="hud-top">
      <div class="currency-display">
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">
          <span class="currency-icon" id="icon-marsh"></span>
          <span class="currency-value" id="marshDisplay">0</span>
        </div>
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">
          <span class="currency-icon" id="icon-pollen"></span>
          <span class="currency-value" id="pollenDisplay">0</span>
        </div>
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">
          <span class="currency-icon" id="icon-caramel"></span>
          <span class="currency-value" id="caramelDisplay">0</span>
        </div>
      </div>
      <div class="nav-buttons">
         <button id="navShop" class="nav-btn wonky" data-fill="#32cd32" data-stroke="#000000" data-stroke-width="3">Shop</button>
         <button id="navUpgrades" class="nav-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="3">Upgrades</button>
         <button id="navCosmetics" class="nav-btn wonky" data-fill="#ffd700" data-stroke="#000000" data-stroke-width="3">Cosmetics</button>
         <div id="treatControls" style="display: flex; gap: 4px;">
           <button id="equipTreat" class="nav-btn wonky" data-fill="#ffd700" data-stroke="#000000" data-stroke-width="3">Equip (0)</button>
         </div>
         <button id="navSettings" class="nav-btn wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">Settings</button>
      </div>
    </div>
    <div class="hud-bottom">
      <div id="comboMeter" class="combo-meter" style="display: none;">
        <div class="combo-text">COMBO x<span id="comboCount">0</span></div>
        <div class="combo-multiplier">+<span id="comboMultiplier">0</span>%</div>
      </div>
      <div id="cooldownIndicator" class="cooldown-indicator" style="display: none;">
        <div class="cooldown-bar wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">
          <div class="cooldown-fill" style="width: 0%; background: #ffd700;"></div>
        </div>
        <div class="cooldown-text" style="text-align: center; font-size: 8px; color: #000; margin-top: 4px;">Ready!</div>
      </div>
    </div>
  `;
  
  const settingsBtn = hud.querySelector('#navSettings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      togglePause();
    });
  }

  const shopBtn = hud.querySelector('#navShop');
  if (shopBtn) {
    shopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!window._shopInstance) {
        import('./shop.js').then(m => {
          window._shopInstance = m.createShop();
          window._shopInstance.show();
        });
      } else {
        window._shopInstance.show();
      }
    });
  }

  const cosmeticsBtn = hud.querySelector('#navCosmetics');
  if (cosmeticsBtn) {
    cosmeticsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!window._cosmeticsInstance) {
        import('./cosmetics-screen.js').then(m => {
          window._cosmeticsInstance = m.createCosmeticsScreen();
          window._cosmeticsInstance.show();
        });
      } else {
        window._cosmeticsInstance.show();
      }
    });
  }

  const equipTreatBtn = hud.querySelector('#equipTreat');
  if (equipTreatBtn) {
    equipTreatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      import('../game/manager.js').then(m => m.equipMarshmallowTreat());
    });
  }

  // Tutorial system using canonical SVG icons
  const tutorialMessages = [
    `Welcome! Click anywhere on the glowing marsh floor to collect marsh currency (${getCurrencySVG('marsh',14)}).`,
    `Great! Now use your marsh to buy a Marshmallow Treat from the Shop. This will summon your marshmallow friend!`,
    `Perfect! Now click on your marshmallow friend to give it love and collect pollen (${getCurrencySVG('pollen',14)}).`,
    `Excellent! Pollen automatically converts to caramel (${getCurrencySVG('caramel',14)}) which you can spend on permanent upgrades. Click the Upgrades button to see what's available!`,
    `You've got the basics! Keep shooting to earn resources, buy upgrades to increase your earning rates, and unlock automations for idle progress. Have fun!`
  ];

  function showTutorialStep() {
    const step = gameState.tutorial.currentStep;
    if (step >= tutorialMessages.length || gameState.tutorial.completed) {
      document.getElementById('tutorialOverlay').style.display = 'none';
      if (!gameState.tutorial.completed) {
        gameState.tutorial.completed = true;
        import('../game/persistence.js').then(m => m.saveGame());
      }
      return;
    }
    
    const overlay = document.getElementById('tutorialOverlay');
    const textEl = document.getElementById('tutorialText');
    
    // tutorialMessages now include inline SVG strings; set as innerHTML to render icons
    textEl.innerHTML = tutorialMessages[step];
    overlay.style.display = 'flex';
  }

  const tutorialNextBtn = hud.querySelector('#tutorialNext');
  if (tutorialNextBtn) {
    tutorialNextBtn.addEventListener('click', () => {
      document.getElementById('tutorialOverlay').style.display = 'none';
    });
  }

  // Inject canonical icons (still populate the top-left currency icons)
  const marshIcon = hud.querySelector('#icon-marsh');
  const pollenIcon = hud.querySelector('#icon-pollen');
  const caramelIcon = hud.querySelector('#icon-caramel');
  if (marshIcon) marshIcon.innerHTML = getCurrencySVG('marsh', 20);
  if (pollenIcon) pollenIcon.innerHTML = getCurrencySVG('pollen', 20);
  if (caramelIcon) caramelIcon.innerHTML = getCurrencySVG('caramel', 20);

  // Show first tutorial message on load if not completed
  if (!gameState.tutorial.completed) {
    setTimeout(() => showTutorialStep(), 500);
  }

  return {
    show() {
      hud.style.display = 'block';
    },
    hide() {
      hud.style.display = 'none';
    },

    update() {
      document.getElementById('marshDisplay').textContent = Math.floor(gameState.currencies.marsh);
      document.getElementById('pollenDisplay').textContent = Math.floor(gameState.currencies.pollen);
      document.getElementById('caramelDisplay').textContent = Math.floor(gameState.currencies.caramel);
      
      // Update tutorial
      if (!gameState.tutorial.completed) {
        const lastStep = gameState.tutorial.currentStep;
        
        if (gameState.tutorial.hasUpgraded && lastStep < 4) {
          gameState.tutorial.currentStep = 4;
        }
        
        if (gameState.tutorial.currentStep !== lastStep) {
          showTutorialStep();
        }
      }

      const equipBtn = document.getElementById('equipTreat');
      if (equipBtn) {
        const treats = gameState.currencies.treats || 0;
        const isActive = gameState.weaponStates.activeAmmo === 'treat';
        equipBtn.textContent = isActive ? 'LOADED!' : `Equip (${treats})`;
        equipBtn.disabled = treats <= 0 || isActive;
        equipBtn.style.opacity = equipBtn.disabled && !isActive ? '0.4' : '1';
        if (isActive) {
          equipBtn.style.filter = 'hue-rotate(90deg)';
        } else {
          equipBtn.style.filter = 'none';
        }
      }
      
      // Update combo meter
      const comboEl = document.getElementById('comboMeter');
      if (comboEl) {
        if (gameState.combo.count > 1 && gameState.combo.timer > 0) {
          comboEl.style.display = 'block';
          const countSpan = comboEl.querySelector('#comboCount');
          const multSpan = comboEl.querySelector('#comboMultiplier');
          if (countSpan) countSpan.textContent = gameState.combo.count;
          if (multSpan) {
            const mult = ((gameState.combo.count - 1) * 10);
            multSpan.textContent = mult;
          }
        } else {
          comboEl.style.display = 'none';
        }
      }
      
      // Update cooldown indicator
      const ws = gameState.weaponStates;
      const cooldownEl = document.getElementById('cooldownIndicator');
      if (cooldownEl) {
        if (ws.skewerCooldown > 0) {
          cooldownEl.style.display = 'block';
          const percent = ((ws.maxCooldown - ws.skewerCooldown) / ws.maxCooldown) * 100;
          const fill = cooldownEl.querySelector('.cooldown-fill');
          const text = cooldownEl.querySelector('.cooldown-text');
          if (fill) {
            fill.style.width = `${percent}%`;
            fill.style.background = '#ffd700';
          }
          if (text) text.textContent = `Cooldown: ${ws.skewerCooldown.toFixed(1)}s`;
        } else if (ws.isCharging) {
          cooldownEl.style.display = 'block';
          const chargePercent = (ws.chargeTimer / ws.maxChargeTime) * 100;
          const fill = cooldownEl.querySelector('.cooldown-fill');
          const text = cooldownEl.querySelector('.cooldown-text');
          if (fill) {
             fill.style.width = `${chargePercent}%`;
             fill.style.background = chargePercent >= 100 ? '#ff1493' : '#32cd32';
          }
          if (text) text.textContent = chargePercent >= 100 ? 'FULLY CHARGED!' : 'Charging...';
        } else {
          const fill = cooldownEl.querySelector('.cooldown-fill');
          const text = cooldownEl.querySelector('.cooldown-text');
          if (fill) {
            fill.style.width = '100%';
            fill.style.background = '#ffd700';
          }
          if (text) text.textContent = 'Ready!';
        }
      }
    }
  };
}