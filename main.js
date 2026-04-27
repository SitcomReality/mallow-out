const rot = gameState.boss.marshmallow.rotation;
  const euler = new THREE.Euler(rot.x, rot.y, rot.z, 'ZXY');
  const q = new THREE.Quaternion().setFromEuler(euler).invert();
  localHit.applyQuaternion(q);
  
  // The face shader maps localP.z to horizontal (uv.x) and localP.x to vertical (uv.y)
  const dir = localHit.normalize();
  
  // We want to map this to an eye offset. Max offset ~0.08
  gameState.boss.marshmallow.targetLookDir = { x: dir.z * 0.08, y: dir.x * 0.08 };
  gameState.boss.marshmallow.lookDirTime = 1.0; // look for 1 second
}

const defeated = damageBoss(gameState.boss, damage);