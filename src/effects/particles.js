import * as THREE from 'three';
import {
  BLOOD_PARTICLE_COUNT,
  BLOOD_PARTICLE_LIFETIME,
  BLOOD_PARTICLE_MIN_SPEED,
  BLOOD_PARTICLE_MAX_SPEED,
  BLOOD_PARTICLE_SIZE_START,
  BLOOD_PARTICLE_SIZE_END,
  BLOOD_PARTICLE_GRAVITY,
  BLOOD_PARTICLE_DRAG,
  BLOOD_COLOR_R,
  BLOOD_COLOR_G,
  BLOOD_COLOR_B,
  HOLE_SPRAY_PARTICLE_COUNT,
  HOLE_SPRAY_LIFETIME,
  HOLE_SPRAY_SPEED,
} from './particle-constants.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  createBloodSplatter(position, normal) {
    const count = BLOOD_PARTICLE_COUNT;
    
    for (let i = 0; i < count; i++) {
      // Random cone around the normal direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5; // Hemisphere
      
      const spread = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
      
      // Align with normal
      const up = new THREE.Vector3(0, 1, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
      spread.applyQuaternion(q);
      
      const speed = BLOOD_PARTICLE_MIN_SPEED + Math.random() * (BLOOD_PARTICLE_MAX_SPEED - BLOOD_PARTICLE_MIN_SPEED);
      
      this.particles.push({
        position: position.clone(),
        velocity: spread.multiplyScalar(speed),
        life: BLOOD_PARTICLE_LIFETIME,
        maxLife: BLOOD_PARTICLE_LIFETIME,
        size: BLOOD_PARTICLE_SIZE_START,
        color: { r: BLOOD_COLOR_R, g: BLOOD_COLOR_G, b: BLOOD_COLOR_B },
        type: 'blood',
      });
    }
  }

  createHoleSpray(position, direction) {
    const count = HOLE_SPRAY_PARTICLE_COUNT;
    
    for (let i = 0; i < count; i++) {
      const spread = direction.clone();
      spread.x += (Math.random() - 0.5) * 0.3;
      spread.y += (Math.random() - 0.5) * 0.3;
      spread.z += (Math.random() - 0.5) * 0.3;
      spread.normalize();
      
      this.particles.push({
        position: position.clone(),
        velocity: spread.multiplyScalar(HOLE_SPRAY_SPEED),
        life: HOLE_SPRAY_LIFETIME,
        maxLife: HOLE_SPRAY_LIFETIME,
        size: BLOOD_PARTICLE_SIZE_START * 0.8,
        color: { r: BLOOD_COLOR_R, g: BLOOD_COLOR_G, b: BLOOD_COLOR_B },
        type: 'spray',
      });
    }
  }

  update(delta) {
    const toRemove = [];
    
    for (const particle of this.particles) {
      particle.life -= delta;
      
      if (particle.life <= 0) {
        toRemove.push(particle);
        continue;
      }
      
      // Physics
      particle.velocity.y += BLOOD_PARTICLE_GRAVITY * delta;
      particle.velocity.multiplyScalar(BLOOD_PARTICLE_DRAG);
      
      particle.position.x += particle.velocity.x * delta;
      particle.position.y += particle.velocity.y * delta;
      particle.position.z += particle.velocity.z * delta;
      
      // Size fade
      const t = 1.0 - (particle.life / particle.maxLife);
      particle.size = BLOOD_PARTICLE_SIZE_START * (1 - t) + BLOOD_PARTICLE_SIZE_END * t;
    }
    
    // Remove dead particles
    for (const particle of toRemove) {
      const index = this.particles.indexOf(particle);
      if (index > -1) {
        this.particles.splice(index, 1);
      }
    }
  }

  clear() {
    this.particles = [];
  }

  getParticles() {
    return this.particles;
  }
}