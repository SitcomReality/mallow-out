# Phase 5: Marshmallow Behaviors and Variety

Add movement, personality types, and visual variety to marshmallows.

## Goals
- Implement floating wandering movement
- Add vertical bobbing motion
- Create different marshmallow flavors/types
- Add rare marshmallow spawns
- Implement marshmallow popping mechanic

## Steps

### Step 5.1: Create Movement System
Create src/game/marshmallow-movement.js

Implement:
- Wandering AI (moves in direction of face)
- Vertical bobbing (sine wave)
- Occasional quick bounds
- Speed variation per marshmallow
- Update position each frame

Add to marshmallow object:
- movementSpeed
- movementPattern (wandering, fleeing, stationary, etc.)
- bobPhase (for sine wave)

### Step 5.2: Define Marshmallow Types
Create src/game/marshmallow-types.js

Type definitions:
- Standard (default)
- Frantic (jittery, faster)
- Shy (tries to move away from player)
- Long (taller, thinner)
- Floaty (rises higher, 2x rewards) - rare
- Friendly (moves toward player, stands still) - rare

Each type has:
- Appearance modifiers (size, color)
- Movement behavior
- Reward multipliers

### Step 5.3: Create Type Constants
Create src/game/marshmallow-type-constants.js

For each type:
- Spawn weight/probability
- Size range
- Color range
- Speed range
- Reward multiplier
- Behavior parameters

### Step 5.4: Implement Spawn Type Selection
Create src/game/marshmallow-spawn.js

Function: selectMarshmallowType()
- Weighted random selection
- Respects rare spawn chance upgrade
- Applies guaranteed spawn petals

### Step 5.5: Apply Type to Marshmallow Creation
Update src/game/marshmallow.js

In createMarshmallow:
- Select type
- Apply visual modifiers (size, color)
- Set movement parameters
- Set reward multipliers

### Step 5.6: Implement Popping Mechanic
Create src/game/marshmallow-pop.js

When marshmallow below 25% health takes damage:
- Roll chance to pop
- If pop: trigger explosion
- Check distance to player
- If player too close: end wave immediately
- Still award caramel reward

Add explosion visual effect (particle burst)

### Step 5.7: Update Movement in Game Loop
Update src/game/loop.js

Each frame:
- Update marshmallow position based on movement AI
- Update bobbing
- Face marshmallow in movement direction
- Clamp to play area boundaries

### Step 5.8: Add Visual Variety
Update marshmallow rendering to support:
- Different sizes
- Color variations
- Maybe different expressions based on type

## Testing Checkpoints
- Marshmallows move and bob naturally
- Different types spawn with correct probabilities
- Type behaviors work as designed
- Popping mechanic functions (distance check, wave end)
- Rare marshmallows are visually distinct
</current_page>

/dev/phase-6-weapon-selection.md