# Remotion Video Build Guide: National Parks Travel Forecasting

Step-by-step instructions for building the 2-minute explainer video using Remotion. Each scene includes the component structure, assets needed, animation approach, and narration timing.

---

## Project Setup

```bash
npx create-video@latest national-parks-video
cd national-parks-video
npm install
```

**Config (`src/Root.tsx`):**
- FPS: 30
- Duration: 3600 frames (2 minutes)
- Resolution: 1920x1080
- Background: #0F172A (dark slate)

**Font:** Inter or IBM Plex Sans (clean, DevRel-friendly)

**Color palette:**
- Primary: #3B82F6 (blue -- Chalk-adjacent)
- Accent: #10B981 (green -- for highlights/results)
- Text: #F8FAFC (white)
- Muted: #94A3B8 (gray -- for secondary info)

---

## File Structure

```
src/
  compositions/
    Scene1_Hook.tsx
    Scene2_Tool.tsx
    Scene3_Data.tsx
    Scene4_Math.tsx
    Scene5_Route.tsx
    Scene6_Query.tsx
    Scene7_Close.tsx
  components/
    CaliforniaMap.tsx       -- SVG map with park pin locations
    ParkPin.tsx             -- Animated map pin component
    CodeBlock.tsx           -- Syntax-highlighted code display
    TerminalTyping.tsx      -- Character-by-character terminal effect
    AnimatedNumber.tsx      -- Number counting up animation
    RouteAnimation.tsx      -- Line drawing between park points
    NarrationSubtitle.tsx   -- Bottom-third subtitle bar
  assets/
    california-outline.svg  -- State outline path data
    chalk-logo.svg
    park-coordinates.json   -- Lat/long for CA parks (extracted from your data)
  data/
    parks.ts               -- Park names, coordinates, fishing boolean
    route-yosemite.ts      -- Ordered list of parks in nearest-neighbor order from Yosemite
    route-alcatraz.ts      -- Same from Alcatraz
  Root.tsx
```

---

## Scene-by-Scene Build Instructions

### Scene 1: The Hook (Frames 0-450, 0:00-0:15)

**File:** `Scene1_Hook.tsx`

**What's on screen:**
- California SVG outline fades in (frames 0-30)
- 28 park pins drop in one by one with a spring animation (frames 30-270)
- Text animates in: "28 parks" then "378 routes" then "? hours" (frames 270-450)

**How to build:**

```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from 'remotion';

// CaliforniaMap: render the SVG outline with opacity fading in
// Use interpolate(frame, [0, 30], [0, 1]) for the fade

// ParkPin positions: convert lat/long to x,y on your SVG viewport
// Each pin uses spring() with a staggered delay:
//   spring({ frame: frame - (index * 8), fps, config: { damping: 12 } })
// This creates a cascading drop effect across 28 pins

// AnimatedNumber: three <Sequence> blocks stacked at frames 270, 330, 390
// Each shows a number counting up from 0 to target value
// "? hours" uses a blinking cursor effect instead of a number
```

**Narration subtitle (bottom third):**
> "You sell fishing gear. You've got 28 national parks in California, and a sales rep who needs to visit every one that offers fishing. How many hours will they be on the road?"

**Assets needed:**
- `california-outline.svg` -- trace from a public domain US state SVG (e.g., Wikimedia)
- `park-coordinates.json` -- extract from your `info.json` or hardcode the 28 CA parks:

```json
[
  { "id": "yose", "name": "Yosemite", "lat": 37.8651, "lon": -119.5383, "hasFishing": true },
  { "id": "alca", "name": "Alcatraz Island", "lat": 37.8267, "lon": -122.4233, "hasFishing": false }
]
```

Map the lat/long range (roughly lat 32.5-42, lon -124 to -114) to your SVG viewport (1920x1080 with padding).

---

### Scene 2: The Tool (Frames 450-900, 0:15-0:30)

**File:** `Scene2_Tool.tsx`

**What's on screen:**
- Chalk logo fades in center screen (frames 450-510)
- Logo shrinks and moves to top-left corner (frames 510-570)
- Code block slides in from the right showing the `@features` class (frames 570-750)
- Second code block replaces first showing `@online` resolver (frames 750-900)

**How to build:**

```tsx
// Chalk logo: use interpolate for scale and position
// Scale: interpolate(frame, [450, 510, 510, 570], [0, 1, 1, 0.3])
// X position: interpolate(frame, [510, 570], [960, 100])
// Y position: interpolate(frame, [510, 570], [540, 60])

// CodeBlock component:
// - Background: #1E293B (dark card)
// - Border-radius: 12px
// - Padding: 24px
// - Font: JetBrains Mono or Fira Code, 20px
// - Use spring() for the slide-in from right
// - Syntax highlighting: color keywords manually with <span> styles
//   - decorators (@features, @online): #C084FC (purple)
//   - class/def keywords: #3B82F6 (blue)
//   - type hints: #10B981 (green)
//   - strings: #FBBF24 (yellow)

// Code to display (Scene 2a):
// @features
// class Park:
//     id: str
//     name: str
//     activities: list[str]
//     has_fishing: bool
//     lat_long: str

// Code to display (Scene 2b):
// @online
// def get_has_fishing(activities: Park.activities) -> Park.has_fishing:
//     return any("fish" in a.lower() for a in activities)
```

**Narration subtitle:**
> "I used Chalk -- a feature engineering platform -- to build a pipeline that answers this in a single query."

---

### Scene 3: The Data (Frames 900-1500, 0:30-0:50)

**File:** `Scene3_Data.tsx`

**What's on screen:**
- Left side: raw JSON blob from NPS API (frames 900-1050)
- Arrow animation pointing right (frames 1050-1110)
- Right side: clean feature table rows appearing (frames 1110-1260)
- Activity list with "Fishing" highlighting green, others graying out (frames 1260-1410)
- Boolean result row: `has_fishing: true` animates in green (frames 1410-1500)

**How to build:**

```tsx
// Left panel: JSON snippet (style as a code block, slightly transparent)
// Show a trimmed version of what the API returns:
// {
//   "parkCode": "yose",
//   "name": "Yosemite",
//   "activities": [
//     {"name": "Astronomy"},
//     {"name": "Fishing"},
//     {"name": "Hiking"}
//   ],
//   "latLong": "lat:37.86, long:-119.53"
// }

// Arrow: simple SVG arrow, use interpolate on opacity and x-position
// Or use a Remotion <spring> to have it bounce in

// Right panel: table with columns [Park, Activities, Has Fishing?]
// Rows fade in with staggered timing (each row delayed by 15 frames)

// Activity highlight effect:
// Map over activity names, each in a pill/badge shape
// At frame 1260+, "Fishing" pill transitions:
//   background: interpolate(frame, [1260, 1290], ['#334155', '#10B981'])
//   scale: spring() with a small bounce
// Other pills transition to opacity 0.3

// Boolean result: "has_fishing: true" in a green badge
// Use spring() for a pop-in effect at frame 1410
```

**Narration subtitle:**
> "The NPS API gives you park names, GPS coordinates, activity lists. I built boolean filters -- does this park have fishing? That narrows the list down to the ones that matter."

---

### Scene 4: The Math (Frames 1500-2250, 0:50-1:15)

**File:** `Scene4_Math.tsx`

**What's on screen:**
- Two park pins on the California map with a curved dashed line between them (frames 1500-1650)
- Distance label appearing on the line: "127.3 mi" (frames 1650-1710)
- Haversine formula fading in below the map (frames 1710-1860)
- Map zooms out, all 378 pair lines draw rapidly (frames 1860-2100)
- Counter in corner: "378 pairs calculated" counting up (frames 1860-2100)
- Drive time estimate: "127.3 mi / 50 mph = 2.5 hrs" (frames 2100-2250)

**How to build:**

```tsx
// Reuse CaliforniaMap from Scene 1, but now with only 2 pins initially

// Curved line between pins:
// Use an SVG <path> with a quadratic bezier curve
// Animate with strokeDashoffset:
//   const length = pathRef.current.getTotalLength();
//   strokeDasharray={length}
//   strokeDashoffset={interpolate(frame, [1500, 1650], [length, 0])}
// This creates a "drawing" effect

// Distance label: fade in at frame 1650 with interpolate on opacity
// Position it at the midpoint of the two pins

// Haversine formula display (don't make it intimidating, keep it readable):
// "d = 2R * arcsin(sqrt(sin²(Δlat/2) + cos(lat₁) * cos(lat₂) * sin²(Δlon/2)))"
// Use a slightly smaller font (16px), muted color
// Fade in with opacity interpolation

// All-pairs animation (the money shot):
// Pre-calculate all 378 line paths between park coordinate pairs
// Stagger their strokeDashoffset animations:
//   Each line starts animating at frame 1860 + (index * 0.5)
//   Duration per line: 30 frames
// This creates a rapid web of connections filling the map
// Use opacity 0.15 per line so it doesn't become a solid blob

// Counter: AnimatedNumber component counting 0 -> 378
// interpolate(frame, [1860, 2100], [0, 378], { extrapolateRight: 'clamp' })
// Round to integer with Math.floor()

// Drive time calculation: slide in from bottom as a "card"
// Show: "127.3 mi / 50 mph = 152.8 min = 2.5 hrs"
// Highlight the final "2.5 hrs" in green
```

**Narration subtitle:**
> "For every pair of parks, I calculate the distance using the Haversine formula -- great-circle distance from GPS coordinates -- then estimate drive time at 50 miles per hour. 28 parks, 378 pairs."

**Assets needed:**
- All 28 CA park coordinates in `park-coordinates.json`
- Pre-compute the 378 pairs (use `combinations` logic from your Python code to generate the pair list as a JSON/TS array)

---

### Scene 5: The Route (Frames 2250-3000, 1:15-1:40)

**File:** `Scene5_Route.tsx`

**What's on screen:**
- Split screen: Yosemite route (left), Alcatraz route (right) (frames 2250-2310)
- Left map: route draws itself park-to-park in nearest-neighbor order (frames 2310-2700)
- Right map: same animation, different route (frames 2310-2700)
- Hours counter ticking up on each side as route draws (frames 2310-2700)
- Final comparison: "36.0 hrs" (green) vs "39.3 hrs" (amber) (frames 2700-3000)
- "3.3 hrs saved" callout badge (frames 2850-3000)

**How to build:**

```tsx
// Split screen: two CaliforniaMap instances side by side
// Left has "Starting: Yosemite" label, right has "Starting: Alcatraz"
// Each map is 900px wide with a 60px divider gap

// Route data: you need the ordered park visit sequence for each start point
// Extract this from your Python code by logging the visited[] order
// Store as arrays in route-yosemite.ts and route-alcatraz.ts:
//   export const yosemiteRoute = [
//     { id: "yose", name: "Yosemite", lat: 37.86, lon: -119.53 },
//     { id: "depo", name: "Devils Postpile", lat: 37.63, lon: -119.08 },
//     // ... next nearest neighbor
//   ];

// Route drawing: same strokeDashoffset technique as Scene 4
// But sequential -- each segment starts when the previous finishes
// Calculate frames per segment: (2700 - 2310) / num_segments
// ~390 frames / 27 segments = ~14 frames per segment

// As each segment completes:
//   1. The destination pin pulses (scale spring)
//   2. The hours counter increments by that segment's drive time
//   Use AnimatedNumber with incremental targets

// Final comparison (frames 2700-3000):
// Both counters land on their final values
// Left "36.0 hrs" gets a green glow/border
// Right "39.3 hrs" gets an amber/orange color
// "3.3 hrs saved" badge springs in between them at frame 2850
//   Use spring({ damping: 10 }) for a satisfying bounce
```

**Narration subtitle:**
> "Nearest-neighbor routing: start at a park, drive to the closest unvisited one, repeat. From Yosemite -- 36 hours. From Alcatraz -- 39. That 3-hour gap is real money when you're planning annual comp."

**Data needed:**
You need to extract the actual nearest-neighbor visit order from your code. Run this locally and save the output:

```python
# Add to pipelines.py temporarily to extract route order:
parks_with_coords, _ = get_parks_with_coords(parks)
visited = [parks_with_coords[0]]
unvisited = parks_with_coords[1:]
while unvisited:
    current = visited[-1]
    nearest = min(unvisited, key=lambda c: calc_distance_miles(
        current[1][0], current[1][1], c[1][0], c[1][1]))
    visited.append(nearest)
    unvisited.remove(nearest)
for p, coords in visited:
    print(f'{{ id: "{p.id}", name: "{p.name}", lat: {coords[0]}, lon: {coords[1]} }},')
```

---

### Scene 6: The Query (Frames 3000-3300, 1:40-1:50)

**File:** `Scene6_Query.tsx`

**What's on screen:**
- Full-screen terminal window (dark background, green/white text)
- Command types out character by character
- Results appear after a brief "processing" pause

**How to build:**

```tsx
// TerminalTyping component:
// Props: { text: string, startFrame: number, charsPerFrame: number }
//
// const visibleChars = Math.floor((frame - startFrame) * charsPerFrame);
// const displayText = text.slice(0, Math.max(0, visibleChars));
// Render with a blinking cursor (toggle every 15 frames) at the end

// Terminal container:
// - Background: #0D1117 (GitHub terminal dark)
// - Top bar with three dots (red/yellow/green circles) for macOS look
// - Font: JetBrains Mono, 22px
// - Padding: 32px

// Sequence:
// Frame 3000-3060: blank terminal with blinking cursor
// Frame 3060-3150: type out "$ chalk query --in park.id=yose --out park.road_trip_hours_from_here"
//   charsPerFrame = 1 (one character per frame = 30 chars/sec, fast but readable)
// Frame 3150-3180: blinking cursor, "processing" pause
// Frame 3180-3210: result fades in:
//   "> park.name: Yosemite"
//   "> park.road_trip_hours_from_here: 36.0"
//   The "36.0" should be in #10B981 (green) and bold
// Frame 3210-3300: hold on result

// Optional: add a subtle screen glow/pulse when the result appears
// Use a box-shadow animation: 0 0 40px rgba(16, 185, 129, 0.2)
```

**Narration subtitle:**
> "All of this -- one Chalk query."

---

### Scene 7: The Close (Frames 3300-3600, 1:50-2:00)

**File:** `Scene7_Close.tsx`

**What's on screen:**
- Clean card with your info, centered
- Links appear one by one

**How to build:**

```tsx
// Background: same #0F172A dark slate
// Center card: semi-transparent background (#1E293B), rounded corners, subtle border

// Content (each line fades in with 20-frame stagger):
// Frame 3300: "Rob Kleiman" -- large, bold, white
// Frame 3340: GitHub icon + "github.com/rkrevolution" -- blue link color
// Frame 3380: Globe icon + "robkleiman.net" -- blue link color
// Frame 3420: Chalk logo + "Built with Chalk" -- muted gray, smaller

// Use interpolate on opacity [0, 1] over 15 frames for each element
// Optional: subtle particle or dot animation in background for visual interest

// Hold until frame 3600 (end of video)
```

**Narration subtitle:**
> "The code's on GitHub and I wrote up the full approach on my blog. Links below."

---

## Shared Components Reference

### `CaliforniaMap.tsx`
```tsx
// Props: { pins: ParkPin[], routes?: RouteSegment[], scale?: number }
// Renders the SVG outline + pins + optional route lines
// Viewport mapping function:
//   x = ((lon - (-124.5)) / ((-114) - (-124.5))) * width
//   y = ((42 - lat) / (42 - 32.5)) * height
// This maps CA's lat/long bounding box to pixel coordinates
```

### `CodeBlock.tsx`
```tsx
// Props: { code: string, highlightLines?: number[], startFrame: number }
// Renders syntax-colored code in a dark card
// Optional line highlight: specific lines get a subtle background glow
// Entrance animation: spring-based slide from right
```

### `TerminalTyping.tsx`
```tsx
// Props: { lines: { text: string, delay: number, color?: string }[], startFrame: number }
// Types out each line with configurable delay between lines
// Blinking cursor at current typing position
```

### `AnimatedNumber.tsx`
```tsx
// Props: { target: number, startFrame: number, duration: number, suffix?: string, color?: string }
// Counts from 0 to target over duration frames
// Uses interpolate with easing for natural feel
// Rounds to 1 decimal place for hours, integer for counts
```

### `NarrationSubtitle.tsx`
```tsx
// Props: { text: string, startFrame: number, endFrame: number }
// Bottom-third bar with semi-transparent dark background
// Text fades in at startFrame, fades out at endFrame - 15
// Max width: 80% of viewport, centered
// Font: 24px, white, with subtle text-shadow for readability
```

---

## Rendering

```bash
# Preview in browser
npm start

# Render to MP4
npx remotion render src/index.ts NationalParksVideo out/national-parks.mp4

# Render with higher quality
npx remotion render src/index.ts NationalParksVideo out/national-parks.mp4 --codec h264 --crf 18
```

---

## Audio -- Narration via Groq TTS (Orpheus)

Instead of recording narration manually, generate it programmatically using Groq's Orpheus TTS API. This keeps narration reproducible and easy to re-render when the script changes.

### Setup

```bash
npm install groq-sdk
```

Set your API key as an environment variable:
```bash
export GROQ_API_KEY="your-groq-api-key-here"
```

### Voice Selection

Groq Orpheus English voices:
| Voice | Gender | Best for |
|-------|--------|----------|
| `troy` | Male | Confident, DevRel presentation tone |
| `austin` | Male | Casual, conversational |
| `daniel` | Male | Neutral, professional |
| `hannah` | Female | Clear, friendly |
| `diana` | Female | Warm, authoritative |
| `autumn` | Female | Energetic |

**Recommended:** `troy` or `daniel` for a DevRel explainer. Pick one voice and use it for all scenes for consistency.

### Vocal Directions

Orpheus supports bracketed vocal directions to control tone. Use sparingly -- fewer directions = more natural conversational cadence, more directions = acted/expressive.

Examples:
- `[friendly] You sell fishing gear.` -- warm opener
- `[authoritatively] All of this -- one Chalk query.` -- mic drop moment
- No direction for middle scenes -- keeps it natural

### Generate Narration Script: `scripts/generate-narration.ts`

```typescript
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const scenes = [
  {
    id: "scene1_hook",
    text: `[friendly] You sell fishing gear. You've got 28 national parks in California, and a sales rep who needs to visit every one that offers fishing. How many hours will they be on the road? How do you budget for that?`,
  },
  {
    id: "scene2_tool",
    text: `This is built on Chalk -- a feature engineering platform for ML and real-time data. The idea is simple: instead of wiring together SQL, cron jobs, and caches to compute features, you define them in Python. You write a feature class -- that's your schema -- and a resolver function that computes it. Chalk handles the wiring, storage, and serving. If one resolver outputs a park's activity list and another takes it as input, Chalk chains them automatically. No glue code.`,
  },
  {
    id: "scene3_data",
    text: `The National Parks Service API gives you everything -- park names, GPS coordinates, activity lists. I pulled that into Chalk and built boolean filters: does this park have fishing? Does it have water activities? That narrows 28 parks down to the ones that actually matter for our rep.`,
  },
  {
    id: "scene4_math",
    text: `For every pair of parks, I calculate the distance using the Haversine formula -- great-circle distance from GPS coordinates -- then estimate drive time at 50 miles per hour. 28 parks, 378 pairs.`,
  },
  {
    id: "scene5_route",
    text: `Nearest-neighbor routing: start at a park, drive to the closest unvisited one, repeat. From Yosemite -- 36 hours. From Alcatraz -- 39. That 3-hour gap is real money when you're planning annual comp.`,
  },
  {
    id: "scene6_query",
    text: `[authoritatively] All of this -- one Chalk query.`,
  },
  {
    id: "scene7_close",
    text: `I built this as a take-home project to show how Chalk turns an API into real business answers. The code's on GitHub and I wrote up the full approach on my blog. Links below.`,
  },
];

async function generateNarration() {
  const outDir = path.join(__dirname, "..", "public", "narration");
  fs.mkdirSync(outDir, { recursive: true });

  for (const scene of scenes) {
    console.log(`Generating ${scene.id}...`);
    const response = await groq.audio.speech.create({
      model: "canopylabs/orpheus-v1-english",
      voice: "troy",
      input: scene.text,
      response_format: "wav",
    });

    const filePath = path.join(outDir, `${scene.id}.wav`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`  -> ${filePath}`);
  }

  console.log("Done! All narration files in public/narration/");
}

generateNarration();
```

Run it:
```bash
npx tsx scripts/generate-narration.ts
```

This outputs:
```
public/narration/
  scene1_hook.wav
  scene2_tool.wav
  scene3_data.wav
  scene4_math.wav
  scene5_route.wav
  scene6_query.wav
  scene7_close.wav
```

### Wire Audio into Remotion

In your root composition, use `<Audio>` with `<Sequence>` to align each narration clip to its scene:

```tsx
import { Audio, Sequence, staticFile } from "remotion";

// In your main composition:
<Sequence from={0} durationInFrames={450}>
  <Audio src={staticFile("narration/scene1_hook.wav")} />
</Sequence>

<Sequence from={450} durationInFrames={600}>
  <Audio src={staticFile("narration/scene2_tool.wav")} />
</Sequence>

<Sequence from={1050} durationInFrames={600}>
  <Audio src={staticFile("narration/scene3_data.wav")} />
</Sequence>

<Sequence from={1650} durationInFrames={750}>
  <Audio src={staticFile("narration/scene4_math.wav")} />
</Sequence>

<Sequence from={2400} durationInFrames={750}>
  <Audio src={staticFile("narration/scene5_route.wav")} />
</Sequence>

<Sequence from={3150} durationInFrames={300}>
  <Audio src={staticFile("narration/scene6_query.wav")} />
</Sequence>

<Sequence from={3450} durationInFrames={300}>
  <Audio src={staticFile("narration/scene7_close.wav")} />
</Sequence>

{/* Background music -- low volume, full duration */}
<Audio src={staticFile("music/bg-lofi.mp3")} volume={0.12} />
```

### Adjusting Timing

After generating the audio, you may need to adjust scene `durationInFrames` to match the actual narration length. Get the duration of each wav file:

```bash
# Check duration of each narration file (requires ffprobe)
for f in public/narration/*.wav; do
  echo "$f: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f")s"
done
```

Then update the `durationInFrames` values: `duration_seconds * 30` (at 30fps).

### Re-generating

If you tweak the script, just re-run the generation. Since it's API-based, you get consistent output and can iterate on wording without re-recording.

---

## Background Music

Use a royalty-free lo-fi or light electronic track. Keep it at ~12% volume relative to narration. Fade in at frame 0, fade out over the last 60 frames.

```tsx
import { interpolate } from "remotion";

// In a custom AudioWithFade component:
const volume = interpolate(
  frame,
  [0, 30, totalFrames - 60, totalFrames],
  [0, 0.12, 0.12, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);
```

---

## Checklist Before Rendering

- [ ] Set `GROQ_API_KEY` environment variable
- [ ] Run `npx tsx scripts/generate-narration.ts` to generate all 7 audio files
- [ ] Check audio durations with `ffprobe` and adjust scene frame counts if needed
- [ ] Extract CA park coordinates from `info.json` into `park-coordinates.json`
- [ ] Run nearest-neighbor algorithm and save Yosemite route order to `route-yosemite.ts`
- [ ] Run nearest-neighbor algorithm and save Alcatraz route order to `route-alcatraz.ts`
- [ ] Find/trace California SVG outline
- [ ] Download Chalk logo SVG
- [ ] Select background music track (royalty-free)
- [ ] Preview full video with `npm start`
- [ ] Test final render at 1080p: `npx remotion render src/index.ts NationalParksVideo out/national-parks.mp4 --codec h264 --crf 18`
