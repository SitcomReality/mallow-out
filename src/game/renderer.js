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
  
  // Set initial render buffer size
  uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);

  function render(time) {
    updateUniforms(uniforms, time);
    renderer.render(scene, camera);
  }

  return { render, uniforms, renderer };
}