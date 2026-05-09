export const AUTOMATION_TYPES = {
  AUTO_SHOOTER: 'auto_shooter',
  COMET: 'comet',
  LASER: 'laser',
  TREAT_DISPENSER: 'treat_dispenser',
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
    baseInterval: 12.0, // seconds between comets
    baseHeal: 8.0, // base heal amount
  },
  
  [AUTOMATION_TYPES.LASER]: {
    id: AUTOMATION_TYPES.LASER,
    name: 'Laser Beam',
    icon: '🔴',
    baseInterval: 8.0, // seconds between lasers
    baseHeal: 5.0, // base heal amount
  },
  
  [AUTOMATION_TYPES.TREAT_DISPENSER]: {
    id: AUTOMATION_TYPES.TREAT_DISPENSER,
    name: 'Treat Dispenser',
    icon: '🍬',
    checkInterval: 2.0, // check every 2 seconds if we can buy
  },
};

export function getAutomationConfig(type) {
  return AUTOMATION_CONFIG[type] || null;
}