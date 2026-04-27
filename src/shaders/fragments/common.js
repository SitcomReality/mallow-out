export const common = `
precision highp float;

#define EPSILON 0.005
#define PI 3.14159265

varying vec2 vUv;

uniform vec2 uResolution;
uniform vec3 uCamPos;
uniform vec3 uCamFwd;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform float uTime;
uniform float uDayTime;
uniform float uMaxSteps;
uniform float uDrawDist;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uAmbientColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFlatLighting;
uniform float uCelShading;
uniform float uShadowsEnabled;
uniform float uAOEnabled;
uniform float uBlobWobble;

uniform vec2 uSelectionInfo;
uniform float uShowOutline;
uniform vec3 uOutlineColor;
uniform float uNumObjects;
uniform vec4 uObjData0[32];  // type, operation, blendRadius, groupId (1-based)
uniform vec4 uGroupData[32]; // operation, blendRadius, _, _
uniform vec4 uObjData1[32];  // position
uniform vec4 uObjData2[32];  // scale
uniform vec4 uObjData3[32];  // color
uniform vec4 uObjData4[32];  // rotation
uniform vec4 uObjData5[32];  // noiseAmount, noiseScale, _, _
uniform vec4 uObjData6[32];  // noiseSpeed (x, y, z, charCode)

float hash(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash2v(vec2 p) {
  return vec2(hash2(p), hash2(p + vec2(127.1, 311.7)));
}
float hash3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i), hash2(i + vec2(1, 0)), f.x),
    mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

mat2 rot2(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float noise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i + vec3(0.0,0.0,0.0)), hash3(i + vec3(1.0,0.0,0.0)), f.x),
        mix(hash3(i + vec3(0.0,1.0,0.0)), hash3(i + vec3(1.0,1.0,0.0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0.0,0.0,1.0)), hash3(i + vec3(1.0,0.0,1.0)), f.x),
        mix(hash3(i + vec3(0.0,1.0,1.0)), hash3(i + vec3(1.0,1.0,1.0)), f.x), f.y), f.z
  );
}

float fbm3D(vec3 p) {
  float v = 0.0, a = 0.5;
  mat3 rot = mat3(
    0.00,  0.80,  0.60,
   -0.80,  0.36, -0.48,
   -0.60, -0.48,  0.64
  );
  for (int i = 0; i < 3; i++) {
    v += a * noise3D(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}
`;