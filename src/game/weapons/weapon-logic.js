import { gameState } from '../state.js';
import { getFireRateMultiplier } from '../petals/petal-effects.js';
import { getWeaponFireRateMultiplier } from './weapon-modifiers.js';
import { 
  CLEAVER_CHARGE_TIME, 
  MELTER_COOLDOWN_PER_SECOND, 
  MELTER_MAX_HEAT 
} from './weapon-stats.js';

/**
 * Orchestrates all active weapon systems (recoil, cooldowns, heat, charging).
 */
export function updateWeaponSystems(delta) {
  updateRecoil(delta);
  updateCooldowns(delta);
}

function updateRecoil(delta) {
  const player = gameState.player;
  if (player.recoilPitchAmount === 0 && player.recoilYawAmount === 0) return;

  const petalFireRateMult = getFireRateMultiplier();
  const upgradeFireRateMult = getWeaponFireRateMultiplier();
  const totalMult = (gameState.currentWeapon === 0) ? (petalFireRateMult * upgradeFireRateMult) : 1.0;
  
  const kickDur = player.recoilKickDuration || 0.1;
  const recDur = player.recoilRecoveryDuration || 0.2;
  
  player.recoilTime += delta / totalMult;
  
  if (player.recoilTime < kickDur) {
    // Phase 1: Kick
    const frameT = (delta / totalMult) / kickDur;
    player.pitch += player.recoilPitchAmount * frameT;
    player.yaw += player.recoilYawAmount * frameT;
  } else if (player.recoilTime < kickDur + recDur) {
    // Phase 2: Recovery
    const frameT = (delta / totalMult) / recDur;
    const pRec = (player.recoilPitchAmount - (player.recoilReturnOffset || 0)) * frameT;
    const yRec = player.recoilYawAmount * frameT;
    player.pitch -= pRec;
    player.yaw -= yRec;
  } else {
    // End of recoil sequence
    if (gameState.currentWeapon === 0) gameState.weaponStates.skewerReady = true;
    player.recoilPitchAmount = 0;
    player.recoilYawAmount = 0;
    player.recoilReturnOffset = 0;
  }
  
  // Sync and clamp
  player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.pitch));
  player.rotation.x = player.pitch;
  player.rotation.y = player.yaw;
}

function updateCooldowns(delta) {
  const ws = gameState.weaponStates;
  const petalFireRateMult = getFireRateMultiplier();
  const upgradeFireRateMult = getWeaponFireRateMultiplier();
  const totalMult = petalFireRateMult * upgradeFireRateMult;

  // Spatterer cooldown
  if (ws.spattererCooldown > 0) {
    ws.spattererCooldown = Math.max(0, ws.spattererCooldown - delta / totalMult);
  }
  
  // Globber cooldown
  if (ws.globberCooldown > 0) {
    ws.globberCooldown = Math.max(0, ws.globberCooldown - delta / totalMult);
  }
  
  // Cleaver charging
  if (ws.cleaverCharging) {
    ws.cleaverCharge = Math.min(CLEAVER_CHARGE_TIME, ws.cleaverCharge + delta / totalMult);
  } else {
    ws.cleaverCharge = Math.max(0, ws.cleaverCharge - delta);
  }
  
  // Melter heat management
  if (ws.melterOverheated) {
    ws.melterHeat = Math.max(0, ws.melterHeat - (MELTER_COOLDOWN_PER_SECOND * 0.5) * delta);
    if (ws.melterHeat <= 0) {
      ws.melterOverheated = false;
    }
  } else {
    const now = performance.now();
    if (gameState.currentWeapon !== 4 || (now - (ws.lastMelterFire || 0) > 100)) {
      ws.melterHeat = Math.max(0, ws.melterHeat - MELTER_COOLDOWN_PER_SECOND * delta);
    }
  }
}