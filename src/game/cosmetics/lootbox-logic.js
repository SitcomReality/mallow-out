import { gameState } from '../state.js';
import { COSMETIC_RARITIES, ALL_COSMETICS } from './cosmetics-types.js';
import { saveGame } from '../persistence.js';

export const LOOTBOX_COST = 50; // Pollen cost

export function canAffordLootbox() {
  return gameState.currencies.pollen >= LOOTBOX_COST;
}

export function openLootbox() {
  if (!canAffordLootbox()) return null;
  
  gameState.currencies.pollen -= LOOTBOX_COST;
  
  // Weighted random selection
  const totalWeight = Object.values(COSMETIC_RARITIES).reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * totalWeight;
  
  let selectedRarity = null;
  for (const rarity of Object.values(COSMETIC_RARITIES)) {
    roll -= rarity.weight;
    if (roll <= 0) {
      selectedRarity = rarity.id;
      break;
    }
  }
  
  // Get all cosmetics of this rarity that aren't unlocked yet
  const available = ALL_COSMETICS.filter(c => 
    c.rarity === selectedRarity && !gameState.cosmetics.unlocked.includes(c.id)
  );
  
  // If all of this rarity are unlocked, give duplicate protection (upgrade to next rarity)
  if (available.length === 0) {
    const rarities = Object.keys(COSMETIC_RARITIES);
    const currentIdx = rarities.indexOf(selectedRarity);
    if (currentIdx < rarities.length - 1) {
      selectedRarity = rarities[currentIdx + 1];
      const nextAvailable = ALL_COSMETICS.filter(c => 
        c.rarity === selectedRarity && !gameState.cosmetics.unlocked.includes(c.id)
      );
      if (nextAvailable.length > 0) {
        const item = nextAvailable[Math.floor(Math.random() * nextAvailable.length)];
        gameState.cosmetics.unlocked.push(item.id);
        saveGame();
        return { item, isDuplicate: false };
      }
    }
    // All cosmetics unlocked - give pollen refund
    gameState.currencies.pollen += LOOTBOX_COST;
    return { item: null, isDuplicate: true, refund: true };
  }
  
  const item = available[Math.floor(Math.random() * available.length)];
  gameState.cosmetics.unlocked.push(item.id);
  saveGame();
  
  return { item, isDuplicate: false };
}

export function equipCosmetic(cosmeticId) {
  const cosmetic = ALL_COSMETICS.find(c => c.id === cosmeticId);
  if (!cosmetic) return false;
  if (!gameState.cosmetics.unlocked.includes(cosmeticId)) return false;
  
  gameState.cosmetics.equipped[cosmetic.category] = cosmeticId;
  saveGame();
  return true;
}

export function getEquippedCosmetic(category) {
  const id = gameState.cosmetics.equipped[category];
  if (!id) return null;
  return ALL_COSMETICS.find(c => c.id === id) || null;
}