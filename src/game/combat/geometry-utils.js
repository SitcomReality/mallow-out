import * as THREE from 'three';

/**
 * Basic ray-sphere intersection utility.
 * Returns distance t to the first hit, or false.
 */
export function intersectRaySphere(ro, rd, center, radius) {
  const oc = new THREE.Vector3().subVectors(center, ro);
  const tca = oc.dot(rd);
  const d2 = oc.dot(oc) - tca * tca;
  const r2 = radius * radius;
  if (d2 > r2) return false;
  const thc = Math.sqrt(r2 - d2);
  let t0 = tca - thc;
  let t1 = tca + thc;
  if (t0 < 0) t0 = t1;
  if (t0 < 0) return false;
  return t0;
}