export const ENV_COLORS = {
  // Fantastical Marsh palette
  day: {
    sun: 0xfff0f5,      // Lavender-tinted sun
    ambient: 0x4b0082,  // Indigo ambient shadows
    sky: 0xffa07a,      // Light salmon horizon (rarely seen)
    sky2: 0x8a2be2,     // Blue violet zenith
    fog: 0x87ceeb,      // Vibrant Orchid fog
  },
  night: {
    sun: 0x00ffff,      // Cyan moon glow
    ambient: 0x191970,  // Midnight blue ambient
    sky: 0x483d8b,      // Dark slate blue horizon
    sky2: 0x000000,     // Deepest black
    fog: 0x4b0082,      // Electric Indigo night mist
  },
  floor: 0x00fa9a,      // Medium Spring Green (Glow-in-the-dark moss)
};

export const ENV_SETTINGS = {
  dayFogDensity: 0.035,
  nightFogDensity: 0.06,
  floorTextured: 1.0,
  skyTextured: 1.0,
  sunOrbitInclination: 0.3, // Z-offset for sun path
};