export const vertexShader = `
varying vec2 vUv;
varying vec2 vScreenUV;

void main() {
  vUv = uv;
  
  // Pre-compute screen-space UV for ray direction
  // Map from [0,1] to [-1,1] and adjust for aspect ratio
  vScreenUV = vUv * 2.0 - 1.0;
  
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;