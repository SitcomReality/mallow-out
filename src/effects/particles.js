import * as THREE from 'three';
import {
  MALLOW_SPLAT_COUNT,
  MALLOW_SPLAT_LIFETIME,
  MALLOW_SPLAT_MIN_SPEED,
  MALLOW_SPLAT_MAX_SPEED,
  MALLOW_SPLAT_GRAVITY,
  MALLOW_SPLAT_DRAG,
  MALLOW_SPLAT_SIZE_START,
  MALLOW_SPLAT_SIZE_END,
  COLOR_MALLOW,
  FLOOR_SPLASH_COUNT,
  FLOOR_SPLASH_LIFETIME,
  FLOOR_SPLASH_SPEED,
  FLOOR_SPLASH_GRAVITY,
  FLOOR_SPLASH_SIZE_START,
  FLOOR_SPLASH_SIZE_END,
  COLOR_FLOOR
} from './particle-constants.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  createMallowSplatter(position, normal) {
    // Normalize incoming position: accept either THREE.Vector3 or a plain {x,y,z} object
    const origin = (position && typeof position.clone === 'function')
      ? position.clone()
      : new THREE.Vector3(position.x || 0, position.y || 0, position.z || 0);

    for (let i = 0; i < MALLOW_SPLAT_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.7; // Wider hemisphere
      const spread = new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      spread.applyQuaternion(q);
      
      const speed = MALLOW_SPLAT_MIN_SPEED + Math.random() * (MALLOW_SPLAT_MAX_SPEED - MALLOW_SPLAT_MIN_SPEED);
      this.particles.push({
        position: origin.clone(),
        velocity: spread.multiplyScalar(speed),
        life: MALLOW_SPLAT_LIFETIME * (0.8 + Math.random() * 0.4),
        maxLife: MALLOW_SPLAT_LIFETIME,
        size: MALLOW_SPLAT_SIZE_START,
        color: { ...COLOR_MALLOW },
        gravity: MALLOW_SPLAT_GRAVITY,
        drag: MALLOW_SPLAT_DRAG,
        sizeStart: MALLOW_SPLAT_SIZE_START,
        sizeEnd: MALLOW_SPLAT_SIZE_END
      });
    }
  }

  createFloorSplash(position) {
    // Normalize incoming position: accept either THREE.Vector3 or a plain {x,y,z} object
    const origin = (position && typeof position.clone === 'function')
      ? position.clone()
      : new THREE.Vector3(position.x || 0, position.y || 0, position.z || 0);

    for (let i = 0; i < FLOOR_SPLASH_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const up = 0.5 + Math.random() * 0.5;
      const velocity = new THREE.Vector3(Math.cos(angle), up, Math.sin(angle)).normalize().multiplyScalar(FLOOR_SPLASH_SPEED * (0.5 + Math.random() * 0.5));
      
      this.particles.push({
        position: origin.clone(),
        velocity,
        life: FLOOR_SPLASH_LIFETIME * (0.7 + Math.random() * 0.6),
        maxLife: FLOOR_SPLASH_LIFETIME,
        size: FLOOR_SPLASH_SIZE_START,
        color: { ...COLOR_FLOOR },
        gravity: FLOOR_SPLASH_GRAVITY,
        drag: 0.92,
        sizeStart: FLOOR_SPLASH_SIZE_START,
        sizeEnd: FLOOR_SPLASH_SIZE_END
      });
    }
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.velocity.y += p.gravity * delta;
      p.velocity.multiplyScalar(p.drag);
      p.position.addScaledVector(p.velocity, delta);
      const t = 1.0 - (p.life / p.maxLife);
      p.size = p.sizeStart * (1 - t) + p.sizeEnd * t;
    }
  }

  clear() { this.particles = []; }
  getParticles() { return this.particles; }
}