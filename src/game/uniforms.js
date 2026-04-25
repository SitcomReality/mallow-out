import * as THREE from 'three';
import { gameState } from './state.js';
import { settings, worldState } from '../state.js';
import { flattenHierarchyForRender } from '../core/scene-processor.js';

export function updateUniforms(uniforms, time) {
  const player = gameState.player;
  
  // Camera setup
  uniforms.uCamPos.value.copy(player.position);
  
  const forward = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();
  
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  
  uniforms.uCamFwd.value.copy(forward);
  uniforms.uCamRight.value.copy(right);
  uniforms.uCamUp.value.copy(up);
  
  // Time and settings
  uniforms.uTime.value = time * 0.001;
  uniforms.uDayTime.value = worldState.time;
  uniforms.uMaxSteps.value = settings.maxSteps;
  uniforms.uDrawDist.value = settings.drawDistance;
  uniforms.uFlatLighting.value = settings.flatLighting ? 1 : 0;
  uniforms.uCelShading.value = settings.celShading ? 1 : 0;
  uniforms.uShadowsEnabled.value = settings.shadowsEnabled ? 1 : 0;
  uniforms.uAOEnabled.value = settings.aoEnabled ? 1 : 0;
  
  // Scene objects (flattened from gameState.objects)
  flattenHierarchyForRender(gameState.objects, uniforms);
  
  // Marsh sky and floor
  uniforms.uSkyColor.value.setHex(0x7A9B8E); // Misty green-gray
  uniforms.uSkyColor2.value.setHex(0x4A6A5C); // Darker marsh tone
  uniforms.uSkyTextured.value = 1;
  uniforms.uFloorEnabled.value = 1;
  uniforms.uFloorColor.value.setHex(0x5A7A6A); // Murky marsh ground
  uniforms.uFloorTextured.value = 1;
  
  // Selection/outline (disabled for now)
  uniforms.uSelectionInfo.value.set(0, 0);
  uniforms.uShowOutline.value = 0;
}