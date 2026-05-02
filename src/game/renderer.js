import * as THREE from 'three';
import { createEngine } from '../engine.js';
import { createMainMaterial } from '../render/material.js';
import { updateUniforms } from './uniforms.js';
import { settings, worldState } from '../state.js';
import { gameState } from './state.js';
import { PostProcessor } from '../render/post-process.js';
import { ParticleRenderer } from '../effects/particle-renderer.js';
import { TracerSystem } from '../effects/tracer-line.js';

export function createRenderer(container) {
  const { renderer, scene, camera, quad } = createEngine(container);
  const material = createMainMaterial();
  quad.material = material;

  const uniforms = material.uniforms;
  
  // Create a separate scene and perspective camera for 3D effects (particles, tracers, projectiles)
  // FOV is 90 to match the shader's implicit FOV (tan(45)=1)
  const particleScene = new THREE.Scene();
  const particleCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
  particleScene.add(particleCamera);
  
  // Create particle renderer
  const particleRenderer = new ParticleRenderer();
  particleScene.add(particleRenderer.mesh);
  
  // Create tracer system
  const tracerSystem = new TracerSystem(particleScene);
  
  // Create post-processor
  const postProcessor = new PostProcessor(renderer);
  postProcessor.setBrightness(1.15); // Make the world pop
  postProcessor.setVignette(0.2);   // Softer vignette
  
  let lastScale = -1;
  let lastWidth = -1;
  let lastHeight = -1;

  function render(time, particleSystem, floatingTextSystem) {
    // Dynamic resolution application or window resize
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    
    if (settings.renderScale !== lastScale || currentWidth !== lastWidth || currentHeight !== lastHeight) {
      const w = Math.floor(currentWidth * settings.renderScale);
      const h = Math.floor(currentHeight * settings.renderScale);
      
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
      postProcessor.resize(w, h);
      
      particleCamera.aspect = currentWidth / currentHeight;
      particleCamera.updateProjectionMatrix();
      
      lastScale = settings.renderScale;
      lastWidth = currentWidth;
      lastHeight = currentHeight;
    }

    updateUniforms(uniforms, time);
    
    // Sync Three.js scene fog with raymarching environment fog to ensure projectiles and tracers fade out
    if (!particleScene.fog) {
      particleScene.fog = new THREE.FogExp2(uniforms.uFogColor.value, uniforms.uFogDensity.value);
    } else {
      particleScene.fog.color.copy(uniforms.uFogColor.value);
      particleScene.fog.density = uniforms.uFogDensity.value;
    }

    // Sync near/far uniforms for depth buffer integration
    uniforms.uNear.value = particleCamera.near;
    uniforms.uFar.value = particleCamera.far;

    // Sync particle camera with player state
    particleCamera.position.copy(gameState.player.position);
    
    // Match uniforms.js forward vector calculation exactly to ensure 
    // raymarching and 3D projection (for clicks) are perfectly aligned.
    const player = gameState.player;
    const forward = new THREE.Vector3(
      Math.sin(player.yaw) * Math.cos(player.pitch),
      Math.sin(player.pitch),
      -Math.cos(player.yaw) * Math.cos(player.pitch)
    ).normalize();
    
    particleCamera.lookAt(particleCamera.position.clone().add(forward));
    
    // Update particles
    if (particleSystem) {
      particleRenderer.update(particleSystem.getParticles(), particleCamera);
    }
    
    // Render with post-processing, passing raymarching and effects scenes
    postProcessor.render(scene, camera, particleScene, particleCamera);
  }

  return { render, uniforms, renderer, postProcessor, tracerSystem, particleCamera, particleScene };
}