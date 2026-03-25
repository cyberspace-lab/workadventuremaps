# WorkAdventure Map JSON Structure

## Top-Level Map Object

```json
{
  "type": "map",
  "version": "1.6",
  "tiledversion": "1.9.2",
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "width": 40,
  "height": 30,
  "tilewidth": 32,
  "tileheight": 32,
  "infinite": false,
  "nextlayerid": 10,
  "nextobjectid": 50,
  "tilesets": [...],
  "layers": [...]
}
```

**Important fields:**
- `width`/`height` — dimensions in tiles
- `tilewidth`/`tileheight` — almost always 32 for WorkAdventure maps
- `nextlayerid` — must be > highest layer id in the file
- `nextobjectid` — must be > highest object id in the file
- `infinite: false` — required for WA (no chunk-based maps)

---

## Tilesets

Each tileset entry in the `tilesets` array:

```json
{
  "firstgid": 1,
  "source": "tileset1.tsx"
}
```

Or inline (when embedding tileset data directly):

```json
{
  "firstgid": 1,
  "name": "tileset1",
  "tilewidth": 32,
  "tileheight": 32,
  "spacing": 0,
  "margin": 0,
  "columns": 8,
  "tilecount": 64,
  "image": "../tilesets/tileset1.png",
  "imagewidth": 256,
  "imageheight": 256
}
```

**firstgid rules:**
- First tileset always starts at `firstgid: 1`
- Each subsequent tileset starts at `firstgid = previous firstgid + previous tilecount`
- Global tile ID 0 = empty tile (no tile)

---

## Layer Types

### Tile Layer (`tilelayer`)

```json
{
  "id": 1,
  "name": "Floor",
  "type": "tilelayer",
  "visible": true,
  "opacity": 1,
  "x": 0,
  "y": 0,
  "width": 40,
  "height": 30,
  "data": [0, 1, 2, 1, 0, ...]
}
```

- `data` is a flat array of global tile IDs, row by row, left to right
- Length = `width * height`
- `0` = empty (no tile drawn)
- Can include `properties` array for WA custom properties

### Object Layer (`objectgroup`)

```json
{
  "id": 5,
  "name": "objects",
  "type": "objectgroup",
  "visible": true,
  "opacity": 1,
  "x": 0,
  "y": 0,
  "objects": [...]
}
```

### Object (within an objectgroup)

```json
{
  "id": 1,
  "name": "MeetingRoom1",
  "type": "area",
  "x": 320,
  "y": 192,
  "width": 192,
  "height": 128,
  "visible": true,
  "rotation": 0,
  "properties": [
    { "name": "openTab", "type": "string", "value": "https://meet.google.com/abc-defg-hij" },
    { "name": "openWebsiteTrigger", "type": "string", "value": "onaction" },
    { "name": "silent", "type": "bool", "value": true }
  ]
}
```

> **CRITICAL:** Every interactive zone object **must** have `"type": "area"`. Without this, WorkAdventure ignores all custom properties on the object.

**Coordinates are in pixels, not tiles.** Multiply tile position by tilewidth/tileheight.
Example: tile position (10, 6) → pixel position (320, 192) for 32px tiles.

---

## Standard Layer Stack (recommended order, bottom to top)

| Order | Layer Name   | Type        | Purpose |
|-------|-------------|-------------|---------|
| 1     | Floor        | tilelayer   | Base floor, ground |
| 2     | Walls        | tilelayer   | Walls, obstacles |
| 3     | FloorLayer   | tilelayer   | WA floor marker — players walk here |
| 4     | Furniture    | tilelayer   | Tables, chairs, decor |
| 5     | Above        | tilelayer   | Above-player elements (ceilings, signs) |
| 6     | objects      | objectgroup | WA interactive zones |
| 7     | start        | objectgroup | Player spawn points |

### The `FloorLayer` layer

WorkAdventure requires a tile layer named `floorLayer` (case-insensitive, but conventionally `FloorLayer`).
Alternatively, set the custom property `floorLayer: true` (bool) on any tile layer.
This layer defines where players can physically walk. It does NOT need to have tiles painted — it can be empty — but it must exist.

### The `Above` layer

Any tile layer with the WA property `zIndex: above` (or named `Above`) renders on top of the player sprite. Use for ceiling tiles, overhanging signs, etc.

---

## Minimal Working Map Template

```json
{
  "type": "map",
  "version": "1.6",
  "tiledversion": "1.9.2",
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "width": 20,
  "height": 15,
  "tilewidth": 32,
  "tileheight": 32,
  "infinite": false,
  "nextlayerid": 8,
  "nextobjectid": 10,
  "tilesets": [
    {
      "firstgid": 1,
      "name": "tileset1",
      "tilewidth": 32,
      "tileheight": 32,
      "spacing": 0,
      "margin": 0,
      "columns": 8,
      "tilecount": 64,
      "image": "../tilesets/tileset1.png",
      "imagewidth": 256,
      "imageheight": 256
    }
  ],
  "layers": [
    {
      "id": 1, "name": "Floor", "type": "tilelayer",
      "visible": true, "opacity": 1, "x": 0, "y": 0,
      "width": 20, "height": 15,
      "data": []
    },
    {
      "id": 2, "name": "Walls", "type": "tilelayer",
      "visible": true, "opacity": 1, "x": 0, "y": 0,
      "width": 20, "height": 15,
      "data": []
    },
    {
      "id": 3, "name": "FloorLayer", "type": "tilelayer",
      "visible": true, "opacity": 1, "x": 0, "y": 0,
      "width": 20, "height": 15,
      "data": [],
      "properties": [
        { "name": "floorLayer", "type": "bool", "value": true }
      ]
    },
    {
      "id": 4, "name": "Furniture", "type": "tilelayer",
      "visible": true, "opacity": 1, "x": 0, "y": 0,
      "width": 20, "height": 15,
      "data": []
    },
    {
      "id": 5, "name": "Above", "type": "tilelayer",
      "visible": true, "opacity": 1, "x": 0, "y": 0,
      "width": 20, "height": 15,
      "data": []
    },
    {
      "id": 6, "name": "objects", "type": "objectgroup",
      "visible": true, "opacity": 1, "x": 0, "y": 0,
      "objects": []
    },
    {
      "id": 7, "name": "start", "type": "objectgroup",
      "visible": true, "opacity": 1, "x": 0, "y": 0,
      "objects": [
        {
          "id": 1,
          "name": "spawn",
          "type": "area",
          "x": 288, "y": 224,
          "width": 64, "height": 64,
          "visible": true, "rotation": 0,
          "properties": [
            { "name": "startLayer", "type": "bool", "value": true }
          ]
        }
      ]
    }
  ]
}
```
