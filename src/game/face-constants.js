// Face feature dimensions (relative to boss scale)
export const EYE_RADIUS = 0.12;
export const EYE_SPACING = 0.5;
export const EYE_HEIGHT = 0.3;
export const EYE_DEPTH = 0.15;

export const EYEBROW_WIDTH = 0.05;
export const EYEBROW_LENGTH = 0.2;
export const EYEBROW_HEIGHT = 0.5;
export const EYEBROW_DEPTH = 0.08;

export const MOUTH_RADIUS = 0.3;
export const MOUTH_WIDTH = 0.08;
export const MOUTH_HEIGHT = -0.1;
export const MOUTH_DEPTH = 0.1;

// Expression states based on health percentage
export const EXPRESSION_HAPPY = 'happy';      // > 75% health
export const EXPRESSION_CONCERNED = 'concerned'; // 50-75% health
export const EXPRESSION_HURT = 'hurt';        // 25-50% health
export const EXPRESSION_DEFEATED = 'defeated';   // < 25% health

// Eyebrow angles for expressions (in radians)
export const EYEBROW_ANGLES = {
  [EXPRESSION_HAPPY]: { left: 0.15, right: -0.15 },      // Raised, friendly
  [EXPRESSION_CONCERNED]: { left: 0.0, right: 0.0 },     // Flat
  [EXPRESSION_HURT]: { left: -0.3, right: 0.3 },         // Sad (outer down)
  [EXPRESSION_DEFEATED]: { left: -0.5, right: 0.5 },     // Very sad
};

// Mouth arc adjustments for expressions
export const MOUTH_ARCS = {
  [EXPRESSION_HAPPY]: 0.15,       // Smile (arc upward)
  [EXPRESSION_CONCERNED]: 0.0,    // Neutral
  [EXPRESSION_HURT]: -0.1,        // Frown
  [EXPRESSION_DEFEATED]: -0.2,    // Big frown
};

// Eye scale for expressions
export const EYE_SCALES = {
  [EXPRESSION_HAPPY]: 1.0,
  [EXPRESSION_CONCERNED]: 1.0,
  [EXPRESSION_HURT]: 0.9,
  [EXPRESSION_DEFEATED]: 0.6,  // Squinted/closing
};

// Material IDs for face features
export const MATERIAL_BODY = 0;
export const MATERIAL_EYE = 1;
export const MATERIAL_EYEBROW = 2;
export const MATERIAL_MOUTH = 3;