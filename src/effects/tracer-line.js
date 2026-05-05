import * as THREE from 'three';

export class TracerSystem {
  constructor(scene) {
    this.scene = scene;
    this.tracers = [];
  }

  createTracer(start, end, color = 0xffff00, isCharged = false) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    
    // linewidth is only supported in specific browsers/drivers, but we can try to differentiate
    const material = new THREE.LineBasicMaterial({ 
      color: isCharged ? 0xffffff : color,
      transparent: true,
      opacity: 1,
      linewidth: isCharged ? 4 : 2
    });

    if (isCharged) {
       // Make charged tracer white with yellow core (simulated by adding two lines)
       const materialGlow = new THREE.LineBasicMaterial({ 
         color: 0xffff00,
         transparent: true,
         opacity: 0.6,
         linewidth: 8
       });
       const lineGlow = new THREE.Line(geometry, materialGlow);
       lineGlow.renderOrder = 9998;
       this.scene.add(lineGlow);
       this.tracers.push({
         line: lineGlow,
         life: 0.25,
         maxLife: 0.25
       });
    }
    
    // Ensure tracers always render on top of the SDF by disabling depth testing/writing
    material.depthTest = false;
    material.depthWrite = false;
    
    const line = new THREE.Line(geometry, material);
    // Make sure it renders after other objects in the same scene
    line.renderOrder = 9999;
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