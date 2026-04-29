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
      font-family: 'Comic Neue', cursive;
      font-weight: 900;
    `;
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
      
      const el = document.createElement('div');
      el.textContent = text.text;
      el.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%) scale(${text.scale});
        opacity: ${alpha};
        text-shadow: 
          2px 2px 0 rgba(0,0,0,0.8),
          -1px -1px 0 rgba(0,0,0,0.8),
          1px -1px 0 rgba(0,0,0,0.8),
          -1px 1px 0 rgba(0,0,0,0.8);
        font-size: ${text.type === 'critical' ? '32px' : '24px'};
        color: ${this.getTextColor(text.type)};
        white-space: nowrap;
      `;
      
      this.container.appendChild(el);
    }
  }

  getTextColor(type) {
    switch (type) {
      case 'critical': return '#ff4d6d';
      case 'damage': return '#ffffff';
      case 'pollen': return '#ffb703';
      case 'caramel': return '#fb8500';
      case 'info': return '#74c69d';
      default: return '#ffffff';
    }
  }
}