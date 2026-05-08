export const rayUtils = `
// Pre-computed ray direction from camera-space UV
// Since camera is static, ray directions are constant per pixel
vec3 getRayDirection(vec2 screenUV, vec3 camFwd, vec3 camRight, vec3 camUp) {
  return normalize(camFwd + camRight * screenUV.x + camUp * screenUV.y);
}

// Check if point is inside a bounding sphere
bool insideBoundingSphere(vec3 p, vec3 center, float radius) {
  return length(p - center) < radius;
}

// Conservative bounding sphere for object
float getObjectBoundingRadius(int idx) {
  vec3 scale = uObjData2[idx].xyz;
  float objType = uObjData0[idx].x;
  float bound = 0.0;
  
  if (objType < 0.5) { // Sphere
    bound = scale.x;
  } else if (objType < 1.5) { // Box
    bound = length(scale);
  } else if (objType < 2.5) { // Cylinder
    bound = length(scale.xy); // sqrt(r^2 + h^2)
  } else if (objType < 3.5) { // Torus
    bound = scale.x + scale.y;
  } else { // Text/Other
    bound = length(scale);
  }
  
  // Add blend radius and a small safety margin
  float blend = uObjData0[idx].z;
  return bound + blend + 0.2;
}
`;