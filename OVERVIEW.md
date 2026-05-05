# Mallow Out - Game Design Overview

**Mallow Out** is a vibrant, raymarched incremental shooting game that blends pet-care mechanics with "clicker" style progression. Players interact with a fantastical world made of marshmallow and viscous liquids, using a unique "love-based" combat system.

## 1. Core Gameplay Loop

1.  **Harvest:** Shoot the "Marsh Floor" to collect **Marsh** currency.
2.  **Summon:** Spend Marsh in the **Shop** to buy **Marshmallow Treats**.
3.  **Bond:** Equip a Treat and "fire" it onto the floor to summon a **Marshmallow Friend**.
4.  **Extract:** Shoot the Marshmallow Friend to provide "love" (healing its melting health) which yields **Pollen**.
5.  **Refine:** Pollen automatically crystallizes into **Caramel** (Prestige Currency) once thresholds are met.
6.  **Ascend:** Spend Caramel on **Permanent Upgrades** to increase efficiency, unlock automations, and scale your operations.

## 2. Key Mechanics

### SDF-Based Interaction (Dynamic Damage)
The game uses a custom **Signed Distance Field (SDF)** raymarching renderer. This allows for:
- **Procedural Holes:** Shots physically subtract volume from the marshmallow body.
- **Dynamic Repair:** The marshmallow's body "heals" over time, closing holes and smoothing out chunks.
- **Goo Internals:** Piercing a hole exposes the "internal pink goo" of the marshmallow.

### Expressive NPCs
The Marshmallow Friend isn't just a target; it's a reactive pet:
- **Facial Expressions:** Reacts to hits and low health with surprised or angry faces.
- **Gaze Tracking:** The marshmallow's pupils track the location of the player's last impact.
- **Melting State:** If health is neglected, the marshmallow "melts" back into the floor, requiring another treat to summon.

### Combo System
- Successive hits on the marshmallow or floor build a **Combo Multiplier**.
- Maintaining the combo increases resource yields significantly.
- Upgrades can extend the combo window for easier chaining.

### Automation
- **Auto-Shooters:** Players can unlock passive systems that automatically "shoot" the floor to generate Marsh currency, enabling idle progress.

## 3. Economy & Progression

### Currencies
- **Marsh (Blue):** Common currency. Used for consumables (Treats).
- **Pollen (Yellow):** Derived from interacting with the marshmallow.
- **Caramel (Orange):** Permanent progression currency.
- **Treats (Pink):** Inventory item used to summon the friend.

### Upgrade Categories
- **Player:** Reduced cooldowns, longer combo windows.
- **Marshmallow:** Higher max health, slower melting rates, increased healing efficiency.
- **Economy:** Multipliers for all currency gains.
- **Automation:** Unlocking and speeding up auto-shooters.

## 4. Technical Aesthetic
- **Wonky UI:** All UI elements use a procedural "hand-drawn" SVG path generator that wobbles and overshoots, creating a tactile, sketchbook feel.
- **Raymarching:** The entire 3D world is calculated within a single fragment shader, allowing for fluid CSG (Constructive Solid Geometry) operations that would be difficult with traditional polygon meshes.
- **Comic Styling:** Uses cel-shading, thick outlines, and high-contrast color palettes to evoke a "Saturday Morning Cartoon" vibe.