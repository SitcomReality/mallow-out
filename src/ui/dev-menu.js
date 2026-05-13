import { devState } from '../game/dev-state.js';

export function createDevMenu() {
  const menu = document.createElement('div');
  menu.id = 'devMenu';
  menu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    color: #00ff00;
    padding: 24px;
    border: 3px solid #00ff00;
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    z-index: 9999;
    display: none;
    min-width: 400px;
  `;
  
  document.body.appendChild(menu);
  
  function render() {
    menu.innerHTML = `
      <div style="margin-bottom: 20px; text-align: center; color: #ffff00;">
        DEV MENU (~ to toggle)
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <label style="display: flex; justify-content: space-between; cursor: pointer;">
          <span>Freeze Movement</span>
          <input type="checkbox" id="devFreezeMovement" ${devState.freezeMovement ? 'checked' : ''}>
        </label>
        <label style="display: flex; justify-content: space-between; cursor: pointer;">
          <span>Disable Healing</span>
          <input type="checkbox" id="devDisableHealing" ${devState.disableHealing ? 'checked' : ''}>
        </label>
        <label style="display: flex; justify-content: space-between; cursor: pointer;">
          <span>Disable Hit Effects</span>
          <input type="checkbox" id="devDisableHitEffects" ${devState.disableHitEffects ? 'checked' : ''}>
        </label>
        <label style="display: flex; justify-content: space-between; cursor: pointer;">
          <span>Show Goo (Union)</span>
          <input type="checkbox" id="devShowGoo" ${devState.showGoo ? 'checked' : ''}>
        </label>
      </div>
      <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #00ff00; font-size: 8px; color: #888;">
        Use these toggles to debug damage chunks and healing behavior
      </div>
    `;
    
    menu.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = e.target.id;
        if (id === 'devFreezeMovement') devState.freezeMovement = e.target.checked;
        if (id === 'devDisableHealing') devState.disableHealing = e.target.checked;
        if (id === 'devDisableHitEffects') devState.disableHitEffects = e.target.checked;
        if (id === 'devShowGoo') devState.showGoo = e.target.checked;
      });
    });
  }
  
  function toggle() {
    devState.enabled = !devState.enabled;
    menu.style.display = devState.enabled ? 'block' : 'none';
    if (devState.enabled) render();
  }
  
  // Add keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      toggle();
    }
  });
  
  return { toggle, render };
}