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
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.targetRotationY = 0;
    this.id = Math.random();
  }

  takeDamage(damageData) {
    this.health--;

    // Store damage in local space (enemy-relative coordinates)
    const localOrigin = this.worldToLocal(damageData.origin);
    const localDir = this.worldToLocalDir(damageData.direction);

    this.damages.push({
      type: damageData.type || 'bullet',
      localOrigin,
      localDirection: localDir,
      radius: damageData.radius,
      length: damageData.length
    });
    
    // Store blood splatter in local space too
    if (damageData.hitPoint) {
      const localHitPoint = this.worldToLocal(damageData.hitPoint);
      this.bloodSplatters.push({
        localPosition: localHitPoint,
        time: 0,
        size: CONSTANTS.BLOOD_SPLATTER_SIZE
      });
    }

    if (this.health <= 0) {
      this.dead = true;
      this.meltAmount = 1.0;
    }
  }
  
  // Transform world position to local space
  worldToLocal(worldPos) {
    const q = new THREE.Quaternion().setFromEuler(this.rotation);
    const invQ = q.invert();
    return worldPos.clone().sub(this.position).applyQuaternion(invQ);
  }
  
  // Transform world direction to local space
  worldToLocalDir(worldDir) {
    const q = new THREE.Quaternion().setFromEuler(this.rotation);
    const invQ = q.invert();
    return worldDir.clone().applyQuaternion(invQ);
  }
  
  // Transform local position to world space
  localToWorld(localPos) {
    const q = new THREE.Quaternion().setFromEuler(this.rotation);
    return localPos.clone().applyQuaternion(q).add(this.position);
  }
  
  // Transform local direction to world space
  localToWorldDir(localDir) {
    const q = new THREE.Quaternion().setFromEuler(this.rotation);
    return localDir.clone().applyQuaternion(q);
  }
  
  update(dt, playerPos) {
    if (this.dead) return;

    // Calculate direction to player (in XZ plane)
    const toPlayer = new THREE.Vector3(
      playerPos.x - this.position.x,
      0,
      playerPos.z - this.position.z
    );
    const distToPlayer = toPlayer.length();
    
    if (distToPlayer > 0.1) {
      toPlayer.normalize();
      
      // Calculate target facing direction (yaw only)
      // Enemy should face the player with its "front" (which is the +Z face in local space)
      this.targetRotationY = Math.atan2(toPlayer.x, toPlayer.z);
      
      // Smoothly rotate toward target
      let rotDiff = this.targetRotationY - this.rotation.y;
      // Normalize angle difference to [-PI, PI]
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      
      const rotSpeed = 3.0; // radians per second
      const rotAmount = Math.sign(rotDiff) * Math.min(Math.abs(rotDiff), rotSpeed * dt);
      this.rotation.y += rotAmount;
    }
    
    // Stand the disc upright (rotate 90° around X axis)
    this.rotation.x = Math.PI / 2;
    this.rotation.z = 0;
    
    // Move forward when facing the player and not too close
    const facingError = Math.abs(this.targetRotationY - this.rotation.y);
    if (facingError < 0.3 && distToPlayer > 1.5) {
      // Move in the direction the enemy is facing
      const forward = new THREE.Vector3(
        Math.sin(this.rotation.y),
        0,
        Math.cos(this.rotation.y)
      );
      this.position.add(forward.multiplyScalar(CONSTANTS.ENEMY_MOVE_SPEED * dt));
    }
    
    // Update blood splatter timers (they stay in local space, just age)
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
      const dist = closest.distanceTo(enemy.position);
      
      // Simple sphere bounding hit detection for flame
      if (dist < radius + enemy.radius) {
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

      // Enemy front face normal (local +Y is the cylinder's face)
      const normal = enemy.localToWorldDir(new THREE.Vector3(0, 1, 0));
      // Point on the front face
      const planePoint = enemy.localToWorld(new THREE.Vector3(0, enemy.halfHeight, 0));

      // Ray-Plane intersection
      const denom = direction.dot(normal);
      // We allow hitting from front or back
      if (Math.abs(denom) > 1e-6) {
        const t = planePoint.clone().sub(origin).dot(normal) / denom;
        if (t > 0 && t < closestDist) {
          const pt = origin.clone().add(direction.clone().multiplyScalar(t));
          // Check if point is within the radius of the disc
          const localPt = enemy.worldToLocal(pt);
          // In local space, the disc is a cylinder along Y. So we check X and Z distance.
          const distXZ = Math.hypot(localPt.x, localPt.z);
          if (distXZ <= enemy.radius) {
            closestDist = t;
            closestEnemy = enemy;
            hitPoint = pt;
          }
        }
      }
    });

    return closestEnemy ? { enemy: closestEnemy, hitPoint } : null;
  }
}