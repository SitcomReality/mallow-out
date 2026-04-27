import * as THREE from 'three';
import { gameState } from './state.js';
import { settings, worldState } from '../state.js';
import { ENV_COLORS, ENV_SETTINGS } from './environment-constants.js';

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
  
  const opMap = { union: 0, subtract: 1, intersect: 2 };
  const typeMap = { sphere: 0, box: 1, cylinder: 2, torus: 3, group: 5 };
  
  let nextGid = 1;
  const groupMap = new Map();
  
  // Clear old group data to prevent stale values
  uniforms.uGroupData.value.forEach(v => v.set(0, 0, 0, 0));
  
  // First pass: identify groups and assign their group data
  gameState.objects.forEach(obj => {
    if (obj.type === 'group') {
      if (!groupMap.has(obj.id)) {
        groupMap.set(obj.id, nextGid++);
        const gIdx = groupMap.get(obj.id) - 1;
        if (gIdx < 32) {
          uniforms.uGroupData.value[gIdx].set(opMap[obj.operation] || 0, obj.blendRadius || 0, 0, 0);
        }
      }
    }
  });

  // Scene objects (limit to 32 max to prevent array out of bounds)
  const objects = gameState.objects.slice(0, 32);
  uniforms.uNumObjects.value = objects.length;
  
  objects.forEach((obj, i) => {
    let gid = 0;
    if (obj.parentId && groupMap.has(obj.parentId)) {
      gid = groupMap.get(obj.parentId);
    }

    uniforms.uObjData0.value[i].set(
      typeMap[obj.type] || 0,
      opMap[obj.operation] || 0,
      obj.blendRadius || 0,
      gid
    );
    uniforms.uObjData1.value[i].set(obj.position.x, obj.position.y, obj.position.z, 0);
    uniforms.uObjData2.value[i].set(obj.scale.x, obj.scale.y, obj.scale.z, 0);
    uniforms.uObjData4.value[i].set(obj.rotation.x, obj.rotation.y, obj.rotation.z, 0);
    const color = new THREE.Color(obj.color);
    uniforms.uObjData3.value[i].set(color.r, color.g, color.b, 0);
    
    // Pass noise parameters
    // uObjData5.w = pupilLookX
    // uObjData2.w = pupilLookY (hijacked)
    const lookX = obj.pupilLookX || 0;
    const lookY = obj.pupilLookY || 0;
    uniforms.uObjData5.value[i].set(obj.noiseAmount || 0, obj.noiseScale || 1, obj.expression || 0, lookX);
    uniforms.uObjData2.value[i].w = lookY;
    
    const nOffset = obj.noiseOffset || { x: 0, y: 0, z: 0 };
    uniforms.uObjData6.value[i].set(nOffset.x, nOffset.y, nOffset.z, 0);
  });
  
  // Environment calculations
  const sunAngle = worldState.time * 6.28318 - 1.5708;
  const sunDir = new THREE.Vector3(
    Math.cos(sunAngle) * 0.7, 
    Math.sin(sunAngle), 
    Math.cos(sunAngle) * ENV_SETTINGS.sunOrbitInclination
  ).normalize();
  
  const sunH = Math.max(0, Math.min(1, sunDir.y * 2.0));
  const nightFactor = 1.0 - sunH;
  
  const cDay = ENV_COLORS.day;
  const cNight = ENV_COLORS.night;
  
  const lerpCol = (target, hex1, hex2, t) => {
    const c1 = new THREE.Color(hex1);
    const c2 = new THREE.Color(hex2);
    target.copy(c1).lerp(c2, t);
  };

  lerpCol(uniforms.uSunColor.value, cDay.sun, cNight.sun, nightFactor);
  lerpCol(uniforms.uAmbientColor.value, cDay.ambient, cNight.ambient, nightFactor);
  lerpCol(uniforms.uSkyColor.value, cDay.sky, cNight.sky, nightFactor);
  lerpCol(uniforms.uSkyColor2.value, cDay.sky2, cNight.sky2, nightFactor);
  lerpCol(uniforms.uFogColor.value, cDay.fog, cNight.fog, nightFactor);
  
  uniforms.uSunDir.value.copy(sunDir);
  uniforms.uFogDensity.value = ENV_SETTINGS.dayFogDensity * (1 - nightFactor) + ENV_SETTINGS.nightFogDensity * nightFactor;

  uniforms.uFloorColor.value.setHex(ENV_COLORS.floor);
  uniforms.uFloorEnabled.value = 1;
  uniforms.uFloorTextured.value = ENV_SETTINGS.floorTextured;
  uniforms.uSkyTextured.value = ENV_SETTINGS.skyTextured;
  
  // Selection/outline (disabled for now)
  uniforms.uSelectionInfo.value.set(0, 0);
  uniforms.uShowOutline.value = 0;
}