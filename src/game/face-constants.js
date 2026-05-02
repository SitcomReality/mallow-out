export const EXPRESSION_NONE = 0;
export const EXPRESSION_DEFAULT = 1;
export const EXPRESSION_ANGRY = 2;
export const EXPRESSION_SURPRISED = 3;

/**
 * Visual configuration for the rigid geometric faces.
 * Extracted for easier tweaking and testing.
 */
export const FACE_STYLE = {
  lineThickness: 0.035, // Slightly thicker for "paint" feel
  default: {
    browPos: [0.38, 0.48],
    browSize: [0.22, 0.04],
    browAngle: 0.1,
    eyePos: [0.35, 0.12],
    eyeSize: [0.25, 0.25], // Large round eyes
    pupilPos: [0.0, 0.0],
    pupilSize: [0.12, 0.12], // Round pupils
    catchlightPos: [0.05, 0.06],
    catchlightSize: [0.03, 0.03],
    mouthPos: [0.0, -0.3],
    mouthSize: [0.35, 0.05], // Smile radius and thickness
    mouthAngle: 1.2, // Angle for the arc
    cheekPos: [0.65, -0.12],
    cheekSize: [0.12, 0.12],
    cheekAlpha: 1.0,
  },
  angry: {
    cheekAlpha: 0.0,
    browPos: [0.3, 0.4],
    browAngle: 0.45,
    eyeSize: [0.25, 0.12], // Squinting
    pupilSize: [0.1, 0.1],
    mouthPos: [0.0, -0.45],
    mouthSize: [0.25, 0.04],
    mouthAngle: 0.8, // Frown arc
  },
  surprised: {
    browPos: [0.45, 0.6],
    browAngle: -0.2,
    eyeSize: [0.28, 0.28], // Very round
    eyePos: [0.35, 0.15],
    pupilSize: [0.08, 0.08],
    mouthSize: [0.12, 0.12], // O-shape
    mouthPos: [0.0, -0.4],
    cheekAlpha: 0.0,
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
    const vec2  DEF_PUPIL_P = vec2(${FACE_STYLE.default.pupilPos[0].toFixed(3)}, ${FACE_STYLE.default.pupilPos[1].toFixed(3)});
    const vec2  DEF_PUPIL_S = vec2(${FACE_STYLE.default.pupilSize[0].toFixed(3)}, ${FACE_STYLE.default.pupilSize[1].toFixed(3)});
    const vec2  DEF_CATCH_P = vec2(${FACE_STYLE.default.catchlightPos[0].toFixed(3)}, ${FACE_STYLE.default.catchlightPos[1].toFixed(3)});
    const vec2  DEF_CATCH_S = vec2(${FACE_STYLE.default.catchlightSize[0].toFixed(3)}, ${FACE_STYLE.default.catchlightSize[1].toFixed(3)});
    const vec2  DEF_MOUTH_P = vec2(${FACE_STYLE.default.mouthPos[0].toFixed(3)}, ${FACE_STYLE.default.mouthPos[1].toFixed(3)});
    const vec2  DEF_MOUTH_S = vec2(${FACE_STYLE.default.mouthSize[0].toFixed(3)}, ${FACE_STYLE.default.mouthSize[1].toFixed(3)});
    const float DEF_MOUTH_A = ${FACE_STYLE.default.mouthAngle.toFixed(3)};
    const vec2  DEF_CHEEK_P = vec2(${FACE_STYLE.default.cheekPos[0].toFixed(3)}, ${FACE_STYLE.default.cheekPos[1].toFixed(3)});
    const vec2  DEF_CHEEK_S = vec2(${FACE_STYLE.default.cheekSize[0].toFixed(3)}, ${FACE_STYLE.default.cheekSize[1].toFixed(3)});
    const float DEF_CHEEK_A = ${FACE_STYLE.default.cheekAlpha.toFixed(3)};

    // Angry Expression Overrides
    const vec2  ANG_BROW_P = vec2(${FACE_STYLE.angry.browPos[0].toFixed(3)}, ${FACE_STYLE.angry.browPos[1].toFixed(3)});
    const float ANG_BROW_A = ${FACE_STYLE.angry.browAngle.toFixed(3)};
    const vec2  ANG_PUPIL_S = vec2(${FACE_STYLE.angry.pupilSize[0].toFixed(3)}, ${FACE_STYLE.angry.pupilSize[1].toFixed(3)});
    const vec2  ANG_MOUTH_P = vec2(${FACE_STYLE.angry.mouthPos[0].toFixed(3)}, ${FACE_STYLE.angry.mouthPos[1].toFixed(3)});
    const vec2  ANG_MOUTH_S = vec2(${FACE_STYLE.angry.mouthSize[0].toFixed(3)}, ${FACE_STYLE.angry.mouthSize[1].toFixed(3)});
    const float ANG_MOUTH_A = ${FACE_STYLE.angry.mouthAngle.toFixed(3)};
    const float ANG_CHEEK_A = ${FACE_STYLE.angry.cheekAlpha.toFixed(3)};

    // Surprised Expression Overrides
    const vec2  SUR_BROW_P = vec2(${FACE_STYLE.surprised.browPos[0].toFixed(3)}, ${FACE_STYLE.surprised.browPos[1].toFixed(3)});
    const float SUR_BROW_A = ${FACE_STYLE.surprised.browAngle.toFixed(3)};
    const vec2  SUR_EYE_P  = vec2(${FACE_STYLE.surprised.eyePos[0].toFixed(3)}, ${FACE_STYLE.surprised.eyePos[1].toFixed(3)});
    const vec2  SUR_EYE_S  = vec2(${FACE_STYLE.surprised.eyeSize[0].toFixed(3)}, ${FACE_STYLE.surprised.eyeSize[1].toFixed(3)});
    const vec2  SUR_PUPIL_S = vec2(${FACE_STYLE.surprised.pupilSize[0].toFixed(3)}, ${FACE_STYLE.surprised.pupilSize[1].toFixed(3)});
    const vec2  SUR_MOUTH_P = vec2(${FACE_STYLE.surprised.mouthPos[0].toFixed(3)}, ${FACE_STYLE.surprised.mouthPos[1].toFixed(3)});
    const vec2  SUR_MOUTH_S = vec2(${FACE_STYLE.surprised.mouthSize[0].toFixed(3)}, ${FACE_STYLE.surprised.mouthSize[1].toFixed(3)});
    const float SUR_CHEEK_A = ${FACE_STYLE.surprised.cheekAlpha.toFixed(3)};
`;