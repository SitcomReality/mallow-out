import * as THREE from 'three';

/**
 * Transforms a world-space point and quaternion into the local space of a marshmallow.
 */
export function getLocalTransform(worldPos, worldQuat, marshmallow) {
  const mPos = new THREE.Vector3(marshmallow.position.x, marshmallow.position.y, marshmallow.position.z);
  const mRot = new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z);
  const mQuat = new THREE.Quaternion().setFromEuler(mRot);
  const mQuatInv = mQuat.clone().invert();

  const localPos = worldPos.clone().sub(mPos).applyQuaternion(mQuatInv);
  const localQuat = mQuatInv.multiply(worldQuat);
  const localRot = new THREE.Euler().setFromQuaternion(localQuat);

  return { 
    position: { x: localPos.x, y: localPos.y, z: localPos.z },
    rotation: { x: localRot.x, y: localRot.y, z: localRot.z }
  };
}

/**
 * Calculates the surface normal of a marshmallow at a specific hit point.
 */
export function calculateSurfaceNormal(marshmallow, hitPoint) {
  const center = new THREE.Vector3(marshmallow.position.x, marshmallow.position.y, marshmallow.position.z);
  const euler = new THREE.Euler(marshmallow.rotation.x, marshmallow.rotation.y, marshmallow.rotation.z);
  const q = new THREE.Quaternion().setFromEuler(euler);
  const axisWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(q);

  const toHit = hitPoint.clone().sub(center);
  const proj = toHit.dot(axisWorld);

  let worldNormal = new THREE.Vector3();
  if (Math.abs(proj) >= marshmallow.scale.y - 0.01) {
    worldNormal.copy(axisWorld).multiplyScalar(Math.sign(proj));
  } else {
    const radial = toHit.clone().sub(axisWorld.clone().multiplyScalar(proj));
    if (radial.lengthSq() < 1e-6) {
      worldNormal.copy(axisWorld).multiplyScalar(1.0);
    } else {
      worldNormal.copy(radial).normalize();
    }
  }
  return worldNormal;
}