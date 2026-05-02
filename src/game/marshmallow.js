import * as THREE from 'three';
import { MARSHMALLOW_CYLINDER_RADIUS, MARSHMALLOW_CYLINDER_HEIGHT, MARSHMALLOW_HEIGHT, MARSHMALLOW_SPAWN_RADIUS } from './marshmallow-constants.js';
import { EXPRESSION_DEFAULT, EXPRESSION_ANGRY, EXPRESSION_SURPRISED } from './face-constants.js';
import { getMarshmallowHealth } from './marshmallow-scaling.js';
import { selectMarshmallowType } from './marshmallow-spawn.js';
import { BASE_MOVEMENT_SPEED, BASE_BOB_AMPLITUDE } from './marshmallow-type-constants.js';

let nextId = 1;

/**
 * Creates a marshmallow entity.
 * Distinctions between types are now purely visual (color/name) and reward-based.
 * Size and movement properties are unified with minor random variance for flavor.
 */
export function createMarshmallow(totalDestroyed) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * MARSHMALLOW_SPAWN_RADIUS;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  const type = selectMarshmallowType();
  
  // Minor visual variation (Hue/Sat/Light)
  const hue = type.color.hue + (Math.random() - 0.5) * 0.04;
  const sat = type.color.satMin + Math.random() * (type.color.satMax - type.color.satMin);
  const light = type.color.lightMin + Math.random() * (type.color.lightMax - type.color.lightMin);
  const color = new THREE.Color().setHSL(hue, sat, light);
  
  // Minor size variation for all types
  const sizeMultiplier = 0.95 + Math.random() * 0.1;
  const heightMultiplier = 0.95 + Math.random() * 0.1;
  
  const marshmallowId = nextId++;
  
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
  
  // Unified movement parameters for all types
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
      speed: BASE_MOVEMENT_SPEED * (0.9 + Math.random() * 0.2),
      bobPhase: Math.random() * Math.PI * 2,
      bobAmplitude: BASE_BOB_AMPLITUDE * (0.8 + Math.random() * 0.4),
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