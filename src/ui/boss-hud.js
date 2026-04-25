export function createBossHUD() {
  const hud = document.getElementById('bossHUD');
  
  function update(boss) {
    if (!boss) {
      hud.style.display = 'none';
      return;
    }
    
    const healthPercent = (boss.currentHealth / boss.maxHealth) * 100;
    
    hud.innerHTML = `
      <div class="boss-info">
        <h2 class="boss-name">Giant Marshmallow</h2>
        <p class="boss-wave">Wave ${boss.wave}</p>
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