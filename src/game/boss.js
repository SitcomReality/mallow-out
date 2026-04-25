import * as THREE from 'three';
import { ENEMY_CYLINDER_RADIUS, ENEMY_CYLINDER_HEIGHT, ENEMY_SPAWN_RADIUS, ENEMY_HEIGHT } from './constants.js';
import { BOSS_BASE_HEALTH, BOSS_HEALTH_PER_WAVE, BOSS_SIZE_BASE, BOSS_SIZE_PER_WAVE } from './wave-constants.js';

let nextId = 1;

export function createBoss(wave) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 8;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  
  // Marshmallow color (white/pink)
  const color = new THREE.Color().setHSL(0.95, 0.3 + Math.random() * 0.2, 0.9);
  
  // Scale boss size with wave
  const sizeMultiplier = BOSS_SIZE_BASE + (wave - 1) * BOSS_SIZE_PER_WAVE;
  
  const bossId = nextId++;
  const shellGroupId = nextId++;
  const bloodGroupId = nextId++;
  const bloodCoreId = nextId++;
  const innerMarshmallowId = nextId++;
  
  // Shell group (White part - will have holes subtracted)
  const shellGroup = {
    id: shellGroupId,
    type: 'group',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    operation: 'union',
    blendRadius: 0,
    parentId: null,
  };

  const marshmallow = {
    id: bossId,
    type: 'cylinder',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: Math.PI / 2 },
    scale: { 
      x: ENEMY_CYLINDER_RADIUS * sizeMultiplier, 
      y: ENEMY_CYLINDER_HEIGHT * sizeMultiplier, 
      z: 0 
    },
    color: '#' + color.getHexString(),
    operation: 'union',
    blendRadius: 0.1,
    parentId: shellGroupId,
  };
  
  // Blood group (Interior red part)
  const bloodGroup = {
    id: bloodGroupId,
    type: 'group',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    operation: 'union',
    blendRadius: 0.1,
    parentId: null,
  };

  // The inner marshmallow shape to intersect with the blood core
  const innerMarshmallow = {
    id: innerMarshmallowId,
    type: 'cylinder',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: Math.PI / 2 },
    scale: { 
      x: ENEMY_CYLINDER_RADIUS * sizeMultiplier * 0.99, // Slightly smaller to prevent flickering
      y: ENEMY_CYLINDER_HEIGHT * sizeMultiplier * 0.99, 
      z: 0 
    },
    color: '#8B0000',
    operation: 'union',
    blendRadius: 0,
    parentId: bloodGroupId,
  };
  
  const bloodCore = {
    id: bloodCoreId,
    type: 'sphere',
    position: { x, y: ENEMY_HEIGHT, z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { 
      x: ENEMY_CYLINDER_RADIUS * sizeMultiplier * 1.1, 
      y: ENEMY_CYLINDER_RADIUS * sizeMultiplier * 1.1, 
      z: ENEMY_CYLINDER_RADIUS * sizeMultiplier * 1.1 
    },
    color: '#8B0000',
    operation: 'intersect',
    blendRadius: 0.05,
    parentId: bloodGroupId,
  };
  
  const boss = {
    shellGroup,
    marshmallow,
    bloodGroup,
    innerMarshmallow,
    bloodCore,
    holes: [],
    hitCount: 0,
    maxHealth: BOSS_BASE_HEALTH + (wave - 1) * BOSS_HEALTH_PER_WAVE,
    currentHealth: BOSS_BASE_HEALTH + (wave - 1) * BOSS_HEALTH_PER_WAVE,
    wave: wave,
    isBoss: true,
    id: bossId,
    shellGroupId,
    bloodGroupId,
  };
  
  return boss;
}

export function damageBoss(boss, damage) {
  boss.currentHealth = Math.max(0, boss.currentHealth - damage);
  return boss.currentHealth <= 0;
}

export function getBossHealthPercent(boss) {
  return boss.currentHealth / boss.maxHealth;
}