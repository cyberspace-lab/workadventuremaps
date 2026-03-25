# WorkAdventure Custom Properties Reference

All properties below go in the `properties` array of a Tiled **object** or **layer**, using this format:

```json
{ "name": "propertyName", "type": "string|bool|int|float", "value": "..." }
```

## CRITICAL: Object class must be "area"

Every interactive zone object in WorkAdventure **must** have its class set to `"area"`. In the Tiled JSON format, this appears as the `"type"` field on the object:

```json
{
  "id": 1,
  "name": "MyZone",
  "type": "area",     ← THIS IS REQUIRED
  "x": 320, "y": 192,
  "width": 192, "height": 128,
  ...
}
```

Without `"type": "area"`, WorkAdventure will ignore the object's custom properties entirely.

---

## Meeting Rooms

### Jitsi Video Conference

```json
{
  "id": 1,
  "name": "MeetingRoom1",
  "type": "area",
  "x": 320, "y": 192,
  "width": 192, "height": 128,
  "properties": [
    { "name": "jitsiRoom", "type": "string", "value": "cyberspacelab-meeting-1" },
    { "name": "jitsiWidth", "type": "int", "value": 50 },
    { "name": "silent", "type": "bool", "value": true }
  ]
}
```

Optional Jitsi properties:
- `jitsiRoomAdminTag` (string) — identifier granting admin rights in the room
- `jitsiWidth` (int) — width of the iframe in % (default: 50)
- `jitsiUrl` (string) — custom Jitsi server URL (if self-hosted)
- `jitsiConfig` (string) — JSON string of Jitsi config overrides

### Google Meet (via openTab)

Google Meet blocks iframe embedding (X-Frame-Options), so the recommended approach is to use `openTab` which opens a new browser tab:

```json
"properties": [
  { "name": "openTab", "type": "string", "value": "https://meet.google.com/abc-defg-hij" },
  { "name": "openWebsiteTrigger", "type": "string", "value": "onaction" },
  { "name": "openWebsiteTriggerMessage", "type": "string", "value": "Press [Space] to join Google Meet" },
  { "name": "silent", "type": "bool", "value": true }
]
```

> `openTab` opens a URL in a new browser tab (not an iframe panel). This is the correct approach for Google Meet since it doesn't support embedding.

### BigBlueButton (BBB)

```json
"properties": [
  { "name": "bbbMeeting", "type": "string", "value": "my-meeting-name" },
  { "name": "silent", "type": "bool", "value": true }
]
```

---

## Website / iFrame Embeds

Open a website in a side panel when a player enters or interacts with a zone:

| Property | Type | Description |
|---|---|---|
| `openWebsite` | string | URL to embed in a side panel iframe |
| `openTab` | string | URL to open in a new browser tab (use this for Google Meet, Google Docs, etc.) |
| `openWebsiteTrigger` | string | `"onaction"` (press Space) or `"onicon"` (click icon). Default (omit property) = opens on entry |
| `openWebsiteTriggerMessage` | string | Custom message shown when `onaction` (default: "Press on SPACE to open the web site") |
| `openWebsiteWidth` | int/float | Width of the sidebar panel in % (default: 50) |
| `openWebsitePolicy` | string | iframe `allow` attribute, e.g. `"fullscreen"` or `"camera; microphone"` |
| `openWebsiteClosable` | bool | Whether the user can close the panel |
| `openWebsiteAllowApi` | bool | Allow the embedded website to communicate with WA via scripting API |

**Trigger modes:**
- Omit `openWebsiteTrigger` → iframe opens automatically when player enters the zone
- `"onaction"` → player must press Space
- `"onicon"` → an icon appears; player clicks it

Example — embedded dashboard (auto-open on entry):
```json
"properties": [
  { "name": "openWebsite", "type": "string", "value": "https://your-app.com/dashboard" },
  { "name": "openWebsiteWidth", "type": "int", "value": 40 },
  { "name": "openWebsitePolicy", "type": "string", "value": "fullscreen" }
]
```

---

## Broadcast / Stage / Podium Zones

> ⚠️ **This feature is NOT configured via Tiled properties.** It is set up using WorkAdventure's built-in **inline map editor**, which you access directly inside WorkAdventure.

This feature lets one or more speakers on a "podium" zone stream their video/audio/screen to all players in an "audience" zone — like a stage presentation.

**How to set it up (in the WA inline editor):**

1. Open WorkAdventure and enter your map
2. Open the **map editor** (pencil icon or hotkey)
3. Go to **Area editor**
4. Draw an area on your map for the **stage/podium**
5. Click the **podium icon** and give it a name (e.g. `main-stage`)
6. Draw a second (larger) area for the **audience**
7. Click the **audience icon** and select `main-stage` as the linked podium
8. Save — anyone stepping on the podium now streams to the audience zone

**Optional settings:**
- Enable "See attendees" so speakers can see audience video bubbles while presenting
- Add a dedicated chat channel to either zone
- Link multiple podium zones to the same audience name for multi-speaker setups

**What you cannot generate in Tiled JSON for this feature:**
Podium/audience zones are stored in WorkAdventure's server-side area database, not in the Tiled map file. You cannot replicate this feature purely through Tiled custom properties.

---

## Image Showcase / Painting Gallery

When a player approaches an artwork or exhibit, you can:
1. Zoom the camera onto the object (`focusable`)
2. Open an image or info page in a side panel (`openWebsite`)

**Full painting zone example:**
```json
{
  "id": 5,
  "name": "Painting-Starry-Night",
  "type": "area",
  "x": 256, "y": 128,
  "width": 96, "height": 96,
  "properties": [
    { "name": "focusable", "type": "bool", "value": true },
    { "name": "zoomMargin", "type": "float", "value": 0.3 },
    { "name": "openWebsite", "type": "string", "value": "https://your-server.com/gallery/starry-night.html" },
    { "name": "openWebsiteTrigger", "type": "string", "value": "onaction" },
    { "name": "openWebsiteTriggerMessage", "type": "string", "value": "Press [Space] to view this artwork" },
    { "name": "openWebsiteWidth", "type": "int", "value": 40 }
  ]
}
```

**How `focusable` works:**
- Camera zooms in and locks onto the defined area while the player is inside it
- `zoomMargin: 0.3` means the camera shows the area + 30% margin around it
- Higher `zoomMargin` = more context visible; `0` = tight crop

**Image hosting note:**
Plain image URLs (`.jpg`, `.png`) don't embed well in iframes. Wrap the image in a minimal HTML page:
```html
<!DOCTYPE html>
<html>
<body style="margin:0;background:#000">
  <img src="./starry-night.jpg" style="max-width:100%;max-height:100vh;display:block;margin:auto">
</body>
</html>
```
Host this HTML file alongside your map files and reference it in `openWebsite`.

---

## Navigation / Exits

```json
{ "name": "exit", "type": "string", "value": "./other-map.json#start" }
```

Format: `<relative-or-absolute-url>#<spawn-layer-name>`

---

## Player Spawn Points

```json
"properties": [
  { "name": "startLayer", "type": "bool", "value": true }
]
```

Put this on a rectangle object in an objectgroup layer named `start`.

---

## Audio Zones

| Property | Type | Description |
|---|---|---|
| `silent` | bool | No proximity audio/video in this zone |
| `playAudio` | string | URL to an MP3 file to loop in this zone |
| `audioLoop` | bool | Whether the audio loops (default: true) |
| `audioVolume` | float | Max volume 0.0–1.0 |

---

## Camera / Focusable Areas

| Property | Type | Description |
|---|---|---|
| `focusable` | bool | Camera zooms in and locks onto this area when player enters |
| `zoomMargin` | float | Extra margin around the area (e.g. `0.35` = 35%). Higher = more context visible |

Object must have `"type": "area"` and be on an object layer.

---

## Layer-Level Properties

These go on a **tile layer** (not an object):

| Property | Type | Description |
|---|---|---|
| `floorLayer` | bool | Marks this as the WA floor layer (required for player movement) |
| `collides` | bool | Tiles on this layer block player movement |

---

## Quick Reference

| What you want | Property | Type | Value |
|---|---|---|---|
| Jitsi meeting room | `jitsiRoom` | string | room name |
| Google Meet (new tab) | `openTab` | string | meet URL |
| Embedded website (panel) | `openWebsite` | string | URL |
| Open on entry (default) | — | — | omit `openWebsiteTrigger` |
| Open on Space key | `openWebsiteTrigger` | string | `"onaction"` |
| Open on icon click | `openWebsiteTrigger` | string | `"onicon"` |
| Exit to map | `exit` | string | `./map.json#layer` |
| Spawn point | `startLayer` | bool | true |
| Isolate audio | `silent` | bool | true |
| Background audio | `playAudio` | string | MP3 URL |
| Camera zoom-in | `focusable` | bool | true |
| Camera zoom margin | `zoomMargin` | float | e.g. `0.3` |
| Floor marker | `floorLayer` | bool | true |
| Block movement | `collides` | bool | true |
| Stage/podium zone | — | — | **Use WA inline editor** |
