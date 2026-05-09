import * as THREE from 'three';

export class FloatingTextRenderer {
  constructor(camera) {
    this.camera = camera;
    this.container = document.createElement('div');
    this.container.id = 'floatingTextContainer';
    this.container.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 60;
      font-family: 'Press Start 2P', monospace;
      font-weight: 900;
    `;
    
    // Inject keyframe styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rainbowPulse {
        0% { 
          color: #ff0000;
          transform: translate(-50%, -50%) scale(1.5);
        }
        20% { color: #ff7f00; }
        40% { color: #ffff00; }
        60% { color: #00ff00; }
        80% { color: #0000ff; }
        100% { 
          color: #8b00ff;
          transform: translate(-50%, -50%) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  render(texts) {
    // Clear previous frame
    this.container.innerHTML = '';
    
    for (const text of texts) {
      // Project 3D position to screen
      const screenPos = new THREE.Vector3().copy(text.position);
      screenPos.project(this.camera);
      
      // Skip if behind camera
      if (screenPos.z > 1) continue;
      
      const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
      
      const t = text.life / text.maxLife;
      const alpha = Math.min(1, t * 2); // Fade out in last half
      
      // Dynamic scale with pop-in effect
      const popScale = t > 0.9 ? (1 + (1 - (t - 0.9) / 0.1) * 0.5) : 1;
      const finalScale = text.scale * popScale;
      
      // Value-based size boost
      const value = parseFloat(text.text) || 0;
      const sizeBoost = value > 100 ? 1.5 : value > 50 ? 1.3 : value > 20 ? 1.2 : 1;
      
      const el = document.createElement('div');
      el.textContent = text.text;
      
      // Rainbow effect for high values
      const useRainbow = text.type === 'critical' || value > 50;
      const color = this.getTextColor(text.type, value);
      
      el.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%) scale(${finalScale * sizeBoost});
        opacity: ${alpha};
        text-shadow: 
          3px 3px 0 rgba(0,0,0,0.9),
          -2px -2px 0 rgba(0,0,0,0.9),
          2px -2px 0 rgba(0,0,0,0.9),
          -2px 2px 0 rgba(0,0,0,0.9),
          ${useRainbow ? '0 0 20px rgba(255,255,255,0.8)' : ''};
        font-size: ${text.type === 'critical' ? '48px' : '32px'};
        color: ${color};
        white-space: nowrap;
        font-weight: 900;
        ${useRainbow ? 'animation: rainbowPulse 0.3s ease-out;' : ''}
      `;
      
      this.container.appendChild(el);
    }
  }

  getTextColor(type, value = 0) {
    // High value gets rainbow gradient
    if (value > 100) {
      return 'transparent';
    }
    
    switch (type) {
      case 'critical': return '#ff00ff';
      case 'damage': return value > 50 ? '#ffff00' : value > 20 ? '#00ffff' : '#ffffff';
      case 'pollen': return '#ffb703';
      case 'caramel': return '#fb8500';
      case 'info': return '#74c69d';
      default: return '#ffffff';
    }
  }
}