import { gameState } from './state.js';
import * as THREE from 'three';
import { 
  BUBBLE_SPAWN_DISTANCE,
  BUBBLE_POP_DISTANCE,
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
  BUBBLE_SPAWN_MIN_DELAY,
  BUBBLE_SPAWN_MAX_DELAY
} from './bubble-constants.js';

let nextBubbleId = 20000;

export function createBubble() {
  // Use camera orientation to find a position on the "back wall" relative to the player
  const player = gameState.player;
  const forward = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();

  // Constrain spread to stay well within the camera's view
  const spread = 0.7;
  const targetDir = forward.clone().add(new THREE.Vector3(
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread
  )).normalize();

  const spawnPos = targetDir.clone().multiplyScalar(BUBBLE_SPAWN_DISTANCE);
  
  const groupId = nextBubbleId++;
  const skinId = nextBubbleId++;
  const voidId = nextBubbleId++;
  
  const group = {
    id: groupId,
    type: 'group',
    position: { x: spawnPos.x, y: spawnPos.y, z: spawnPos.z },
    rotation: { x: 0, y: 0, z: 0 },
    // Much smaller at spawn to create a subtle emergence from the wall
    scale: { x: 0.02, y: 0.02, z: 0.02 },
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
      
      // Move towards camera (center origin approx)
      const currentPos = new THREE.Vector3(bubble.group.position.x, bubble.group.position.y, bubble.group.position.z);
      const dirToCenter = currentPos.clone().normalize().multiplyScalar(-1);
      
      currentPos.add(dirToCenter.multiplyScalar(speed * delta));
      bubble.group.position.x = currentPos.x;
      bubble.group.position.y = currentPos.y;
      bubble.group.position.z = currentPos.z;
      
      const distFromCenter = currentPos.length();
      // Progress from spawn distance outside to pop distance just inside
      const progress = Math.max(0, Math.min(1, (BUBBLE_SPAWN_DISTANCE - distFromCenter) / (BUBBLE_SPAWN_DISTANCE - BUBBLE_POP_DISTANCE)));
      
      // Grow from small at spawn to full size as it enters the sphere
      const currentScale = 0.02 + progress * 0.98;
      bubble.group.scale.x = currentScale;
      bubble.group.scale.y = currentScale;
      bubble.group.scale.z = currentScale;

      // Update child scales directly for correct rendering
      bubble.skin.scale.x = BUBBLE_OUTER_RADIUS * currentScale;
      bubble.skin.scale.y = BUBBLE_OUTER_RADIUS * currentScale;
      bubble.skin.scale.z = BUBBLE_OUTER_RADIUS * currentScale;
      
      bubble.voidObj.scale.x = BUBBLE_INNER_RADIUS * currentScale;
      bubble.voidObj.scale.y = BUBBLE_INNER_RADIUS * currentScale;
      bubble.voidObj.scale.z = BUBBLE_INNER_RADIUS * currentScale;
      
      bubble.group.blendRadius = BUBBLE_INITIAL_BLEND - progress * (BUBBLE_INITIAL_BLEND - BUBBLE_FINAL_BLEND);
      
      // Trigger pop once the bubble has fully transitioned into the sphere's interior
      if (distFromCenter < BUBBLE_POP_DISTANCE) {
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
        
        // Bubble pop notification on first bubble
        if (!gameState.milestones?.firstBubble) {
          if (!gameState.milestones) gameState.milestones = {};
          gameState.milestones.firstBubble = true;
          if (import('./manager.js').then) {
            import('./manager.js').then(mgr => {
              if (mgr.session.notifications) {
                mgr.session.notifications.add({
                  id: 'first_bubble',
                  sticky: true,
                  title: '✨ BUBBLE DISCOVERED! ✨',
                  text: 'Bubbles appear when your friend is away! Pop them for BONUS marsh!',
                  color: '#8afdff'
                });
              }
            });
          }
        }
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