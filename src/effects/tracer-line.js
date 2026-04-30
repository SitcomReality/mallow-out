import * as THREE from 'three';

export class TracerSystem {
  constructor(scene) {
    this.scene = scene;
    this.tracers = [];
    this.persistentBeams = new Map();
  }

  setPersistentBeam(id, start, end, color = 0xff6600) {
    let beam = this.persistentBeams.get(id);
    if (!beam) {
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const material = new THREE.LineBasicMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.8,
        linewidth: 3 
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      beam = { line, material };
      this.persistentBeams.set(id, beam);
    } else {
      beam.line.geometry.setFromPoints([start, end]);
      beam.line.geometry.attributes.position.needsUpdate = true;
    }
  }

  removePersistentBeam(id) {
    const beam = this.persistentBeams.get(id);
    if (beam) {
      this.scene.remove(beam.line);
      beam.line.geometry.dispose();
      beam.material.dispose();
      this.persistentBeams.delete(id);
    }
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
    
    for (const [id, beam] of this.persistentBeams) {
      this.scene.remove(beam.line);
      beam.line.geometry.dispose();
      beam.material.dispose();
    }
    this.persistentBeams.clear();
  }
}