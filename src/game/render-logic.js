import { settings } from './state.js';

let frameCount = 0;
let totalDelta = 0;

// Graphics quality levels (ordered from lowest to highest impact)
const QUALITY_LEVELS = [
  { name: 'minimal', renderScale: 0.25, celShading: true, shadowsEnabled: false, aoEnabled: false },
  { name: 'low', renderScale: 0.4, celShading: true, shadowsEnabled: false, aoEnabled: false },
  { name: 'medium', renderScale: 0.6, celShading: true, shadowsEnabled: false, aoEnabled: false },
  { name: 'high', renderScale: 0.8, celShading: false, shadowsEnabled: false, aoEnabled: false },
  { name: 'ultra', renderScale: 1.0, celShading: false, shadowsEnabled: true, aoEnabled: false },
  { name: 'max', renderScale: 1.0, celShading: false, shadowsEnabled: true, aoEnabled: true },
];

let currentQualityLevel = 2; // Start at medium

/**
 * Dynamically adjusts graphics quality (resolution, cel shading, shadows, AO) to maintain target FPS.
 */
export function updateDynamicResolution(delta) {
  if (!settings.dynamicGraphics) return;
  
  frameCount++;
  totalDelta += delta;
  
  if (frameCount >= 20) {
    const avgDelta = totalDelta / frameCount;
    const targetDelta = 1.0 / settings.targetFPS;
    const fps = 1.0 / avgDelta;
    
    // Aggressively reduce quality if significantly under target
    if (avgDelta > targetDelta * 1.2 && currentQualityLevel > 0) {
      currentQualityLevel = Math.max(0, currentQualityLevel - 1);
      applyQualityLevel(currentQualityLevel);
    } 
    // Eagerly increase quality if well above target
    else if (avgDelta < targetDelta * 0.7 && currentQualityLevel < QUALITY_LEVELS.length - 1) {
      currentQualityLevel = Math.min(QUALITY_LEVELS.length - 1, currentQualityLevel + 1);
      applyQualityLevel(currentQualityLevel);
    }
    
    frameCount = 0;
    totalDelta = 0;
  }
}

function applyQualityLevel(level) {
  const quality = QUALITY_LEVELS[level];
  settings.renderScale = quality.renderScale;
  settings.celShading = quality.celShading;
  settings.shadowsEnabled = quality.shadowsEnabled;
  settings.aoEnabled = quality.aoEnabled;
}