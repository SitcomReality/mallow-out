export function createWeaponStatus() {
  const container = document.createElement('div');
  container.id = 'weaponStatus';
  container.style.cssText = `
    position: fixed;
    bottom: 110px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 60;
  `;
  document.body.appendChild(container);

  function updateCleaverCharge(charge, maxCharge) {
    const percent = (charge / maxCharge) * 100;
    container.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 3px solid white;
        border-radius: 100px;
        padding: 8px 20px;
        min-width: 200px;
      ">
        <div style="text-align: center; color: white; font-size: 12px; font-weight: 900; margin-bottom: 4px;">
          CHARGING
        </div>
        <div style="
          background: rgba(0,0,0,0.3);
          border-radius: 100px;
          height: 12px;
          overflow: hidden;
        ">
          <div style="
            background: linear-gradient(90deg, #ffb703, #fb8500);
            height: 100%;
            width: ${percent}%;
            transition: width 0.1s;
            border-radius: 100px;
          "></div>
        </div>
      </div>
    `;
  }

  function updateMelterHeat(heat, maxHeat, overheated) {
    const percent = (heat / maxHeat) * 100;
    const color = overheated ? '#ff4d6d' : '#ffb703';
    container.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 3px solid white;
        border-radius: 100px;
        padding: 8px 20px;
        min-width: 200px;
      ">
        <div style="text-align: center; color: white; font-size: 12px; font-weight: 900; margin-bottom: 4px;">
          ${overheated ? 'OVERHEATED!' : 'HEAT'}
        </div>
        <div style="
          background: rgba(0,0,0,0.3);
          border-radius: 100px;
          height: 12px;
          overflow: hidden;
        ">
          <div style="
            background: ${color};
            height: 100%;
            width: ${percent}%;
            transition: width 0.1s;
            border-radius: 100px;
          "></div>
        </div>
      </div>
    `;
  }

  function hide() {
    container.innerHTML = '';
  }

  return {
    updateCleaverCharge,
    updateMelterHeat,
    hide
  };
}