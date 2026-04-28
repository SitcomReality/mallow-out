# Phase 1: Core Systems Refactoring

This phase establishes the foundation for the new game design by renaming concepts, restructuring wave logic, and preparing the codebase for upcoming currency and progression systems.

## Goals
- Rename "boss/enemy" terminology to "marshmallow" throughout codebase
- Implement time-based wave system (30 second default)
- Replace wave completion check with timer-based progression
- Add continuous marshmallow spawning during waves
- Implement marshmallow replacement on death

## Steps

### Step 1.1: Rename Boss/Enemy to Marshmallow
Update all references from boss/enemy to marshmallow across the codebase:

Files to update:
- src/game/boss.js -> src/game/marshmallow.js
- All references in game state, combat, manager, etc.
- Function names: createBoss -> createMarshmallow, damageBoss -> damageMarshmallow
- Variable names: gameState.boss -> gameState.currentMarshmallow
- Comments and console logs

### Step 1.2: Create Wave Timer System
Create src/game/wave-timer.js

Key functions:
- startWaveTimer(duration)
- updateWaveTimer(delta)
- getRemainingTime()
- addTimeBonus(percentage) - adds n% of wave duration when marshmallows are destroyed
- isWaveComplete()

Add to gameState:
- waveTimer: { duration: 30, remaining: 30, active: false }

### Step 1.3: Implement Continuous Marshmallow Spawning
Update src/game/manager.js

New function: spawnNextMarshmallow()
- Called when wave starts
- Called when a marshmallow is destroyed (after melt animation starts)
- *Constraint:* If there is >1 melting marshmallow, wait until there is at most 1 before spawning the next
- Increments a counter for "marshmallows spawned this wave"
- Each subsequent marshmallow has slightly more health

Update gameState to track:
- marshmallowsSpawnedThisWave: 0
- marshmallowsDestroyedThisWave: 0

### Step 1.4: Update Wave Completion Logic
Modify src/game/loop.js

Replace boss defeat check with timer check:
- When timer reaches 0, wave ends
- Show wave summary screen (placeholder for now)
- Proceed to shop/upgrade screen

### Step 1.5: Add Marshmallow Health Scaling
Create src/game/marshmallow-scaling.js

Functions:
- getBaseHealthForWave(waveNumber)
- getHealthForSpawnIndex(waveNumber, spawnIndex)
- Uses exponential or polynomial growth curve

### Step 1.6: Update Constants
Create src/game/wave-timer-constants.js

Constants:
- DEFAULT_WAVE_DURATION = 30
- TIME_BONUS_PER_KILL = 3 (or percentage)
- BASE_MARSHMALLOW_HEALTH = 12
- HEALTH_INCREASE_PER_WAVE = 0.15 (multiplier)
- HEALTH_INCREASE_PER_SPAWN = 0.05 (multiplier)

## Testing Checkpoints
- Marshmallows spawn continuously during wave
- Timer counts down properly
- Destroying marshmallow spawns new one and adds time
- Wave ends when timer expires
- Health increases per wave and per spawn
</current_page>

/dev/phase-2-currency-system.md