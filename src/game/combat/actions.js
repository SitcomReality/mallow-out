import * as THREE from 'three';
import { gameState } from '../state.js';
import { castRay, getEnemyDistanceAt } from '../shooting.js';
import { addHoleToEnemy, addSpattererDamage, addCleaverDamage } from '../enemy.js';
import { session } from '../manager.js';
import { getDamageMultiplier } from '../petals/petal-effects.js';
import { getWeaponDamageBonus, rollCriticalHit } from '../upgrades/weapon-modifiers.js';

import { 
  BASE_DAMAGE_HOLE, 
  BASE_DAMAGE_SPATTERER,
  BASE_DAMAGE_CLEAVER,
} from '../combat-constants.js';
import {
  SKEWER_RECOIL_PITCH,
  SKEWER_RECOIL_DURATION,
  SKEWER_RECOIL_RECOVERY,
  GLOBBER_RECOIL_PITCH,
  SPATTERER_RECOIL_PITCH,
  CLEAVER_RECOIL_PITCH,
  GENERIC_RECOIL_DURATION,
  GENERIC_RECOIL_RECOVERY,
} from '../weapons/recoil-constants.js';
import {
  GLOBBER_PROJECTILE_SPEED,
  GLOBBER_PROJECTILE_SIZE,
  GLOBBER_FIRE_COOLDOWN,
  SPATTERER_MAX_RANGE,
  CLEAVER_CHARGE_TIME,
} from '../weapons/weapon-stats.js';

import { getSceneDistanceAt, rebuildObjectList } from './scene.js';
import { handleMarshmallowHit } from './logic.js';

export function shoot(particleSystem, bossHUD) {
  const weapon = gameState.currentWeapon;
  const player = gameState.player;
  const ws = gameState.weaponStates;
  
  if (weapon === 0 && !ws.skewerReady) return;
  if (weapon === 1 && ws.globberCooldown > 0) return;
  if (weapon === 2 && ws.spattererCooldown > 0) return;
  
  const origin = player.position.clone();
  const direction = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, Math.sin(player.yaw));
  const up = new THREE.Vector3(0, 1, 0);
  const visualOrigin = origin.clone()
    .add(right.multiplyScalar(0.3))
    .add(up.multiplyScalar(-0.2))
    .add(direction.clone().multiplyScalar(0.5));
  
  if (weapon === 1) {
    ws.globberCooldown = GLOBBER_FIRE_COOLDOWN;
    gameState.projectiles.push({
      position: visualOrigin.clone(),
      velocity: direction.clone().multiplyScalar(GLOBBER_PROJECTILE_SPEED),
      size: GLOBBER_PROJECTILE_SIZE,
      lifetime: 5.0,
      maxLifetime: 5.0,
    });
    
    player.recoilTime = 0;
    player.recoilPitchAmount = GLOBBER_RECOIL_PITCH;
    player.recoilYawAmount = (Math.random() * 0.04 - 0.02);
    player.recoilKickDuration = GENERIC_RECOIL_DURATION;
    player.recoilRecoveryDuration = GENERIC_RECOIL_RECOVERY;
    player.recoilReturnOffset = 0;
    return;
  }
  
  if (weapon === 3) {
    ws.cleaverCharging = true;
    return;
  }
  
  const result = castRay(origin, direction, getSceneDistanceAt);
  const effectEnd = result.hit ? result.point : origin.clone().add(direction.clone().multiplyScalar(60));

  if (weapon === 0) {
    if (session.tracerSystem) session.tracerSystem.createTracer(visualOrigin, effectEnd, 0xffffff);
    ws.skewerReady = false;
    player.recoilTime = 0;
    player.recoilPitchAmount = SKEWER_RECOIL_PITCH;
    player.recoilYawAmount = (Math.random() * 0.2 - 0.1) * SKEWER_RECOIL_PITCH;
    player.recoilKickDuration = SKEWER_RECOIL_DURATION;
    player.recoilRecoveryDuration = SKEWER_RECOIL_RECOVERY;
    player.recoilReturnOffset = (Math.random() * 0.2 - 0.1) * SKEWER_RECOIL_PITCH;
  } else if (weapon === 2) {
    ws.spattererCooldown = 1.0;
    player.recoilTime = 0;
    player.recoilPitchAmount = SPATTERER_RECOIL_PITCH;
    player.recoilYawAmount = (Math.random() * 0.08 - 0.04);
    player.recoilKickDuration = GENERIC_RECOIL_DURATION;
    player.recoilRecoveryDuration = GENERIC_RECOIL_RECOVERY;
    player.recoilReturnOffset = 0;
  }

  if (result.hit) {
    const hitMarshmallow = gameState.currentMarshmallow && getEnemyDistanceAt(gameState.currentMarshmallow, result.point) < 0.1;
    if (!hitMarshmallow) return;

    let damage = 0;
    const isCritical = rollCriticalHit();
    
    if (weapon === 0) {
      addHoleToEnemy(gameState.currentMarshmallow, result.point, direction);
      particleSystem.createHoleSpray(result.point, direction);
      damage = (BASE_DAMAGE_HOLE + getWeaponDamageBonus()) * getDamageMultiplier();
      if (isCritical) damage *= 2;
    } else if (weapon === 2) {
      const rangeFactor = Math.max(0, 1 - (result.distance - 3) / (SPATTERER_MAX_RANGE - 3));
      addSpattererDamage(gameState.currentMarshmallow, result.point, result.distance);
      particleSystem.createBloodSplatter(result.point, direction);
      damage = Math.floor((BASE_DAMAGE_SPATTERER + getWeaponDamageBonus()) * rangeFactor * getDamageMultiplier());
      if (isCritical) damage *= 2;
    }
    
    handleMarshmallowHit(result.point, damage, isCritical, particleSystem, bossHUD);
    rebuildObjectList();
  }
}

export function stopShooting() {}

export function releaseCleaver(particleSystem, bossHUD) {
  const ws = gameState.weaponStates;
  if (!ws.cleaverCharging) return;
  
  ws.cleaverCharging = false;
  if (ws.cleaverCharge < CLEAVER_CHARGE_TIME) return;
  
  ws.cleaverCharge = 0;
  
  const player = gameState.player;
  const origin = player.position.clone();
  const direction = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  const result = castRay(origin, direction, getSceneDistanceAt);
  
  player.recoilTime = 0;
  player.recoilPitchAmount = CLEAVER_RECOIL_PITCH;
  player.recoilYawAmount = (Math.random() * 0.1 - 0.05);
  player.recoilKickDuration = GENERIC_RECOIL_DURATION * 1.5;
  player.recoilRecoveryDuration = GENERIC_RECOIL_RECOVERY * 1.5;
  player.recoilReturnOffset = 0;

  if (result.hit) {
    const hitMarshmallow = gameState.currentMarshmallow && getEnemyDistanceAt(gameState.currentMarshmallow, result.point) < 0.1;
    if (!hitMarshmallow) return;

    addCleaverDamage(gameState.currentMarshmallow, result.point, direction);
    particleSystem.createBloodSplatter(result.point, direction);
    
    const isCritical = rollCriticalHit();
    let damage = (BASE_DAMAGE_CLEAVER + getWeaponDamageBonus()) * getDamageMultiplier();
    if (isCritical) damage *= 2;
    
    handleMarshmallowHit(result.point, damage, isCritical, particleSystem, bossHUD);
    rebuildObjectList();
  }
}