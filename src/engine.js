import * as THREE from 'three';

export function createEngine(container) {
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  scene.add(quad);

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    if (quad.material && quad.material.uniforms.uResolution) {
      // Use actual drawing buffer dimensions to ensure the aspect ratio 
      // stays correct regardless of the render scale settings.
      quad.material.uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
    }
  });

  return { renderer, scene, camera, quad, canvas };
}