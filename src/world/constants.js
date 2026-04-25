// Hollow sphere environment constants
export const SPHERE_RADIUS = 50;
export const SPHERE_WALL_THICKNESS = 2;
export const SPHERE_NOISE_SCALE = 2.0;
export const SPHERE_NOISE_AMOUNT = 1.5;

// Fog settings (critical for performance)
export const FOG_DENSITY = 0.08;
export const FOG_CUTOFF = 0.95; // Stop raymarching at 95% fog density
export const MAX_RAY_DISTANCE = SPHERE_RADIUS * 2; // Hard limit