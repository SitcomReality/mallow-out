export const world = `
uniform float uFloorEnabled;
uniform vec3 uFloorColor;
uniform float uFloorTextured;

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
  // Flat circular disk at y=0. Using the sdCylinder from sdf.js
  return sdCylinder(p + vec3(0.0, 0.1, 0.0), 5.5, 0.1);
}

vec3 getFloorColorAt(vec3 p) {
  vec3 col = uFloorColor;
  if (uFloorTextured > 0.5) {
    float dist = length(p.xz);
    // Cheap concentric ring pattern
    float rings = smoothstep(0.0, 0.1, abs(fract(dist * 0.8) - 0.5));
    col = mix(col * 1.15, col * 0.9, rings);
    // Darken edge of the disk for visual definition
    col = mix(col, col * 0.4, smoothstep(4.8, 5.5, dist));
  }
  return col;
}

uniform sampler2D uFontTex;

// Ensure we don't redefine sdCylinder here since it's already in sdf.js

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

float getObjectDist(vec3 p, int idx) {
  vec3 pos = uObjData1[idx].xyz;
  vec3 scale = uObjData2[idx].xyz;
  vec3 rot = uObjData4[idx].xyz;
  float objType = uObjData0[idx].x;
  float nAmount = uObjData5[idx].x;
  float nScale = uObjData5[idx].y;
  vec3 nSpeed = uObjData6[idx].xyz;
  
  vec3 localP = p - pos;
  
  // Apply rotation to the local coordinate space
  localP.yz *= rot2(-rot.x);
  localP.xz *= rot2(rot.y);
  localP.xy *= rot2(-rot.z);
  
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
  
  if (nAmount > 0.001) {
    vec3 nOffset = uObjData6[idx].xyz;
    float pert = (fbm3D(localP * nScale - nOffset) - 0.5) * 2.0 * nAmount;
    d += pert;
  }
  
  return d;
}

vec4 blendOp(vec4 res, float d, vec3 col, float op, float blend) {
  float safeBlend = max(blend, 0.0);
  if (op < 0.5) {
    if (safeBlend > 0.001) {
      float h = clamp(0.5 + 0.5 * (res.x - d) / safeBlend, 0.0, 1.0);
      vec3 finalCol = mix(res.yzw, col, h);
      return vec4(mix(res.x, d, h) - safeBlend * h * (1.0 - h), finalCol);
    } else {
      return (d < res.x) ? vec4(d, col) : res;
    }
  } else if (op < 1.5) {
    float newD = smax(res.x, -d, safeBlend);
    float h = 0.0;
    if (safeBlend > 0.001) {
      h = clamp(0.5 + 0.5 * (-d - res.x) / safeBlend, 0.0, 1.0);
    } else {
      h = (-d > res.x) ? 1.0 : 0.0;
    }
    vec3 newCol = mix(res.yzw, col, h);
    return vec4(newD, newCol);
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
  bool worldFirst = true; // Track if we've initialized worldRes with the first real geometry hit

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
      vec3 localP = p - uObjData1[i].xyz;
      vec3 rot = uObjData4[i].xyz;
      localP.yz *= rot2(-rot.x);
      localP.xz *= rot2(rot.y);
      localP.xy *= rot2(-rot.z);
      
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
        // Always blend single objects with worldRes (which starts with the floor)
        worldRes = blendOp(worldRes, d, col, op, blend);
        worldFirst = false;
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
    worldRes = blendOp(worldRes, groupRes.x, groupRes.yzw, gOp, gBlend);
  }
  
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