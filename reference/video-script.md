# Video Script: National Parks Travel Forecasting with Chalk

**Format:** ~2 min Remotion video | DevRel portfolio piece
**Tone:** Conversational, technically credible, show-don't-tell

---

## Scene 1: The Hook (0:00 - 0:15)

**On screen:** Map of California with national park pins dropping in

**Narration:**
"You sell fishing gear. You've got 28 national parks in California, and a sales rep who needs to visit every one that offers fishing. How many hours will they be on the road? How do you budget for that?"

**Visual cue:** Numbers animating in -- "28 parks", "378 possible routes", "? hours"

---

## Scene 2: The Tool (0:15 - 0:35)

**On screen:** Chalk logo, then a two-panel explainer graphic

**Narration:**
"This is built on Chalk -- a feature engineering platform for ML and real-time data. The idea is simple: instead of wiring together SQL, cron jobs, and caches to compute features, you define them in Python. You write a feature class -- that's your schema -- and a resolver function that computes it. Chalk handles the wiring, storage, and serving. If one resolver outputs a park's activity list and another takes it as input, Chalk chains them automatically. No glue code."

**Visual cue:**
- Chalk logo fades in (2 sec)
- Left panel: `@features` decorator on `Park` class with attributes appearing line by line
- Right panel: `@online` decorator on `get_has_fishing` resolver
- Animated arrow connecting `Park.activities` on the left to `activities: Park.activities` on the right, showing the automatic wiring

---

## Scene 3: The Data (0:35 - 0:55)

**On screen:** NPS API response JSON morphing into clean feature rows

**Narration:**
"The National Parks Service API gives you everything -- park names, GPS coordinates, activity lists. I pulled that into Chalk and built boolean filters: does this park have fishing? Does it have water activities? That narrows 28 parks down to the ones that actually matter for our rep."

**Visual cue:** Activity list with "Fishing" and "Kayaking" highlighting green, others graying out. Then a query result showing `state.parks.has_fishing` with the boolean array.

---

## Scene 4: The Math (0:55 - 1:20)

**On screen:** Two park pins on a map with a curved line between them, distance label appearing

**Narration:**
"For every pair of parks in a state, I calculate the distance using the Haversine formula -- that's great-circle distance from GPS coordinates -- then estimate drive time at 50 miles per hour. California's 28 parks give you 378 unique pairs, each with a distance and time."

**Visual cue:** Animated Haversine formula, then a matrix/grid filling in with pairwise distances. Speed it up so it feels like computation happening.

---

## Scene 5: The Route (1:20 - 1:45)

**On screen:** Map of California with a route drawing itself park-to-park, nearest-neighbor style

**Narration:**
"Now the real question: what's the optimal route? I used a nearest-neighbor algorithm -- start at the northernmost park, drive to the closest unvisited one, repeat. Starting from Yosemite? 36 hours on the road. Starting from Alcatraz? 39. That 3-hour difference is real money when you're planning annual comp and mileage."

**Visual cue:** Split comparison -- Yosemite route on the left (36.0 hrs), Alcatraz route on the right (39.3 hrs). The Yosemite number pulses green.

---

## Scene 6: The Query (1:45 - 1:55)

**On screen:** Terminal with chalk query command typing out, results appearing

**Narration:**
"And all of this is one Chalk query."

**Visual cue:**
```
$ chalk query --in park.id=yose --out park.road_trip_hours_from_here
> 36.0
```
Results animate in cleanly. Keep it snappy.

---

## Scene 7: The Close (1:55 - 2:05)

**On screen:** Your name, GitHub link, blog post link

**Narration:**
"I built this as a take-home project to show how Chalk turns an API into real business answers. The code's on GitHub, and I wrote up the full approach on my blog. Links below."

**Visual cue:**
- Rob Kleiman
- github.com/rkrevolution/feature-engineering-devrel-chalkai-example
- robkleiman.net/writing/chalk-interview-examples-12172025

---

## Production Notes

**Total runtime:** ~2:05

**Music:** Lo-fi or light electronic instrumental, low in the mix. Builds slightly during Scene 5 (the route animation).

**Pacing:** Scenes 1-3 set context quickly. Scene 4-5 are the payoff -- spend the most visual energy here. Scene 6 is the mic-drop moment (one query). Scene 7 is fast.

**Remotion tips:**
- Use `<Sequence>` components for each scene with `durationInFrames` at 30fps
- Map animation in Scenes 1, 4, 5 could use a simple SVG of California with animated dots/lines via `interpolate()` and `spring()`
- Terminal typing effect in Scene 6: character-by-character reveal with `useCurrentFrame()`
- Keep text overlays minimal -- let the narration carry the explanation, visuals carry the proof
