import * as THREE from 'three';

const particleVertexShader = `
attribute vec3 particlePos;
attribute float particleSize;
attribute vec3 particleColor;
attribute float particleAlpha;

varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

uniform vec3 cameraRight;
uniform vec3 cameraUp;

void main() {
  vUv = uv;
  vColor = particleColor;
  vAlpha = particleAlpha;
  
  // Billboard quad (position is a built-in attribute in ShaderMaterial)
  vec3 worldPos = particlePos + cameraRight * position.x * particleSize + cameraUp * position.y * particleSize;
  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}
`;

const particleFragmentShader = `
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Circular particle
  float dist = length(vUv - vec2(0.5));
  float alpha = smoothstep(0.5, 0.3, dist) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;

export class ParticleRenderer {
  constructor() {
    // Create a single quad geometry that will be instanced
    const geometry = new THREE.InstancedBufferGeometry();
    const vertices = new Float32Array([
      -0.5, -0.5, 0,
       0.5, -0.5, 0,
       0.5,  0.5, 0,
      -0.5, -0.5, 0,
       0.5,  0.5, 0,
      -0.5,  0.5, 0,
    ]);
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    
    // Per-particle instance attributes (will be updated each frame)
    const maxParticles = 500;
    this.maxParticles = maxParticles;
    
    const particlePositions = new Float32Array(maxParticles * 3);
    const particleSizes = new Float32Array(maxParticles);
    const particleColors = new Float32Array(maxParticles * 3);
    const particleAlphas = new Float32Array(maxParticles);
    
    geometry.setAttribute('particlePos', new THREE.InstancedBufferAttribute(particlePositions, 3));
    geometry.setAttribute('particleSize', new THREE.InstancedBufferAttribute(particleSizes, 1));
    geometry.setAttribute('particleColor', new THREE.InstancedBufferAttribute(particleColors, 3));
    geometry.setAttribute('particleAlpha', new THREE.InstancedBufferAttribute(particleAlphas, 1));
    
    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        cameraRight: { value: new THREE.Vector3() },
        cameraUp: { value: new THREE.Vector3() },
      },
      transparent: true,
      // Render particles on top of the raymarching quad by disabling depth testing.
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.geometry = geometry;
    this.material = material;
  }

  update(particles, camera) {
    const count = Math.min(particles.length, this.maxParticles);
    
    const positions = this.geometry.attributes.particlePos.array;
    const sizes = this.geometry.attributes.particleSize.array;
    const colors = this.geometry.attributes.particleColor.array;
    const alphas = this.geometry.attributes.particleAlpha.array;
    
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const i3 = i * 3;
      
      positions[i3] = p.position.x;
      positions[i3 + 1] = p.position.y;
      positions[i3 + 2] = p.position.z;
      
      sizes[i] = p.size;
      
      colors[i3] = p.color.r;
      colors[i3 + 1] = p.color.g;
      colors[i3 + 2] = p.color.b;
      
      const lifeRatio = p.life / p.maxLife;
      alphas[i] = lifeRatio;
    }
    
    // Update attributes
    this.geometry.attributes.particlePos.needsUpdate = true;
    this.geometry.attributes.particleSize.needsUpdate = true;
    this.geometry.attributes.particleColor.needsUpdate = true;
    this.geometry.attributes.particleAlpha.needsUpdate = true;
    
    // Set instance count
    this.geometry.instanceCount = count;
    
    // Update camera vectors for billboarding
    const cameraMatrix = new THREE.Matrix4().extractRotation(camera.matrixWorld);
    const right = new THREE.Vector3(1, 0, 0).applyMatrix4(cameraMatrix);
    const up = new THREE.Vector3(0, 1, 0).applyMatrix4(cameraMatrix);
    
    this.material.uniforms.cameraRight.value.copy(right);
    this.material.uniforms.cameraUp.value.copy(up);
  }
}