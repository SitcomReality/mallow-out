import { FACE_GLSL_PARAMS } from '../../game/face-constants.js';

export const face = `
${FACE_GLSL_PARAMS}

struct FaceParams {
    vec2 browPos;
    vec2 browSize;
    float browAngle;
    vec2 eyePos;
    vec2 eyeSize;
    float pupilFill;
    vec2 catchlightPos;
    vec2 catchlightSize;
    vec2 mouthPos;
    vec2 mouthSize;
    float mouthAngle;
    float lineThickness;
};

FaceParams getDefaultFace() {
    FaceParams p;
    p.browPos = DEF_BROW_P;
    p.browSize = DEF_BROW_S;
    p.browAngle = DEF_BROW_A;
    p.eyePos = DEF_EYE_P;
    p.eyeSize = DEF_EYE_S;
    p.pupilFill = DEF_PUPIL;
    p.catchlightPos = DEF_CATCH_P;
    p.catchlightSize = DEF_CATCH_S;
    p.mouthPos = DEF_MOUTH_P;
    p.mouthSize = DEF_MOUTH_S;
    p.mouthAngle = DEF_MOUTH_A;
    p.lineThickness = FACE_LINE_THICKNESS;
    return p;
}

FaceParams getAngryFace() {
    FaceParams p = getDefaultFace();
    p.browPos = ANG_BROW_P;
    p.browAngle = ANG_BROW_A;
    p.pupilFill = ANG_PUPIL;
    p.mouthPos = ANG_MOUTH_P;
    p.mouthSize = ANG_MOUTH_S;
    p.mouthAngle = ANG_MOUTH_A;
    return p;
}

FaceParams getSurprisedFace() {
    FaceParams p = getDefaultFace();
    p.browPos = SUR_BROW_P;
    p.browAngle = SUR_BROW_A;
    p.eyePos = SUR_EYE_P;
    p.eyeSize = SUR_EYE_S;
    p.pupilFill = SUR_PUPIL;
    p.mouthPos = SUR_MOUTH_P;
    p.mouthSize = SUR_MOUTH_S;
    return p;
}

FaceParams mixParams(FaceParams a, FaceParams b, float t) {
    FaceParams r;
    r.browPos = mix(a.browPos, b.browPos, t);
    r.browSize = mix(a.browSize, b.browSize, t);
    r.browAngle = mix(a.browAngle, b.browAngle, t);
    r.eyePos = mix(a.eyePos, b.eyePos, t);
    r.eyeSize = mix(a.eyeSize, b.eyeSize, t);
    r.pupilFill = mix(a.pupilFill, b.pupilFill, t);
    r.catchlightPos = mix(a.catchlightPos, b.catchlightPos, t);
    r.catchlightSize = mix(a.catchlightSize, b.catchlightSize, t);
    r.mouthPos = mix(a.mouthPos, b.mouthPos, t);
    r.mouthSize = mix(a.mouthSize, b.mouthSize, t);
    r.mouthAngle = mix(a.mouthAngle, b.mouthAngle, t);
    r.lineThickness = mix(a.lineThickness, b.lineThickness, t);
    return r;
}

float drawBox(vec2 p, vec2 center, vec2 size, float angle) {
    p -= center;
    float c = cos(angle), s = sin(angle);
    p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    vec2 d = abs(p) - size;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float drawHollowBox(vec2 p, vec2 center, vec2 size, float angle, float thickness) {
    float d = drawBox(p, center, size, angle);
    return abs(d) - thickness;
}

vec3 getFaceColor(vec3 localP, vec3 scale, vec3 baseCol, float expression) {
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
  float aa = 0.02;
  
  vec2 uvMirrored = vec2(abs(uv.x), uv.y);
  float sideSign = sign(uv.x); 
  if (sideSign == 0.0) sideSign = 1.0;
  
  // 1. Mouth
  float mouthDist = drawBox(uv, p.mouthPos, p.mouthSize, p.mouthAngle);
  col = mix(col, vec3(0.05), smoothstep(aa, -aa, mouthDist));
  
  // 2. Eyebrows
  float browDist = drawBox(uvMirrored, p.browPos, p.browSize, p.browAngle * sideSign);
  col = mix(col, vec3(0.05), smoothstep(aa, -aa, browDist));
  
  // 3. Eyes
  float eyeFrameDist = drawHollowBox(uvMirrored, p.eyePos, p.eyeSize, 0.0, p.lineThickness);
  
  vec2 innerSize = max(vec2(0.0), p.eyeSize - p.lineThickness);
  float pupilHalfHeight = innerSize.y * p.pupilFill;
  vec2 pupilCenter = vec2(p.eyePos.x, p.eyePos.y - innerSize.y + pupilHalfHeight);
  vec2 pupilSize = vec2(innerSize.x, pupilHalfHeight);
  
  float pupilDist = drawBox(uvMirrored, pupilCenter, pupilSize, 0.0);
  float innerEyeBox = drawBox(uvMirrored, p.eyePos, innerSize, 0.0);
  float pupilClipped = max(pupilDist, innerEyeBox);
  
  vec2 catchCenterUnmirroredLeft = vec2(-p.eyePos.x, pupilCenter.y) + p.catchlightPos;
  vec2 catchCenterUnmirroredRight = vec2(p.eyePos.x, pupilCenter.y) + p.catchlightPos;
  
  float catchDistL = drawBox(uv, catchCenterUnmirroredLeft, p.catchlightSize, 0.0);
  float catchDistR = drawBox(uv, catchCenterUnmirroredRight, p.catchlightSize, 0.0);
  float catchDist = min(catchDistL, catchDistR);
  float catchClipped = max(catchDist, pupilClipped);

  // Blend Eyes
  col = mix(col, vec3(0.05), smoothstep(aa, -aa, eyeFrameDist));
  col = mix(col, vec3(0.05), smoothstep(aa, -aa, pupilClipped));
  col = mix(col, vec3(1.0), smoothstep(aa, -aa, catchClipped));

  return col;
}
`;