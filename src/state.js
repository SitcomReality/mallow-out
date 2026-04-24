import * as THREE from 'three';

export const worldState = {
  time: 0.35,        // 0-1 day cycle, 0.35 = golden hour
  timeSpeed: 0.01,   // cycle speed
  biomeScale: 0.0004,
  chunkCache: new Map(),
};

export const settings = {
  renderScale: 0.5, // Lower for better performance
  maxSteps: 80,
  drawDistance: 100,
  flatLighting: false,
  celShading: false,
  shadowsEnabled: false,
  aoEnabled: false,
};