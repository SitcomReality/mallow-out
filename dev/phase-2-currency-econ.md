# Phase 2: Currency and Economy System
Implement the two-currency system (Pollen and Caramel) with damage-based reward calculation.

## Goals
- Add Pollen currency (earned from damage)
- Add Caramel currency (earned from marshmallow destruction)
- Track currency gains during waves
- Display currency in UI
- Create wave summary screen showing earnings

## Steps
### Step 2.1: Create Currency State
Update src/game/state.js

Add to gameState:
- currencies: { pollen: 0, caramel: 0 }
- currentWave: { pollenEarned: 0, caramelEarned: 0, damageDealt: 0 }

### Step 2.2: Create Currency Constants
Create src/game/economy-constants.js

Constants:
- POLLEN_PER_DAMAGE = 1
- BASE_CARAMEL_PER_KILL = 10
- CARAMEL_VAPOR_MIN_PERCENT = 0.20
- CARAMEL_VAPOR_MAX_PERCENT = 0.30

### Step 2.3: Implement Pollen Rewards
Update src/game/combat.js

In damageMarshmallow function:
- Calculate pollen from damage amount
- Add to currentWave.pollenEarned
- Show floating damage text (placeholder for now)

### Step 2.4: Implement Caramel Rewards
Update src/game/marshmallow.js or create new file

On marshmallow death:
- Calculate base caramel reward
- Apply any active modifiers
- Add to currentWave.caramelEarned
- Trigger petal roll (placeholder for phase 3)

### Step 2.5: Create Wave Summary Screen
Create src/ui/wave-summary.js

Display:
- Wave number completed
- Marshmallows destroyed
- Total damage dealt
- Pollen earned (with count-up animation)
- Caramel earned (with count-up animation)
- Continue button to shop

### Step 2.6: Create Currency Display HUD
Update src/ui/hud.js

Add persistent display showing:
- Current Pollen total
- Current Caramel total
- Wave timer countdown

Position in top corners or along top edge

### Step 2.7: Wire Up Wave Flow
Update src/game/loop.js and src/game/manager.js

Flow:
1. Wave timer expires
2. Show wave summary with earnings
3. Add earnings to total currencies
4. Show shop/upgrade screen
5. Start next wave when player ready

## Testing Checkpoints
- Pollen increases when dealing damage
- Caramel awarded on marshmallow death
- Currency totals persist between waves
- Wave summary displays correctly
- Totals update after summary screen