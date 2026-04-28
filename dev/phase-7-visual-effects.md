# Phase 7: Visual Effects and Feedback

Add visual feedback, floating damage text, weapon effects, and other polish.

## Goals
- Implement floating damage text system
- Add weapon visuals (simple meshes)
- Add muzzle flash effects
- Add tracer bullets for hitscan weapons
- Add visible projectile for Globber
- Add charge/heat visual indicators
- Create additional rendering layers if needed

## Steps

### Step 7.1: Create Floating Text System
Create src/effects/floating-text.js

Features:
- Text spawns at 3D position
- Floats upward with slight randomness
- Fades out over time
- Different styles for different text types

Text types:
- Damage numbers
- Critical hit
- Marshmallow type spawned
- Pollen/Caramel rewards
- Petal triggered

### Step 7.2: Implement Text Rendering
Create src/effects/floating-text-renderer.js

Consider approach:
- HTML overlay with CSS transforms
- Or 2D canvas overlay
- Or WebGL instanced text (if performant)

Update render loop to draw text each frame

### Step 7.3: Create Simple Weapon Meshes
Create src/game/weapons/weapon-models.js

For each weapon, create simple geometry:
- Skewer: elongated cylinder (spear)
- Globber: bulbous shape
- Spatterer: spread barrel
- Cleaver: axe shape
- Melter: glowing rod

Position in view (bottom right of screen)
Apply simple animations (recoil, firing)

### Step 7.4: Add Muzzle Flash Effect
Create src/effects/muzzle-flash.js

Simple bright sphere or sprite that:
- Appears at weapon tip on fire
- Scales up quickly then fades
- Different color/size per weapon

### Step 7.5: Add Tracer Bullets
Create src/effects/tracer-line.js

For hitscan weapons (Skewer, Spatterer, Melter):
- Draw line from weapon to hit point
- Bright color with glow
- Fades out quickly (0.1-0.2 seconds)

Use THREE.Line or custom shader

### Step 7.6: Add Visible Globber Projectile
Update projectile rendering

Make Globber projectiles visible:
- Small sphere that travels through air
- Slight trail/glow effect
- Distinct color

### Step 7.7: Add Charge/Heat Indicators
Create src/ui/weapon-status.js

Visual indicators for:
- Cleaver charge (progress bar or circular fill)
- Melter heat (color gradient bar)
- Position near weapon or crosshair

### Step 7.8: Consider Rendering Optimization
Evaluate if additional canvas layers needed:

Option A: Single canvas with multiple scenes
- Raymarched background
- 3D weapon/effects in foreground
- 2D UI overlay

Option B: Multiple canvas layers
- Background canvas for raymarching
- Foreground canvas for effects/weapons
- HTML overlay for UI

Implement chosen approach

### Step 7.9: Add Marshmallow Spawn Effect
Create visual effect when marshmallow spawns:
- Rising from marsh
- Particles/splash
- Floating text announcing type

## Testing Checkpoints
- Floating text appears and animates correctly
- Weapon models visible and animate
- Muzzle flashes appear on firing
- Tracers show bullet paths
- Globber projectiles are visible
- Charge/heat indicators update in real-time
- All effects perform well
</current_page>

/dev/phase-8-polish-and-balance.md