import { settings } from '../state.js';

let frameCount = 0;
let totalDelta = 0;

// Quality level from 0 to 100
let currentQuality = 100;
let optimalMax = 100;
let stableFrames = 0;

/**
 * Adjusts multiple graphics settings dynamically based on average framerate to maintain target FPS,
 * while learning optimal min/max states.
 */
export function updateDynamicGraphics(delta) {
  if (!settings.dynamicGraphics) return;
  
  frameCount++;
  totalDelta += delta;
  
  // Evaluate every 15 frames (~0.25 seconds at 60fps) for quick responsiveness
  if (frameCount >= 15) {
    const avgDelta = totalDelta / frameCount;
    const fps = 1.0 / avgDelta;
    
    if (fps < settings.targetFPS * 0.8) {
      // Severe drop - drop quality aggressively
      currentQuality = Math.max(0, currentQuality - 15);
      stableFrames = 0;
    } else if (fps < settings.targetFPS * 0.95) {
      // Mild drop - scale down moderately
      currentQuality = Math.max(0, currentQuality - 5);
      optimalMax = Math.min(100, currentQuality + 10); // Adjust max down to prevent immediate bounce back
      stableFrames = 0;
    } else {
      // Stable FPS
      stableFrames++;
      // Wait for sustained stability before increasing graphics
      if (stableFrames > 8) { // About 2 seconds of stability
        currentQuality = Math.min(optimalMax, currentQuality + 2);
        
        // Slowly increase optimalMax to safely probe higher quality levels over time
        if (stableFrames % 10 === 0) {
            optimalMax = Math.min(100, optimalMax + 1);
        }
      }
    }
    
    applyQualityLevel(currentQuality);
    
    frameCount = 0;
    totalDelta = 0;
  }
}

function applyQualityLevel(level) {
  if (level < 40) {
    // Lowest tier: scale resolution down, use simple cel shading
    settings.renderScale = 0.2 + (level / 40.0) * 0.8;
    settings.celShading = true;
    settings.shadowsEnabled = false;
    settings.aoEnabled = false;
  } else if (level < 60) {
    // Low-Mid tier: Full resolution, standard lighting
    settings.renderScale = 1.0;
    settings.celShading = false;
    settings.shadowsEnabled = false;
    settings.aoEnabled = false;
  } else if (level < 85) {
    // High-Mid tier: Full resolution, shadows on
    settings.renderScale = 1.0;
    settings.celShading = false;
    settings.shadowsEnabled = true;
    settings.aoEnabled = false;
  } else {
    // Max tier: Everything on
    settings.renderScale = 1.0;
    settings.celShading = false;
    settings.shadowsEnabled = true;
    settings.aoEnabled = true;
  }
}