import * as THREE from 'three';
import { createEngine } from '../engine.js';
import { createMainMaterial } from '../render/material.js';
import { updateUniforms } from './uniforms.js';
import { settings, worldState } from '../state.js';

export function createRenderer(container) {
  const { renderer, scene, camera, quad } = createEngine(container);
  const material = createMainMaterial();
  quad.material = material;

  const uniforms = material.uniforms;
  
  let lastScale = -1;

  function render(time) {
    // Dynamic resolution application
    if (settings.renderScale !== lastScale) {
      const w = Math.floor(window.innerWidth * settings.renderScale);
      const h = Math.floor(window.innerHeight * settings.renderScale);
      renderer.setSize(w, h, false); // false = don't update CSS style
      uniforms.uResolution.value.set(w, h);
      lastScale = settings.renderScale;
    }

    updateUniforms(uniforms, time);
    renderer.render(scene, camera);
  }

  return { render, uniforms, renderer };
}