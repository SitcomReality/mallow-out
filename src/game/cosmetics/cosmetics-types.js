export const COSMETIC_CATEGORIES = {
  SKIN: 'skin',
  PATTERN: 'pattern',
  ACCESSORY: 'accessory'
};

export const COSMETIC_RARITIES = {
  COMMON: { id: 'common', weight: 60, color: '#ffffff' },
  UNCOMMON: { id: 'uncommon', weight: 30, color: '#32cd32' },
  RARE: { id: 'rare', weight: 8, color: '#4169e1' },
  EPIC: { id: 'epic', weight: 2, color: '#9370db' }
};

export const COSMETIC_ITEMS = {
  // Skins - Common
  SKIN_PINK: { id: 'skin_pink', category: COSMETIC_CATEGORIES.SKIN, rarity: 'common', name: 'Classic Pink', color: '#ff69b4' },
  SKIN_WHITE: { id: 'skin_white', category: COSMETIC_CATEGORIES.SKIN, rarity: 'common', name: 'Vanilla', color: '#ffffff' },
  SKIN_YELLOW: { id: 'skin_yellow', category: COSMETIC_CATEGORIES.SKIN, rarity: 'common', name: 'Lemon', color: '#ffff99' },
  
  // Skins - Uncommon
  SKIN_MINT: { id: 'skin_mint', category: COSMETIC_CATEGORIES.SKIN, rarity: 'uncommon', name: 'Mint Chill', color: '#98ff98' },
  SKIN_LAVENDER: { id: 'skin_lavender', category: COSMETIC_CATEGORIES.SKIN, rarity: 'uncommon', name: 'Lavender Dream', color: '#e6e6fa' },
  SKIN_PEACH: { id: 'skin_peach', category: COSMETIC_CATEGORIES.SKIN, rarity: 'uncommon', name: 'Peachy Keen', color: '#ffdab9' },
  
  // Skins - Rare
  SKIN_RAINBOW: { id: 'skin_rainbow', category: COSMETIC_CATEGORIES.SKIN, rarity: 'rare', name: 'Rainbow Swirl', gradient: true, colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'] },
  SKIN_GALAXY: { id: 'skin_galaxy', category: COSMETIC_CATEGORIES.SKIN, rarity: 'rare', name: 'Galaxy', color: '#191970', pattern: 'stars' },
  
  // Skins - Epic
  SKIN_GOLD: { id: 'skin_gold', category: COSMETIC_CATEGORIES.SKIN, rarity: 'epic', name: 'Golden Glory', color: '#ffd700', metallic: true },
  SKIN_COSMIC: { id: 'skin_cosmic', category: COSMETIC_CATEGORIES.SKIN, rarity: 'epic', name: 'Cosmic Void', color: '#000000', pattern: 'cosmic' }
};

export const ALL_COSMETICS = Object.values(COSMETIC_ITEMS);

export function getCosmeticsByCategory(category) {
  return ALL_COSMETICS.filter(c => c.category === category);
}

export function getCosmeticById(id) {
  return ALL_COSMETICS.find(c => c.id === id) || null;
}