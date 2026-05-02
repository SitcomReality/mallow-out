import { gameState } from './state.js';
import { session } from './manager.js';
import { updateControls } from './controls.js';
import { updateMeltingEnemies } from './melting.js';
import { updateSpawningMarshmallows } from './spawning.js';
import { updateRepairs } from './repair.js';
import { rebuildObjectList } from './combat.js';
import { updatePetalEffects } from './petals/petal-effects.js';
import { updateFX } from './fx.js';
import { updateDynamicResolution } from './render-logic.js';
import { updateWaveLogic } from './wave-logic.js';
import { updateWeaponSystems } from './weapons/weapon-logic.js';
import { updateProjectiles } from './weapons/projectile-logic.js';
import { updateMarshmallows } from './marshmallow-logic.js';
import { CLEAVER_CHARGE_TIME } from './weapons/weapon-stats.js';

let lastTime = 0;

/**
 * The core game loop. Orchestrates updates and rendering by calling modularized logic functions.
 */
export function runGameLoop(time) {
  if (!session.isPlaying) return;
  
  const delta = (time - lastTime) * 0.001;
  lastTime = time;
  
  if (!session.isPaused) {
    // 1. Performance and Wave Management
    updateDynamicResolution(delta);
    updateWaveLogic(delta);

    // 2. Systems and Input (some only during active wave)
    if (gameState.waveInProgress) {
      updateControls(delta);
      updateMarshmallows(delta);
    }
    
    // 3. Combat, Physics and Global FX
    updateWeaponSystems(delta);
    updateProjectiles(delta, time * 0.001);
    
    session.particleSystem.update(delta);
    session.floatingTextSystem.update(delta);
    if (session.tracerSystem) session.tracerSystem.update(delta);
    
    updateSpawningMarshmallows(time * 0.001);
    updateMeltingEnemies(time * 0.001);
    updateRepairs(time * 0.001, delta);
    updatePetalEffects(time * 0.001);
    updateFX(time * 0.001);
    rebuildObjectList();
    
    // 4. UI Updates
    if (session.hud) session.hud.update();
    
    if (session.weaponStatus) {
      const ws = gameState.weaponStates;
      if (gameState.currentWeapon === 3 && (ws.cleaverCharging || ws.cleaverCharge > 0)) {
        session.weaponStatus.updateCleaverCharge(ws.cleaverCharge, CLEAVER_CHARGE_TIME);
      } else {
        session.weaponStatus.hide();
      }
    }
    

  }
  
  // 5. Rendering
  if (session.renderFn) {
    session.renderFn(time, session.particleSystem, session.floatingTextSystem);
  }
  
  if (session.floatingTextRenderer) {
    session.floatingTextRenderer.render(session.floatingTextSystem.getTexts());
  }
  
  requestAnimationFrame(runGameLoop);
}