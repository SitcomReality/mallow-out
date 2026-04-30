import { settings } from './state.js';

let frameCount = 0;
let totalDelta = 0;

/**
 * Adjusts render scale dynamically based on average framerate to maintain target FPS.
 */
export function updateDynamicResolution(delta) {
  if (!settings.dynamicRes) return;
  
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