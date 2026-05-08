# Graphics Optimization Strategy

## 1. Analytic Hollow Sphere
Calculate the ray intersection with the background sphere analytically. Since the camera and sphere are perfectly static, this provides an exact distance without any raymarching steps for the vast majority of the screen.

## 2. Hybrid Rendering
Combine the analytic background with raymarching only where necessary. If a pixel's ray does not intersect the bounding volume of any dynamic object (like a marshmallow or ripple), skip raymarching entirely and use the analytic sphere distance and color.

## 3. Aggressive SDF Culling
Enclose complex SDF objects inside simple bounding spheres or boxes. Before evaluating expensive CSG operations or noise for an object, check if the current sample point is within its bounding volume. If not, skip it.

## 4. Ray Step Limits and Relaxed Convergence
Implement a hard cap on maximum ray steps and slightly relax the distance threshold for surface hits. Tie these parameters into the Dynamic Graphics system to aggressively reduce GPU load on low-power devices.

## 5. Optimized Resolution Scaling
Ensure our current resolution scaling system uses crisp upscaling filters. Rendering at a fraction of the native resolution is the most powerful optimization for mobile devices, and a lightweight sharpening pass can mask the quality drop.

## 6. Simplified Blending Operations
Replace expensive smooth-minimum operations with hard CSG subtractions for marshmallow damage (holes and chunks). For effects that absolutely require smooth blending, utilize the cheapest polynomial approximations available and restrict the maximum blend radius.

## 7. Pre-computed Static Data
Because the camera never moves, per-pixel ray directions and sphere intersection coefficients remain constant. Optimize the vertex and fragment shaders to avoid recalculating these static values every frame.

## 8. Bounding Volume Proxy Geometry
Transition the rendering architecture from a full-screen quad to drawing proxy geometry (3D bounding boxes) for dynamic entities. This leverages native GPU depth culling, ensuring the fragment shader only performs raymarching for pixels directly covered by active objects.