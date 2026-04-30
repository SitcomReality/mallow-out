import * as THREE from 'three';

export class ProjectileRenderer {
  constructor(scene) {
    this.scene = scene;
    this.projectileMeshes = new Map();
    // Default visual opacity for projectiles; used as the starting alpha.
    this._baseOpacity = 0.8;
  }

  update(projectiles) {
    // Remove old meshes (indices correspond to projectile array order)
    const currentIds = new Set(projectiles.map((p, i) => i));
    for (const [id, mesh] of this.projectileMeshes) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.projectileMeshes.delete(id);
      }
    }

    // Update/create meshes and drive their opacity from remaining life so they fade to fully transparent
    projectiles.forEach((proj, i) => {
      let mesh = this.projectileMeshes.get(i);
      
      if (!mesh) {
        const geometry = new THREE.SphereGeometry(proj.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
          color: 0x9b59b6,
          transparent: true,
          opacity: this._baseOpacity,
          depthWrite: false // let fog blend through instead of writing depth which can cause dark silhouettes
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 50;
        this.scene.add(mesh);
        this.projectileMeshes.set(i, mesh);
      }
      
      // Position update
      mesh.position.copy(proj.position);

      // Compute alpha based on life ratio (proj.life / proj.maxLife). Clamp to [0,1].
      // If maxLife is not provided, fall back to 1 to avoid division by zero.
      const lifeRatio = (proj.maxLife && proj.maxLife > 0) ? (proj.life / proj.maxLife) : 0;
      const clamped = Math.max(0, Math.min(1, lifeRatio));
      // Fade linearly to zero alpha; multiply by base opacity to preserve intended starting strength.
      mesh.material.opacity = clamped * this._baseOpacity;

      // If fully transparent, hide to avoid unnecessary draw calls
      mesh.visible = mesh.material.opacity > 0.005;
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