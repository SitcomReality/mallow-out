import * as THREE from 'three';

// Simple vignette + brightness post-process
const postVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const postFragmentShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uVignetteStrength;
uniform float uBrightness;

void main() {
  vec3 col = texture2D(tDiffuse, vUv).rgb;
  
  // Vignette
  vec2 uv = vUv * 2.0 - 1.0;
  float vignette = 1.0 - dot(uv, uv) * uVignetteStrength;
  col *= vignette;
  
  // Brightness
  col *= uBrightness;
  
  gl_FragColor = vec4(col, 1.0);
}
`;

export class PostProcessor {
  constructor(renderer) {
    this.renderer = renderer;
    
    // Create render target
    this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    
    // Post-process scene
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const postMaterial = new THREE.ShaderMaterial({
      vertexShader: postVertexShader,
      fragmentShader: postFragmentShader,
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        uVignetteStrength: { value: 0.3 },
        uBrightness: { value: 1.05 },
      },
    });
    
    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
    this.postScene.add(postQuad);
    this.postMaterial = postMaterial;
  }

  resize(width, height) {
    this.renderTarget.setSize(width, height);
  }

  render(mainScene, mainCamera, effectScene = null, effectCamera = null, viewmodelScene = null, viewmodelCamera = null) {
    // 1. Render primary raymarched scene to texture
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.autoClear = true;
    this.renderer.render(mainScene, mainCamera);
    
    // 2. Render particle/tracer effects on top (sharing depth)
    if (effectScene && effectCamera) {
      this.renderer.autoClear = false;
      this.renderer.clearDepth();
      this.renderer.render(effectScene, effectCamera);
    }

    // 3. Render weapon viewmodel on top (clearing depth to ensure occlusion)
    if (viewmodelScene && viewmodelCamera) {
      this.renderer.autoClear = false;
      this.renderer.clearDepth();
      this.renderer.render(viewmodelScene, viewmodelCamera);
    }
    
    // 4. Render final post-process result to screen
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  }

  setVignette(strength) {
    this.postMaterial.uniforms.uVignetteStrength.value = strength;
  }

  setBrightness(brightness) {
    this.postMaterial.uniforms.uBrightness.value = brightness;
  }
}