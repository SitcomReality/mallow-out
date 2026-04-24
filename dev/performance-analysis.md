# Raymarched FPS Performance Analysis & Path Forward

## The Problem

Performance degrades significantly after just 3 holes in an enemy. Each hole adds:
- A CSG subtraction operation evaluated at every raymarch step
- Point transformation into local space (rotation + translation)
- Distance field calculation
- Max operation for boolean subtraction

With 160 max raymarch steps per pixel, even 3-4 holes means thousands of extra calculations per frame.

## Why It's Slow

**Raymarching fundamentals:**
- Every pixel shoots a ray
- Each ray takes up to 160 steps
- Each step evaluates the entire scene (all objects + all holes)
- CSG operations are expensive (transformation + distance calculation + boolean ops)

**Current worst case:**
- 1920x1080 = 2,073,600 pixels
- 160 steps per ray = 331,776,000 step evaluations per frame
- 4 holes in enemy = 1,327,104,000 distance calculations per frame
- At 60fps target = 79,626,240,000 calculations per second

No wonder it melts!

## Performance Optimization Hacks

### 1. Aggressive Resolution Reduction
<html_style_tag>
// In src/state.js, change:
renderScale: 0.35,  // Was 0.75 - huge impact!
</html_style_tag>

This alone could 4x your performance. Consider dynamic resolution scaling based on frame time.

### 2. Reduce Raymarch Steps
<html_style_tag>
// In src/state.js:
maxSteps: 60,  // Was 120, still looks decent
</html_style_tag>

### 3. Limit Holes Per Enemy
<html_style_tag>
// In src/game/enemy.js addHoleToEnemy():
const MAX_HOLES = 3;
if (enemy.holes.length >= MAX_HOLES) {
  enemy.holes.shift(); // Remove oldest hole
}
</html_style_tag>

### 4. Use Spheres Instead of Cylinders for Holes
Spheres are much cheaper (no rotation needed):
<html_style_tag>
// Change hole to sphere:
const hole = {
  type: 'sphere',
  scale: { x: HOLE_RADIUS, y: HOLE_RADIUS, z: HOLE_RADIUS },
  // No rotation needed!
}
</html_style_tag>

### 5. Early Depth Cutoff
<html_style_tag>
// In fragment shader, after ray loop:
if (t > 30.0) {
  // Cheap sky rendering for distant pixels
  col = skyBase;
  gl_FragColor = vec4(col, 1.0);
  return;
}
</html_style_tag>

### 6. Merge Nearby Holes
When a new hole is close to an existing one, just make the old one bigger instead:
<html_style_tag>
const MIN_HOLE_DISTANCE = 0.5;
for (const existing of enemy.holes) {
  const dist = hitPoint.distanceTo(new THREE.Vector3(
    existing.position.x, 
    existing.position.y, 
    existing.position.z
  ));
  if (dist < MIN_HOLE_DISTANCE) {
    existing.scale.x *= 1.3; // Make it bigger
    return existing;
  }
}
</html_style_tag>

### 7. Lower Quality Lighting
<html_style_tag>
// Disable expensive features:
settings = {
  shadowsEnabled: false,  // Big win!
  aoEnabled: false,       // Also expensive
  celShading: true,       // Actually cheaper than smooth
}
</html_style_tag>

## Alternative Game Design Ideas

### Option A: "Sculpture Mode"
**Concept:** Not a fast-paced FPS, but an artistic destruction sandbox
- One enemy at a time
- Players have unlimited time to "sculpt" by shooting
- Focus on creating interesting shapes/patterns
- Share creations as screenshots
- No performance pressure since it's turn-based

**Pros:** Fits the tech perfectly, unique gameplay
**Cons:** Different genre than original vision

### Option B: "Melt Shooter"
**Concept:** Replace holes with noise-based melting
- Shooting increases noise amount on enemy
- Enemies gradually deform and collapse
- Much cheaper than CSG (just changes a uniform)
- Still satisfying visual feedback

**Pros:** Performant, fits "melting" concept
**Cons:** Less precise damage visualization

### Option C: "Wave Defense Lite"
**Concept:** Enemies are one-shot-kill, focus on shooting mechanics
- Forget complex damage - enemies pop when hit
- Spawn many simple enemies instead of detailed ones
- Use simple shapes (spheres, boxes)
- Challenge is in aiming/movement, not destruction

**Pros:** Could actually run at 60fps
**Cons:** Abandons the "shredding" mechanic entirely

### Option D: "Precision Shooter"
**Concept:** Embrace the limitation, make it a feature
- 3 holes EXACTLY per enemy before it dies
- Shooting specific spots does different things
- Puzzle-like: where should I put these 3 holes?
- Slow-paced, tactical gameplay

**Pros:** Works within constraints, interesting mechanic
**Cons:** Very different from power fantasy FPS

### Option E: "Hybrid Approach"
**Concept:** Raymarch only for special effects, use traditional rendering for gameplay
- Enemies are regular Three.js meshes
- Use raymarched effects for: muzzle flash, impacts, explosions, environment
- Get visual style without the performance cost
- Could use vertex displacement for damage instead of CSG

**Pros:** Best of both worlds
**Cons:** Major architecture change, loses some uniqueness

## Realistic Assessment

**Can this work as originally envisioned?**
Honestly? Probably not on most hardware. The math doesn't lie - evaluating complex CSG trees in a pixel shader is fundamentally expensive.

**What CAN work?**
1. Heavy optimization + reduced scope (3 holes max, low res, simple shapes)
2. Different game genre (puzzle, artistic, turn-based)
3. Hybrid approach (traditional rendering + raymarched effects)

## My Recommendation

**Path 1 (Optimized FPS):**
- Implement ALL the optimization hacks above
- renderScale: 0.35
- maxSteps: 50
- Max 3 spherical holes per enemy
- No shadows/AO
- Test on target hardware

If it runs at 30+ fps on a mid-range device, you have a game. If not...

**Path 2 (Genre Pivot):**
Go with "Sculpture Mode" or "Melt Shooter". The tech is too cool to waste, but forcing it into a fast-paced FPS might be fighting reality.

**Path 3 (Hybrid):**
Biggest lift, but potentially the most commercially viable. Use Three.js for the game, raymarching for the *juice*.

## Bottom Line

The technology is amazing and the effects are unique. But raymarching complex CSG in real-time is genuinely hard even on modern GPUs. 

You need to either:
- Drastically reduce complexity (fewer holes, lower res, simpler shapes)
- Change the game design to fit the constraints
- Use a hybrid approach

The good news? All three paths could result in a fun, unique game. The bad news? The original "power fantasy FPS with enemies you can shred" probably isn't feasible without major compromises.

Want me to help implement any of these paths? I'd start with Path 1 (optimization) to see what's actually possible before making bigger decisions.