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
  
  // Correct estimate for rotated objects: distance from center to furthest point
  // For most shapes length(scale) is the distance to corner; for torus, it's sum of radii.
  float bound = (objType > 2.5 && objType < 3.5) ? (scale.x + scale.y) : length(scale);
  
  // Add blend radius for safety
  float blend = uObjData0[idx].z;
  
  return bound + blend + 0.5;
}
`;