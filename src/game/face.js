import {
  EYE_RADIUS, EYE_SPACING, EYE_HEIGHT, EYE_DEPTH,
  EYEBROW_WIDTH, EYEBROW_LENGTH, EYEBROW_HEIGHT, EYEBROW_DEPTH,
  MOUTH_RADIUS, MOUTH_WIDTH, MOUTH_HEIGHT, MOUTH_DEPTH,
  EXPRESSION_HAPPY, EXPRESSION_CONCERNED, EXPRESSION_HURT, EXPRESSION_DEFEATED,
  EYEBROW_ANGLES, MOUTH_ARCS, EYE_SCALES,
  MATERIAL_EYE, MATERIAL_EYEBROW, MATERIAL_MOUTH
} from './face-constants.js';

let nextFaceId = 50000;

export function getExpressionForHealth(healthPercent) {
  if (healthPercent > 0.75) return EXPRESSION_HAPPY;
  if (healthPercent > 0.5) return EXPRESSION_CONCERNED;
  if (healthPercent > 0.25) return EXPRESSION_HURT;
  return EXPRESSION_DEFEATED;
}

export function createFaceFeatures(boss, expression = EXPRESSION_HAPPY) {
  const features = [];
  const scale = boss.marshmallow.scale.x; // Use radius as base scale
  const pos = boss.marshmallow.position;
  const rot = boss.marshmallow.rotation;
  
  // Eyes
  const eyeScale = EYE_SCALES[expression];
  const leftEye = {
    id: nextFaceId++,
    type: 'sphere',
    position: { 
      x: pos.x - EYE_SPACING * scale, 
      y: pos.y + EYE_HEIGHT * scale, 
      z: pos.z + EYE_DEPTH * scale 
    },
    rotation: { x: rot.x, y: rot.y, z: rot.z },
    scale: { x: EYE_RADIUS * scale * eyeScale, y: EYE_RADIUS * scale * eyeScale, z: EYE_RADIUS * scale * eyeScale },
    color: '#000000',
    operation: 'subtract',
    blendRadius: 0.02,
    materialId: MATERIAL_EYE,
    isFaceFeature: true,
  };
  
  const rightEye = {
    id: nextFaceId++,
    type: 'sphere',
    position: { 
      x: pos.x + EYE_SPACING * scale, 
      y: pos.y + EYE_HEIGHT * scale, 
      z: pos.z + EYE_DEPTH * scale 
    },
    rotation: { x: rot.x, y: rot.y, z: rot.z },
    scale: { x: EYE_RADIUS * scale * eyeScale, y: EYE_RADIUS * scale * eyeScale, z: EYE_RADIUS * scale * eyeScale },
    color: '#000000',
    operation: 'subtract',
    blendRadius: 0.02,
    materialId: MATERIAL_EYE,
    isFaceFeature: true,
  };
  
  // Eyebrows
  const angles = EYEBROW_ANGLES[expression];
  const leftBrow = {
    id: nextFaceId++,
    type: 'cylinder',
    position: { 
      x: pos.x - EYE_SPACING * scale, 
      y: pos.y + EYEBROW_HEIGHT * scale, 
      z: pos.z + EYEBROW_DEPTH * scale 
    },
    rotation: { x: rot.x, y: rot.y, z: rot.z + angles.left },
    scale: { x: EYEBROW_WIDTH * scale, y: EYEBROW_LENGTH * scale / 2, z: 0 },
    color: '#000000',
    operation: 'subtract',
    blendRadius: 0.02,
    materialId: MATERIAL_EYEBROW,
    isFaceFeature: true,
  };
  
  const rightBrow = {
    id: nextFaceId++,
    type: 'cylinder',
    position: { 
      x: pos.x + EYE_SPACING * scale, 
      y: pos.y + EYEBROW_HEIGHT * scale, 
      z: pos.z + EYEBROW_DEPTH * scale 
    },
    rotation: { x: rot.x, y: rot.y, z: rot.z + angles.right },
    scale: { x: EYEBROW_WIDTH * scale, y: EYEBROW_LENGTH * scale / 2, z: 0 },
    color: '#000000',
    operation: 'subtract',
    blendRadius: 0.02,
    materialId: MATERIAL_EYEBROW,
    isFaceFeature: true,
  };
  
  // Mouth (torus for smile/frown arc)
  const mouthArc = MOUTH_ARCS[expression];
  const mouth = {
    id: nextFaceId++,
    type: 'torus',
    position: { 
      x: pos.x, 
      y: pos.y + MOUTH_HEIGHT * scale + mouthArc * scale, 
      z: pos.z + MOUTH_DEPTH * scale 
    },
    rotation: { x: rot.x, y: rot.y, z: rot.z },
    scale: { x: MOUTH_RADIUS * scale, y: MOUTH_WIDTH * scale, z: 0 },
    color: '#000000',
    operation: 'subtract',
    blendRadius: 0.03,
    materialId: MATERIAL_MOUTH,
    isFaceFeature: true,
  };
  
  features.push(leftEye, rightEye, leftBrow, rightBrow, mouth);
  return features;
}

export function updateFaceExpression(boss, expression) {
  // Remove old face features
  boss.faceFeatures = boss.faceFeatures || [];
  
  // Generate new face with updated expression
  boss.faceFeatures = createFaceFeatures(boss, expression);
}