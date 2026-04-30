import * as THREE from 'three';
import {
  BUBBLE_COLOR, BUBBLE_OUTER_RADIUS, BUBBLE_INNER_RADIUS,
  BUBBLE_SPAWN_Y, BUBBLE_FLOOR_Y, BUBBLE_MAX_Y,
  BUBBLE_INITIAL_VELOCITY, BUBBLE_ACCELERATION,
  BUBBLE_INITIAL_BLEND, BUBBLE_FINAL_BLEND,
  BUBBLE_POP_DURATION, BUBBLE_POP_NOISE_AMOUNT, BUBBLE_POP_NOISE_SCALE
} from './bubble-constants.js';
import { awardCaramel } from './economy.js';
import { gameState } from './state.js';

let nextBubbleId = 20000;

export function createBubble() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 8 + Math.random() * 8; // Random distance around center
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  const groupId = nextBubbleId++;
  const skinId = nextBubbleId++;
  const voidId = nextBubbleId++;
  
  const group = {
    id: groupId,
    type: 'group',
    position: { x, y: BUBBLE_SPAWN_Y, z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0.25, y: 0.25, z: 0.25 },
    operation: 'union',
    blendRadius: BUBBLE_INITIAL_BLEND,
  };
  
  const skin = {
    id: skinId,
    type: 'sphere',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: BUBBLE_OUTER_RADIUS, y: BUBBLE_OUTER_RADIUS, z: BUBBLE_OUTER_RADIUS },
    color: BUBBLE_COLOR,
    operation: 'union',
    blendRadius: 0,
    parentId: groupId,
  };
  
  const voidObj = {
    id: voidId,
    type: 'sphere',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: BUBBLE_INNER_RADIUS, y: BUBBLE_INNER_RADIUS, z: BUBBLE_INNER_RADIUS },
    color: '#000000',
    operation: 'subtract',
    blendRadius: 0,
    parentId: groupId,
    noiseAmount: 0,
    noiseScale: 1,
    noiseOffset: { x: 0, y: 0, z: 0 },
  };
  
  return {
    state: 'rising',
    riseTime: 0,
    popTimer: 0,
    group,
    skin,
    voidObj
  };
}

export function updateBubbles(delta, currentTime) {
  const toRemove = [];
  
  for (const bubble of gameState.bubbles) {
    if (bubble.state === 'rising') {
      bubble.riseTime += delta;
      const speed = BUBBLE_INITIAL_VELOCITY + Math.pow(bubble.riseTime, 2) * BUBBLE_ACCELERATION;
      bubble.group.position.y += speed * delta;
      
      const targetY = BUBBLE_FLOOR_Y + BUBBLE_OUTER_RADIUS;
      const progress = Math.max(0, Math.min(1, (bubble.group.position.y - BUBBLE_SPAWN_Y) / (targetY - BUBBLE_SPAWN_Y)));
      
      const currentScale = 0.25 + progress * 0.75;
      bubble.group.scale.x = currentScale;
      bubble.group.scale.y = currentScale;
      bubble.group.scale.z = currentScale;
      
      bubble.group.blendRadius = BUBBLE_INITIAL_BLEND - progress * (BUBBLE_INITIAL_BLEND - BUBBLE_FINAL_BLEND);
      
      if (bubble.group.position.y > BUBBLE_MAX_Y) {
        toRemove.push(bubble);
      }
    } else if (bubble.state === 'popping') {
      bubble.popTimer += delta;
      const t = Math.min(bubble.popTimer / BUBBLE_POP_DURATION, 1.0);
      
      const maxOffset = BUBBLE_OUTER_RADIUS - BUBBLE_INNER_RADIUS;
      const currentOffset = maxOffset * t;
      
      bubble.voidObj.position.x = bubble.localHitDir.x * currentOffset;
      bubble.voidObj.position.y = bubble.localHitDir.y * currentOffset;
      bubble.voidObj.position.z = bubble.localHitDir.z * currentOffset;
      
      const finalRadius = BUBBLE_OUTER_RADIUS + maxOffset * 2.5; 
      const currentRadius = BUBBLE_INNER_RADIUS + (finalRadius - BUBBLE_INNER_RADIUS) * t;
      bubble.voidObj.scale.x = currentRadius;
      bubble.voidObj.scale.y = currentRadius;
      bubble.voidObj.scale.z = currentRadius;
      
      bubble.voidObj.noiseAmount = BUBBLE_POP_NOISE_AMOUNT * t;
      bubble.voidObj.noiseScale = BUBBLE_POP_NOISE_SCALE;
      
      bubble.voidObj.noiseOffset.y += delta * 2.0;

      // Animate smoothing/blend to zero over the pop so the bubble shell becomes sharp before removal
      if (typeof BUBBLE_INITIAL_BLEND !== 'undefined') {
        // Interpolate from current blend (or initial) down to 0
        const startBlend = bubble.group.blendRadius !== undefined ? bubble.group.blendRadius : BUBBLE_INITIAL_BLEND;
        bubble.group.blendRadius = startBlend * (1.0 - t);
      } else {
        bubble.group.blendRadius = 0;
      }
      
      if (t >= 1.0) {
        toRemove.push(bubble);
      }
    }
  }
  
  for (const b of toRemove) {
    const idx = gameState.bubbles.indexOf(b);
    if (idx > -1) {
      gameState.bubbles.splice(idx, 1);
    }
  }
  
  if (gameState.waveInProgress && gameState.bubbles.length === 0) {
    gameState.bubbles.push(createBubble());
  }
}

export function popBubble(bubble, hitPoint) {
  if (bubble.state === 'popping') return; 
  
  bubble.state = 'popping';
  bubble.popTimer = 0;
  
  const bubbleCenter = new THREE.Vector3(bubble.group.position.x, bubble.group.position.y, bubble.group.position.z);
  let localHitDir = hitPoint.clone().sub(bubbleCenter);
  if (localHitDir.lengthSq() < 0.0001) {
    localHitDir = new THREE.Vector3(0, 1, 0); 
  } else {
    localHitDir.normalize();
  }
  bubble.localHitDir = localHitDir;
  
  if (!bubble.voidObj.noiseOffset) {
    bubble.voidObj.noiseOffset = { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100 };
  }
  
  awardCaramel(0.5);
  gameState.currentWaveStats.bubblesPopped = (gameState.currentWaveStats.bubblesPopped || 0) + 1;
}

export function getBubbleDistanceAt(bubble, p) {
  const localP = p.clone().sub(new THREE.Vector3(bubble.group.position.x, bubble.group.position.y, bubble.group.position.z));
  const scale = bubble.group.scale.x; 
  
  const skinPos = new THREE.Vector3(bubble.skin.position.x, bubble.skin.position.y, bubble.skin.position.z).multiplyScalar(scale);
  const dSkin = localP.distanceTo(skinPos) - bubble.skin.scale.x * scale;
  
  const voidPos = new THREE.Vector3(bubble.voidObj.position.x, bubble.voidObj.position.y, bubble.voidObj.position.z).multiplyScalar(scale);
  const dVoid = localP.distanceTo(voidPos) - bubble.voidObj.scale.x * scale;
  
  return Math.max(dSkin, -dVoid);
}