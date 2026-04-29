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
      <div style="
        background: ${isReady ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'};
        backdrop-filter: blur(10px);
        border: 4px solid white;
        border-radius: 100px;
        padding: 8px 20px;
        min-width: 200px;
        animation: ${animation};
        box-shadow: ${isReady ? '0 0 20px rgba(255,255,255,0.5)' : 'none'};
      ">
        <div style="text-align: center; color: white; font-size: 12px; font-weight: 900; margin-bottom: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
          ${isReady ? 'READY!' : 'CHARGING'}
        </div>
        <div style="
          background: rgba(0,0,0,0.3);
          border-radius: 100px;
          height: 12px;
          overflow: hidden;
        ">
          <div style="
            background: ${barColor};
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
    
    let color = '#ffb703'; // Yellow
    let animation = 'none';
    
    if (overheated) {
      color = '#ff4d6d'; // Red
      animation = 'mallow-shake 0.1s infinite';
    } else if (percent > 85) {
      color = '#ff4d6d'; // Red
      animation = 'mallow-shake 0.2s infinite';
    } else if (percent > 60) {
      color = '#fb8500'; // Orange
    }

    container.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 3px solid white;
        border-radius: 100px;
        padding: 8px 20px;
        min-width: 200px;
        animation: ${animation};
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