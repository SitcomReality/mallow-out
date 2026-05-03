export function createMarshmallowHUD() {
  const hud = document.getElementById('marshmallowHUD');
  
  function update(marshmallow) {
    if (!marshmallow) {
      hud.style.display = 'none';
      return;
    }
    
    const healthPercent = (marshmallow.currentHealth / marshmallow.maxHealth) * 100;
    const isDanger = healthPercent < 25;
    
    hud.innerHTML = `
      <div class="boss-info">
        <h2 class="boss-name wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">${marshmallow.name}</h2>
      </div>
      <div class="boss-health-bar wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4">
        <div class="boss-health-fill ${isDanger ? 'danger' : ''}" style="width: ${healthPercent}%; background: #32cd32;"></div>
      </div>
      <div class="health-text" style="text-align: center; font-size: 8px; color: #000; margin-top: 4px;">
        ${Math.ceil(marshmallow.currentHealth)} / ${marshmallow.maxHealth} HP
      </div>
    `;
    
    hud.style.display = 'block';
  }
  
  return {
    show() {
      hud.style.display = 'block';
    },
    hide() {
      hud.style.display = 'none';
    },
    update
  };
}