import * as THREE from 'three';
import { MAX_PARTICLES } from './particle-constants.js';

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
  vec3 worldPos = particlePos + cameraRight * position.x * particleSize + cameraUp * position.y * particleSize;
  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}
`;

const particleFragmentShader = `
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float dist = length(vUv - vec2(0.5));
  float alpha = smoothstep(0.5, 0.3, dist) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;

export class ParticleRenderer {
  constructor() {
    const geometry = new THREE.InstancedBufferGeometry();
    const vertices = new Float32Array([-0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0, -0.5,-0.5,0, 0.5,0.5,0, -0.5,0.5,0]);
    const uvs = new Float32Array([0,0, 1,0, 1,1, 0,0, 1,1, 0,1]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    
    geometry.setAttribute('particlePos', new THREE.InstancedBufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3));
    geometry.setAttribute('particleSize', new THREE.InstancedBufferAttribute(new Float32Array(MAX_PARTICLES), 1));
    geometry.setAttribute('particleColor', new THREE.InstancedBufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3));
    geometry.setAttribute('particleAlpha', new THREE.InstancedBufferAttribute(new Float32Array(MAX_PARTICLES), 1));
    
    this.material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: { cameraRight: { value: new THREE.Vector3() }, cameraUp: { value: new THREE.Vector3() } },
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.NormalBlending,
    });
    
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
    this.geometry = geometry;
  }

  update(particles, camera) {
    const count = Math.min(particles.length, MAX_PARTICLES);
    const attr = this.geometry.attributes;
    
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const i3 = i * 3;
      attr.particlePos.array[i3] = p.position.x;
      attr.particlePos.array[i3+1] = p.position.y;
      attr.particlePos.array[i3+2] = p.position.z;
      attr.particleSize.array[i] = p.size;
      attr.particleColor.array[i3] = p.color.r;
      attr.particleColor.array[i3+1] = p.color.g;
      attr.particleColor.array[i3+2] = p.color.b;
      attr.particleAlpha.array[i] = p.life / p.maxLife;
    }
    
    attr.particlePos.needsUpdate = attr.particleSize.needsUpdate = true;
    attr.particleColor.needsUpdate = attr.particleAlpha.needsUpdate = true;
    this.geometry.instanceCount = count;
    
    const camRot = new THREE.Matrix4().extractRotation(camera.matrixWorld);
    this.material.uniforms.cameraRight.value.set(1,0,0).applyMatrix4(camRot);
    this.material.uniforms.cameraUp.value.set(0,1,0).applyMatrix4(camRot);
  }
}