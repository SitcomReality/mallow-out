export class UIManager {
  constructor(container, game) {
    this.container = container;
    this.game = game;
    this.paused = false;
    
    this.createHUD();
    this.createPauseMenu();
    this.setupEventListeners();
  }
  
  createHUD() {
    const hud = document.createElement('div');
    hud.className = 'hud';
    hud.innerHTML = `
      <div class="reticle">
        <div class="reticle-dot"></div>
        <div class="reticle-ring"></div>
      </div>
      
      <div class="hotbar">
        <div class="hotbar-slot active" data-weapon="gun">
          <div class="hotbar-key">1</div>
          <div class="hotbar-icon">🔫</div>
          <div class="hotbar-name">GUN</div>
        </div>
        <div class="hotbar-slot" data-weapon="flamethrower">
          <div class="hotbar-key">2</div>
          <div class="hotbar-icon">🔥</div>
          <div class="hotbar-name">FLAME</div>
        </div>
      </div>
      
      <div class="health-bar">
        <div class="health-label">INTEGRITY</div>
        <div class="health-bar-bg">
          <div class="health-bar-fill" style="width: 100%"></div>
          <div class="health-bar-glow"></div>
        </div>
      </div>
      
      <div class="enemy-counter">
        <div class="enemy-label">TARGETS</div>
        <div class="enemy-count">0</div>
      </div>
    `;
    
    this.container.appendChild(hud);
    this.hud = hud;
    this.healthFill = hud.querySelector('.health-bar-fill');
    this.enemyCount = hud.querySelector('.enemy-count');
    this.hotbarSlots = hud.querySelectorAll('.hotbar-slot');
  }
  
  createPauseMenu() {
    const menu = document.createElement('div');
    menu.className = 'pause-menu hidden';
    menu.innerHTML = `
      <div class="pause-content">
        <h1 class="pause-title">PAUSED</h1>
        
        <div class="settings">
          <div class="setting">
            <label>Render Quality</label>
            <select id="renderScale">
              <option value="0.5">Low (0.5x)</option>
              <option value="0.75">Medium (0.75x)</option>
              <option value="1.0">High (1.0x)</option>
            </select>
          </div>
          
          <div class="setting">
            <label>Max Ray Steps</label>
            <input type="range" id="maxSteps" min="40" max="160" step="10" value="80">
            <span id="maxStepsValue">80</span>
          </div>
          
          <div class="setting">
            <label>Draw Distance</label>
            <input type="range" id="drawDistance" min="50" max="200" step="10" value="100">
            <span id="drawDistValue">100</span>
          </div>
          
          <div class="setting">
            <label class="checkbox-label">
              <input type="checkbox" id="shadowsEnabled" checked>
              <span>Shadows</span>
            </label>
          </div>
          
          <div class="setting">
            <label class="checkbox-label">
              <input type="checkbox" id="aoEnabled" checked>
              <span>Ambient Occlusion</span>
            </label>
          </div>
        </div>
        
        <button class="resume-btn">RESUME</button>
        <div class="pause-hint">Press ESC to resume</div>
      </div>
    `;
    
    this.container.appendChild(menu);
    this.pauseMenu = menu;
    this.setupPauseMenuControls();
  }
  
  setupPauseMenuControls() {
    const resumeBtn = this.pauseMenu.querySelector('.resume-btn');
    resumeBtn.addEventListener('click', () => this.togglePause());
    
    // Settings controls
    const renderScale = this.pauseMenu.querySelector('#renderScale');
    const maxSteps = this.pauseMenu.querySelector('#maxSteps');
    const maxStepsValue = this.pauseMenu.querySelector('#maxStepsValue');
    const drawDistance = this.pauseMenu.querySelector('#drawDistance');
    const drawDistValue = this.pauseMenu.querySelector('#drawDistValue');
    const shadowsEnabled = this.pauseMenu.querySelector('#shadowsEnabled');
    const aoEnabled = this.pauseMenu.querySelector('#aoEnabled');
    
    renderScale.addEventListener('change', (e) => {
      const scale = parseFloat(e.target.value);
      this.game.setRenderScale(scale);
    });
    
    maxSteps.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      maxStepsValue.textContent = val;
      this.game.uniforms.uMaxSteps.value = val;
    });
    
    drawDistance.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      drawDistValue.textContent = val;
      this.game.uniforms.uDrawDist.value = val;
    });
    
    shadowsEnabled.addEventListener('change', (e) => {
      this.game.uniforms.uShadowsEnabled.value = e.target.checked ? 1.0 : 0.0;
    });
    
    aoEnabled.addEventListener('change', (e) => {
      this.game.uniforms.uAOEnabled.value = e.target.checked ? 1.0 : 0.0;
    });
  }
  
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        this.togglePause();
      }
    });
  }
  
  togglePause() {
    this.paused = !this.paused;
    this.pauseMenu.classList.toggle('hidden', !this.paused);
    this.game.setPaused(this.paused);
    
    if (this.paused) {
      document.exitPointerLock();
    }
  }
  
  updateWeapon(weaponType) {
    this.hotbarSlots.forEach(slot => {
      slot.classList.toggle('active', slot.dataset.weapon === weaponType);
    });
  }
  
  updateHealth(health) {
    const percent = Math.max(0, Math.min(100, health));
    this.healthFill.style.width = `${percent}%`;
  }
  
  updateEnemyCount(count) {
    this.enemyCount.textContent = count;
  }
  
  update() {
    // Update enemy count
    this.updateEnemyCount(this.game.enemyManager.enemies.filter(e => !e.dead).length);
    
    // Update health
    this.updateHealth(this.game.player.health);
    
    // Update active weapon
    const weaponType = this.game.currentWeapon.type;
    this.updateWeapon(weaponType);
  }
}