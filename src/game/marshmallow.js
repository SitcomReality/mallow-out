import * as THREE from 'three';
import { MARSHMALLOW_CYLINDER_RADIUS, MARSHMALLOW_CYLINDER_HEIGHT, MARSHMALLOW_HEIGHT, MARSHMALLOW_SPAWN_RADIUS } from './marshmallow-constants.js';
import { EXPRESSION_DEFAULT, EXPRESSION_ANGRY, EXPRESSION_SURPRISED } from './face-constants.js';
import { getMarshmallowHealth } from './marshmallow-scaling.js';
import { selectMarshmallowType } from './marshmallow-spawn.js';
import { BASE_MOVEMENT_SPEED, BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

let nextId = 1;

export function createMarshmallow(totalDestroyed) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * MARSHMALLOW_SPAWN_RADIUS;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  // Select marshmallow type
  const type = selectMarshmallowType();
  
  // Apply type's color variation
  const hue = type.color.hue + (Math.random() - 0.5) * 0.05;
  const sat = type.color.satMin + Math.random() * (type.color.satMax - type.color.satMin);
  const light = type.color.lightMin + Math.random() * (type.color.lightMax - type.color.lightMin);
  const color = new THREE.Color().setHSL(hue, sat, light);
  
  // Apply size variation
  const sizeMultiplier = type.sizeMultiplier.min + Math.random() * (type.sizeMultiplier.max - type.sizeMultiplier.min);
  const heightMultiplier = type.heightMultiplier ? 
    (type.heightMultiplier.min + Math.random() * (type.heightMultiplier.max - type.heightMultiplier.min)) : 
    1.0;
  
  const marshmallowId = nextId++;
  
  // Create marshmallow shell (outer)
  const marshmallow = {
    id: marshmallowId,
    type: 'cylinder',
    position: { x, y: MARSHMALLOW_HEIGHT, z },
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
  
  // Movement parameters
  const speedMultiplier = type.speedMultiplier.min + Math.random() * (type.speedMultiplier.max - type.speedMultiplier.min);
  const bobAmplitude = type.bobAmplitude ? 
    (type.bobAmplitude.min + Math.random() * (type.bobAmplitude.max - type.bobAmplitude.min)) :
    BASE_BOB_AMPLITUDE;
  
  const entity = {
    marshmallow,
    holes: [],
    hitCount: 0,
    maxHealth: getMarshmallowHealth(totalDestroyed),
    currentHealth: getMarshmallowHealth(totalDestroyed),
    totalIndex: totalDestroyed,
    id: marshmallowId,
    type: type,
    movement: {
      pattern: type.movementPattern,
      speed: BASE_MOVEMENT_SPEED * speedMultiplier,
      bobPhase: Math.random() * Math.PI * 2,
      bobAmplitude: bobAmplitude,
      baseY: MARSHMALLOW_HEIGHT,
      currentDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
      targetDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
      moveTimer: 0,
      changeDirectionInterval: 2.0 + Math.random() * 3.0,
      boundTimer: 0,
      boundInterval: 3.0 + Math.random() * 4.0,
      spawnDistance: distance,
    },
  };
  
  return entity;
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