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
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3" data-currency="marsh">
          <span class="currency-icon" id="icon-marsh"></span>
          <span class="currency-value" id="marshDisplay">0</span>
        </div>
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3" data-currency="pollen">
          <span class="currency-icon" id="icon-pollen"></span>
          <span class="currency-value" id="pollenDisplay">0</span>
        </div>
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3" data-currency="caramel">
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
           <button id="pauseDispenser" class="nav-btn wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3" style="display: none;">Pause Auto</button>
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

  const pauseDispenserBtn = hud.querySelector('#pauseDispenser');
  if (pauseDispenserBtn) {
    pauseDispenserBtn.addEventListener('click', (e) => {
      e.preventDefault();
      gameState.treatDispenserPaused = !gameState.treatDispenserPaused;
      pauseDispenserBtn.textContent = gameState.treatDispenserPaused ? 'Resume Auto' : 'Pause Auto';
    });
  }

  // Tutorial system using canonical SVG icons
  const tutorialMessages = [
    `💥 <strong>WELCOME TO MALLOW OUT!</strong> 💥<br><br>Tap the glowing marsh floor to blast it and collect ${getCurrencySVG('marsh',16)} <strong>Marsh</strong> currency!<br><br>Every shot counts! Build combos for MASSIVE bonuses! 🔥`,
    `🎉 <strong>INCREDIBLE!</strong> 🎉<br><br>You've earned ${getCurrencySVG('marsh',16)} Marsh! Now visit the <strong>Shop</strong> to buy a ${getCurrencySVG('treat',16)} <strong>Marshmallow Treat</strong>!<br><br>This summons your adorable marshmallow companion! 💖`,
    `✨ <strong>YOUR FRIEND HAS ARRIVED!</strong> ✨<br><br>Tap your marshmallow to shower it with love! Each hit heals it AND rewards you with ${getCurrencySVG('pollen',16)} <strong>Pollen</strong>!<br><br>The more you love, the more you earn! 🌟`,
    `🌈 <strong>POLLEN POWER!</strong> 🌈<br><br>Your pollen has been converted to ${getCurrencySVG('caramel',16)} <strong>Caramel</strong> - the PREMIUM currency!<br><br>Spend it on <strong>Permanent Upgrades</strong> to become UNSTOPPABLE! 💪`,
    `🚀 <strong>YOU'RE READY!</strong> 🚀<br><br>✅ Shoot bubbles for BONUS marsh!<br>✅ Build combos for MULTIPLIERS!<br>✅ Unlock AUTOMATIONS!<br>✅ Open LOOTBOXES for cosmetics!<br><br>The marsh awaits your legend! 🏆`
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
      const oldMarsh = parseInt(document.getElementById('marshDisplay').textContent) || 0;
      const oldPollen = parseInt(document.getElementById('pollenDisplay').textContent) || 0;
      const oldCaramel = parseInt(document.getElementById('caramelDisplay').textContent) || 0;
      
      const newMarsh = Math.floor(gameState.currencies.marsh);
      const newPollen = Math.floor(gameState.currencies.pollen);
      const newCaramel = Math.floor(gameState.currencies.caramel);
      
      document.getElementById('marshDisplay').textContent = newMarsh;
      document.getElementById('pollenDisplay').textContent = newPollen;
      document.getElementById('caramelDisplay').textContent = newCaramel;
      
      // Pulse animation when currency increases
      if (newMarsh > oldMarsh) {
        const el = document.querySelector('[data-currency="marsh"]');
        if (el) {
          el.classList.remove('currency-pulse');
          void el.offsetWidth; // Force reflow
          el.classList.add('currency-pulse');
        }
      }
      if (newPollen > oldPollen) {
        const el = document.querySelector('[data-currency="pollen"]');
        if (el) {
          el.classList.remove('currency-pulse');
          void el.offsetWidth;
          el.classList.add('currency-pulse');
        }
      }
      if (newCaramel > oldCaramel) {
        const el = document.querySelector('[data-currency="caramel"]');
        if (el) {
          el.classList.remove('currency-pulse');
          void el.offsetWidth;
          el.classList.add('currency-pulse');
        }
      }
      
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
      
      const pauseBtn = document.getElementById('pauseDispenser');
      if (pauseBtn) {
        if (gameState.upgrades.treat_dispenser_unlock > 0) {
          pauseBtn.style.display = 'block';
          pauseBtn.textContent = gameState.treatDispenserPaused ? 'Resume Auto' : 'Pause Auto';
        } else {
          pauseBtn.style.display = 'none';
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