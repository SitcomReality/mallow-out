import { gameState } from './state.js';
import { session, spawnNextMarshmallow } from './manager.js';
import { updateControls } from './controls.js';
import { updateMeltingMarshmallows } from './melting.js';
import { updateSpawningMarshmallows } from './spawning.js';
import { updateRepairs } from './repair.js';
import { rebuildObjectList } from './combat.js';
import { updateFX } from './fx.js';
import { updateDynamicResolution } from './render-logic.js';

import { updateWeaponSystems } from './weapons/weapon-logic.js';
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

    // 2. Systems and Input
    updateControls(delta);
    updateMarshmallows(delta);
    
    // 3. Combat, Physics and Global FX
    updateWeaponSystems(delta);
    
    session.particleSystem.update(delta);
    session.floatingTextSystem.update(delta);
    if (session.tracerSystem) session.tracerSystem.update(delta);
    
    updateSpawningMarshmallows(time * 0.001);
    updateMeltingMarshmallows(time * 0.001);
    updateRepairs(time * 0.001, delta);
    updateFX(time * 0.001);
    rebuildObjectList();
    
    // 4. UI Updates
    if (session.hud) session.hud.update();
    
    if (!gameState.currentMarshmallow && gameState.meltingMarshmallows.length <= 1) {
       spawnNextMarshmallow();
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