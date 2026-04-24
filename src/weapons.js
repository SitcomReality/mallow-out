import * as THREE from 'three';
import { CONSTANTS } from './constants.js';

export class Weapon {
  constructor(type) {
    this.type = type;
    this.cooldown = 0;
    this.active = false;
  }
  
  update(dt) {
    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }
  }
  
  canFire() {
    return this.cooldown <= 0;
  }
}

export class Gun extends Weapon {
  constructor() {
    super('gun');
    this.damages = []; // Array of damage cylinders
  }
  
  fire(origin, direction) {
    if (!this.canFire()) return null;
    
    this.cooldown = CONSTANTS.GUN_FIRE_RATE;
    
    // Create damage cylinder along the ray
    const damage = {
      origin: origin.clone(),
      direction: direction.clone(),
      radius: CONSTANTS.GUN_DAMAGE_RADIUS,
      length: CONSTANTS.GUN_DAMAGE_LENGTH,
      time: 0,
    };
    
    this.damages.push(damage);
    
    // Limit damage array size
    if (this.damages.length > 50) {
      this.damages.shift();
    }
    
    return damage;
  }
}

export class Flamethrower extends Weapon {
  constructor() {
    super('flamethrower');
    this.damageCooldown = 0;
    this.noiseOffset = 0;
  }
  
  update(dt) {
    super.update(dt);
    if (this.active) {
      this.noiseOffset += dt * CONSTANTS.FLAME_NOISE_SPEED;
      if (this.damageCooldown > 0) {
        this.damageCooldown -= dt;
      }
    }
  }
  
  startFire() {
    this.active = true;
  }
  
  stopFire() {
    this.active = false;
  }
  
  canDamage() {
    return this.active && this.damageCooldown <= 0;
  }
  
  applyDamage() {
    this.damageCooldown = CONSTANTS.FLAME_DAMAGE_RATE;
  }
  
  getFlameData(origin, direction) {
    if (!this.active) return null;
    
    return {
      origin: origin.clone(),
      direction: direction.clone(),
      length: CONSTANTS.FLAME_LENGTH,
      radius: CONSTANTS.FLAME_RADIUS,
      noiseOffset: this.noiseOffset,
    };
  }
}