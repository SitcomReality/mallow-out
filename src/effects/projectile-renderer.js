import * as THREE from 'three';

export class ProjectileRenderer {
  constructor(scene) {
    this.scene = scene;
    this.projectileMeshes = new Map();
  }

  update(projectiles) {
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
          opacity: 0.8
        });
        mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.projectileMeshes.set(i, mesh);
      }
      
      mesh.position.copy(proj.position);
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