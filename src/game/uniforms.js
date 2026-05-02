import * as THREE from 'three';
import { gameState } from './state.js';
import { settings, worldState } from '../state.js';
import { ENV_COLORS, ENV_SETTINGS } from './environment-constants.js';
import { PLAYER_HEIGHT } from './controls-constants.js';

export function updateUniforms(uniforms, time) {
  const player = gameState.player;
  
  // Camera setup - Static position for incremental gameplay
  player.position.set(0, 6.5, 8.5);
  player.pitch = -0.65;
  player.yaw = 0;
  
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
  
  // First pass: identify groups.
  // A group is either an object of type 'group' OR a marshmallow (parent of holes).
  gameState.objects.forEach(obj => {
    // Check if it's a group-type object or has children in the current object list
    const hasChildren = gameState.objects.some(other => other.parentId === obj.id);
    if (obj.type === 'group' || hasChildren) {
      if (!groupMap.has(obj.id)) {
        const gid = nextGid++;
        groupMap.set(obj.id, gid);
        const gIdx = gid - 1;
        if (gIdx < 32) {
          // Groups default to union with 0 blend unless they are a group-type object with specific settings
          const op = obj.type === 'group' ? (opMap[obj.operation] || 0) : 0;
          const blend = obj.type === 'group' ? (obj.blendRadius || 0) : 0;
          uniforms.uGroupData.value[gIdx].set(op, blend, 0, 0);
        }
      }
    }
  });

  // Scene objects (limit to 32 max to prevent array out of bounds)
  const objects = gameState.objects.slice(0, 32);
  uniforms.uNumObjects.value = objects.length;
  
  objects.forEach((obj, i) => {
    let gid = 0;
    let finalPos = { ...obj.position };
    let finalRot = { ...obj.rotation };
    
    // Assign gid if it's a parent or a child
    if (groupMap.has(obj.id)) {
      gid = groupMap.get(obj.id);
    } else if (obj.parentId && groupMap.has(obj.parentId)) {
      gid = groupMap.get(obj.parentId);
    }

    if (obj.parentId) {
      // Transform local to world space if parent is found
      const parent = gameState.objects.find(o => o.id === obj.parentId);
      if (parent) {
        const pPos = new THREE.Vector3(parent.position.x, parent.position.y, parent.position.z);
        const pRot = new THREE.Euler(parent.rotation.x, parent.rotation.y, parent.rotation.z);
        const pQuat = new THREE.Quaternion().setFromEuler(pRot);
        
        const lPos = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
        const wPos = lPos.applyQuaternion(pQuat).add(pPos);
        
        const lRot = new THREE.Euler(obj.rotation.x, obj.rotation.y, obj.rotation.z);
        const lQuat = new THREE.Quaternion().setFromEuler(lRot);
        const wQuat = pQuat.clone().multiply(lQuat);
        const wRot = new THREE.Euler().setFromQuaternion(wQuat);
        
        finalPos = { x: wPos.x, y: wPos.y, z: wPos.z };
        finalRot = { x: wRot.x, y: wRot.y, z: wRot.z };
      }
    }

    uniforms.uObjData0.value[i].set(
      typeMap[obj.type] || 0,
      opMap[obj.operation] || 0,
      obj.blendRadius || 0,
      gid
    );
    uniforms.uObjData1.value[i].set(finalPos.x, finalPos.y, finalPos.z, 0);
    uniforms.uObjData4.value[i].set(finalRot.x, finalRot.y, finalRot.z, 0);
    const color = new THREE.Color(obj.color);
    uniforms.uObjData3.value[i].set(color.r, color.g, color.b, 0);
    
    // Pass noise parameters
    const nOffset = obj.noiseOffset || { x: 0, y: 0, z: 0 };
    uniforms.uObjData6.value[i].set(nOffset.x, nOffset.y, nOffset.z, 0);
    
    const lookX = obj.pupilLookX || 0;
    const lookY = obj.pupilLookY || 0;
    uniforms.uObjData5.value[i].set(obj.noiseAmount || 0, obj.noiseScale || 1, obj.expression || 0, lookX);
    
    // Set scale and hijacked lookY. Doing individual components to avoid .set() zeroing out .w
    uniforms.uObjData2.value[i].x = obj.scale.x;
    uniforms.uObjData2.value[i].y = obj.scale.y;
    uniforms.uObjData2.value[i].z = obj.scale.z;
    uniforms.uObjData2.value[i].w = lookY;
  });
  
  // Environment calculations
  const sunDir = new THREE.Vector3(-1.0, 1.5, 1.0).normalize();
  
  uniforms.uSunColor.value.setHex(ENV_COLORS.sun);
  uniforms.uAmbientColor.value.setHex(ENV_COLORS.ambient);
  uniforms.uSkyColor.value.setHex(ENV_COLORS.sky);
  uniforms.uSkyColor2.value.setHex(ENV_COLORS.sky2);
  uniforms.uFogColor.value.setHex(ENV_COLORS.fog);
  
  uniforms.uSunDir.value.copy(sunDir);
  uniforms.uFogDensity.value = ENV_SETTINGS.fogDensity;

  uniforms.uFloorColor.value.setHex(ENV_COLORS.floor);
  uniforms.uFloorEnabled.value = 1;
  uniforms.uFloorTextured.value = ENV_SETTINGS.floorTextured;
  uniforms.uSkyTextured.value = ENV_SETTINGS.skyTextured;
  
  // Selection/outline (disabled for now)
  uniforms.uSelectionInfo.value.set(0, 0);
  uniforms.uShowOutline.value = 0;
}