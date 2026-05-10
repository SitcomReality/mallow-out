const lPos = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
  const wPos = lPos.applyQuaternion(pQuat).add(pPos);
  
  const lRot = new THREE.Euler(obj.rotation.x, obj.rotation.y, obj.rotation.z);
  const lQuat = new THREE.Quaternion().setFromEuler(lRot);
  const wQuat = pQuat.clone().multiply(lQuat);
  const wRot = new THREE.Euler().setFromQuaternion(wQuat);
  
  finalPos = { x: wPos.x, y: wPos.y, z: wPos.z };
  finalRot = { x: wRot.x, y: wRot.y, z: wRot.z };
}

uniforms.uObjData0.value[i].set(
  typeMap[obj.type] || 0,
  opMap[obj.operation] || 0,
  obj.blendRadius || 0,
  gid
);
uniforms.uObjData1.value[i].set(finalPos.x, finalPos.y, finalPos.z, 0);
// Handle both Euler and Quaternion rotation inputs
let finalQuat;
if (obj.rotation && typeof obj.rotation.w === 'number') {
  finalQuat = new THREE.Quaternion(obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.w);
} else {
  finalQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(obj.rotation.x, obj.rotation.y, obj.rotation.z));
}

if (parent) {
  const pRot = new THREE.Euler(parent.rotation.x, parent.rotation.y, parent.rotation.z);
  const pQuat = new THREE.Quaternion().setFromEuler(pRot);
  finalQuat.premultiply(pQuat);
}