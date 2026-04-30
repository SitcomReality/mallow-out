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
    this.weaponMesh.rotation.set(0, 0, 0); // Ensure consistent base rotation
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

  animateRecoil(amountZ, duration, amountY = 0) {
    if (!this.weaponMesh) return;
    
    if (!this.isAnimatingRecoil) {
      this.originalPos = this.weaponMesh.position.clone();
      this.originalRot = this.weaponMesh.rotation.clone();
    }
    
    this.isAnimatingRecoil = true;
    
    const startPos = this.originalPos.clone();
    const startRot = this.originalRot.clone();
    
    const kickbackPos = new THREE.Vector3(0, amountY, amountZ);
    const kickbackRot = amountZ * 0.6; // Pitch up
    
    const startTime = performance.now();
    
    const animate = () => {
      if (this.currentWeapon === -1) {
        this.isAnimatingRecoil = false;
        return;
      }
      
      const elapsed = (performance.now() - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      
      const kickT = Math.min(t / 0.15, 1.0);
      const recT = t > 0.15 ? (t - 0.15) / 0.85 : 0;
      
      const easeOutQuad = x => 1 - (1 - x) * (1 - x);
      const easeInOutQuad = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      
      if (t < 0.15) {
        const kt = easeOutQuad(kickT);
        this.weaponMesh.position.lerpVectors(startPos, startPos.clone().add(kickbackPos), kt);
        this.weaponMesh.rotation.x = startRot.x + kickbackRot * kt;
      } else {
        const rt = easeInOutQuad(recT);
        this.weaponMesh.position.lerpVectors(startPos.clone().add(kickbackPos), startPos, rt);
        this.weaponMesh.rotation.x = startRot.x + kickbackRot * (1 - rt);
      }
      
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this.weaponMesh.position.copy(startPos);
        this.weaponMesh.rotation.copy(startRot);
        this.isAnimatingRecoil = false;
      }
    };
    
    animate();
  }

  initMuzzleFlash() {
    if (this.muzzleFlash) return;

    this.muzzleFlash = new THREE.Group();
    
    this.mfCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), this.mfCoreMat);
    
    this.mfBurstMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending });
    const burstGeo = new THREE.ConeGeometry(0.3, 0.8, 6);
    burstGeo.rotateX(-Math.PI / 2);
    const burst = new THREE.Mesh(burstGeo, this.mfBurstMat);
    burst.position.z = -0.15;
    
    this.mfFlareMat = new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const flareGeo = new THREE.PlaneGeometry(0.8, 0.15);
    const flare1 = new THREE.Mesh(flareGeo, this.mfFlareMat);
    const flare2 = new THREE.Mesh(flareGeo, this.mfFlareMat);
    flare2.rotation.z = Math.PI / 2;
    
    this.muzzleFlash.add(core, burst, flare1, flare2);
    this.muzzleFlash.visible = false;
    this.camera.add(this.muzzleFlash);
  }

  createMuzzleFlash() {
    this.initMuzzleFlash();
    
    this.muzzleFlash.position.set(0.3, -0.2, -1.2);
    
    if (this.currentWeapon === 1) {
      this.mfBurstMat.color.setHex(0x9b59b6);
      this.mfFlareMat.color.setHex(0xd2b4de);
    } else if (this.currentWeapon === 3) {
      this.mfBurstMat.color.setHex(0xffffff);
      this.mfFlareMat.color.setHex(0xaaaaaa);
      this.muzzleFlash.position.set(0.3, 0.0, -0.8);
    } else {
      this.mfBurstMat.color.setHex(0xffaa00);
      this.mfFlareMat.color.setHex(0xffdd00);
    }
    
    this.muzzleFlash.visible = true;
    this.muzzleFlash.rotation.z = Math.random() * Math.PI;
    
    const startTime = performance.now();
    const duration = 0.08;
    
    const animate = () => {
      if (!this.muzzleFlash || !this.muzzleFlash.visible) return;
      
      const elapsed = (performance.now() - startTime) / 1000;
      const t = elapsed / duration;
      
      if (t >= 1) {
        this.muzzleFlash.visible = false;
        return;
      }
      
      const alpha = 1 - Math.pow(t, 2);
      const scale = 1 + t * 0.5;
      
      this.mfCoreMat.opacity = alpha;
      this.mfBurstMat.opacity = alpha * 0.8;
      this.mfFlareMat.opacity = alpha * 0.6;
      
      this.muzzleFlash.scale.setScalar(scale);
      
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
      this.isAnimatingRecoil = false;
      this.createWeaponMesh(weaponIndex);
      this.originalPos = this.weaponMesh.position.clone();
      this.originalRot = this.weaponMesh.rotation.clone();
    }
  }
}