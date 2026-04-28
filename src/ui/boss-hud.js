export function createBossHUD() {
  const hud = document.getElementById('bossHUD');
  
  function update(marshmallow) {
    if (!marshmallow) {
      hud.style.display = 'none';
      return;
    }
    
    const healthPercent = (marshmallow.currentHealth / marshmallow.maxHealth) * 100;
    
    hud.innerHTML = `
      <div class="boss-info">
        <h2 class="boss-name">Marshmallow #${marshmallow.spawnIndex + 1}</h2>
        <p class="boss-wave">Wave ${marshmallow.wave}</p>
      </div>
      <div class="boss-health-bar">
        <div class="boss-health-fill" style="width: ${healthPercent}%"></div>
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