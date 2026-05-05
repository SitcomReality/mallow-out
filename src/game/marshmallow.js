import * as THREE from 'three';
import { MARSHMALLOW_CYLINDER_RADIUS, MARSHMALLOW_CYLINDER_HEIGHT, MARSHMALLOW_HEIGHT, MARSHMALLOW_SPAWN_RADIUS } from './marshmallow-constants.js';
import { SPAWN_START_Y, SPAWN_END_Y } from './spawn-constants.js';
import { EXPRESSION_DEFAULT, EXPRESSION_ANGRY, EXPRESSION_SURPRISED } from './face-constants.js';
import { getMarshmallowHealth } from './marshmallow-scaling.js';
import { selectMarshmallowType } from './marshmallow-spawn.js';
import { BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';
import { gameState } from './state.js';

let nextId = 1;

const NAME_PARTS = ['Mallow', 'Marsh', 'Mellow', 'Munch', 'Fellow'];

function generateMarshmallowName() {
  const part1 = NAME_PARTS[Math.floor(Math.random() * NAME_PARTS.length)];
  let part2 = NAME_PARTS[Math.floor(Math.random() * NAME_PARTS.length)];
  // Ensure different parts
  while (part2 === part1) {
    part2 = NAME_PARTS[Math.floor(Math.random() * NAME_PARTS.length)];
  }
  return part1 + part2.toLowerCase();
}

/**
 * Creates the marshmallow pet.
 */
export function createMarshmallow(totalDestroyed) {
  // Only spawn on the far side of the floor (opposite the camera at z=8.5)
  // To ensure z is negative, we pick an angle between PI and 2*PI
  const angle = Math.PI + Math.random() * Math.PI;
  const distance = 0.5 + Math.random() * (MARSHMALLOW_SPAWN_RADIUS - 0.5);
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  const type = selectMarshmallowType();
  
  const hue = type.color.hue + (Math.random() - 0.5) * 0.04;
  const sat = type.color.satMin + Math.random() * (type.color.satMax - type.color.satMin);
  const light = type.color.lightMin + Math.random() * (type.color.lightMax - type.color.lightMin);
  const color = new THREE.Color().setHSL(hue, sat, light);
  
  const sizeMultiplier = 0.95 + Math.random() * 0.1;
  const heightMultiplier = 0.95 + Math.random() * 0.1;
  
  const marshmallowId = nextId++;
  
  const marshmallow = {
    id: marshmallowId,
    type: 'cylinder',
    // Start below the floor to avoid a single-frame flash at the final Y before the spawn animation runs
    position: { x, y: SPAWN_START_Y, z },
    rotation: { x: 0, y: 0, z: Math.PI / 2 },
    scale: { 
      x: MARSHMALLOW_CYLINDER_RADIUS * sizeMultiplier, 
      y: MARSHMALLOW_CYLINDER_HEIGHT * heightMultiplier, 
      z: 0 
    },
    color: '#' + color.getHexString(),
    operation: 'union',
    blendRadius: 0.1,
    parentId: null,
    expression: EXPRESSION_DEFAULT,
  };

  // Internal goo object to provide "blood" color when pierced
  const goo = {
    id: nextId++,
    type: 'sphere',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { 
      x: MARSHMALLOW_CYLINDER_RADIUS * sizeMultiplier * 1.5, 
      y: MARSHMALLOW_CYLINDER_RADIUS * sizeMultiplier * 1.5, 
      z: MARSHMALLOW_CYLINDER_RADIUS * sizeMultiplier * 1.5 
    },
    color: '#ff1493', // Deep Pink Goo
    operation: 'intersect',
    blendRadius: 0.1,
    parentId: marshmallowId,
  };
  
  // Determine name: reuse persisted player name if present, otherwise generate and persist it
  let mName = gameState.playerMarshmallowName;
  if (!mName) {
    mName = generateMarshmallowName();
    gameState.playerMarshmallowName = mName;
  }
  
  const entity = {
    marshmallow,
    goo,
    holes: [],
    hitCount: 0,
    maxHealth: getMarshmallowHealth(totalDestroyed),
    currentHealth: getMarshmallowHealth(totalDestroyed),
    totalIndex: totalDestroyed,
    id: marshmallowId,
    type: type,
    name: mName,
    lastHitTime: performance.now() * 0.001,
    isDying: false,
    movement: {
      bobPhase: Math.random() * Math.PI * 2,
      bobAmplitude: BASE_BOB_AMPLITUDE * (0.8 + Math.random() * 0.4),
      baseY: SPAWN_END_Y,
      yaw: Math.random() * Math.PI * 2,
      wanderTargetYaw: Math.random() * Math.PI * 2,
      wanderTimer: 2.0 + Math.random() * 3.0,
      speed: 0.3 + Math.random() * 0.4,
    },
  };
  
  return entity;
}

export function healMarshmallow(marshmallow, amount) {
  const healBonus = 1.0; // Can be upgraded later
  marshmallow.currentHealth = Math.min(marshmallow.maxHealth, marshmallow.currentHealth + amount * healBonus);
  marshmallow.lastHitTime = performance.now() * 0.001;
  
  // Update expression based on health
  if (marshmallow.currentHealth >= marshmallow.maxHealth * 0.8) {
    marshmallow.marshmallow.targetExpression = EXPRESSION_DEFAULT;
  } else if (marshmallow.currentHealth >= marshmallow.maxHealth * 0.5) {
    marshmallow.marshmallow.targetExpression = EXPRESSION_DEFAULT;
  } else {
    marshmallow.marshmallow.targetExpression = EXPRESSION_ANGRY;
  }
}

export function damageMarshmallow(marshmallow, damage, particleSystem = null) {
  marshmallow.currentHealth = Math.max(0, marshmallow.currentHealth - damage);
  
  if (marshmallow.currentHealth <= 0) {
    marshmallow.marshmallow.targetExpression = EXPRESSION_SURPRISED;
  } else if (marshmallow.currentHealth < marshmallow.maxHealth * 0.5) {
    marshmallow.marshmallow.targetExpression = EXPRESSION_ANGRY;
  }
  
  return marshmallow.currentHealth <= 0;
}

export function getMarshmallowHealthPercent(marshmallow) {
  return marshmallow.currentHealth / marshmallow.maxHealth;
}