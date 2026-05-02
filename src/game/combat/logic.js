import * as THREE from 'three';
import { gameState } from '../state.js';
import { awardPollen } from '../economy.js';
import { checkMarshmallowPop } from '../marshmallow-pop.js';
import { damageMarshmallow } from '../marshmallow.js';
import { onMarshmallowDefeated, session } from '../manager.js';

/**
 * Makes the marshmallow look at the impact point.
 */
export function setPupilLook(marshmallow, hitPoint) {
  const marshmallowPos = new THREE.Vector3(
    marshmallow.marshmallow.position.x, 
    marshmallow.marshmallow.position.y, 
    marshmallow.marshmallow.position.z
  );
  const hitRelative = hitPoint.clone().sub(marshmallowPos);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(
    marshmallow.marshmallow.rotation.x, 
    marshmallow.marshmallow.rotation.y, 
    marshmallow.marshmallow.rotation.z
  ));
  hitRelative.applyQuaternion(q.invert());
  
  marshmallow.marshmallow.pupilLookX = THREE.MathUtils.clamp(hitRelative.z / marshmallow.marshmallow.scale.x, -1, 1);
  marshmallow.marshmallow.pupilLookY = THREE.MathUtils.clamp(hitRelative.x / marshmallow.marshmallow.scale.x, -1, 1);
  marshmallow.marshmallow.pupilLookHold = 0.8;
}

/**
 * Orchestrates common damage application logic: economy, UI, health, and death state.
 */
export function handleMarshmallowHit(hitPoint, damage, isCritical, particleSystem, bossHUD) {
  const marshmallow = gameState.currentMarshmallow;
  if (!marshmallow || damage <= 0) return;

  setPupilLook(marshmallow, hitPoint);
  awardPollen(damage);
  
  if (session.floatingTextSystem) {
    session.floatingTextSystem.createDamageText(hitPoint, damage, isCritical);
  }
  
  checkMarshmallowPop(marshmallow, particleSystem);
  
  const defeated = damageMarshmallow(marshmallow, damage, particleSystem);
  if (bossHUD) bossHUD.update(marshmallow);
  
  if (defeated) {
    if (gameState.meltingMarshmallows.length >= 2) {
      gameState.meltingMarshmallows.shift();
    }
    
    const deadMarshmallow = marshmallow;
    deadMarshmallow.meltStartTime = performance.now() * 0.001;
    gameState.meltingMarshmallows.push(deadMarshmallow);
    gameState.currentMarshmallow = null;
    if (bossHUD) bossHUD.hide();
    onMarshmallowDefeated();
  }
}