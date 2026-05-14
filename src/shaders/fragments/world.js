export const world = `
uniform float uFloorEnabled;
uniform vec3 uFloorColor;
uniform float uFloorTextured;
uniform float uWorldBoundsEnabled;
uniform float uWorldBoundsRadius;
uniform float uWorldBoundsCenterY;
uniform float uWorldBoundsOutline;

struct Object {
  float type;      // 0=sphere, 1=box, 2=cylinder, 3=torus
  vec3 position;
  vec3 scale;
  float blendRadius;
  float operation;  // 0=union, 1=subtract, 2=intersect
  vec3 color;
};

float sdFloor(vec3 p) {
  if (uFloorEnabled < 0.5) return 1e10;
  // The "floor" is now the interior of the world sphere
  vec3 sphereCenter = vec3(0.0, uWorldBoundsCenterY, 0.0);
  return uWorldBoundsRadius - length(p - sphereCenter);
}

vec3 getFloorColorAt(vec3 p) {
  vec3 col = uFloorColor;
  if (uFloorTextured > 0.5) {
    vec3 sphereCenter = vec3(0.0, uWorldBoundsCenterY, 0.0);
    vec3 n = normalize(p - sphereCenter);
    // Use polar coordinates for pattern on the sphere
    float phi = atan(n.z, n.x);
    float theta = acos(n.y);
    float pattern = smoothstep(0.0, 0.1, abs(fract(theta * 3.0) - 0.5)) * 
                    smoothstep(0.0, 0.1, abs(fract(phi * 2.0 / PI) - 0.5));
    col = mix(col * 1.1, col * 0.9, pattern);
  }
  return col;
}

uniform sampler2D uFontTex;

float sdText(vec3 p, vec3 scale, float charCode) {
  float idx = charCode - 32.0;
  if (idx < 0.0 || idx > 94.0) idx = 31.0;
  
  float cx = mod(idx, 10.0);
  float cy = floor(idx / 10.0);
  
  // UV mapping within the glyph box (-scale to +scale -> 0 to 1)
  vec2 uv = p.xy / scale.xy * 0.5 + 0.5;
  
  // Bounding box distances
  vec2 d_rect = abs(p.xy) - scale.xy;
  float d_z = abs(p.z) - scale.z;

  // Sample atlas with safe clamping to prevent cross-character bleeding
  vec2 safeUv = clamp(uv, 0.0, 1.0);
  vec2 atlasUv = vec2((cx + safeUv.x) / 10.0, (cy + safeUv.y) / 10.0);
  float texDist = texture2D(uFontTex, atlasUv).r;
  
  // Convert texture value to world-space distance.
  float d_pixels = (0.5 - texDist) * 32.0; 
  float d_glyph = d_pixels * (2.0 * scale.y) / 102.4;
  
  // Add the 2D exterior distance so the distance field continues to grow outside the bounding box
  float d_out = length(max(d_rect, 0.0));
  d_glyph += d_out;
  
  // Extrude the 2D shape along the Z axis
  vec2 w = vec2(d_glyph, d_z);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

vec3 qtransform(vec4 q, vec3 v) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

float getObjectDist(vec3 p, int idx) {
  vec3 pos = uObjData1[idx].xyz;
  vec3 scale = uObjData2[idx].xyz;
  vec4 quat = uObjData4[idx]; // Quaternion (x,y,z,w)
  float objType = uObjData0[idx].x;
  float nAmount = uObjData5[idx].x;
  float nScale = uObjData5[idx].y;
  
  // Inverse rotation for local point: q_inv = (-x, -y, -z, w) for unit quaternions
  vec4 qinv = vec4(-quat.xyz, quat.w);
  vec3 localP = qtransform(qinv, p - pos);
  
  float d = 0.0;
  if (objType < 0.5) {
    d = sdSphere(localP, scale.x);
  } else if (objType < 1.5) {
    d = sdBox(localP, scale);
  } else if (objType < 2.5) {
    d = sdCylinder(localP, scale.x, scale.y);
  } else if (objType < 3.5) {
    d = sdTorus(localP, scale.xy);
  } else {
    d = sdText(localP, scale, uObjData6[idx].w);
  }
  
  // Distance-based LOD: skip noise for distant objects
  if (nAmount > 0.001) {
    float distToCamera = length(p - uCamPos);
    // Only apply noise to objects within 20 units of camera
    if (distToCamera < 20.0) {
      float distToCenter = length(p - pos);
      if (distToCenter < getObjectBoundingRadius(idx) + 0.1) {
        vec3 nOffset = uObjData6[idx].xyz;
        // Reduce noise quality for distant objects (>10 units)
        float lodFactor = smoothstep(20.0, 10.0, distToCamera);
        float pert = (fbm3D(localP * nScale - nOffset) - 0.5) * 2.0 * nAmount * lodFactor;
        d += pert;
      }
    }
  }
  
  return d;
}

vec4 blendOp(vec4 res, float d, vec3 col, float op, float blend) {
  // Optimization #6: Simplified blending - cap blend radius
  float safeBlend = min(max(blend, 0.0), 0.3);
  
  if (op < 0.5) {
    // Union with optional smooth blend
    if (safeBlend > 0.001) {
      // Cheaper polynomial smooth min
      float h = clamp(0.5 + 0.5 * (res.x - d) / safeBlend, 0.0, 1.0);
      vec3 finalCol = mix(res.yzw, col, h);
      return vec4(mix(res.x, d, h) - safeBlend * h * (1.0 - h), finalCol);
    } else {
      // Hard union (fast path)
      return (d < res.x) ? vec4(d, col) : res;
    }
  } else if (op < 1.5) {
    // Subtraction with optional smooth blend
    if (safeBlend > 0.001) {
      float newD = smax(res.x, -d, safeBlend);
      float h = clamp(0.5 + 0.5 * (-d - res.x) / safeBlend, 0.0, 1.0);
      vec3 newCol = mix(res.yzw, col, h);
      return vec4(newD, newCol);
    } else {
      // Hard subtraction (fast path for damage holes)
      float newD = max(res.x, -d);
      vec3 newCol = (-d > res.x) ? col : res.yzw;
      return vec4(newD, newCol);
    }
  } else {
    float oldD = res.x;
    float newD = max(res.x, d);
    return vec4(newD, (d > oldD) ? col : res.yzw);
  }
}

vec4 map(vec3 p) {
  float fD = sdFloor(p);
  vec3 fCol = getFloorColorAt(p);
  vec4 worldRes = vec4(fD, fCol);
  vec4 groupRes = vec4(1e10, 1.0, 1.0, 1.0);
  float lastGid = 0.0;
  bool worldFirst = false;

  for (int i = 0; i < 32; i++) {
    if (float(i) >= uNumObjects) break;
    
    float objType = uObjData0[i].x;
    if (objType > 4.5) continue;
    
    float gid = uObjData0[i].w;
    float d = getObjectDist(p, i);
    vec3 col = uObjData3[i].xyz;
    float op = uObjData0[i].y;
    float blend = uObjData0[i].z;
    
    // Apply expression textures without adding to CSG limits
    float expression = uObjData5[i].z;
    if (expression > 0.5) {
      vec4 quat = uObjData4[i];
      vec4 qinv = vec4(-quat.xyz, quat.w);
      vec3 localP = qtransform(qinv, p - uObjData1[i].xyz);
      
      // uObjData5.w holds pupil look X, uObjData6.w holds pupil look Y (if needed, otherwise 0)
      vec2 lookDir = vec2(uObjData5[i].w, 0.0); 
      // We'll hijack the unused Y component in uObjData5 or just stay horizontal for now.
      // Wait, uObjData6.w is charCode. Let's use uObjData2.w for lookY if needed.
      lookDir.y = uObjData2[i].w; 
      
      col = getFaceColor(localP, uObjData2[i].xyz, col, expression, lookDir);
    }

    if (gid != lastGid) {
      // Close existing group if it was active
      if (lastGid > 0.5) {
        int gIdx = int(lastGid - 1.0);
        float gOp = uGroupData[gIdx].x;
        float gBlend = uGroupData[gIdx].y;
        if (worldFirst) {
          worldRes = groupRes;
          worldFirst = false;
        } else {
          worldRes = blendOp(worldRes, groupRes.x, groupRes.yzw, gOp, gBlend);
        }
      }
      
      lastGid = gid;
      if (gid > 0.5) {
        // Start new group
        groupRes = vec4(d, col);
      } else {
        // Single object
        if (worldFirst) {
          worldRes = vec4(d, col);
          worldFirst = false;
        } else {
          worldRes = blendOp(worldRes, d, col, op, blend);
        }
      }
    } else {
      // Continue same state (group or no group)
      if (gid > 0.5) {
        groupRes = blendOp(groupRes, d, col, op, blend);
      } else {
        if (worldFirst) {
          worldRes = vec4(d, col);
          worldFirst = false;
        } else {
          worldRes = blendOp(worldRes, d, col, op, blend);
        }
      }
    }
  }
  
  // Final group flush
  if (lastGid > 0.5) {
    int gIdx = int(lastGid - 1.0);
    float gOp = uGroupData[gIdx].x;
    float gBlend = uGroupData[gIdx].y;
    if (worldFirst) {
      worldRes = groupRes;
    } else {
      worldRes = blendOp(worldRes, groupRes.x, groupRes.yzw, gOp, gBlend);
    }
  }
  
  // No longer applying boundingSphereD as an intersection because the floor IS the interior
  return worldRes;
}

float mapSelected(vec3 p) {
  if (uSelectionInfo.x < 0.5) return 1e10;
  
  if (uSelectionInfo.x < 1.5) {
    int idx = int(uSelectionInfo.y);
    if (idx < 0 || idx >= 32) return 1e10;
    return getObjectDist(p, idx);
  } else {
    float targetGid = uSelectionInfo.y;
    vec4 groupRes = vec4(1e10, 1.0, 1.0, 1.0);
    bool groupFirst = true;
    
    for (int i = 0; i < 32; i++) {
      if (float(i) >= uNumObjects) break;
      float gid = uObjData0[i].w;
      if (abs(gid - targetGid) < 0.1) {
        float d = getObjectDist(p, i);
        float op = uObjData0[i].y;
        float blend = uObjData0[i].z;
        if (groupFirst) {
          groupRes = vec4(d, 0.0, 0.0, 0.0);
          groupFirst = false;
        } else {
          groupRes = blendOp(groupRes, d, vec3(0.0), op, blend);
        }
      }
    }
    return groupRes.x;
  }
}
`;