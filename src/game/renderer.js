import * as THREE from 'three';
import { createEngine } from '../engine.js';
import { createMainMaterial } from '../render/material.js';
import { updateUniforms } from './uniforms.js';
import { settings, worldState } from '../state.js';
import { gameState } from './state.js';
import { PostProcessor } from '../render/post-process.js';
import { ParticleRenderer } from '../effects/particle-renderer.js';

export function createRenderer(container) {
  const { renderer, scene, camera, quad } = createEngine(container);
  const material = createMainMaterial();
  quad.material = material;

  const uniforms = material.uniforms;
  
  // Create a separate scene and perspective camera for 3D effects (particles)
  const particleScene = new THREE.Scene();
  const particleCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  // Create particle renderer
  const particleRenderer = new ParticleRenderer();
  particleScene.add(particleRenderer.mesh);
  
  // Create post-processor
  const postProcessor = new PostProcessor(renderer);
  
  let lastScale = -1;

  function render(time, particleSystem) {
    // Dynamic resolution application
    if (settings.renderScale !== lastScale) {
      const w = Math.floor(window.innerWidth * settings.renderScale);
      const h = Math.floor(window.innerHeight * settings.renderScale);
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
      postProcessor.resize(w, h);
      particleCamera.aspect = w / h;
      particleCamera.updateProjectionMatrix();
      lastScale = settings.renderScale;
    }

    updateUniforms(uniforms, time);
    
    // Sync particle camera with player state
    particleCamera.position.copy(gameState.player.position);
    particleCamera.rotation.set(gameState.player.pitch, gameState.player.yaw, 0, 'YXZ');
    
    // Update particles
    if (particleSystem) {
      particleRenderer.update(particleSystem.getParticles(), particleCamera);
    }
    
    // Render with post-processing, passing both the raymarching scene and particle scene
    postProcessor.render(scene, camera, particleScene, particleCamera);
  }

  return { render, uniforms, renderer, postProcessor };
}