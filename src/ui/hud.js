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
        <div class="currency-item wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3" data-currency="caramel">
          <span class="currency-icon" id="icon-caramel"></span>
          <span class="currency-value" id="caramelDisplay">0</span>
        </div>
      </div>
      <div class="nav-buttons">
         <button id="navUpgrades" class="nav-btn wonky" data-fill="#ff69b4" data-stroke="#000000" data-stroke-width="3">Upgrades</button>
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

  // Tutorial system using canonical SVG icons
  const tutorialMessages = [
    `💥 <strong>WELCOME TO MALLOW OUT!</strong> 💥<br><br>Tap anywhere to shoot! Build combos for bonus ${getCurrencySVG('caramel',16)} <strong>Caramel</strong>!<br><br>Hold to charge a powerful shot! 🔥`,
    `🎯 <strong>MARSHMALLOW APPEARED!</strong> 🎯<br><br>Your adorable target has emerged! Hit it to deal damage and earn caramel!<br><br>Defeat it to spawn a new one! 💖`,
    `🌈 <strong>UPGRADES UNLOCKED!</strong> 🌈<br><br>Spend ${getCurrencySVG('caramel',16)} <strong>Caramel</strong> on permanent upgrades!<br><br>Become faster, stronger, and more deadly! 💪`,
    `🚀 <strong>YOU'RE READY!</strong> 🚀<br><br>✅ Build combos for MULTIPLIERS!<br>✅ Charge shots for HUGE damage!<br>✅ Defeat marshmallows for BONUS caramel!<br><br>The marsh awaits! 🏆`
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

  // Inject canonical icons
  const caramelIcon = hud.querySelector('#icon-caramel');
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
      const oldCaramel = parseInt(document.getElementById('caramelDisplay').textContent) || 0;
      const newCaramel = Math.floor(gameState.currencies.caramel);
      
      document.getElementById('caramelDisplay').textContent = newCaramel;
      
      // Pulse animation when currency increases
      if (newCaramel > oldCaramel) {
        const el = document.querySelector('[data-currency="caramel"]');
        if (el) {
          el.classList.remove('currency-pulse');
          void el.offsetWidth; // Force reflow
          el.classList.add('currency-pulse');
        }
      }
      
      // Update tutorial
      if (!gameState.tutorial.completed) {
        const lastStep = gameState.tutorial.currentStep;
        
        if (gameState.tutorial.hasUpgraded && lastStep < 3) {
          gameState.tutorial.currentStep = 3;
        }
        
        if (gameState.tutorial.currentStep !== lastStep) {
          showTutorialStep();
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