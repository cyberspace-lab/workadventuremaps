---
name: workadventure-map-builder
description: >
  Use this skill whenever the user wants to create, modify, or configure a WorkAdventure map. This includes
  building new virtual office or event spaces, adding or editing rooms and zones, setting up Google Meet
  (or Jitsi/BBB) meeting rooms, configuring interactive objects, linking maps together, or implementing
  any WorkAdventure scripting or behavioral features.

  Trigger on any mention of: WorkAdventure, WA map, Tiled map for WorkAdventure, virtual office, virtual
  meeting room, map.json, .tmx file for WA, jitsiRoom, openWebsite in a WA context, meeting zone, silent
  zone, or exit zone. Also trigger if the user describes building a virtual space, adds features to an
  existing WA map, or asks how to get Google Meet working in their WA environment.

  Always use this skill even if the user only asks a quick question about WorkAdventure — the reference
  files contain the authoritative property list and map schema you need to answer correctly.
---

# WorkAdventure Map Builder

This skill helps you create and modify WorkAdventure maps — the Tiled JSON files that define virtual spaces, meeting rooms, interactive zones, and behavioral features. Your job is to produce valid, working map files (or modifications to existing ones) and explain what you've done.

## Core Concepts

WorkAdventure maps are built with **Tiled Map Editor** and exported as **JSON** (`.json`) or **TMX** (`.tmx`) files. The map is a grid of tiles with layers on top of each other, plus object layers that define zones with special behaviors.

Key principles:
- Maps are **tile-based** (typically 32×32 px tiles)
- Layers stack visually from bottom to top
- **Object layers** hold interactive zones/triggers — this is where all WA-specific behavior lives
- WorkAdventure reads **custom properties** on objects and layers to know what to do

Read `references/map-structure.md` for the full JSON schema and layer conventions.
Read `references/wa-properties.md` for all WorkAdventure custom properties (meetings, exits, embeds, etc.).

---

## Workflow

### Step 1 — Understand the request

Before generating anything, understand:
- **Is this a new map or modifying an existing one?** If existing, ask the user to provide the JSON/TMX file or paste its contents.
- **What's the space for?** (office, event, lab, etc.) — affects layout and room count
- **What features are needed?** (meeting rooms, exits to other maps, embedded websites, silent zones, custom scripts)
- **What tileset will be used?** If none specified, default to the WorkAdventure starter kit tileset and note this assumption.

### Step 2 — Plan the layout

For new maps, define:
- Map dimensions in tiles (e.g., 40×30 for a medium office)
- Room layout: which areas are open space, which are meeting rooms, corridors, etc.
- Entry/spawn point location

For modifications, identify which layers/objects need to change.

### Step 3 — Generate the map JSON

Produce a complete, valid Tiled JSON map. See `references/map-structure.md` for the full schema.

**Always include these layers (in this order, bottom to top):**
1. `Floor` — base floor tiles (tilelayer)
2. `Walls` — wall/obstacle tiles (tilelayer)
3. `FloorLayer` — required WA marker layer (tilelayer, can be empty — tells WA where the player walks)
4. `Furniture` / decoration layers as needed (tilelayer)
5. `Above` — tiles rendered above the player, e.g. ceiling elements (tilelayer)
6. `objects` — interactive zones and triggers (objectgroup) ← **WA behaviors go here**
7. `start` — spawn point(s) for players entering the map (objectgroup, objects with `startLayer: true`)

> The `floorLayer` (or a layer with the WA property `floorLayer: true`) is essential — WorkAdventure uses it to determine where players can walk. Without it, the map may not work correctly.

### Step 4 — Configure interactive zones

**Meeting rooms (Google Meet):** Use `openTab` (not `openWebsite`) pointing to the Meet URL. Google Meet blocks iframe embedding, so `openTab` opens it in a new browser tab — this is the reliable approach.

**Jitsi rooms:** Use `jitsiRoom` with a room name string.

**Image showcase / gallery:** Combine `focusable: true` (camera zooms in) with `openWebsite` pointing to an HTML page displaying the image, triggered via `openWebsiteTrigger: "onaction"`.

**Broadcast / stage / podium:** This feature is NOT set up via Tiled — it requires WorkAdventure's inline map editor (accessed from inside WA). See `references/wa-properties.md` → "Broadcast / Stage / Podium Zones" for the step-by-step.

For each zone in Tiled:
1. Draw a rectangle object in the `objects` layer covering the zone area
2. **Set `"type": "area"` on the object** — this is required or WA ignores the properties
3. Set the appropriate custom properties
4. Add `silent: true` to meeting rooms to isolate audio

### Step 5 — Output

- Save the complete map as a `.json` file in the outputs folder
- If modifying an existing map, produce a complete updated version (not a diff)
- Briefly explain what was created/changed and any assumptions made (especially around tilesets)
- Note any manual steps the user needs to do in Tiled (e.g., importing tilesets, painting specific tiles)

---

## Tileset Handling

You can generate the JSON structure of a map, but **tile graphics must already exist as image files**. When creating maps:

- If the user has their own tileset, ask for its filename and tile count so you can reference it correctly
- If no tileset is specified, use the **WorkAdventure Starter Kit** tileset as a placeholder reference:
  - Filename: `tileset1.png` (or as named in the starter kit)
  - Tile width/height: 32×32
  - Note clearly that the user must import the actual tileset image in Tiled

For maps that need only zones/behavior (no visual tile painting), you can produce an empty tile layer structure with just the object layer fully configured — the user can paint tiles in Tiled afterward.

---

## Common Patterns

### Image showcase / painting gallery
Combine `focusable: true` (camera zooms in on approach) with `openWebsite` pointing to an HTML wrapper page displaying the image. Use `openWebsiteTrigger: "onaction"` so it doesn't auto-open. See `references/wa-properties.md` → "Image Showcase / Painting Gallery".

### Stage / broadcast to audience
Done entirely in WorkAdventure's inline editor — NOT in Tiled. Guide the user to the inline editor. See `references/wa-properties.md` → "Broadcast / Stage / Podium Zones".

### Google Meet meeting room
Use `openTab` with the Meet URL + `openWebsiteTrigger: "onaction"` + `silent: true`. Google Meet blocks iframes, so `openTab` (new browser tab) is the correct approach. See `references/wa-properties.md` → "Google Meet".

### Multi-room office
Create separate named zones for each meeting room, each with their own `openWebsite` or `jitsiRoom` property. Use `silent` on each so conversations stay private.

### Map exit
Link to another WA map using the `exit` property on a zone object. The value is the URL or relative path to the next map's JSON file.

### Spawn point
Add a rectangle object to the `start` layer with property `startLayer: true`. Players entering the map spawn inside this zone.

---

## What You Cannot Do Automatically

- **Paint tiles visually** — the JSON can define which tile IDs go where, but if you don't know the user's tileset layout, you can't paint meaningful floor/wall patterns. In that case, leave tilelayers with empty data arrays and tell the user to paint tiles in Tiled.
- **Upload or host the map** — the user needs to host the map files on their WorkAdventure server or use WorkAdventure SaaS.
- **Generate tileset images** — only reference them by filename.

---

## Quality Checks (do these before outputting)

- [ ] All required layers present (`FloorLayer`, `objects`, at least one `start` zone)
- [ ] `nextobjectid` is higher than any object ID in the file
- [ ] `nextlayerid` is higher than any layer ID in the file
- [ ] All object rectangles have valid `x`, `y`, `width`, `height` values in pixels (not tiles)
- [ ] Meeting room zones have complete property sets (not just one missing property)
- [ ] Tileset `firstgid` values are sequential and non-overlapping
- [ ] Map JSON is valid (no trailing commas, no missing brackets)
