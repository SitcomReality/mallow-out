import * as THREE from 'three';

export class TracerSystem {
  constructor(scene) {
    this.scene = scene;
    this.tracers = [];
  }

  createTracer(start, end, color = 0xffff00) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ 
      color,
      transparent: true,
      opacity: 1,
      linewidth: 2
    });
    
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    
    const tracer = {
      line,
      life: 0.15,
      maxLife: 0.15
    };
    
    this.tracers.push(tracer);
  }

  update(delta) {
    const toRemove = [];
    
    for (const tracer of this.tracers) {
      tracer.life -= delta;
      
      if (tracer.life <= 0) {
        this.scene.remove(tracer.line);
        tracer.line.geometry.dispose();
        tracer.line.material.dispose();
        toRemove.push(tracer);
        continue;
      }
      
      tracer.line.material.opacity = tracer.life / tracer.maxLife;
    }
    
    for (const tracer of toRemove) {
      const idx = this.tracers.indexOf(tracer);
      if (idx > -1) this.tracers.splice(idx, 1);
    }
  }

  clear() {
    for (const tracer of this.tracers) {
      this.scene.remove(tracer.line);
      tracer.line.geometry.dispose();
      tracer.line.material.dispose();
    }
    this.tracers = [];
  }
}