import * as THREE from 'three';
import { creatorState } from '../state.js';

/**
 * Flattens the hierarchical object structure into a format suitable for the SDF shader.
 * Updates the provided uniforms object with flattened data.
 */
export function flattenHierarchyForRender(uniforms) {
  const groupMap = new Map(); // parentId -> local group index (0-based)
  let nextGroupIdx = 0;
  const groupUniformData = uniforms.uGroupData.value;
  
  // Reset group data
  groupUniformData.forEach(v => v.set(0, 0.1, 0, 0));

  const opMap = { union: 0, subtract: 1, intersect: 2 };
  const typeMap = { sphere: 0, box: 1, cylinder: 2, torus: 3, text: 4, group: 5 };

  const flatObjects = [];
  const processed = new Set();
  
  const processObj = (obj) => {
    if (processed.has(obj.id)) return;
    processed.add(obj.id);
    
    if (obj.type === 'group') {
      if (!groupMap.has(obj.id)) {
        groupMap.set(obj.id, nextGroupIdx++);
      }
      const gIdx = groupMap.get(obj.id);
      groupUniformData[gIdx].set(opMap[obj.operation] || 0, obj.blendRadius, 0, 0);

      // Recursive child processing ensures contiguous data for the shader's grouping logic
      const children = creatorState.objects.filter(o => o.parentId === obj.id);
      children.forEach(child => processObj(child));
    } else {
      let gid = 0;
      if (obj.parentId !== null) {
        if (!groupMap.has(obj.parentId)) {
          const parent = creatorState.objects.find(o => o.id === obj.parentId);
          if (parent) {
            groupMap.set(obj.parentId, nextGroupIdx++);
            const gIdx = groupMap.get(obj.parentId);
            groupUniformData[gIdx].set(opMap[parent.operation] || 0, parent.blendRadius, 0, 0);
          }
        }
        gid = groupMap.get(obj.parentId) + 1; // 1-based index for shader logic
      }
      flatObjects.push({ ...obj, gid });
    }
  };
  
  // Start from top-level objects
  creatorState.objects.filter(o => !o.parentId).forEach(obj => processObj(obj));

  // Update object data uniforms
  uniforms.uNumObjects.value = flatObjects.length;
  flatObjects.forEach((obj, i) => {
    uniforms.uObjData0.value[i].set(
      typeMap[obj.type] || 0,
      opMap[obj.operation] || 0,
      obj.blendRadius,
      obj.gid || 0
    );
    uniforms.uObjData1.value[i].set(obj.position.x, obj.position.y, obj.position.z, 0);
    uniforms.uObjData2.value[i].set(obj.scale.x, obj.scale.y, obj.scale.z, 0);
    uniforms.uObjData4.value[i].set(obj.rotation.x, obj.rotation.y, obj.rotation.z, 0);
    const color = new THREE.Color(obj.color);
    uniforms.uObjData3.value[i].set(color.r, color.g, color.b, 0);
    uniforms.uObjData5.value[i].set(obj.noiseAmount || 0, obj.noiseScale || 1, 0, 0);
    const no = obj.noiseOffset || { x: 0, y: 0, z: 0 };
    const charCode = obj.type === 'text' ? (obj.textChar || 'A').charCodeAt(0) : 0;
    uniforms.uObjData6.value[i].set(no.x, no.y, no.z, charCode);
  });

  return { flatObjects, groupMap };
}