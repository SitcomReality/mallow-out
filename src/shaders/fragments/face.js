export const face = `
const float EYE_OFFSET_X = 0.4;
const float EYE_OFFSET_Z = 0.2;
const float EYE_RADIUS = 0.2;
const vec3 EYE_COLOR = vec3(0.05);

vec3 getFaceColor(vec3 localP, vec3 scale, vec3 baseCol, float expression) {
  if (expression < 0.5) return baseCol;
  
  // Face mapped onto the top flat cap (+Y direction in local space)
  float capDist = scale.y - localP.y;
  if (capDist < 0.1) {
    if (expression < 1.5) {
      // Expression 1: Simple circular black eyes
      float eyeOffsetX = scale.x * EYE_OFFSET_X;
      float eyeOffsetZ = scale.x * EYE_OFFSET_Z;
      float eyeRadius = scale.x * EYE_RADIUS;
      
      float dEye1 = length(vec2(localP.x - eyeOffsetX, localP.z - eyeOffsetZ)) - eyeRadius;
      float dEye2 = length(vec2(localP.x + eyeOffsetX, localP.z - eyeOffsetZ)) - eyeRadius;
      
      float eyes = min(dEye1, dEye2);
      float blend = smoothstep(0.0, 0.02, eyes);
      return mix(EYE_COLOR, baseCol, blend);
    }
  }
  
  return baseCol;
}
`;