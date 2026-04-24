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
    this.meltAmount = 0;
    this.dead = false;
    this.color = new THREE.Color(0xff4444);
    this.id = Math.random();
  }
  
  takeDamage(damageData) {
    this.health--;
    this.damages.push(damageData);
    
    if (this.health <= 0) {
      this.dead = true;
      this.meltAmount = 1.0;
    }
  }
  
  update(dt, playerPos) {
    if (this.dead) return;
    
    // Move toward player on the XZ plane
    const dir = new THREE.Vector3().subVectors(playerPos, this.position);
    dir.y = 0;
    if (dir.length() > 1.5) {
      dir.normalize().multiplyScalar(CONSTANTS.ENEMY_MOVE_SPEED * dt);
      this.position.add(dir);
    }
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
    
    this.enemies.forEach(enemy => {
      if (enemy.dead) return;
      
      const toEnemy = new THREE.Vector3().subVectors(enemy.position, origin);
      const alongRay = toEnemy.dot(direction);
      if (alongRay <= 0) return;
      
      const closest = origin.clone().add(direction.clone().multiplyScalar(alongRay));
      const dxz = Math.hypot(closest.x - enemy.position.x, closest.z - enemy.position.z);
      const dy = Math.abs(closest.y - enemy.position.y);
      
      // Treat enemy as a short upright cylinder: require horizontal distance within radius and vertical within halfHeight tolerance
      if (dxz < enemy.radius && dy < (enemy.halfHeight + 0.5) && alongRay < closestDist) {
        closestDist = alongRay;
        closestEnemy = enemy;
      }
    });
    
    return closestEnemy;
  }
}