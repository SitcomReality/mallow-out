# Phase 3: Petals System

Implement the consumable petal system with 5 slots, random triggering on marshmallow death, and between-wave purchasing.

## Goals
- Create 5-slot petal inventory system
- Implement petal triggering on marshmallow death
- Create petal shop interface
- Implement various petal effects
- Handle "caramel vapor" for empty slots

## Steps

### Step 3.1: Create Petal Data Structure
Create src/game/petals/petal-types.js

Define petal structure:
<js>
{
  id: string,
  name: string,
  rarity: 'common' | 'uncommon' | 'rare',
  cost: number,
  icon: string,
  description: string,
  effect: function
}
</js>

Create library of petal types (start with 5-8 types)

### Step 3.2: Create Petal Constants
Create src/game/petals/petal-constants.js

Constants:
- PETAL_SLOTS = 5
- CARAMEL_VAPOR_MIN = 0.20
- CARAMEL_VAPOR_MAX = 0.30
- PETAL_SHOP_OFFERS = 5

### Step 3.3: Add Petal State
Update src/game/state.js

Add:
- equippedPetals: [null, null, null, null, null] (5 slots)
- activePetalEffects: [] (for duration-based effects)

### Step 3.4: Implement Petal Triggering
Create src/game/petals/petal-trigger.js

Function: triggerRandomPetal()
- Called when marshmallow is destroyed
- Randomly selects one of 5 slots
- If slot has petal: apply effect, remove petal
- If slot empty: award caramel vapor bonus
- Show visual feedback

### Step 3.5: Implement Petal Effects
Create src/game/petals/petal-effects.js

Effect handlers for each petal type:
- Immediate caramel bonus
- Next kill multiplier
- Temporary damage boost
- Movement speed reduction
- Wave duration increase
- Fire rate boost
- Guaranteed rare spawn

Track active timed effects in gameState

### Step 3.6: Create Petal Shop UI
Create src/ui/petal-shop.js

Display:
- Current pollen balance
- 5 random petal offerings with costs
- Purchase buttons
- Current equipped petals (with empty slots shown)
- Drag-and-drop or click to equip

### Step 3.7: Create Petal HUD Display
Create src/ui/petal-hud.js

Replace weapon bar with petal display showing:
- 5 petal slots with icons
- Empty slots shown as "vapor"
- Highlight when petal triggers
- Simple animations

### Step 3.8: Update Wave Summary
Update src/ui/wave-summary.js

Add section showing:
- Which petals were triggered
- Effects that activated
- Caramel vapor bonuses received

## Testing Checkpoints
- Petals can be purchased and equipped
- Random petal triggers on marshmallow death
- Effects apply correctly
- Empty slots award caramel vapor
- Petals persist between waves until triggered
- Visual feedback works properly
</current_page>

/dev/phase-4-upgrades-system.md