// Movement constants
export const BASE_MOVEMENT_SPEED = 2.0;
export const BASE_BOB_AMPLITUDE = 0.3;
export const DIRECTION_CHANGE_MIN = 2.0;
export const DIRECTION_CHANGE_MAX = 5.0;

// Popping mechanic
export const POP_HEALTH_THRESHOLD = 0.25;
export const POP_CHANCE = 0.15; // 15% chance per hit when below threshold
export const POP_KILL_DISTANCE = 4.0; // Player must be this close to die from pop
export const MIN_APPROACH_DISTANCE = 2.0; // Half of pop distance