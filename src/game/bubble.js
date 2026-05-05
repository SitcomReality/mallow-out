import { gameState } from './state.js';
import { 
  BUBBLE_SPAWN_Y, 
  BUBBLE_MAX_Y, 
  BUBBLE_INITIAL_BLEND, 
  BUBBLE_FINAL_BLEND, 
  BUBBLE_OUTER_RADIUS, 
  BUBBLE_INNER_RADIUS, 
  BUBBLE_COLOR, 
  BUBBLE_POP_DURATION, 
  BUBBLE_POP_NOISE_AMOUNT, 
  BUBBLE_POP_NOISE_SCALE, 
  BUBBLE_INITIAL_VELOCITY, 
  BUBBLE_ACCELERATION,
  BUBBLE_FLOOR_Y,
  BUBBLE_SPAWN_MIN_DELAY,
  BUBBLE_SPAWN_MAX_DELAY
} from './bubble-constants.js';

let nextBubbleId = 20000;

export function createBubble() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 1.0 + Math.random() * 4.0; 
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
    scale: { x: 0.1, y: 0.1, z: 0.1 },
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
    id: groupId,
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
  
  // Handle spawning
  if (!gameState.currentMarshmallow && gameState.bubbles.length === 0) {
    if (gameState.nextBubbleSpawnTime === 0) {
      gameState.nextBubbleSpawnTime = currentTime + BUBBLE_SPAWN_MIN_DELAY + Math.random() * (BUBBLE_SPAWN_MAX_DELAY - BUBBLE_SPAWN_MIN_DELAY);
    }
    
    if (currentTime >= gameState.nextBubbleSpawnTime) {
      gameState.bubbles.push(createBubble());
      gameState.nextBubbleSpawnTime = 0;
    }
  } else if (gameState.currentMarshmallow) {
    // Marshmallow prevents spawning and clears queue
    gameState.nextBubbleSpawnTime = 0;
  }

  for (const bubble of gameState.bubbles) {
    if (bubble.state === 'rising') {
      bubble.riseTime += delta;
      const speed = BUBBLE_INITIAL_VELOCITY + bubble.riseTime * BUBBLE_ACCELERATION;
      bubble.group.position.y += speed * delta;
      
      const targetY = BUBBLE_MAX_Y;
      const totalDist = targetY - BUBBLE_SPAWN_Y;
      const progress = Math.max(0, Math.min(1, (bubble.group.position.y - BUBBLE_SPAWN_Y) / totalDist));
      
      const currentScale = 0.1 + progress * 0.9;
      bubble.group.scale.x = currentScale;
      bubble.group.scale.y = currentScale;
      bubble.group.scale.z = currentScale;
      
      bubble.group.blendRadius = BUBBLE_INITIAL_BLEND - progress * (BUBBLE_INITIAL_BLEND - BUBBLE_FINAL_BLEND);
      
      if (bubble.group.position.y > BUBBLE_MAX_Y) {
        bubble.state = 'popping';
      }
    } else if (bubble.state === 'popping') {
      bubble.popTimer += delta;
      const t = Math.min(bubble.popTimer / BUBBLE_POP_DURATION, 1.0);
      
      const maxPopGrowth = 1.5;
      const currentRadius = BUBBLE_OUTER_RADIUS + maxPopGrowth * t;
      bubble.voidObj.scale.x = currentRadius;
      bubble.voidObj.scale.y = currentRadius;
      bubble.voidObj.scale.z = currentRadius;
      
      bubble.voidObj.noiseAmount = BUBBLE_POP_NOISE_AMOUNT * t;
      bubble.voidObj.noiseScale = BUBBLE_POP_NOISE_SCALE;
      bubble.voidObj.noiseOffset.y += delta * 5.0;
      
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
}