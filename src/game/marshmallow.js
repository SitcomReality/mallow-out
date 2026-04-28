import * as THREE from 'three';
import { ENEMY_CYLINDER_RADIUS, ENEMY_CYLINDER_HEIGHT, ENEMY_SPAWN_RADIUS, ENEMY_HEIGHT } from './constants.js';
import { EXPRESSION_DEFAULT, EXPRESSION_ANGRY, EXPRESSION_SURPRISED } from './face-constants.js';
import { getMarshmallowHealth } from './marshmallow-scaling.js';

let nextId = 1;

export function createMarshmallow(wave, spawnIndex) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 8;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  // Marshmallow color (white/pink)
  const color = new THREE.Color().setHSL(0.95, 0.3 + Math.random() * 0.2, 0.9);
  
  const marshmallowId = nextId++;
  
  // Create marshmallow shell (outer)
  const marshmallow = {
    id: marshmallowId,
    type: 'cylinder',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: Math.PI / 2 },
    scale: { 
      x: ENEMY_CYLINDER_RADIUS, 
      y: ENEMY_CYLINDER_HEIGHT, 
      z: 0 
    },
    color: '#' + color.getHexString(),
    operation: 'union',
    blendRadius: 0.1,
    parentId: null,
    expression: EXPRESSION_DEFAULT,
  };
  
  const entity = {
    marshmallow,
    holes: [],
    hitCount: 0,
    maxHealth: getMarshmallowHealth(wave, spawnIndex),
    currentHealth: getMarshmallowHealth(wave, spawnIndex),
    wave: wave,
    spawnIndex: spawnIndex,
    id: marshmallowId,
  };
  
  return entity;
}

export function damageMarshmallow(marshmallow, damage) {
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