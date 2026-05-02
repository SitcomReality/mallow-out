import { FACE_GLSL_PARAMS } from '../../game/face-constants.js';

export const face = `
${FACE_GLSL_PARAMS}

struct FaceParams {
    vec2 browPos;
    vec2 browSize;
    float browAngle;
    vec2 eyePos;
    vec2 eyeSize;
    vec2 pupilPos;
    vec2 pupilSize;
    vec2 catchlightPos;
    vec2 catchlightSize;
    vec2 mouthPos;
    vec2 mouthSize;
    float mouthAngle;
    vec2 cheekPos;
    vec2 cheekSize;
    float cheekAlpha;
    float lineThickness;
};

FaceParams getDefaultFace() {
    FaceParams p;
    p.browPos = DEF_BROW_P;
    p.browSize = DEF_BROW_S;
    p.browAngle = DEF_BROW_A;
    p.eyePos = DEF_EYE_P;
    p.eyeSize = DEF_EYE_S;
    p.pupilPos = DEF_PUPIL_P;
    p.pupilSize = DEF_PUPIL_S;
    p.catchlightPos = DEF_CATCH_P;
    p.catchlightSize = DEF_CATCH_S;
    p.mouthPos = DEF_MOUTH_P;
    p.mouthSize = DEF_MOUTH_S;
    p.mouthAngle = DEF_MOUTH_A;
    p.cheekPos = DEF_CHEEK_P;
    p.cheekSize = DEF_CHEEK_S;
    p.cheekAlpha = DEF_CHEEK_A;
    p.lineThickness = FACE_LINE_THICKNESS;
    return p;
}

FaceParams getAngryFace() {
    FaceParams p = getDefaultFace();
    p.browPos = ANG_BROW_P;
    p.browAngle = ANG_BROW_A;
    p.pupilSize = ANG_PUPIL_S;
    p.mouthPos = ANG_MOUTH_P;
    p.mouthSize = ANG_MOUTH_S;
    p.mouthAngle = ANG_MOUTH_A;
    p.cheekAlpha = ANG_CHEEK_A;
    return p;
}

FaceParams getSurprisedFace() {
    FaceParams p = getDefaultFace();
    p.browPos = SUR_BROW_P;
    p.browAngle = SUR_BROW_A;
    p.eyePos = SUR_EYE_P;
    p.eyeSize = SUR_EYE_S;
    p.pupilSize = SUR_PUPIL_S;
    p.mouthPos = SUR_MOUTH_P;
    p.mouthSize = SUR_MOUTH_S;
    p.cheekAlpha = SUR_CHEEK_A;
    return p;
}

FaceParams mixParams(FaceParams a, FaceParams b, float t) {
    FaceParams r;
    r.browPos = mix(a.browPos, b.browPos, t);
    r.browSize = mix(a.browSize, b.browSize, t);
    r.browAngle = mix(a.browAngle, b.browAngle, t);
    r.eyePos = mix(a.eyePos, b.eyePos, t);
    r.eyeSize = mix(a.eyeSize, b.eyeSize, t);
    r.pupilPos = mix(a.pupilPos, b.pupilPos, t);
    r.pupilSize = mix(a.pupilSize, b.pupilSize, t);
    r.catchlightPos = mix(a.catchlightPos, b.catchlightPos, t);
    r.catchlightSize = mix(a.catchlightSize, b.catchlightSize, t);
    r.mouthPos = mix(a.mouthPos, b.mouthPos, t);
    r.mouthSize = mix(a.mouthSize, b.mouthSize, t);
    r.mouthAngle = mix(a.mouthAngle, b.mouthAngle, t);
    r.cheekPos = mix(a.cheekPos, b.cheekPos, t);
    r.cheekSize = mix(a.cheekSize, b.cheekSize, t);
    r.cheekAlpha = mix(a.cheekAlpha, b.cheekAlpha, t);
    r.lineThickness = mix(a.lineThickness, b.lineThickness, t);
    return r;
}

float sdEllipse(vec2 p, vec2 r) {
    float k0 = length(p/r);
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdArc(vec2 p, float r, float thickness, float angle) {
    p.x = abs(p.x);
    float sca = sin(angle);
    float scb = cos(angle);
    return ((scb*p.x - sca*p.y) > 0.0) ? length(p - vec2(sca, scb)*r) - thickness : abs(length(p) - r) - thickness;
}

float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0);
    return length(pa - ba*h) - r;
}

vec3 getFaceColor(vec3 localP, vec3 scale, vec3 baseCol, float expression, vec2 lookDir) {
  if (expression < 0.5) return baseCol;
  
  float capDist = scale.y - localP.y;
  if (capDist > 0.1) return baseCol;
  
  vec2 uv = vec2(localP.z, localP.x) / scale.x;
  
  FaceParams p1 = getDefaultFace();
  FaceParams p2 = getDefaultFace();
  float blendT = 0.0;
  
  if (expression < 1.5) {
      p1 = getDefaultFace();
      p2 = getDefaultFace();
      blendT = 0.0;
  } else if (expression < 2.5) {
      p1 = getDefaultFace();
      p2 = getAngryFace();
      blendT = clamp(expression - 1.0, 0.0, 1.0);
  } else {
      p1 = getDefaultFace();
      p2 = getSurprisedFace();
      blendT = clamp(expression - 2.0, 0.0, 1.0);
  }
  
  FaceParams p = mixParams(p1, p2, blendT);
  
  vec3 col = baseCol;
  float aa = 0.015;
  
  vec2 uvMirrored = vec2(abs(uv.x), uv.y);
  float sideSign = sign(uv.x); 
  if (sideSign == 0.0) sideSign = 1.0;
  
  // 1. Mouth
  float mouthDist;
  if (expression > 2.5) {
      // Surprised: Round O-mouth
      mouthDist = sdCircle(uv - p.mouthPos, p.mouthSize.x);
  } else if (expression > 1.5) {
      // Angry: Frown arc
      vec2 mouthUV = vec2(uv.x, -(uv.y - p.mouthPos.y));
      mouthDist = sdArc(mouthUV, p.mouthSize.x, p.mouthSize.y, p.mouthAngle);
  } else {
      // Happy: Smile arc (invert arc angle so it's a smile, not a frown)
      vec2 mouthUV = vec2(uv.x, uv.y - p.mouthPos.y);
      mouthDist = sdArc(mouthUV, p.mouthSize.x, p.mouthSize.y, -p.mouthAngle);
  }
  col = mix(col, vec3(0.05), smoothstep(aa, -aa, mouthDist));

  // 1b. Cheeks
  float cheekDist = sdCircle(uvMirrored - p.cheekPos, p.cheekSize.x);
  vec3 rosy = vec3(1.0, 0.4, 0.5); 
  col = mix(col, rosy, smoothstep(aa, -aa, cheekDist) * p.cheekAlpha);
  
  // 2. Eyebrows
  vec2 browA = vec2(-p.browSize.x, 0.0);
  vec2 browB = vec2(p.browSize.x, 0.0);
  float sa = sin(p.browAngle * sideSign), ca = cos(p.browAngle * sideSign);
  mat2 rot = mat2(ca, -sa, sa, ca);
  vec2 browUV = (uvMirrored - p.browPos) * rot;
  float browDist = sdCapsule(browUV, browA, browB, p.browSize.y);
  col = mix(col, vec3(0.05), smoothstep(aa, -aa, browDist));
  
  // 3. Eyes
  float eyeDist = sdEllipse(uvMirrored - p.eyePos, p.eyeSize);
  float eyeFrameDist = abs(eyeDist) - p.lineThickness;
  
  vec2 innerSize = max(vec2(0.01), p.eyeSize - p.lineThickness);
  
  // Dynamic Pupil Position
  vec2 lookRange = innerSize * 0.6;
  vec2 pupilLookDir = lookDir;
  pupilLookDir.x *= sideSign; 
  vec2 currentPupilCenter = p.eyePos + pupilLookDir * lookRange;
  
  float pupilDist = sdCircle(uvMirrored - currentPupilCenter, p.pupilSize.x);
  float innerEyeArea = sdEllipse(uvMirrored - p.eyePos, innerSize);
  float pupilClipped = max(pupilDist, innerEyeArea);
  
  // Catchlights
  vec2 catchL = vec2(-currentPupilCenter.x, currentPupilCenter.y) + p.catchlightPos + lookDir * 0.02;
  vec2 catchR = vec2(currentPupilCenter.x, currentPupilCenter.y) + p.catchlightPos + lookDir * 0.02;
  float catchDistL = sdCircle(uv - catchL, p.catchlightSize.x);
  float catchDistR = sdCircle(uv - catchR, p.catchlightSize.x);
  float catchDist = min(catchDistL, catchDistR);
  float catchClipped = max(catchDist, pupilClipped);

  // Final Blending
  col = mix(col, vec3(0.05), smoothstep(aa, -aa, eyeFrameDist));
  col = mix(col, vec3(0.05), smoothstep(aa, -aa, pupilClipped));
  col = mix(col, vec3(1.0), smoothstep(aa, -aa, catchClipped));

  return col;
}
`;