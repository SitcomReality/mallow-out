// Simple utility functions for animation
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