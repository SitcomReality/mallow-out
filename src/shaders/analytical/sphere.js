export const analyticalSphere = `
// Analytical ray-sphere intersection
// Returns vec2(tNear, tFar) where ray enters/exits sphere
// Returns vec2(-1.0, -1.0) if no intersection
vec2 intersectSphere(vec3 ro, vec3 rd, vec3 center, float radius) {
  vec3 oc = ro - center;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float h = b * b - c;
  
  if (h < 0.0) return vec2(-1.0, -1.0);
  
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

// Analytical hollow sphere distance (for interior rendering)
float sdHollowSphere(vec3 p, vec3 center, float radius, float thickness) {
  return abs(length(p - center) - radius) - thickness;
}
`;