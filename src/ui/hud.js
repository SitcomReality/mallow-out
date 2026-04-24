__DELETE_ME__

export function createHUD() {
  const hud = document.getElementById('hud');
  
  hud.innerHTML = `
    <div class="weapon-bar">
      <div class="weapon-slot active" data-weapon="0">
        <span>🔫</span>
        <div class="key-hint">1</div>
      </div>
      <div class="weapon-slot" data-weapon="1">
        <span>?</span>
        <div class="key-hint">2</div>
      </div>
      <div class="weapon-slot" data-weapon="2">
        <span>?</span>
        <div class="key-hint">3</div>
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