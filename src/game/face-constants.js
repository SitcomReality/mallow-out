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
    pupilSize: [0.08, 0.12],
    pupilOffset: [0.0, -0.05],
    catchlightPos: [0.015, 0.03],
    catchlightSize: [0.015, 0.03],
    mouthPos: [0.0, -0.25],
    mouthSize: [0.12, 0.02],
    mouthAngle: 0.0,
  },
  angry: {
    browPos: [0.28, 0.35],
    browAngle: 0.35,
    pupilSize: [0.1, 0.1],
    pupilOffset: [0.0, 0.0],
    mouthPos: [0.0, -0.35],
    mouthSize: [0.22, 0.03],
    mouthAngle: -0.15,
  },
  surprised: {
    browPos: [0.4, 0.55],
    browAngle: -0.25,
    eyeSize: [0.15, 0.1],
    eyePos: [0.32, 0.2],
    pupilSize: [0.06, 0.06],
    pupilOffset: [0.0, 0.0],
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
    const vec2  DEF_PUPIL_S = vec2(${FACE_STYLE.default.pupilSize[0].toFixed(3)}, ${FACE_STYLE.default.pupilSize[1].toFixed(3)});
    const vec2  DEF_PUPIL_O = vec2(${FACE_STYLE.default.pupilOffset[0].toFixed(3)}, ${FACE_STYLE.default.pupilOffset[1].toFixed(3)});
    const vec2  DEF_CATCH_P = vec2(${FACE_STYLE.default.catchlightPos[0].toFixed(3)}, ${FACE_STYLE.default.catchlightPos[1].toFixed(3)});
    const vec2  DEF_CATCH_S = vec2(${FACE_STYLE.default.catchlightSize[0].toFixed(3)}, ${FACE_STYLE.default.catchlightSize[1].toFixed(3)});
    const vec2  DEF_MOUTH_P = vec2(${FACE_STYLE.default.mouthPos[0].toFixed(3)}, ${FACE_STYLE.default.mouthPos[1].toFixed(3)});
    const vec2  DEF_MOUTH_S = vec2(${FACE_STYLE.default.mouthSize[0].toFixed(3)}, ${FACE_STYLE.default.mouthSize[1].toFixed(3)});
    const float DEF_MOUTH_A = ${FACE_STYLE.default.mouthAngle.toFixed(3)};

    // Angry Expression Overrides
    const vec2  ANG_BROW_P = vec2(${FACE_STYLE.angry.browPos[0].toFixed(3)}, ${FACE_STYLE.angry.browPos[1].toFixed(3)});
    const float ANG_BROW_A = ${FACE_STYLE.angry.browAngle.toFixed(3)};
    const vec2  ANG_PUPIL_S = vec2(${FACE_STYLE.angry.pupilSize[0].toFixed(3)}, ${FACE_STYLE.angry.pupilSize[1].toFixed(3)});
    const vec2  ANG_PUPIL_O = vec2(${FACE_STYLE.angry.pupilOffset[0].toFixed(3)}, ${FACE_STYLE.angry.pupilOffset[1].toFixed(3)});
    const vec2  ANG_MOUTH_P = vec2(${FACE_STYLE.angry.mouthPos[0].toFixed(3)}, ${FACE_STYLE.angry.mouthPos[1].toFixed(3)});
    const vec2  ANG_MOUTH_S = vec2(${FACE_STYLE.angry.mouthSize[0].toFixed(3)}, ${FACE_STYLE.angry.mouthSize[1].toFixed(3)});
    const float ANG_MOUTH_A = ${FACE_STYLE.angry.mouthAngle.toFixed(3)};

    // Surprised Expression Overrides
    const vec2  SUR_BROW_P = vec2(${FACE_STYLE.surprised.browPos[0].toFixed(3)}, ${FACE_STYLE.surprised.browPos[1].toFixed(3)});
    const float SUR_BROW_A = ${FACE_STYLE.surprised.browAngle.toFixed(3)};
    const vec2  SUR_EYE_P  = vec2(${FACE_STYLE.surprised.eyePos[0].toFixed(3)}, ${FACE_STYLE.surprised.eyePos[1].toFixed(3)});
    const vec2  SUR_EYE_S  = vec2(${FACE_STYLE.surprised.eyeSize[0].toFixed(3)}, ${FACE_STYLE.surprised.eyeSize[1].toFixed(3)});
    const vec2  SUR_PUPIL_S = vec2(${FACE_STYLE.surprised.pupilSize[0].toFixed(3)}, ${FACE_STYLE.surprised.pupilSize[1].toFixed(3)});
    const vec2  SUR_PUPIL_O = vec2(${FACE_STYLE.surprised.pupilOffset[0].toFixed(3)}, ${FACE_STYLE.surprised.pupilOffset[1].toFixed(3)});
    const vec2  SUR_MOUTH_P = vec2(${FACE_STYLE.surprised.mouthPos[0].toFixed(3)}, ${FACE_STYLE.surprised.mouthPos[1].toFixed(3)});
    const vec2  SUR_MOUTH_S = vec2(${FACE_STYLE.surprised.mouthSize[0].toFixed(3)}, ${FACE_STYLE.surprised.mouthSize[1].toFixed(3)});
`;