import * as THREE from 'three';
import { gameState } from './state.js';
import { settings, worldState } from '../state.js';
import { SPHERE_RADIUS, SPHERE_WALL_THICKNESS, SPHERE_NOISE_AMOUNT, SPHERE_NOISE_SCALE } from '../world/constants.js';

export function updateUniforms(uniforms, time) {
  const player = gameState.player;
  
  // Camera setup
  uniforms.uCamPos.value.copy(player.position);
  
  // Match the camera up-vector with the spherical environment
  const localUp = player.position.clone().multiplyScalar(-1).normalize();
  
  let forwardRef = new THREE.Vector3(0, 0, -1);
  if (Math.abs(localUp.dot(forwardRef)) > 0.99) {
    forwardRef = new THREE.Vector3(1, 0, 0);
  }
  
  const localRight = new THREE.Vector3().crossVectors(forwardRef, localUp).normalize();
  const localForward = new THREE.Vector3().crossVectors(localUp, localRight).normalize();
  
  const yawedForward = localForward.clone().multiplyScalar(Math.cos(player.yaw)).add(localRight.clone().multiplyScalar(-Math.sin(player.yaw)));
  const yawedRight = new THREE.Vector3().crossVectors(yawedForward, localUp).normalize();
  
  // Pitch the camera up and down relative to the spherical tangent
  const pitchQ = new THREE.Quaternion().setFromAxisAngle(yawedRight, player.pitch);
  const finalForward = yawedForward.clone().applyQuaternion(pitchQ);
  const finalUp = localUp.clone().applyQuaternion(pitchQ);
  
  uniforms.uCamFwd.value.copy(finalForward);
  uniforms.uCamRight.value.copy(yawedRight);
  uniforms.uCamUp.value.copy(finalUp);
  
  // Time and settings
  uniforms.uTime.value = time * 0.001;
  uniforms.uDayTime.value = worldState.time;
  uniforms.uMaxSteps.value = settings.maxSteps;
  uniforms.uDrawDist.value = settings.drawDistance;
  uniforms.uFlatLighting.value = settings.flatLighting ? 1 : 0;
  uniforms.uCelShading.value = settings.celShading ? 1 : 0;
  uniforms.uShadowsEnabled.value = settings.shadowsEnabled ? 1 : 0;
  uniforms.uAOEnabled.value = settings.aoEnabled ? 1 : 0;
  
  // Scene objects
  const objects = gameState.objects;
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
  
  // Sky and sphere environment
  uniforms.uSkyColor.value.setHex(0x1a0a20); // Dark purple sky
  uniforms.uSkyColor2.value.setHex(0x0a0510); // Darker purple
  uniforms.uSkyTextured.value = 1;
  uniforms.uFloorEnabled.value = 1; // Using sphere instead
  uniforms.uFloorColor.value.setHex(0x4a2860); // Purple-ish sphere surface
  uniforms.uFloorTextured.value = 1;
  
  // Sphere parameters
  uniforms.uSphereRadius.value = SPHERE_RADIUS;
  uniforms.uSphereWallThickness.value = SPHERE_WALL_THICKNESS;
  uniforms.uSphereNoiseAmount.value = SPHERE_NOISE_AMOUNT;
  uniforms.uSphereNoiseScale.value = SPHERE_NOISE_SCALE;
  
  // Selection/outline (disabled for now)
  uniforms.uSelectionInfo.value.set(0, 0);
  uniforms.uShowOutline.value = 0;
}