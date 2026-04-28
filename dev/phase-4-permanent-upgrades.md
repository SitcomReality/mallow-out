# Phase 4: Permanent Upgrades System
Implement the permanent upgrade system using Caramel currency with exponential costs.

## Goals
- Create upgrade data structure
- Implement upgrade purchase system
- Add upgrade shop UI
- Apply upgrade effects to gameplay
- Handle exponential cost scaling

## Steps
### Step 4.1: Create Upgrade Types
Create src/game/upgrades/upgrade-types.js

Define upgrade categories:
- Weapon upgrades (rate of fire, damage, crit chance/damage, drawback reduction)
- Economy upgrades (pollen per damage, wave duration)
- Marshmallow upgrades (movement, spawn chances)

Each upgrade tracks current level and has cost formula

### Step 4.2: Create Upgrade Constants
Create src/game/upgrades/upgrade-constants.js

For each upgrade:
- Base cost
- Cost multiplier per level
- Effect per level
- Maximum level (if applicable)

Example cost formula: baseCost * (multiplier ^ currentLevel)

### Step 4.3: Add Upgrade State
Update src/game/state.js

Add upgrades object tracking levels:
<js>
upgrades: {
  fireRate: 0,
  damage: 0,
  critChance: 0,
  critDamage: 0,
  drawbackReduction: 0,
  pollenMultiplier: 0,
  waveDuration: 0,
  // etc.
}
</js>

### Step 4.4: Create Upgrade Calculator
Create src/game/upgrades/upgrade-calculator.js

Functions:
- getUpgradeCost(upgradeId, currentLevel)
- getUpgradeEffect(upgradeId, level)
- canAffordUpgrade(upgradeId, caramelAmount)

### Step 4.5: Apply Weapon Upgrades
Update weapon damage, fire rate, and drawback logic

Create src/game/upgrades/weapon-modifiers.js

Functions to calculate:
- Final damage with upgrades and crits
- Fire rate multiplier
- Drawback reduction for each weapon

### Step 4.6: Apply Economy Upgrades
Update pollen reward calculation
Update wave timer initialization with duration bonuses

### Step 4.7: Create Upgrade Shop UI
Create src/ui/upgrade-shop.js

Display:
- Current Caramel balance
- Upgrade categories (tabs or sections)
- Each upgrade showing: name, current level, cost, effect preview
- Purchase buttons (disabled if can't afford)
- Visual indication of affordable upgrades

### Step 4.8: Integrate Shop Into Wave Flow
Update src/game/manager.js

Flow after wave summary:
1. Show wave summary
2. Show petal shop
3. Show upgrade shop
4. Continue to next wave

Or combine petal + upgrade into single shop screen

## Testing Checkpoints
- Upgrades can be purchased with Caramel
- Costs increase exponentially
- Upgrade effects apply to gameplay
- Can't purchase unaffordable upgrades
- Upgrade levels persist across waves