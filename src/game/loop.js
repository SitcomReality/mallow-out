import { gameState, updateWeaponCooldowns } from './state.js';
import { session, spawnNextMarshmallow } from './manager.js';
import { updateControls } from './controls.js';
import { updateMeltingMarshmallows } from './melting.js';
import { updateSpawningMarshmallows } from './spawning.js';
import { updateRepairs } from './repair.js';
import { rebuildObjectList } from './combat.js';
import { updateFX } from './fx.js';
import { updateDynamicResolution } from './render-logic.js';
import { updateMarshmallows } from './marshmallow-logic.js';
import { updateAutomations } from './automations/automation-logic.js';
import { updateComboSystem } from './combo-system.js';
import { updateBubbles } from './bubble.js';

let lastTime = 0;

export function runGameLoop(time) {
  if (!session.isPlaying) return;
  
  const delta = (time - lastTime) * 0.001;
  lastTime = time;
  
  if (!session.isPaused) {
    updateDynamicResolution(delta);
    updateControls(delta);
    updateWeaponCooldowns(delta);
    updateMarshmallows(delta);
    updateAutomations(delta);
    updateComboSystem(delta);
    updateBubbles(delta, time * 0.001);
    
    session.particleSystem.update(delta);
    session.floatingTextSystem.update(delta);
    if (session.tracerSystem) session.tracerSystem.update(delta);
    
    updateSpawningMarshmallows(time * 0.001);
    updateMeltingMarshmallows(time * 0.001);
    updateRepairs(time * 0.001, delta);
    updateFX(time * 0.001);
    rebuildObjectList();
    
    if (session.hud) session.hud.update();
  }
  
  if (session.renderFn) {
    session.renderFn(time, session.particleSystem, session.floatingTextSystem);
  }
  
  if (session.floatingTextRenderer) {
    session.floatingTextRenderer.render(session.floatingTextSystem.getTexts());
  }
  
  requestAnimationFrame(runGameLoop);
}