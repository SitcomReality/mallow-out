// Face positioning relative to marshmallow center
export const FACE_EYE_SPACING = 0.4;
export const FACE_EYE_Y_OFFSET = 0.3;
export const FACE_EYE_SIZE = 0.2;
export const FACE_EYEBROW_SPACING = 0.5;
export const FACE_EYEBROW_Y_OFFSET = 0.6;
export const FACE_EYEBROW_SIZE = 0.15;
export const FACE_DEPTH_OFFSET = 0.05; // How far from surface

// Expression definitions
export const EXPRESSIONS = {
  neutral: {
    leftEyebrowChar: '-',
    rightEyebrowChar: '-',
    leftEyebrowRotation: 0,
    rightEyebrowRotation: 0,
    eyeChar: 'o',
  },
  angry: {
    leftEyebrowChar: '\\',
    rightEyebrowChar: '/',
    leftEyebrowRotation: 0,
    rightEyebrowRotation: 0,
    eyeChar: 'o',
  },
  sad: {
    leftEyebrowChar: '/',
    rightEyebrowChar: '\\',
    leftEyebrowRotation: 0,
    rightEyebrowRotation: 0,
    eyeChar: 'o',
  },
  hurt: {
    leftEyebrowChar: '-',
    rightEyebrowChar: '-',
    leftEyebrowRotation: -0.3,
    rightEyebrowRotation: 0.3,
    eyeChar: 'o',
  },
  dead: {
    leftEyebrowChar: '-',
    rightEyebrowChar: '-',
    leftEyebrowRotation: 0,
    rightEyebrowRotation: 0,
    eyeChar: 'x',
  }
};