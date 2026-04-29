import { common } from './fragments/common.js';
import { sdf } from './fragments/sdf.js';
import { face } from './fragments/face.js';
import { world } from './fragments/world.js';
import { lighting } from './fragments/lighting.js';

export const fragmentShader = `
${common}
${sdf}
${face}
${world}
${lighting}

void main() {
  // Use vUv (0 to 1) and map to -1 to 1 for resolution-independent ray generation
  vec2 uv2 = vUv * 2.0 - 1.0;
  uv2.x *= uResolution.x / uResolution.y;
  vec3 rd = normalize(uCamFwd + uCamRight * uv2.x + uCamUp * uv2.y);
  vec3 ro = uCamPos;
  LightEnv env = getLightEnv(uDayTime);
  
  float t = 0.0;
  vec3 hitCol = vec3(0.0);
  vec3 hitP;
  bool hit = false;
  
  for (int i = 0; i < 160; i++) {
    if (float(i) >= uMaxSteps) break;
    hitP = ro + rd * t;
    vec4 res = map(hitP);
    if (res.x < EPSILON * t) {
      hitCol = res.yzw;
      hit = true;
      break;
    }
    t += res.x * 0.8;
    if (t > uDrawDist) break;
  }
  
  float skyGrad = clamp(rd.y * 2.0 + 0.5, 0.0, 1.0);
  vec3 skyBase = mix(uSkyColor2, uSkyColor, skyGrad);

  vec3 col;
  if (hit) {
    vec3 n = calcNormal(hitP, map(hitP).x);
    vec3 baseColor = getMaterialColor(hitCol, hitP);
    
    vec3 litColor;
    if (uFlatLighting > 0.5) {
      float ndotl = max(dot(n, env.sunDir), 0.0);
      litColor = baseColor * (env.ambientColor + env.sunColor * ndotl * 0.7);
    } else {
      // Full quality lighting only for nearby geometry
      float ndotl = dot(n, env.sunDir);
      float lightingFactor = (uCelShading > 0.5) ? celShade(ndotl) : max(ndotl, 0.0);
      
      float shadow = 1.0;
      if (uShadowsEnabled > 0.5) {
        shadow = softShadow(hitP + n * 0.05, env.sunDir, 0.1, 40.0);
        if (uCelShading > 0.5) {
          shadow = shadow > 0.5 ? 1.0 : 0.3;
        }
      }
      
      float ao = 1.0;
      if (uAOEnabled > 0.5) {
        ao = calcAO(hitP, n);
      }
      
      float rim = pow(1.0 - max(0.0, dot(n, -rd)), 3.0);
      vec3 rimColor = vec3(0.3, 0.5, 0.65) * rim * 0.5;
      litColor = baseColor * (env.ambientColor * ao + env.sunColor * lightingFactor * shadow);
      litColor += rimColor;
    }

    col = litColor;
    
    // Subtle silhouette
    float silhouette = 0.12;
    if (dot(n, -rd) < silhouette) col *= 0.7;
  } else {
    // If we didn't hit anything, we're at uDrawDist
    t = uDrawDist;
    if (uSkyTextured > 0.5) {
      vec2 skyUV = rd.xz / (rd.y + 0.3) * 5.0;
      float clouds = fbm(skyUV + uTime * 0.02);
      col = mix(skyBase, vec3(1.0, 0.95, 0.9), smoothstep(0.4, 0.7, clouds) * 0.3 * max(0.0, env.sunDir.y));
    } else {
      col = skyBase;
    }
  }
  // Apply fog based on distance t relative to uDrawDist
  // We use a combination of exponential and distance-clamped fog for a thick horizon
  float fogExp = 1.0 - exp(-t * env.fogDensity);
  float fogDist = clamp((t - uDrawDist * 0.5) / (uDrawDist * 0.5), 0.0, 1.0);
  float fogAmount = max(fogExp, pow(fogDist, 2.0));
  
  col = mix(col, env.fogColor, fogAmount);

  if (uSelectionInfo.x > 0.5 && uShowOutline > 0.5) {
    float tSel = 0.0;
    float minD = 1e10;
    bool hitSel = false;
    for (int i = 0; i < 60; i++) {
      float d = mapSelected(ro + rd * tSel);
      float dNorm = d / max(tSel, 1.0);
      minD = min(minD, dNorm);
      if (d < 0.002) {
        hitSel = true;
        break;
      }
      tSel += d * 0.8;
      if (tSel > uDrawDist) break;
    }
    if (!hitSel) {
      float outline = smoothstep(0.012, 0.0, minD);
      if (outline > 0.0) {
        col = mix(col, uOutlineColor * 1.5, outline * 0.85);
      }
    }
  }

  col = col / (col + 0.5);
  col = pow(col, vec3(0.85));
  gl_FragColor = vec4(col, 1.0);
}
`;