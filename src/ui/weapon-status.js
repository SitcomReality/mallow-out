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

  // Inject animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes mallow-ready-pulse {
      0% { transform: scale(1); filter: brightness(1); }
      100% { transform: scale(1.1); filter: brightness(1.5); }
    }
    @keyframes mallow-shake {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      20% { transform: translate(-1px, -1px) rotate(-1deg); }
      40% { transform: translate(-2px, 0px) rotate(1deg); }
      60% { transform: translate(2px, 1px) rotate(0deg); }
      80% { transform: translate(1px, -1px) rotate(1deg); }
      100% { transform: translate(-1px, 1px) rotate(0deg); }
    }
  `;
  document.head.appendChild(style);

  function updateCleaverCharge(charge, maxCharge) {
    const percent = (charge / maxCharge) * 100;
    const isReady = charge >= maxCharge;
    const barColor = isReady ? '#ffffff' : 'linear-gradient(90deg, #ffb703, #fb8500)';
    const animation = isReady ? 'mallow-ready-pulse 0.4s infinite alternate ease-in-out' : 'none';
    
    container.innerHTML = `
      <div class="wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4" style="
        padding: 8px 20px;
        min-width: 200px;
        animation: ${animation};
      ">
        <div style="text-align: center; color: #000000; font-size: 8px; font-weight: 400; margin-bottom: 4px;">
          ${isReady ? 'READY!' : 'CHARGING'}
        </div>
        <div class="wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2" style="
          height: 12px;
          overflow: hidden;
        ">
          <div style="
            background: ${isReady ? '#32cd32' : '#ffd700'};
            height: 100%;
            width: ${percent}%;
            transition: width 0.1s;
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