import * as THREE from 'three';
import { createEngine } from './engine.js';
import { createMainMaterial } from './render/material.js';
import { Player } from './player.js';
import { InputManager } from './input.js';
import { Gun, Flamethrower } from './weapons.js';
import { EnemyManager } from './enemies.js';
import { settings } from './state.js';
import { CONSTANTS } from './constants.js';
import { UIManager } from './ui/ui-manager.js';

export class Game {
  constructor(container) {
    const { renderer, scene, camera, quad, canvas } = createEngine(container);
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.quad = quad;
    this.canvas = canvas;
    
    this.player = new Player();
    this.input = new InputManager(canvas);
    this.gun = new Gun();
    this.flamethrower = new Flamethrower();
    this.currentWeapon = this.gun;
    this.enemyManager = new EnemyManager();
    
    this.time = 0;
    this.lastTime = performance.now();
    this.paused = false;
    
    // Create material
    const material = createMainMaterial();
    this.quad.material = material;
    this.uniforms = material.uniforms;
    
    // Set up input callbacks
    this.input.onMouseMove((dx, dy) => this.player.rotate(dx, dy));
    
    // Weapon switching
    window.addEventListener('keydown', e => {
      if (e.code === 'Digit1') this.currentWeapon = this.gun;
      if (e.code === 'Digit2') this.currentWeapon = this.flamethrower;
    });
    
    this.setupUniforms();
    
    // Create UI
    this.ui = new UIManager(container, this);
    
    this.animate();
  }
  
  setupUniforms() {
    this.uniforms.uFloorEnabled.value = 1.0;
    this.uniforms.uFloorColor.value.set(0.2, 0.22, 0.25);
    this.uniforms.uSkyColor.value.set(0.4, 0.5, 0.6);
    this.uniforms.uSkyColor2.value.set(0.15, 0.18, 0.22);
    this.uniforms.uMaxSteps.value = settings.maxSteps;
    this.uniforms.uDrawDist.value = settings.drawDistance;
  }
  
  handleWeapons(dt) {
    this.gun.update(dt);
    this.flamethrower.update(dt);
    
    const origin = this.player.position.clone();
    const direction = this.player.forward.clone();
    
    // Gun fire
    if (this.input.mouse.left && this.currentWeapon === this.gun) {
      const damage = this.gun.fire(origin, direction);
      if (damage) {
        const hitResult = this.enemyManager.checkGunHit(origin, direction);
        if (hitResult) {
          hitResult.enemy.takeDamage({
            origin: origin.clone(),
            direction: direction.clone(),
            radius: damage.radius,
            length: damage.length,
            hitPoint: hitResult.hitPoint,
          });
        }
      }
    }
    
    // Flamethrower
    if (this.input.mouse.right) {
      this.flamethrower.startFire();
      if (this.flamethrower.canDamage()) {
        const hits = this.enemyManager.checkFlameHit(
          origin, 
          direction, 
          this.flamethrower.getFlameData(origin, direction).length,
          this.flamethrower.getFlameData(origin, direction).radius
        );
        hits.forEach(enemy => {
          enemy.takeDamage({
            type: 'flame',
            radius: 0.1,
          });
        });
        this.flamethrower.applyDamage();
      }
    } else {
      this.flamethrower.stopFire();
    }
  }
  
  updateUniforms() {
    const u = this.uniforms;
    
    // Camera
    this.player.updateVectors();
    u.uCamPos.value.copy(this.player.position);
    u.uCamFwd.value.copy(this.player.forward);
    u.uCamRight.value.copy(this.player.right);
    u.uCamUp.value.copy(this.player.up);
    
    // Time
    u.uTime.value = this.time;
    u.uDayTime.value = 0.35; // Golden hour
    
    // Enemies - each enemy and all its FX form a group
    const enemies = this.enemyManager.enemies;
    let objCount = 0;
    
    enemies.forEach((enemy, enemyIdx) => {
      if (objCount >= 32) return;
      
      const enemyGroupId = enemyIdx + 1; // Unique group per enemy
      u.uGroupData.value[enemyGroupId - 1].set(0, 0.1, 0, 0); // Union the group into the world

      // Main enemy body: Standing cylinder (disc)
      u.uObjData0.value[objCount].set(2, 0, 0, enemyGroupId); // type=2 (cylinder), union within group
      u.uObjData1.value[objCount].copy(enemy.position).setW(0);
      u.uObjData2.value[objCount].set(enemy.radius, enemy.halfHeight, enemy.radius, 0);
      u.uObjData3.value[objCount].set(enemy.color.r, enemy.color.g, enemy.color.b, 0);
      u.uObjData4.value[objCount].set(enemy.rotation.x, enemy.rotation.y, enemy.rotation.z, 0);
      u.uObjData5.value[objCount].set(enemy.meltAmount * 0.3, 1.5, 0, 0);
      u.uObjData6.value[objCount].set(0, -enemy.meltAmount * 2, 0, 0);
      objCount++;
      
      // Add "eye" sphere on front face. The local unrotated front face is at +Y.
      if (objCount < 32) {
        const eyeLocalPos = new THREE.Vector3(0, enemy.halfHeight + 0.05, 0);
        const eyeWorldPos = enemy.localToWorld(eyeLocalPos);
        
        u.uObjData0.value[objCount].set(0, 0, 0, enemyGroupId); // sphere, union
        u.uObjData1.value[objCount].copy(eyeWorldPos).setW(0);
        u.uObjData2.value[objCount].set(0.15, 0.15, 0.15, 0);
        u.uObjData3.value[objCount].set(0.1, 0.1, 0.1, 0); // Dark eye
        u.uObjData4.value[objCount].set(0, 0, 0, 0);
        u.uObjData5.value[objCount].set(0, 0, 0, 0);
        u.uObjData6.value[objCount].set(0, 0, 0, 0);
        objCount++;
      }
      
      // Damage holes - transform from local to world space and subtract from enemy group
      enemy.damages.forEach(dmg => {
        if (objCount >= 32) return;
        
        const worldOrigin = enemy.localToWorld(dmg.localOrigin);
        const worldDir = enemy.localToWorldDir(dmg.localDirection);

        if (dmg.type === 'flame') {
          // Flame damage: small sphere subtraction
          u.uObjData0.value[objCount].set(0, 1, 0.05, enemyGroupId); // sphere, subtract from group
          u.uObjData1.value[objCount].copy(worldOrigin).setW(0);
          u.uObjData2.value[objCount].set(dmg.radius, dmg.radius, dmg.radius, 0);
          u.uObjData3.value[objCount].set(0, 0, 0, 0);
          u.uObjData4.value[objCount].set(0, 0, 0, 0);
          u.uObjData5.value[objCount].set(0, 0, 0, 0);
          u.uObjData6.value[objCount].set(0, 0, 0, 0);
          objCount++;
        } else {
          // Bullet hole: cylinder punched through enemy
          const holeLength = enemy.radius * 3.0; // Long enough to fully penetrate
          const holeMidpoint = worldOrigin.clone().add(worldDir.clone().multiplyScalar(holeLength * 0.5));
          
          u.uObjData0.value[objCount].set(2, 1, 0, enemyGroupId); // cylinder, subtract from group
          u.uObjData1.value[objCount].copy(holeMidpoint).setW(0);
          u.uObjData2.value[objCount].set(dmg.radius, holeLength * 0.5, dmg.radius, 0);
          u.uObjData3.value[objCount].set(0, 0, 0, 0);
          
          // Orient cylinder along the shot direction
          const pitch = Math.atan2(worldDir.y, Math.sqrt(worldDir.x * worldDir.x + worldDir.z * worldDir.z)) - Math.PI / 2;
          const yaw = Math.atan2(worldDir.x, worldDir.z);
          
          u.uObjData4.value[objCount].set(pitch, yaw, 0, 0);
          u.uObjData5.value[objCount].set(0, 0, 0, 0);
          u.uObjData6.value[objCount].set(0, 0, 0, 0);
          objCount++;
        }
      });
      
      // Blood splatters - transform from local to world space and add to group
      enemy.bloodSplatters.forEach(splatter => {
        if (objCount >= 32) return;
        
        const worldPos = enemy.localToWorld(splatter.localPosition);
        const fade = 1.0 - (splatter.time / CONSTANTS.BLOOD_DECAY_TIME);
        const size = splatter.size * (0.5 + fade * 0.5);
        
        u.uObjData0.value[objCount].set(0, 0, 0.2, enemyGroupId); // sphere, union within group
        u.uObjData1.value[objCount].copy(worldPos).setW(0);
        u.uObjData2.value[objCount].set(size, size, size, 0);
        u.uObjData3.value[objCount].set(0.6 * fade, 0.05 * fade, 0.05 * fade, 0);
        u.uObjData4.value[objCount].set(0, 0, 0, 0);
        u.uObjData5.value[objCount].set(0.2, 2.0, 0, 0);
        u.uObjData6.value[objCount].set(0, 0, 0, 0);
        objCount++;
      });
    });
    
    // Flamethrower visual
    const flameData = this.flamethrower.getFlameData(
      this.player.position.clone().add(this.player.forward.clone().multiplyScalar(0.5)),
      this.player.forward
    );
    
    if (flameData && objCount < 32) {
      const midpoint = flameData.origin.clone().add(flameData.direction.clone().multiplyScalar(flameData.length * 0.5));
      
      u.uObjData0.value[objCount].set(2, 0, 0, 0); // cylinder, union
      u.uObjData1.value[objCount].copy(midpoint).setW(0);
      u.uObjData2.value[objCount].set(flameData.radius, flameData.length * 0.5, flameData.radius, 0);
      u.uObjData3.value[objCount].set(1.0, 0.3, 0.05, 0); // Orange/red flame color
      
      const angle = Math.atan2(flameData.direction.x, flameData.direction.z);
      const tilt = Math.asin(flameData.direction.y);
      u.uObjData4.value[objCount].set(tilt, angle, 0, 0);
      u.uObjData5.value[objCount].set(0.8, 2.0, 0, 0); // Heavy noise
      u.uObjData6.value[objCount].set(0, -flameData.noiseOffset, 0, 0); // Animated noise
      objCount++;
    }
    
    u.uNumObjects.value = objCount;
  }
  
  setPaused(paused) {
    this.paused = paused;
  }
  
  setRenderScale(scale) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5) * scale);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.uniforms.uResolution.value.set(this.renderer.domElement.width, this.renderer.domElement.height);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    
    if (!this.paused) {
      this.time += dt;
      
      // Update game state
      this.player.update(dt, this.input.getMoveInput());
      this.enemyManager.update(dt, this.player.position);
      this.handleWeapons(dt);
    }
    
    // Update UI
    this.ui.update();
    
    // Update uniforms and render
    this.updateUniforms();
    this.renderer.render(this.scene, this.camera);
  }
}