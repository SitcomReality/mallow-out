import * as THREE from 'three';

export class ProjectileRenderer {
  constructor(scene) {
    this.scene = scene;
    this.projectileMeshes = new Map();
  }

  update(projectiles, camera) {
    // Remove old meshes
    const currentIds = new Set(projectiles.map((p, i) => i));
    for (const [id, mesh] of this.projectileMeshes) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.projectileMeshes.delete(id);
      }
    }

    // Update/create meshes
    projectiles.forEach((proj, i) => {
      let mesh = this.projectileMeshes.get(i);
      
      if (!mesh) {
        const geometry = new THREE.SphereGeometry(proj.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
          color: 0x9b59b6,
          transparent: true,
          opacity: 1.0,
          fog: false // Disable Three.js fog to handle fading manually for perfect world matching
        });
        mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.projectileMeshes.set(i, mesh);
      }
      
      mesh.position.copy(proj.position);
      
      // Calculate fading
      // 1. Lifetime fade (fast fade out in the last 0.5s)
      const lifetimeFade = Math.min(1.0, proj.lifetime / 0.5);
      
      // 2. Distance fade (fade out into the fog)
      // We want them to be 100% transparent by the time they reach the dense fog distance
      const dist = camera.position.distanceTo(proj.position);
      const fogStart = 20;
      const fogEnd = 60;
      const distFade = 1.0 - THREE.MathUtils.smoothstep(dist, fogStart, fogEnd);
      
      mesh.material.opacity = Math.min(lifetimeFade, distFade);
    });
  }

  clear() {
    for (const [id, mesh] of this.projectileMeshes) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.projectileMeshes.clear();
  }
}