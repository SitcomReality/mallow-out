import * as THREE from 'three';

export const worldState = {};

export const settings = {
  renderScale: 0.5,
  targetFPS: 60,
  dynamicRes: true,
  minScale: 0.1,
  maxScale: 1.0,
  maxSteps: 100,
  drawDistance: 150,
  flatLighting: false,
  celShading: true,
  shadowsEnabled: false,
  aoEnabled: false,
  outlinesEnabled: true,
};

export function applyGraphicsPreset(preset) {
  if (preset === 'low') {
    settings.minScale = 0.1;
    settings.maxScale = 1.0;
    settings.aoEnabled = false;
    settings.shadowsEnabled = false;
    settings.celShading = true;
    settings.renderScale = 0.5;
  } else if (preset === 'high') {
    settings.minScale = 0.5;
    settings.maxScale = 2.0;
    settings.aoEnabled = true;
    settings.shadowsEnabled = true;
    settings.celShading = false;
    settings.renderScale = 1.0;
  }
}