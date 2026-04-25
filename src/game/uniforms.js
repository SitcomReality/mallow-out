import * as THREE from 'three';
import { gameState } from './state.js';
import { settings, worldState } from '../state.js';

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
  
  // Scene objects (limit to 32 max to prevent array out of bounds)
  const objects = gameState.objects.slice(0, 32);
  uniforms.uNumObjects.value = objects.length;
  
  const opMap = { union: 0, subtract: 1, intersect: 2 };
  const typeMap = { sphere: 0, box: 1, cylinder: 2, torus: 3 };
  
  objects.forEach((obj, i) => {
    uniforms.uObjData0.value[i].set(
      typeMap[obj.type] || 0,
      opMap[obj.operation] || 0,
      obj.blendRadius || 0,
      0 // No groups for now
    );
    uniforms.uObjData1.value[i].set(obj.position.x, obj.position.y, obj.position.z, 0);
    uniforms.uObjData2.value[i].set(obj.scale.x, obj.scale.y, obj.scale.z, 0);
    uniforms.uObjData4.value[i].set(obj.rotation.x, obj.rotation.y, obj.rotation.z, 0);
    const color = new THREE.Color(obj.color);
    uniforms.uObjData3.value[i].set(color.r, color.g, color.b, 0);
    
    // Pass noise parameters
    uniforms.uObjData5.value[i].set(obj.noiseAmount || 0, obj.noiseScale || 1, 0, 0);
    const nOffset = obj.noiseOffset || { x: 0, y: 0, z: 0 };
    uniforms.uObjData6.value[i].set(nOffset.x, nOffset.y, nOffset.z, 0);
  });
  
  // Sky and floor
  uniforms.uSkyColor.value.setHex(0x87CEEB);
  uniforms.uSkyColor2.value.setHex(0x4682B4);
  uniforms.uSkyTextured.value = 1;
  uniforms.uFloorEnabled.value = 1;
  uniforms.uFloorColor.value.setHex(0x8B7355);
  uniforms.uFloorTextured.value = 1;
  
  // Selection/outline (disabled for now)
  uniforms.uSelectionInfo.value.set(0, 0);
  uniforms.uShowOutline.value = 0;
}