import * as THREE from 'three';

export const worldState = {
  time: 0.35,        // 0-1 day cycle, 0.35 = golden hour
  timeSpeed: 0.01,   // cycle speed
  biomeScale: 0.0004,
  chunkCache: new Map(),
};

export const settings = { // make render settings customizable in-game
  renderScale: 0.75,
  maxSteps: 100,
  drawDistance: 150,
  lodDetail: 1.0,
  flatLighting: false,
  celShading: true,
  shadowsEnabled: true,
  aoEnabled: true,
  isStarted: false,
  uiVisible: true,
  showOutline: true,
  outlineColor: '#ffd200',
  snapDistance: 0.5,
  snapAngle: 15,
  invertSnapModifier: false,
  previewNoisePaused: false,
  tutorialCompleted: localStorage.getItem('smelt_tutorial_completed') === 'true'
};