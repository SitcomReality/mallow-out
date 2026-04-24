export const lighting = `
uniform vec3 uFloorColor;
uniform float uFloorTextured;
uniform vec3 uSkyColor;
uniform vec3 uSkyColor2;
uniform float uSkyTextured;

vec3 calcNormal(vec3 p, float currentDist) {
  vec2 e = vec2(0.01, 0);
  return normalize(vec3(
    map(p + e.xyy).x - currentDist,
    map(p + e.yxy).x - currentDist,
    map(p + e.yyx).x - currentDist
  ));
}

vec3 getMaterialColor(vec3 colorData, vec3 p) {
  // Check for floor sentinel value (colorData.x == -1.0)
  if (colorData.x < -0.5) {
    vec3 col = uFloorColor;
    if (uFloorTextured > 0.5) {
      float pattern = noise(p.xz * 0.8) * 0.6 + fbm(p.xz * 2.0) * 0.4;
      col = mix(col * 0.6, col * 1.4, pattern);
      float grid = smoothstep(0.0, 0.02, abs(fract(p.x * 0.5 + 0.5) - 0.5)) * 
                   smoothstep(0.0, 0.02, abs(fract(p.z * 0.5 + 0.5) - 0.5));
      col = mix(col * 1.2, col, grid);
    }
    return col;
  }
  
  return colorData;
}

float celShade(float ndotl) {
  if (ndotl > 0.6) return 1.0;
  if (ndotl > 0.25) return 0.6;
  if (ndotl > 0.0) return 0.35;
  return 0.15;
}

float softShadow(vec3 ro, vec3 rd, float mint, float maxt) {
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 6; i++) {
    float h = map(ro + rd * t).x;
    res = min(res, 8.0 * h / t);
    t += clamp(h, 0.15, 2.0);
    if (h < 0.001 || t > maxt) break;
  }
  return clamp(res, 0.0, 1.0);
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 3; i++) {
    float h = 0.1 + 0.15 * float(i);
    float d = map(p + h * n).x;
    occ += (h - d) * sca;
    sca *= 0.75;
  }
  return clamp(1.0 - 1.5 * occ, 0.0, 1.0);
}

struct LightEnv {
  vec3 sunDir;
  vec3 sunColor;
  vec3 ambientColor;
  vec3 skyColor;
  vec3 fogColor;
  float fogDensity;
};

LightEnv getLightEnv(float dayTime) {
  LightEnv env;
  float sunAngle = dayTime * 6.28318 - 1.5708;
  env.sunDir = normalize(vec3(cos(sunAngle) * 0.7, sin(sunAngle), cos(sunAngle) * 0.3));
  vec3 daySun = vec3(1.4, 1.05, 0.7), dayAmbient = vec3(0.25, 0.28, 0.35), daySky = vec3(0.35, 0.55, 0.75), dayFog = vec3(0.5, 0.6, 0.72);
  vec3 nightSun = vec3(0.1, 0.12, 0.2), nightAmbient = vec3(0.03, 0.04, 0.08), nightSky = vec3(0.02, 0.02, 0.06), nightFog = vec3(0.03, 0.04, 0.07);
  float sunH = clamp(env.sunDir.y * 2.0, 0.0, 1.0);
  float nightFactor = 1.0 - sunH;
  env.sunColor = mix(daySun, nightSun, nightFactor);
  env.ambientColor = mix(dayAmbient, nightAmbient, nightFactor);
  env.skyColor = mix(daySky, nightSky, nightFactor);
  env.fogColor = mix(dayFog, nightFog, nightFactor);
  env.fogDensity = mix(0.035, 0.05, nightFactor);
  return env;
}
`;