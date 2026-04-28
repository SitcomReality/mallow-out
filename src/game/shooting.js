import * as THREE from 'three';

export function castRay(origin, direction, distanceFunction, maxDistance = 100) {
  let t = 0;
  const steps = 150;
  const epsilon = 0.01;
  
  for (let i = 0; i < steps; i++) {
    const p = origin.clone().add(direction.clone().multiplyScalar(t));
    const dist = distanceFunction(p);
    
    if (dist < epsilon) {
      return { hit: true, point: p, distance: t };
    }
    
    if (t > maxDistance) break;
    t += dist;
  }
  
  return { hit: false, point: null, distance: maxDistance };
}

export function getEnemyDistanceAt(enemy, point) {
  // Transform point to local space of marshmallow
  const localP = point.clone().sub(new THREE.Vector3(enemy.marshmallow.position.x, enemy.marshmallow.position.y, enemy.marshmallow.position.z));
  
  // Apply inverse rotation
  const euler = new THREE.Euler(enemy.marshmallow.rotation.x, enemy.marshmallow.rotation.y, enemy.marshmallow.rotation.z);
  const q = new THREE.Quaternion().setFromEuler(euler);
  localP.applyQuaternion(q.invert());
  
  // Calculate cylinder distance (simplified - height is along Y in local space)
  const r = enemy.marshmallow.scale.x;
  const h = enemy.marshmallow.scale.y;
  const dx = Math.sqrt(localP.x * localP.x + localP.z * localP.z) - r;
  const dy = Math.abs(localP.y) - h;
  
  let dist = Math.min(Math.max(dx, dy), 0) + Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
  
  // Subtract holes with a small blend for "juicy" look
  for (const hole of enemy.holes) {
    const holeDist = getHoleDistanceAt(hole, point);
    // Smooth subtraction logic
    const k = 0.1;
    const h = Math.max(k - Math.abs(dist - (-holeDist)), 0.0) / k;
    dist = Math.max(dist, -holeDist) + h * h * k * 0.25;
  }
  
  return dist;
}

function getHoleDistanceAt(hole, point) {
  const localP = point.clone().sub(new THREE.Vector3(hole.position.x, hole.position.y, hole.position.z));
  
  if (hole.type === 'sphere') {
    return localP.length() - hole.scale.x;
  }
  
  const euler = new THREE.Euler(hole.rotation.x, hole.rotation.y, hole.rotation.z);
  const q = new THREE.Quaternion().setFromEuler(euler);
  localP.applyQuaternion(q.invert());
  
  const r = hole.scale.x;
  const h = hole.scale.y;
  const dx = Math.sqrt(localP.x * localP.x + localP.z * localP.z) - r;
  const dy = Math.abs(localP.y) - h;
  
  return Math.min(Math.max(dx, dy), 0) + Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
}