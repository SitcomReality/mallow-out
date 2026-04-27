import * as THREE from 'three';
import { createEngine } from '../engine.js';
import { createMainMaterial } from '../render/material.js';
import { updateUniforms } from './uniforms.js';
import { settings, worldState } from '../state.js';
import { PostProcessor } from '../render/post-process.js';
import { ParticleRenderer } from '../effects/particle-renderer.js';

export function createRenderer(container) {
  const { renderer, scene, camera, quad } = createEngine(container);
  const material = createMainMaterial();
  quad.material = material;

  const uniforms = material.uniforms;
  
  // Create particle renderer
  const particleRenderer = new ParticleRenderer();
  scene.add(particleRenderer.mesh);
  
  // Create post-processor
  const postProcessor = new PostProcessor(renderer);
  
  let lastScale = -1;

  function render(time, particleSystem) {
    // Dynamic resolution application
    if (settings.renderScale !== lastScale) {
      const w = Math.floor(window.innerWidth * settings.renderScale);
      const h = Math.floor(window.innerHeight * settings.renderScale);
      renderer.setSize(w, h, false); // false = don't update CSS style
      uniforms.uResolution.value.set(w, h);
      postProcessor.resize(w, h);
      lastScale = settings.renderScale;
    }

    updateUniforms(uniforms, time);
    
    // Update particles
    if (particleSystem) {
      particleRenderer.update(particleSystem.getParticles(), camera);
    }
    
    // Render with post-processing
    postProcessor.render(scene, camera);
  }

  return { render, uniforms, renderer, postProcessor };
}