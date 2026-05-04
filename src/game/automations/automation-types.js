export const AUTOMATION_TYPES = {
  AUTO_SHOOTER: 'auto_shooter',
  COMET: 'comet',
  LASER: 'laser',
};

export const AUTOMATION_CONFIG = {
  [AUTOMATION_TYPES.AUTO_SHOOTER]: {
    id: AUTOMATION_TYPES.AUTO_SHOOTER,
    name: 'Auto Shooter',
    icon: '🔫',
    baseInterval: 5.0, // seconds between shots
    baseValue: 0.1, // fraction of player's marsh reward
  },
  
  [AUTOMATION_TYPES.COMET]: {
    id: AUTOMATION_TYPES.COMET,
    name: 'Comet Strike',
    icon: '☄️',
    baseInterval: 15.0,
    baseValue: 0.05,
  },
  
  [AUTOMATION_TYPES.LASER]: {
    id: AUTOMATION_TYPES.LASER,
    name: 'Laser Beam',
    icon: '🔴',
    baseInterval: 8.0,
    baseValue: 0.08,
  },
};

export function getAutomationConfig(type) {
  return AUTOMATION_CONFIG[type] || null;
}