import { gameState } from '../state.js';
import { getPetalById } from './petal-types.js';
import { applyPetalEffect } from './petal-effects.js';
import { PETAL_SLOTS, CARAMEL_VAPOR_MIN_PERCENT, CARAMEL_VAPOR_MAX_PERCENT } from './petal-constants.js';
import { session } from '../manager.js';

export function triggerRandomPetal() {
  // Randomly select one of the 5 slots
  const slotIndex = Math.floor(Math.random() * PETAL_SLOTS);
  const petal = gameState.equippedPetals[slotIndex];
  
  if (petal) {
    // Petal is equipped - trigger it
    const petalData = getPetalById(petal);
    if (petalData) {
      applyPetalEffect(petalData);
      gameState.petalTriggersThisWave.push({
        name: petalData.name,
        icon: petalData.icon,
        slot: slotIndex
      });
      console.log(`[Petal] Triggered ${petalData.name} from slot ${slotIndex}`);
    }
    
    // Remove petal from slot (one-time use)
    gameState.equippedPetals[slotIndex] = null;
    
  } else {
    // Empty slot - award caramel vapor bonus
    const vaporPercent = CARAMEL_VAPOR_MIN_PERCENT + Math.random() * (CARAMEL_VAPOR_MAX_PERCENT - CARAMEL_VAPOR_MIN_PERCENT);
    const vaporBonus = Math.floor(gameState.currentWaveStats.caramelEarned * vaporPercent);
    
    gameState.currentWaveStats.caramelEarned += vaporBonus;
    gameState.petalTriggersThisWave.push({
      name: 'Caramel Vapor',
      icon: '💨',
      bonus: vaporBonus,
      slot: slotIndex
    });
    console.log(`[Petal] Empty slot ${slotIndex} - awarded ${vaporBonus} caramel vapor`);
  }
  
  if (session.petalHUD && session.petalHUD.animateTrigger) {
    session.petalHUD.animateTrigger(slotIndex);
  }
}