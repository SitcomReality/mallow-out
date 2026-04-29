export function createBossHUD() {
  const hud = document.getElementById('bossHUD');
  
  function update(marshmallow) {
    if (!marshmallow) {
      hud.style.display = 'none';
      return;
    }
    
    const healthPercent = (marshmallow.currentHealth / marshmallow.maxHealth) * 100;
    const typeName = marshmallow.type ? marshmallow.type.name : 'Marshmallow';
    const isCritical = healthPercent <= 25;
    
    hud.innerHTML = `
      <div class="boss-info">
        <h2 class="boss-name">${typeName} #${marshmallow.spawnIndex + 1}</h2>
        <p class="boss-wave">Wave ${marshmallow.wave}</p>
      </div>
      <div class="boss-health-bar ${isCritical ? 'critical-pulse' : ''}">
        <div class="boss-health-fill" style="width: ${healthPercent}%; background: ${isCritical ? '#ff0000' : 'var(--jam-red)'}"></div>
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