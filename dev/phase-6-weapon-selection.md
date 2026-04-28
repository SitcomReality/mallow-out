# Phase 6: Weapon Selection System
Add weapon selection at wave start and remove mid-wave weapon switching.

## Goals
- Present 2 random weapons at wave start
- Lock weapon for duration of wave
- Remove weapon switching controls during wave
- Update UI to show selected weapon

## Steps
### Step 6.1: Create Weapon Selection State
Update src/game/state.js

Add:
- selectedWeaponForWave: null
- weaponChoicesOffered: [null, null]

### Step 6.2: Create Weapon Selection UI
Create src/ui/weapon-selection.js

Display before wave starts:
- "Choose Your Weapon"
- 2 weapon options (randomly selected from 5)
- Each shows: icon, name, description, drawback warning
- Click to select

### Step 6.3: Implement Weapon Selection Logic
Create src/game/weapon-selection.js

Function: offerWeaponChoices()
- Randomly select 2 different weapons
- Store in gameState
- Show selection UI

Function: selectWeapon(weaponIndex)
- Lock in weapon for wave
- Hide selection UI
- Start wave timer

### Step 6.4: Remove Mid-Wave Weapon Switching
Update main.js

Remove keyboard bindings for weapon switching (1-5 keys)
Remove weapon selection from HUD during wave

### Step 6.5: Update Weapon Display
Update src/ui/hud.js or create new weapon-display component

Show:
- Currently selected weapon icon and name
- Weapon-specific status (charge, heat, cooldown)
- Position near crosshair or bottom center

### Step 6.6: Integrate Into Wave Flow
Update src/game/manager.js

New wave flow:
1. Wave summary (if not first wave)
2. Petal shop
3. Upgrade shop
4. Weapon selection
5. Wave starts

## Testing Checkpoints
- 2 random weapons offered at wave start
- Selection locks weapon for wave
- Can't switch weapons mid-wave
- Weapon display shows correct info
- Flow between screens works smoothly