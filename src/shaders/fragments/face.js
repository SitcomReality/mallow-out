export const face = `
const float EYE_SEP = 0.4;
const float EYE_HEIGHT = 0.2;
const float EYE_RADIUS = 0.2;
const vec3 EYE_COLOR = vec3(0.05);

vec3 getFaceColor(vec3 localP, vec3 scale, vec3 baseCol, float expression) {
  if (expression < 0.5) return baseCol;
  
  // Face mapped onto the top flat cap (+Y direction in local space)
  float capDist = scale.y - localP.y;
  if (capDist < 0.1) {
    if (expression < 1.5) {
      // Expression 1: Simple circular black eyes
      float eyeSep = scale.x * EYE_SEP;
      float eyeHeight = scale.x * EYE_HEIGHT;
      float eyeRadius = scale.x * EYE_RADIUS;
      
      // Swap coordinates to align horizontal/vertical with the boss cylinder rotation
      float dEye1 = length(vec2(localP.z - eyeSep, localP.x - eyeHeight)) - eyeRadius;
      float dEye2 = length(vec2(localP.z + eyeSep, localP.x - eyeHeight)) - eyeRadius;
      
      float eyes = min(dEye1, dEye2);
      float blend = smoothstep(0.0, 0.02, eyes);
      return mix(EYE_COLOR, baseCol, blend);
    }
  }
  
  return baseCol;
}
`;