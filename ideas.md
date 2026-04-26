# Ideas for High-Performance Visual Enhancements

## The Performance Challenge
In our current raymarching setup, every Constructive Solid Geometry (CSG) operation—like subtracting a hole or adding a splash chunk—increases the complexity of our distance function (<code>map()</code>). Because this function is evaluated dozens of times for every single pixel on the screen, calculating too many subtractions simultaneously will inevitably cause frame rate drops.

## 1. Procedural Shader Texturing (Zero Geometry Cost)
The absolute most performant way to add detail is to do it completely outside the distance function, directly in the material color calculation (<code>getMaterialColor()</code>). Once a ray hits the surface, we have its local position and normal, which we can use to procedurally generate features without adding any raymarching steps.

*   <b>The Toasted Look:</b> We can add a toasted gradient by checking the local Y coordinate or the surface normal. If the normal points upwards, we mix in a golden-brown, caramelized color.
*   <b>Procedural Faces:</b> We can calculate a simple 2D UV coordinate mapped around the cylinder. Using basic 2D distance math (which only runs once per pixel on hit, rather than every ray step), we can draw a face. For example, checking if the UV falls within two small circles can render black eyes, and a curved line can render a mouth. By tweaking the 2D shapes, we can change expressions without any CSG overhead.

## 2. Dynamic Hole Healing (CSG Budgeting)
To keep the CSG operations strictly within budget, we can implement an active healing mechanic.
*   <b>FIFO Queue:</b> We can limit an enemy to a maximum of, say, 5 simultaneous holes. When a new hole is created, the oldest one is removed from the array.
*   <b>Shrink-to-Heal:</b> Over a few seconds, we can animate the scale of older holes down to zero before removing them, making it look like the marshmallow is actively regenerating its fluffy exterior. This allows visual damage feedback while maintaining a hard cap on performance cost.

## 3. Raymarching Bounding Volumes (Optimization)
If we do need more CSG operations, we can wrap the evaluation of the marshmallow's holes inside a bounding volume check. By evaluating a slightly larger bounding cylinder first, we can skip evaluating all the hole subtractions if the ray's current position is outside the bounding box. This saves massive amounts of GPU cycles for rays traveling through empty space or hitting the floor.

## 4. Simple Accessory Objects
Adding one or two simple union operations (like a sphere or box) to give the marshmallow a hat, a stick, or a bow tie is relatively cheap compared to dozens of subtractions. We can give each wave's boss a unique accessory to visually distinguish them, storing it in the <code>gameState.objects</code> array.