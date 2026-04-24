__DELETE_ME__

import { settings } from '../state.js';

export function createPauseMenu(onResume, onQuit) {
  const menu = document.getElementById('pauseMenu');
  
  menu.innerHTML = `
    <div class="pause-content">
      <h2 class="pause-title">Paused</h2>
      
      <div class="pause-section">
        <h3>Graphics</h3>
        <div class="setting-row">
          <label>Cel Shading</label>
          <input type="checkbox" id="celShading" ${settings.celShading ? 'checked' : ''}>
        </div>
        <div class="setting-row">
          <label>Shadows</label>
          <input type="checkbox" id="shadows" ${settings.shadowsEnabled ? 'checked' : ''}>
        </div>
        <div class="setting-row">
          <label>Ambient Occlusion</label>
          <input type="checkbox" id="ao" ${settings.aoEnabled ? 'checked' : ''}>
        </div>
        <div class="setting-row">
          <label>Dynamic Resolution</label>
          <input type="checkbox" id="dynamicRes" ${settings.dynamicRes ? 'checked' : ''}>
        </div>
      </div>
      
      <div class="pause-buttons">
        <button class="pause-btn" id="resumeBtn">Resume</button>
        <button class="pause-btn secondary" id="quitBtn">Quit</button>
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
  
  document.getElementById('dynamicRes').addEventListener('change', (e) => {
    settings.dynamicRes = e.target.checked;
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