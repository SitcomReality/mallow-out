export const ENV_COLORS = {
  // Marsh palette
  day: {
    sun: 0xffffee,      // Slightly warm sun
    ambient: 0x334d40,  // Dark murky green ambient
    sky: 0x7a9b8e,      // Misty green-gray horizon
    sky2: 0x4a6a5c,     // Darker swamp zenith
    fog: 0x6a8a7a,      // Dense marsh fog
  },
  night: {
    sun: 0x1a261e,      // Dim green-tinted moonlight
    ambient: 0x080f0d,  // Deep swamp shadows
    sky: 0x050a08,      // Midnight green horizon
    sky2: 0x020504,     // Black-green zenith
    fog: 0x080d0a,      // Oppressive night mist
  },
  floor: 0x5a7a6a,      // Murky ground color
};

export const ENV_SETTINGS = {
  dayFogDensity: 0.035,
  nightFogDensity: 0.06,
  floorTextured: 1.0,
  skyTextured: 1.0,
  sunOrbitInclination: 0.3, // Z-offset for sun path
};