import * as THREE from 'three';
import {
  FACE_EYE_SPACING,
  FACE_EYE_Y_OFFSET,
  FACE_EYE_SIZE,
  FACE_EYEBROW_SPACING,
  FACE_EYEBROW_Y_OFFSET,
  FACE_EYEBROW_SIZE,
  FACE_DEPTH_OFFSET,
  EXPRESSIONS
} from './face-constants.js';

let nextFaceId = 20000;

/**
 * Creates facial features for a marshmallow.
 * Returns an array of text objects for eyes and eyebrows.
 */
export function createFace(marshmallow, expression = 'neutral') {
  const expr = EXPRESSIONS[expression];
  const center = new THREE.Vector3(
    marshmallow.position.x,
    marshmallow.position.y,
    marshmallow.position.z
  );
  
  // Get marshmallow's orientation
  const euler = new THREE.Euler(
    marshmallow.rotation.x,
    marshmallow.rotation.y,
    marshmallow.rotation.z
  );
  const q = new THREE.Quaternion().setFromEuler(euler);
  
  // Local forward (where the face looks) - marshmallow's Z axis in world space
  const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  // Local right
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  // Local up
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  
  // Position features on the surface
  const faceOffset = marshmallow.scale.x + FACE_DEPTH_OFFSET;
  const faceCenter = center.clone().add(forward.clone().multiplyScalar(faceOffset));
  
  // Create eyes
  const leftEyePos = faceCenter.clone()
    .add(right.clone().multiplyScalar(-FACE_EYE_SPACING))
    .add(up.clone().multiplyScalar(FACE_EYE_Y_OFFSET));
  
  const rightEyePos = faceCenter.clone()
    .add(right.clone().multiplyScalar(FACE_EYE_SPACING))
    .add(up.clone().multiplyScalar(FACE_EYE_Y_OFFSET));
  
  // Create eyebrows
  const leftBrowPos = faceCenter.clone()
    .add(right.clone().multiplyScalar(-FACE_EYEBROW_SPACING))
    .add(up.clone().multiplyScalar(FACE_EYEBROW_Y_OFFSET));
  
  const rightBrowPos = faceCenter.clone()
    .add(right.clone().multiplyScalar(FACE_EYEBROW_SPACING))
    .add(up.clone().multiplyScalar(FACE_EYEBROW_Y_OFFSET));
  
  const faceObjects = [];
  
  // Left eye
  faceObjects.push({
    id: nextFaceId++,
    type: 'text',
    textChar: expr.eyeChar,
    position: { x: leftEyePos.x, y: leftEyePos.y, z: leftEyePos.z },
    rotation: { x: marshmallow.rotation.x, y: marshmallow.rotation.y, z: marshmallow.rotation.z },
    scale: { x: FACE_EYE_SIZE, y: FACE_EYE_SIZE, z: 0.05 },
    color: '#000000',
    operation: 'union',
    blendRadius: 0,
    isFaceFeature: true,
    featureType: 'leftEye'
  });
  
  // Right eye
  faceObjects.push({
    id: nextFaceId++,
    type: 'text',
    textChar: expr.eyeChar,
    position: { x: rightEyePos.x, y: rightEyePos.y, z: rightEyePos.z },
    rotation: { x: marshmallow.rotation.x, y: marshmallow.rotation.y, z: marshmallow.rotation.z },
    scale: { x: FACE_EYE_SIZE, y: FACE_EYE_SIZE, z: 0.05 },
    color: '#000000',
    operation: 'union',
    blendRadius: 0,
    isFaceFeature: true,
    featureType: 'rightEye'
  });
  
  // Left eyebrow
  faceObjects.push({
    id: nextFaceId++,
    type: 'text',
    textChar: expr.leftEyebrowChar,
    position: { x: leftBrowPos.x, y: leftBrowPos.y, z: leftBrowPos.z },
    rotation: { 
      x: marshmallow.rotation.x, 
      y: marshmallow.rotation.y, 
      z: marshmallow.rotation.z + expr.leftEyebrowRotation 
    },
    scale: { x: FACE_EYEBROW_SIZE, y: FACE_EYEBROW_SIZE, z: 0.05 },
    color: '#000000',
    operation: 'union',
    blendRadius: 0,
    isFaceFeature: true,
    featureType: 'leftEyebrow'
  });
  
  // Right eyebrow
  faceObjects.push({
    id: nextFaceId++,
    type: 'text',
    textChar: expr.rightEyebrowChar,
    position: { x: rightBrowPos.x, y: rightBrowPos.y, z: rightBrowPos.z },
    rotation: { 
      x: marshmallow.rotation.x, 
      y: marshmallow.rotation.y, 
      z: marshmallow.rotation.z + expr.rightEyebrowRotation 
    },
    scale: { x: FACE_EYEBROW_SIZE, y: FACE_EYEBROW_SIZE, z: 0.05 },
    color: '#000000',
    operation: 'union',
    blendRadius: 0,
    isFaceFeature: true,
    featureType: 'rightEyebrow'
  });
  
  return faceObjects;
}

/**
 * Updates face expression by recreating face objects
 */
export function setFaceExpression(enemy, expression) {
  // Remove old face
  if (enemy.face) {
    enemy.face = null;
  }
  
  // Create new face with expression
  enemy.face = createFace(enemy.marshmallow, expression);
}

/**
 * Updates face position to follow marshmallow (for melting)
 */
export function updateFacePosition(enemy) {
  if (!enemy.face) return;
  
  const marshmallow = enemy.marshmallow;
  const center = new THREE.Vector3(
    marshmallow.position.x,
    marshmallow.position.y,
    marshmallow.position.z
  );
  
  const euler = new THREE.Euler(
    marshmallow.rotation.x,
    marshmallow.rotation.y,
    marshmallow.rotation.z
  );
  const q = new THREE.Quaternion().setFromEuler(euler);
  
  const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  
  const faceOffset = marshmallow.scale.x + FACE_DEPTH_OFFSET;
  const faceCenter = center.clone().add(forward.clone().multiplyScalar(faceOffset));
  
  // Update positions
  enemy.face.forEach(feature => {
    if (feature.featureType === 'leftEye') {
      const pos = faceCenter.clone()
        .add(right.clone().multiplyScalar(-FACE_EYE_SPACING))
        .add(up.clone().multiplyScalar(FACE_EYE_Y_OFFSET));
      feature.position.x = pos.x;
      feature.position.y = pos.y;
      feature.position.z = pos.z;
    } else if (feature.featureType === 'rightEye') {
      const pos = faceCenter.clone()
        .add(right.clone().multiplyScalar(FACE_EYE_SPACING))
        .add(up.clone().multiplyScalar(FACE_EYE_Y_OFFSET));
      feature.position.x = pos.x;
      feature.position.y = pos.y;
      feature.position.z = pos.z;
    } else if (feature.featureType === 'leftEyebrow') {
      const pos = faceCenter.clone()
        .add(right.clone().multiplyScalar(-FACE_EYEBROW_SPACING))
        .add(up.clone().multiplyScalar(FACE_EYEBROW_Y_OFFSET));
      feature.position.x = pos.x;
      feature.position.y = pos.y;
      feature.position.z = pos.z;
    } else if (feature.featureType === 'rightEyebrow') {
      const pos = faceCenter.clone()
        .add(right.clone().multiplyScalar(FACE_EYEBROW_SPACING))
        .add(up.clone().multiplyScalar(FACE_EYEBROW_Y_OFFSET));
      feature.position.x = pos.x;
      feature.position.y = pos.y;
      feature.position.z = pos.z;
    }
    
    // Update rotation to match marshmallow
    feature.rotation.x = marshmallow.rotation.x;
    feature.rotation.y = marshmallow.rotation.y;
    // Keep eyebrow rotation offsets
    if (feature.featureType.includes('Eyebrow')) {
      const expr = Object.values(EXPRESSIONS).find(e => 
        (feature.featureType === 'leftEyebrow' && e.leftEyebrowChar === feature.textChar) ||
        (feature.featureType === 'rightEyebrow' && e.rightEyebrowChar === feature.textChar)
      );
      if (expr) {
        feature.rotation.z = marshmallow.rotation.z + 
          (feature.featureType === 'leftEyebrow' ? expr.leftEyebrowRotation : expr.rightEyebrowRotation);
      }
    } else {
      feature.rotation.z = marshmallow.rotation.z;
    }
  });
}