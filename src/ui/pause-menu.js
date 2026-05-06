import { settings } from '../game/state.js';

export function createPauseMenu(onResume, onQuit) {
  const menu = document.getElementById('pauseMenu');
  
  const dynamicGraphicsEnabled = settings.dynamicGraphics;
  
  menu.innerHTML = `
    <div class="pause-content wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="8">
      <h2 class="pause-title">Paused</h2>
      
      <div class="pause-section">
        <h3 style="font-size: 12px; color: #000000;">Graphics</h3>
        <div class="setting-row wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Dynamic Graphics</label>
          <input type="checkbox" id="dynamicGraphics" ${settings.dynamicGraphics ? 'checked' : ''}>
        </div>
        
        <div class="setting-row wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Cel Shading</label>
          <input type="checkbox" id="celShading" ${settings.celShading ? 'checked' : ''} ${dynamicGraphicsEnabled ? 'disabled' : ''}>
        </div>
        <div class="setting-row wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Shadows</label>
          <input type="checkbox" id="shadows" ${settings.shadowsEnabled ? 'checked' : ''} ${dynamicGraphicsEnabled ? 'disabled' : ''}>
        </div>
        <div class="setting-row wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Ambient Occlusion</label>
          <input type="checkbox" id="ao" ${settings.aoEnabled ? 'checked' : ''} ${dynamicGraphicsEnabled ? 'disabled' : ''}>
        </div>
        <div class="setting-row wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Outlines</label>
          <input type="checkbox" id="outlines" ${settings.outlinesEnabled ? 'checked' : ''}>
        </div>
        
        <div class="setting-row slider-row wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">
          <label>Resolution Scale: <span id="maxScaleVal">${settings.renderScale.toFixed(1)}</span></label>
          <input type="range" id="maxScale" min="0.1" max="2.0" step="0.1" value="${settings.renderScale}" ${dynamicGraphicsEnabled ? 'disabled' : ''}>
        </div>
      </div>
      
      <div class="pause-buttons">
        <button class="pause-btn wonky" data-fill="#32cd32" data-stroke="#000000" data-stroke-width="3" id="resumeBtn">Resume</button>
        <button class="pause-btn secondary wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3" id="quitBtn">Quit</button>
      </div>
    </div>
  `;
  
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

  // Toggle global outlines for SDF objects
  document.getElementById('outlines').addEventListener('change', (e) => {
    settings.outlinesEnabled = e.target.checked;
  });
  
  document.getElementById('dynamicRes').addEventListener('change', (e) => {
    settings.dynamicRes = e.target.checked;
    document.getElementById('minScaleContainer').style.opacity = settings.dynamicRes ? '1' : '0.4';
    if (!settings.dynamicRes) {
      settings.renderScale = settings.maxScale;
    }
  });

  const maxSlider = document.getElementById('maxScale');
  const maxVal = document.getElementById('maxScaleVal');
  maxSlider.addEventListener('input', (e) => {
    settings.maxScale = parseFloat(e.target.value);
    maxVal.textContent = settings.maxScale.toFixed(1);
    if (!settings.dynamicRes) {
      settings.renderScale = settings.maxScale;
    }
  });

  const minSlider = document.getElementById('minScale');
  const minVal = document.getElementById('minScaleVal');
  minSlider.addEventListener('input', (e) => {
    settings.minScale = parseFloat(e.target.value);
    minVal.textContent = settings.minScale.toFixed(1);
  });
  
  return {
    show() {
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