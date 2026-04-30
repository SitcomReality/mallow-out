import { gameState } from './state.js';
import { session, spawnNextMarshmallow } from './manager.js';

/**
 * Handles wave progression, timer updates, and wave-end transitions.
 */
export function updateWaveLogic(delta) {
  if (!gameState.waveInProgress) return;

  // Update wave timer
  if (gameState.waveTimer.active) {
    gameState.waveTimer.update(delta);
  }
  
  // Wave transition check - timer expired
  if (gameState.waveTimer.isComplete()) {
    gameState.waveInProgress = false;
    gameState.waveTimer.stop();
    
    if (!gameState.waveEndReason) {
      gameState.waveEndReason = 'TIME_OUT';
    }
    
    if (session.waveSummary) {
      session.waveSummary.show();
      document.exitPointerLock();
    }
  }
  
  // Spawn next marshmallow if needed
  if (!gameState.currentMarshmallow && gameState.meltingMarshmallows.length <= 1) {
    spawnNextMarshmallow();
  }
}