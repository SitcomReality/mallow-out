import * as THREE from 'three';
import { vertexShader } from '../shaders/vertex.js';
import { fragmentShader } from '../shaders/fragment.js';

/**
 * Creates the main shader material with all required uniforms initialized.
 */
export function createMainMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      // Initialize font texture uniform to null by default; it can be assigned later.
      uFontTex: { value: null },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uCamPos: { value: new THREE.Vector3() },
      uCamFwd: { value: new THREE.Vector3() },
      uCamRight: { value: new THREE.Vector3() },
      uCamUp: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uDayTime: { value: 0 },
      uMaxSteps: { value: 100 },
      uDrawDist: { value: 150 },
      uFlatLighting: { value: 0.0 },
      uCelShading: { value: 1.0 },
      uShadowsEnabled: { value: 1.0 },
      uAOEnabled: { value: 1.0 },
      uBlobWobble: { value: 0.0 },
      uSelectionInfo: { value: new THREE.Vector2(0, 0) },
      uShowOutline: { value: 1.0 },
      uOutlineColor: { value: new THREE.Color() },
      uNumObjects: { value: 0 },
      uObjData0: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
      uGroupData: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
      uObjData1: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
      uObjData2: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
      uObjData3: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
      uObjData4: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
      uObjData5: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
      uObjData6: { value: Array.from({ length: 32 }, () => new THREE.Vector4()) },
      uSkyColor: { value: new THREE.Color() },
      uSkyColor2: { value: new THREE.Color() },
      uSkyTextured: { value: 1.0 },
      uFloorEnabled: { value: 1.0 },
      uFloorTextured: { value: 1.0 },
      uFloorColor: { value: new THREE.Color() },
      uSphereRadius: { value: 50.0 },
      uSphereWallThickness: { value: 2.0 },
      uSphereNoiseAmount: { value: 1.5 },
      uSphereNoiseScale: { value: 2.0 },
    },
    vertexShader,
    fragmentShader
  });
}