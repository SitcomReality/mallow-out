export const EXPRESSION_NONE = 0;
export const EXPRESSION_DEFAULT = 1;
export const EXPRESSION_ANGRY = 2;
export const EXPRESSION_SURPRISED = 3;

/**
 * Visual configuration for the rigid geometric faces.
 * Extracted for easier tweaking and testing.
 */
export const FACE_STYLE = {
  lineThickness: 0.025,
  default: {
    browPos: [0.35, 0.45],
    browSize: [0.18, 0.03],
    browAngle: 0.0,
    eyePos: [0.32, 0.1],
    eyeSize: [0.15, 0.2],
    pupilFill: 0.6,
    catchlightPos: [0.02, 0.04],
    catchlightSize: [0.015, 0.03],
    mouthPos: [0.0, -0.25],
    mouthSize: [0.12, 0.02],
    mouthAngle: 0.0,
  },
  angry: {
    browPos: [0.28, 0.35],
    browAngle: 0.35,
    pupilFill: 0.9,
    mouthPos: [0.0, -0.35],
    mouthSize: [0.22, 0.03],
    mouthAngle: -0.15,
  },
  surprised: {
    browPos: [0.4, 0.55],
    browAngle: -0.25,
    eyeSize: [0.15, 0.1],
    eyePos: [0.32, 0.2],
    pupilFill: 0.5,
    mouthSize: [0.05, 0.05],
    mouthPos: [0.05, -0.3],
  }
};

// Helper to inject these into the shader
export const FACE_GLSL_PARAMS = `
    const float FACE_LINE_THICKNESS = ${FACE_STYLE.lineThickness.toFixed(4)};
    
    // Default Expression Values
    const vec2  DEF_BROW_P = vec2(${FACE_STYLE.default.browPos[0].toFixed(3)}, ${FACE_STYLE.default.browPos[1].toFixed(3)});
    const vec2  DEF_BROW_S = vec2(${FACE_STYLE.default.browSize[0].toFixed(3)}, ${FACE_STYLE.default.browSize[1].toFixed(3)});
    const float DEF_BROW_A = ${FACE_STYLE.default.browAngle.toFixed(3)};
    const vec2  DEF_EYE_P  = vec2(${FACE_STYLE.default.eyePos[0].toFixed(3)}, ${FACE_STYLE.default.eyePos[1].toFixed(3)});
    const vec2  DEF_EYE_S  = vec2(${FACE_STYLE.default.eyeSize[0].toFixed(3)}, ${FACE_STYLE.default.eyeSize[1].toFixed(3)});
    const float DEF_PUPIL  = ${FACE_STYLE.default.pupilFill.toFixed(3)};
    const vec2  DEF_CATCH_P = vec2(${FACE_STYLE.default.catchlightPos[0].toFixed(3)}, ${FACE_STYLE.default.catchlightPos[1].toFixed(3)});
    const vec2  DEF_CATCH_S = vec2(${FACE_STYLE.default.catchlightSize[0].toFixed(3)}, ${FACE_STYLE.default.catchlightSize[1].toFixed(3)});
    const vec2  DEF_MOUTH_P = vec2(${FACE_STYLE.default.mouthPos[0].toFixed(3)}, ${FACE_STYLE.default.mouthPos[1].toFixed(3)});
    const vec2  DEF_MOUTH_S = vec2(${FACE_STYLE.default.mouthSize[0].toFixed(3)}, ${FACE_STYLE.default.mouthSize[1].toFixed(3)});
    const float DEF_MOUTH_A = ${FACE_STYLE.default.mouthAngle.toFixed(3)};

    // Angry Expression Overrides
    const vec2  ANG_BROW_P = vec2(${FACE_STYLE.angry.browPos[0].toFixed(3)}, ${FACE_STYLE.angry.browPos[1].toFixed(3)});
    const float ANG_BROW_A = ${FACE_STYLE.angry.browAngle.toFixed(3)};
    const float ANG_PUPIL  = ${FACE_STYLE.angry.pupilFill.toFixed(3)};
    const vec2  ANG_MOUTH_P = vec2(${FACE_STYLE.angry.mouthPos[0].toFixed(3)}, ${FACE_STYLE.angry.mouthPos[1].toFixed(3)});
    const vec2  ANG_MOUTH_S = vec2(${FACE_STYLE.angry.mouthSize[0].toFixed(3)}, ${FACE_STYLE.angry.mouthSize[1].toFixed(3)});
    const float ANG_MOUTH_A = ${FACE_STYLE.angry.mouthAngle.toFixed(3)};

    // Surprised Expression Overrides
    const vec2  SUR_BROW_P = vec2(${FACE_STYLE.surprised.browPos[0].toFixed(3)}, ${FACE_STYLE.surprised.browPos[1].toFixed(3)});
    const float SUR_BROW_A = ${FACE_STYLE.surprised.browAngle.toFixed(3)};
    const vec2  SUR_EYE_P  = vec2(${FACE_STYLE.surprised.eyePos[0].toFixed(3)}, ${FACE_STYLE.surprised.eyePos[1].toFixed(3)});
    const vec2  SUR_EYE_S  = vec2(${FACE_STYLE.surprised.eyeSize[0].toFixed(3)}, ${FACE_STYLE.surprised.eyeSize[1].toFixed(3)});
    const float SUR_PUPIL  = ${FACE_STYLE.surprised.pupilFill.toFixed(3)};
    const vec2  SUR_MOUTH_P = vec2(${FACE_STYLE.surprised.mouthPos[0].toFixed(3)}, ${FACE_STYLE.surprised.mouthPos[1].toFixed(3)});
    const vec2  SUR_MOUTH_S = vec2(${FACE_STYLE.surprised.mouthSize[0].toFixed(3)}, ${FACE_STYLE.surprised.mouthSize[1].toFixed(3)});
`;