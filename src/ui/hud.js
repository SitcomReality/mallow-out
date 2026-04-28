export function createHUD() {
  const hud = document.getElementById('hud');
  
  hud.innerHTML = `
    <div class="weapon-bar">
      <div class="weapon-slot active" data-weapon="0" title="Skewer - High recoil">
        <span>🗡️</span>
        <div class="key-hint">1</div>
      </div>
      <div class="weapon-slot" data-weapon="1" title="Globber - Slow projectile">
        <span>🟣</span>
        <div class="key-hint">2</div>
      </div>
      <div class="weapon-slot" data-weapon="2" title="Spatterer - Close range">
        <span>💥</span>
        <div class="key-hint">3</div>
      </div>
      <div class="weapon-slot" data-weapon="3" title="Cleaver - Requires charging">
        <span>🪓</span>
        <div class="key-hint">4</div>
      </div>
      <div class="weapon-slot" data-weapon="4" title="Melter - Overheats">
        <span>🔥</span>
        <div class="key-hint">5</div>
      </div>
    </div>
  `;
  
  return {
    show() {
      hud.style.display = 'block';
    },
    hide() {
      hud.style.display = 'none';
    },
    setActiveWeapon(index) {
      hud.querySelectorAll('.weapon-slot').forEach((slot, i) => {
        slot.classList.toggle('active', i === index);
      });
    }
  };
}