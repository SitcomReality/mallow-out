import { settings } from './state.js';


export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpColor(c1, c2, t) {
  // Assumes hex colors like '#rrggbb'
  const r1 = parseInt(c1.substr(1, 2), 16);
  const g1 = parseInt(c1.substr(3, 2), 16);
  const b1 = parseInt(c1.substr(5, 2), 16);
  const r2 = parseInt(c2.substr(1, 2), 16);
  const g2 = parseInt(c2.substr(3, 2), 16);
  const b2 = parseInt(c2.substr(5, 2), 16);
  
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}


export function recalculateNoiseOffsets() {
  const sorted = [...animState.keyframes].sort((a, b) => a.time - b.time);
  const objectStates = new Map(); // id -> { offset, speed }

  let lastTime = 0;

  sorted.forEach(kf => {
    const dt = kf.time - lastTime;
    
    kf.objects.forEach(obj => {
      if (!objectStates.has(obj.id)) {
        objectStates.set(obj.id, { 
          offset: { x: 0, y: 0, z: 0 }, 
          speed: obj.noiseSpeed || { x: 0, y: 0, z: 0 } 
        });
      }
      
      const state = objectStates.get(obj.id);
      const currSpeed = obj.noiseSpeed || { x: 0, y: 0, z: 0 };
      
      // Trapezoidal accumulation of speed to get offset
      state.offset.x += (state.speed.x + currSpeed.x) * 0.5 * dt;
      state.offset.y += (state.speed.y + currSpeed.y) * 0.5 * dt;
      state.offset.z += (state.speed.z + currSpeed.z) * 0.5 * dt;
      
      // Store in kf object for interpolation use
      obj.accumulatedOffset = { ...state.offset };
      
      // Update state for next kf
      state.speed = { ...currSpeed };
    });
    
    lastTime = kf.time;
  });
}
