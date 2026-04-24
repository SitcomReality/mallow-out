import * as THREE from 'three';
import { CONSTANTS } from './constants.js';

export class Enemy {
  constructor(position) {
    this.position = position.clone();
    this.health = CONSTANTS.ENEMY_HEALTH;
    this.radius = CONSTANTS.ENEMY_RADIUS; // horizontal radius
    this.height = CONSTANTS.ENEMY_HEIGHT; // total height
    this.halfHeight = this.height * 0.5;
    this.damages = []; // Holes carved into this enemy
    this.bloodSplatters = []; // Visual feedback on hit
    this.meltAmount = 0;
    this.dead = false;
    this.color = new THREE.Color(0xff4444);
    this.rotation = new THREE.Euler(0, 0, 0);
    this.targetRotationY = 0;
    this.id = Math.random();
  }

  takeDamage(damageData) {
    this.health--;

    // Convert damage world origin to local space relative to enemy
    const localOrigin = damageData.origin.clone().sub(this.position);
    // Inverse rotate the origin and direction to lock it to the enemy's orientation
    const invRot = new THREE.Euler(-this.rotation.x, -this.rotation.y, -this.rotation.z, 'YXZ');
    localOrigin.applyEuler(invRot);
    const localDir = damageData.direction.clone().applyEuler(invRot);

    this.damages.push({
      ...damageData,
      localOrigin,
      localDirection: localDir
    });
    
    // Add blood splatter at hit location
    if (damageData.hitPoint) {
      this.bloodSplatters.push({
        position: damageData.hitPoint.clone(),
        time: 0,
        size: CONSTANTS.BLOOD_SPLATTER_SIZE
      });
    }

    if (this.health <= 0) {
      this.dead = true;
      this.meltAmount = 1.0;
    }
  }
  
  update(dt, playerPos) {
    if (this.dead) return;

    // Calculate direction to player
    const dir = new THREE.Vector3().subVectors(playerPos, this.position);
    dir.y = 0;
    
    // Calculate target rotation (where enemy should face)
    this.targetRotationY = Math.atan2(dir.x, dir.z);
    
    // Smoothly rotate toward target
    let rotDiff = this.targetRotationY - this.rotation.y;
    // Normalize angle difference to [-PI, PI]
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    
    const rotSpeed = 3.0; // radians per second
    if (Math.abs(rotDiff) > 0.1) {
      this.rotation.y += Math.sign(rotDiff) * Math.min(Math.abs(rotDiff), rotSpeed * dt);
    } else {
      this.rotation.y = this.targetRotationY;
    }
    
    // Tilt to "stand up" on edge
    this.rotation.x = Math.PI / 2;
    
    // Only move forward if mostly facing the player
    if (Math.abs(rotDiff) < 0.5 && dir.length() > 1.5) {
      const forward = new THREE.Vector3(Math.sin(this.rotation.y), 0, Math.cos(this.rotation.y));
      forward.multiplyScalar(CONSTANTS.ENEMY_MOVE_SPEED * dt);
      this.position.add(forward);
    }
    
    // Update blood splatters
    this.bloodSplatters = this.bloodSplatters.filter(splatter => {
      splatter.time += dt;
      return splatter.time < CONSTANTS.BLOOD_DECAY_TIME;
    });
  }
}

export class EnemyManager {
  constructor() {
    this.enemies = [];
    this.spawnTimer = 0;
  }
  
  update(dt, playerPos) {
    // Update enemies
    this.enemies.forEach(e => e.update(dt, playerPos));
    
    // Remove dead enemies after a delay
    this.enemies = this.enemies.filter(e => !e.dead || e.meltAmount < 5.0);
    this.enemies.forEach(e => {
      if (e.dead) e.meltAmount += dt * CONSTANTS.MELT_EFFECT_SPEED;
    });
    
    // Spawn new enemies
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < CONSTANTS.ENEMY_MAX_COUNT) {
      this.spawnEnemy(playerPos);
      this.spawnTimer = CONSTANTS.ENEMY_SPAWN_INTERVAL;
    }
  }
  
  spawnEnemy(playerPos) {
    const angle = Math.random() * Math.PI * 2;
    const distance = CONSTANTS.ENEMY_SPAWN_DISTANCE;
    const pos = new THREE.Vector3(
      playerPos.x + Math.cos(angle) * distance,
      0, // ground-level placement (y is center)
      playerPos.z + Math.sin(angle) * distance
    );
    this.enemies.push(new Enemy(pos));
  }
  
  checkFlameHit(origin, direction, length, radius) {
    const hits = [];
    this.enemies.forEach(enemy => {
      if (enemy.dead) return;
      
      // Project enemy position onto the flame ray to find closest point
      const toEnemy = new THREE.Vector3().subVectors(enemy.position, origin);
      const alongFlame = toEnemy.dot(direction);
      if (alongFlame < 0 || alongFlame > length) return;
      
      const closest = origin.clone().add(direction.clone().multiplyScalar(alongFlame));
      // Horizontal (xz) distance and vertical separation
      const dxz = Math.hypot(closest.x - enemy.position.x, closest.z - enemy.position.z);
      const dy = Math.abs(closest.y - enemy.position.y);
      
      // If within horizontal radius and within vertical half-height plus some tolerance, it's a hit
      if (dxz < (radius + enemy.radius) && dy < (enemy.halfHeight + 0.5)) {
        hits.push(enemy);
      }
    });
    return hits;
  }
  
  checkGunHit(origin, direction) {
    let closestEnemy = null;
    let closestDist = Infinity;
    let hitPoint = null;

    this.enemies.forEach(enemy => {
      if (enemy.dead) return;

      // Project enemy position onto the gun ray
      const toEnemy = new THREE.Vector3().subVectors(enemy.position, origin);
      const alongRay = toEnemy.dot(direction);
      if (alongRay <= 0) return;

      const closestPointOnRay = origin.clone().add(direction.clone().multiplyScalar(alongRay));
      const distToCenter = closestPointOnRay.distanceTo(enemy.position);

      // Hit detection for a standing disc
      if (distToCenter < enemy.radius && alongRay < closestDist) {
        closestDist = alongRay;
        closestEnemy = enemy;
        hitPoint = closestPointOnRay.clone();
      }
    });

    return closestEnemy ? { enemy: closestEnemy, hitPoint } : null;
  }
}