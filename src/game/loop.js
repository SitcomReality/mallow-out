import { settings } from '../state.js';
import { gameState } from './state.js';
import { updateControls } from './controls.js';
import { updateMeltingEnemies } from './melting.js';
import { updateRepairs } from './repair.js';
import { rebuildObjectList } from './combat.js';
import { session } from './manager.js';

let lastTime = 0;
let frameCount = 0;
let totalDelta = 0;

/**
 * The core game loop. Orchestrates performance monitoring, state updates, and rendering.
 */
export function runGameLoop(time) {
  if (!session.isPlaying) return;
  
  const delta = (time - lastTime) * 0.001;
  lastTime = time;
  
  if (!session.isPaused) {
    // Wave transition check
    if (gameState.waveInProgress && !gameState.boss && gameState.meltingEnemies.length === 0) {
      gameState.waveInProgress = false;
      if (session.upgradeScreen) {
        session.upgradeScreen.show(gameState.currentWave);
        document.exitPointerLock();
      }
    }

    // Dynamic resolution scaling based on framerate
    if (settings.dynamicRes) {
      frameCount++;
      totalDelta += delta;
      if (frameCount >= 30) {
        const avgDelta = totalDelta / frameCount;
        const targetDelta = 1.0 / settings.targetFPS;
        
        if (avgDelta > targetDelta * 1.1) {
          settings.renderScale = Math.max(settings.minScale, settings.renderScale - 0.05);
        } else if (avgDelta < targetDelta * 0.8) {
          settings.renderScale = Math.min(settings.maxScale, settings.renderScale + 0.02);
        }
        frameCount = 0;
        totalDelta = 0;
      }
    }

    // Logic updates
    updateControls(delta);
    session.particleSystem.update(delta);
    updateMeltingEnemies(time * 0.001);
    updateRepairs(time * 0.001, delta);
    rebuildObjectList();
  }
  
  // Render call
  if (session.renderFn) {
    session.renderFn(time, session.particleSystem);
  }
  
  requestAnimationFrame(runGameLoop);
}