import * as THREE from 'three';
import { createEngine } from '../engine.js';
import { createMainMaterial } from '../render/material.js';
import { updateUniforms } from './uniforms.js';
import { settings, worldState } from '../state.js';
import { gameState } from './state.js';
import { PostProcessor } from '../render/post-process.js';
import { ParticleRenderer } from '../effects/particle-renderer.js';
import { TracerSystem } from '../effects/tracer-line.js';
import { ProjectileRenderer } from '../effects/projectile-renderer.js';

export function createRenderer(container) {
  const { renderer, scene, camera, quad } = createEngine(container);
  const material = createMainMaterial();
  quad.material = material;

  const uniforms = material.uniforms;
  
  // Create a separate scene and perspective camera for 3D effects (particles, tracers, projectiles)
  const particleScene = new THREE.Scene();
  const particleCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  // Create particle renderer
  const particleRenderer = new ParticleRenderer();
  particleScene.add(particleRenderer.mesh);
  
  // Create tracer system
  const tracerSystem = new TracerSystem(particleScene);
  
  // Create projectile renderer
  const projectileRenderer = new ProjectileRenderer(particleScene);
  
  // Create post-processor
  const postProcessor = new PostProcessor(renderer);
  postProcessor.setBrightness(1.15); // Make the world pop
  postProcessor.setVignette(0.2);   // Softer vignette
  
  let lastScale = -1;

  function render(time, particleSystem, floatingTextSystem) {
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
    // Negate yaw because Three.js camera rotation Y is counter-clockwise (positive turns left),
    // while our raymarching yaw is positive for turning right.
    particleCamera.rotation.set(gameState.player.pitch, -gameState.player.yaw, 0, 'YXZ');
    
    // Update particles
    if (particleSystem) {
      particleRenderer.update(particleSystem.getParticles(), particleCamera);
    }
    
    // Update projectiles
    projectileRenderer.update(gameState.projectiles);
    
    // Render with post-processing, passing both the raymarching scene and particle scene
    postProcessor.render(scene, camera, particleScene, particleCamera);
  }

  return { render, uniforms, renderer, postProcessor, tracerSystem, projectileRenderer };
}