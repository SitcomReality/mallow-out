export function createBossHUD() {
  const hud = document.getElementById('bossHUD');
  
  function update(marshmallow) {
    if (!marshmallow) {
      hud.style.display = 'none';
      return;
    }
    
    const healthPercent = (marshmallow.currentHealth / marshmallow.maxHealth) * 100;
    const typeName = marshmallow.type ? marshmallow.type.name : 'Marshmallow';
    const isDanger = healthPercent < 25;
    
    hud.innerHTML = `
      <div class="boss-info">
        <h2 class="boss-name wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="3">${typeName} #${marshmallow.spawnIndex + 1}</h2>
        <p class="boss-wave" style="font-size: 8px; color: #000000;">Wave ${marshmallow.wave}</p>
      </div>
      <div class="boss-health-bar wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4">
        <div class="boss-health-fill ${isDanger ? 'danger' : ''}" style="width: ${healthPercent}%; background: #32cd32;"></div>
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