import { settings } from '../game/state.js';

export function createPauseMenu(onResume, onQuit) {
  const menu = document.getElementById('pauseMenu');
  
  menu.innerHTML = `
    <div class="pause-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="8">
      <h2 class="pause-title">Paused</h2>
      
      <div class="pause-section">
        <h3 style="font-size: 12px; color: #000000;">Graphics</h3>
        <div class="setting-row wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Dynamic Graphics</label>
          <input type="checkbox" id="dynamicGraphics">
        </div>
        <div class="setting-row wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Outlines</label>
          <input type="checkbox" id="outlines">
        </div>
        <div class="setting-row wonky" id="celRow" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Cel Shading</label>
          <input type="checkbox" id="celShading">
        </div>
        <div class="setting-row wonky" id="shadowsRow" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Shadows</label>
          <input type="checkbox" id="shadows">
        </div>
        <div class="setting-row wonky" id="aoRow" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Ambient Occlusion</label>
          <input type="checkbox" id="ao">
        </div>
        
        <div class="setting-row slider-row wonky" id="resRow" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Resolution Scale: <span id="resScaleVal">1.0</span></label>
          <input type="range" id="resScale" min="0.1" max="2.0" step="0.05" value="1.0">
        </div>
      </div>
      
      <div class="pause-buttons">
        <button class="pause-btn wonky" data-fill="#32cd32" data-stroke="#000000" data-stroke-width="3" id="resumeBtn">Resume</button>
        <button class="pause-btn secondary wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3" id="quitBtn">Quit</button>
      </div>
    </div>
  `;
  
  const updateDisabledStates = () => {
    const isDyn = settings.dynamicGraphics;
    document.getElementById('celShading').disabled = isDyn;
    document.getElementById('shadows').disabled = isDyn;
    document.getElementById('ao').disabled = isDyn;
    document.getElementById('resScale').disabled = isDyn;
    
    const opacity = isDyn ? '0.4' : '1.0';
    document.getElementById('celRow').style.opacity = opacity;
    document.getElementById('shadowsRow').style.opacity = opacity;
    document.getElementById('aoRow').style.opacity = opacity;
    document.getElementById('resRow').style.opacity = opacity;
  };

  // Event listeners
  document.getElementById('resumeBtn').addEventListener('click', onResume);
  document.getElementById('quitBtn').addEventListener('click', onQuit);
  
  document.getElementById('celShading').addEventListener('change', (e) => {
    settings.celShading = e.target.checked;
  });
  
  document.getElementById('shadows').addEventListener('change', (e) => {
    settings.shadowsEnabled = e.target.checked;
  });
  
  document.getElementById('ao').addEventListener('change', (e) => {
    settings.aoEnabled = e.target.checked;
  });

  document.getElementById('outlines').addEventListener('change', (e) => {
    settings.outlinesEnabled = e.target.checked;
  });
  
  document.getElementById('dynamicGraphics').addEventListener('change', (e) => {
    settings.dynamicGraphics = e.target.checked;
    updateDisabledStates();
  });

  const resSlider = document.getElementById('resScale');
  const resVal = document.getElementById('resScaleVal');
  resSlider.addEventListener('input', (e) => {
    settings.renderScale = parseFloat(e.target.value);
    resVal.textContent = settings.renderScale.toFixed(2);
  });
  
  return {
    show() {
      document.getElementById('dynamicGraphics').checked = settings.dynamicGraphics;
      document.getElementById('outlines').checked = settings.outlinesEnabled;
      document.getElementById('celShading').checked = settings.celShading;
      document.getElementById('shadows').checked = settings.shadowsEnabled;
      document.getElementById('ao').checked = settings.aoEnabled;
      document.getElementById('resScale').value = settings.renderScale;
      document.getElementById('resScaleVal').textContent = settings.renderScale.toFixed(2);
      updateDisabledStates();
      
      menu.classList.add('active');
    },
    hide() {
      menu.classList.remove('active');
    },
    isVisible() {
      return menu.classList.contains('active');
    }
  };
}