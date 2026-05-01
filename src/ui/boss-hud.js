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
        <h2 class="boss-name wonky" data-fill="var(--mallow-white)" data-stroke="var(--marsh-deep)" data-stroke-width="3">${typeName} #${marshmallow.spawnIndex + 1}</h2>
        <p class="boss-wave">Wave ${marshmallow.wave}</p>
      </div>
      <div class="boss-health-bar wonky" data-fill="rgba(255, 255, 255, 0.4)" data-stroke="var(--mallow-white)" data-stroke-width="4">
        <div class="boss-health-fill ${isDanger ? 'danger' : ''}" style="width: ${healthPercent}%"></div>
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