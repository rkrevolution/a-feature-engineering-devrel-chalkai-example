# Go Fish: Using Chalk to Calculate Sales Rep Travel Time Across National Parks

## What is Chalk?

[Chalk](https://docs.chalk.ai) is a feature engineering platform designed for machine learning and real-time data applications. Instead of stitching together SQL queries, cron jobs, and caching layers to compute features, Chalk lets you define them declaratively with Python and handles the rest -- storage, serving, dependency resolution, and low-latency queries.

The core workflow has two parts:

- **Features** (`@features`): Python classes that define what you want to compute -- like a schema for your ML feature store. Each attribute (e.g., `has_fishing: bool`) is a feature that Chalk tracks, versions, and serves.
- **Resolvers** (`@online`): Functions that compute features. Chalk automatically wires them together based on their input/output types. If resolver A outputs `Park.activities` and resolver B takes `Park.activities` as input, Chalk chains them without you writing glue code.

This means you spend your time defining *what* you want to know about your data, and Chalk figures out *how* to compute and serve it. Companies use it for fraud detection, identity verification, pricing, and other latency-sensitive ML applications.

---

## The Prompt

I was given a take-home project built around Chalk and the **National Parks Service API**. The scenario: a company sells fishing gear and sends traveling sales reps to national parks. Management needs to forecast how many hours each rep will spend driving between parks in their assigned state so they can estimate mileage reimbursement, billable time, and travel expenses.

The starting point was a bare-bones Chalk project with a basic `Park` model and a single resolver that fetched park names from the NPS API. My job was to extend it into something that could actually answer the question: *"How long will our California sales rep be on the road this year?"*

---

## My Approach

I broke the problem into four phases:

1. **Enrich the park data** -- pull activities and GPS coordinates from the API
2. **Filter for relevance** -- identify which parks have fishing or water activities
3. **Calculate distances** -- compute pairwise drive times between all parks in a state
4. **Optimize the route** -- estimate total road trip hours using a nearest-neighbor algorithm

Each phase built on the last. Chalk's declarative feature/resolver pattern made this natural -- define the feature you want, then write a resolver that computes it.

---

## Phase 1: Enriching the Data Model

The NPS API returns a rich payload per park, but the starter project only captured `id`, `name`, `state_id`, and `description`. I needed two more fields to make the analysis work:

- **`activities`** -- a list of activity names (returned as JSON objects from the API)
- **`lat_long`** -- GPS coordinates as a string like `"lat:37.58, long:-85.67"`

### models.py -- Feature Definitions

I defined three feature classes in Chalk:

```python
@features
class State:
    id: str
    parks: "DataFrame[Park]"
    park_drive_times: "DataFrame[ParkPairDriveTime]"
    park_count: int
    simple_road_trip_hours: float
    simple_road_trip_start_park: str

@features
class Park:
    id: str
    description: str
    has_long_description: bool
    name: str
    state_id: State.id
    state: State
    activities: list[str]
    has_water: bool
    has_fishing: bool
    lat_long: str
    road_trip_hours_from_here: float

@features
class ParkPairDriveTime:
    id: str  # "park1_id:park2_id"
    state_id: State.id
    state: State
    park1_name: str
    park2_name: str
    distance_miles: float
    drive_time_minutes: float
```

The key design decisions:
- **`State` holds aggregated DataFrames** of parks and drive times, so you can query everything at the state level
- **`ParkPairDriveTime`** uses a composite ID (`"yose:alca"`) to represent each unique pair
- **`Park.road_trip_hours_from_here`** lets you ask "how long if I start from *this* park?" -- useful when a rep is based near a specific location

### pipelines.py -- Fetching Park Data

The main resolver pulls all 500 parks from the NPS API in a single call:

```python
@online
def get_parks() -> DataFrame[Park.id, Park.name, Park.state_id,
                              Park.description, Park.activities, Park.lat_long]:
    response = requests.get(
        "https://developer.nps.gov/api/v1/parks?limit=500&api_key=...",
        headers={"accept": "application/json"},
    ).json()
    parks = []
    for park in response["data"]:
        parks.append(Park(
            id=park["parkCode"],
            name=park["name"],
            state_id=park["states"],
            description=park["description"],
            activities=[a["name"] for a in park["activities"]],
            lat_long=park["latLong"],
        ))
    return DataFrame(parks)
```

One thing to note: `activities` comes back from the API as a list of objects (`[{"id": "...", "name": "Fishing"}, ...]`), so I used a list comprehension to extract just the names: `[a["name"] for a in park["activities"]]`.

---

## Phase 2: Filtering for Fishing and Water Activities

With activities stored as a `list[str]`, filtering is straightforward. Two boolean resolvers scan the list for keywords:

```python
@online
def get_has_fishing(activities: Park.activities) -> Park.has_fishing:
    return any("fish" in activity.lower() for activity in activities)

@online
def get_has_water(activities: Park.activities) -> Park.has_water:
    return any("water" in activity.lower() for activity in activities)
```

I used substring matching (`"fish" in activity.lower()`) rather than exact matching so it catches "Fishing", "Freshwater Fishing", "Fly Fishing", etc.

### Verifying in Chalk

```
chalk query --branch parks --in state.id=CA --out state.park_count --out state.parks.has_fishing
```

Result: **28 parks** in California, with a boolean array showing which ones have fishing. This confirmed the pipeline was working end-to-end.

---

## Phase 3: Calculating Pairwise Drive Times

This is where the math comes in. To estimate drive times between every pair of parks in a state, I needed:

1. **A coordinate parser** -- the API returns lat/long as a string that needs splitting
2. **The Haversine formula** -- to calculate great-circle distance from GPS coordinates
3. **A speed assumption** -- I used 50 mph average to convert miles to minutes

### Parsing Coordinates

```python
def parse_lat_long(s: str) -> tuple[float, float] | None:
    if not s:
        return None
    try:
        parts = s.split(", ")
        lat = float(parts[0].replace("lat:", ""))
        lon = float(parts[1].replace("long:", ""))
        return lat, lon
    except (ValueError, IndexError):
        return None
```

### Haversine Distance

```python
def calc_distance_miles(lat1, lon1, lat2, lon2) -> float:
    R = 3959  # Earth's radius in miles
    lat1, lat2, lon1, lon2 = map(math.radians, [lat1, lat2, lon1, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c
```

### Pairwise Drive Times

The resolver uses `itertools.combinations` to generate every unique pair of parks, then computes distance and estimated drive time for each:

```python
@online
def get_park_drive_times(
    state_id: State.id,
    parks: State.parks[Park.id, Park.name, Park.lat_long]
) -> DataFrame[ParkPairDriveTime.id, ParkPairDriveTime.state_id,
               ParkPairDriveTime.park1_name, ParkPairDriveTime.park2_name,
               ParkPairDriveTime.distance_miles, ParkPairDriveTime.drive_time_minutes]:
    park_list = list(parks)
    drive_times = []
    for park1, park2 in combinations(park_list, 2):
        coords1 = parse_lat_long(park1.lat_long)
        coords2 = parse_lat_long(park2.lat_long)
        if coords1 and coords2:
            distance = calc_distance_miles(coords1[0], coords1[1], coords2[0], coords2[1])
            drive_time = estimate_drive_time_minutes(distance)
            drive_times.append(ParkPairDriveTime(
                id=f"{park1.id}:{park2.id}",
                state_id=state_id,
                park1_name=park1.name,
                park2_name=park2.name,
                distance_miles=round(distance, 1),
                drive_time_minutes=round(drive_time, 1),
            ))
    return DataFrame(drive_times)
```

For California's 28 parks, this produces **378 pairs** (28 choose 2) -- each with a distance and time estimate.

---

## Phase 4: Optimizing the Road Trip

Pairwise distances are useful, but the real question is: *What's the total drive time if a rep visits every park?* This is essentially the Traveling Salesman Problem. I used a **nearest-neighbor heuristic** -- not optimal, but practical and fast:

1. Start at the northernmost park in the state
2. Drive to the nearest unvisited park
3. Repeat until all parks are visited

```python
@online
def get_simple_road_trip_hours(
    parks: State.parks[Park.id, Park.name, Park.lat_long]
) -> State.simple_road_trip_hours:
    parks_with_coords, _ = get_parks_with_coords(parks)
    if len(parks_with_coords) < 2:
        return 0.0

    visited = [parks_with_coords[0]]
    unvisited = parks_with_coords[1:]
    total_minutes = 0.0

    while unvisited:
        current = visited[-1]
        nearest = min(unvisited, key=lambda c: calc_distance_miles(
            current[1][0], current[1][1], c[1][0], c[1][1]))
        nearest_dist = calc_distance_miles(
            current[1][0], current[1][1], nearest[1][0], nearest[1][1])
        total_minutes += estimate_drive_time_minutes(nearest_dist)
        visited.append(nearest)
        unvisited.remove(nearest)

    return round(total_minutes / 60, 1)
```

I also built a per-park version (`get_road_trip_hours_from_here`) so you can compare starting points. This turned out to be the most interesting output.

---

## Results

Querying Chalk for California:

| Starting Park | Total Road Trip Hours |
|---|---|
| Alcatraz Island | **39.3 hours** |
| Yosemite | **36.0 hours** |

```
chalk query --branch parks --in park.id=alca --out park.name --out park.road_trip_hours_from_here
> park.name: "Alcatraz Island"
> park.road_trip_hours_from_here: 39.3

chalk query --branch parks --in park.id=yose --out park.name --out park.road_trip_hours_from_here
> park.name: "Yosemite"
> park.road_trip_hours_from_here: 36.0
```

Starting from Yosemite saves ~3 hours compared to Alcatraz -- it's more centrally located relative to California's other parks. This is exactly the kind of insight a sales manager needs: where to base a rep, how many days to budget for travel, and what the mileage reimbursement will look like.

---

## What I'd Improve

- **Road distance vs. straight-line** -- Haversine gives as-the-crow-flies distance. A real implementation would use a routing API (Google Directions, OSRM) for actual road miles.
- **Filter the route to fishing parks only** -- right now the road trip hits all parks in a state. A production version would let you filter to only parks where `has_fishing=True`.
- **Multi-state routes** -- some reps cover regions, not just single states. The model could be extended with a `Region` feature.
- **Caching** -- the NPS API call happens on every query. Chalk's offline resolvers and caching would be the natural next step.

---

## Tech Stack

- **Chalk** -- feature definitions (`@features`) and resolver pipelines (`@online`)
- **Python 3.12** -- runtime
- **National Parks Service API** -- data source
- **Haversine formula** -- geospatial distance calculation
- **Nearest-neighbor heuristic** -- route optimization

---

## Takeaway

Chalk made it straightforward to go from "here's an API" to "here's a queryable feature store with computed travel analytics." The declarative model -- define a feature, write a resolver -- kept the code organized even as the complexity grew from simple attribute lookups to pairwise distance matrices to route optimization. The branch deployment workflow (`chalk apply --branch`) made it easy to iterate without breaking anything.

Let's go fish for some prospects.
