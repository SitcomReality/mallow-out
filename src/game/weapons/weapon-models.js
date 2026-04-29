import * as THREE from 'three';

export class WeaponModels {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.weaponMesh = null;
    this.muzzleFlash = null;
    this.currentWeapon = -1;
  }

  createWeaponMesh(weaponIndex) {
    // Correctly remove the old mesh from whichever parent it has (usually camera)
    if (this.weaponMesh) {
      if (this.weaponMesh.parent) {
        this.weaponMesh.parent.remove(this.weaponMesh);
      }
    }

    const geometry = this.getWeaponGeometry(weaponIndex);
    const material = new THREE.MeshBasicMaterial({ 
      color: this.getWeaponColor(weaponIndex),
      transparent: true,
      opacity: 0.9
    });
    
    this.weaponMesh = new THREE.Mesh(geometry, material);
    this.weaponMesh.position.set(0.3, -0.2, -0.5);
    this.weaponMesh.scale.set(0.15, 0.15, 0.15);
    
    // Ensure it renders on top of other particle/tracer effects
    this.weaponMesh.renderOrder = 100;
    
    this.camera.add(this.weaponMesh);
    this.currentWeapon = weaponIndex;
  }

  getWeaponColor(weaponIndex) {
    switch (weaponIndex) {
      case 0: return 0xd1d1d1; // Skewer - Steel
      case 1: return 0x9b59b6; // Globber - Purple
      case 2: return 0xe67e22; // Spatterer - Bronze
      case 3: return 0x7f8c8d; // Cleaver - Iron
      case 4: return 0xff4d00; // Melter - Hot Core
      default: return 0xffffff;
    }
  }

  getWeaponGeometry(weaponIndex) {
    switch (weaponIndex) {
      case 0: // Skewer - elongated cylinder
        const skewer = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        skewer.rotateX(Math.PI / 2); // Align with forward
        return skewer;
      case 1: // Globber - bulbous shape
        return new THREE.SphereGeometry(0.8, 12, 12);
      case 2: // Spatterer - spread barrel
        const cone = new THREE.ConeGeometry(0.5, 1.5, 6);
        cone.rotateX(-Math.PI / 2);
        return cone;
      case 3: // Cleaver - box/axe
        return new THREE.BoxGeometry(1.2, 1.5, 0.3);
      case 4: // Melter - glowing cylinder
        const melter = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
        melter.rotateX(Math.PI / 2);
        return melter;
      default:
        return new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }
  }

  animateRecoil(amount, duration) {
    if (!this.weaponMesh) return;
    
    const startPos = this.weaponMesh.position.clone();
    const kickback = new THREE.Vector3(0, 0, amount);
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      
      if (t < 0.2) {
        this.weaponMesh.position.lerp(startPos.clone().add(kickback), t / 0.2);
      } else {
        this.weaponMesh.position.lerp(startPos, (t - 0.2) / 0.8);
      }
      
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  createMuzzleFlash() {
    if (this.muzzleFlash) {
      this.scene.remove(this.muzzleFlash);
    }

    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 1
    });
    
    this.muzzleFlash = new THREE.Mesh(geometry, material);
    this.muzzleFlash.position.set(0.3, -0.2, -1.0);
    this.camera.add(this.muzzleFlash);
    
    const startTime = performance.now();
    const duration = 0.1;
    
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const t = elapsed / duration;
      
      if (t >= 1) {
        this.camera.remove(this.muzzleFlash);
        this.muzzleFlash = null;
        return;
      }
      
      this.muzzleFlash.material.opacity = 1 - t;
      this.muzzleFlash.scale.setScalar(1 + t);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  update() {
    // Keep weapon attached to camera
    if (this.weaponMesh && this.weaponMesh.parent !== this.camera) {
      this.camera.add(this.weaponMesh);
    }
  }

  setWeapon(weaponIndex) {
    if (this.currentWeapon !== weaponIndex) {
      this.createWeaponMesh(weaponIndex);
    }
  }
}