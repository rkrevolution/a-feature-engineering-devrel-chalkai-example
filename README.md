# National Parks Travel Forecasting with Chalk

A take-home project for a [Developer Relations role at Chalk](https://docs.chalk.ai). Given a starter Chalk project and access to the National Parks Service API, I built a feature pipeline that answers: **How many hours will a sales rep spend driving between national parks in their state?**

The use case: a company selling fishing gear sends reps to national parks. Management needs to forecast travel time per state to estimate mileage reimbursement, billable hours, and trip expenses.

## What is Chalk?

[Chalk](https://docs.chalk.ai) is a feature engineering platform for machine learning and real-time data applications. It replaces the usual tangle of SQL queries, cron jobs, and caching with a declarative Python workflow:

- **Features** (`@features`) -- Python classes that define what you want to compute. Each attribute is a feature that Chalk tracks, versions, and serves.
- **Resolvers** (`@online`) -- Functions that compute features. Chalk automatically chains them based on input/output types -- if one resolver outputs `Park.activities` and another takes it as input, they're wired together without glue code.

You define *what* you want to know about your data, and Chalk handles *how* to compute and serve it at low latency. It's used in production for fraud detection, identity verification, pricing, and other ML applications. [Learn more](https://docs.chalk.ai/docs/what-is-chalk).

**Companion blog post:** [Go Fish? How to Look at Parks Data and Determine Sales Reps Hours on the Road](https://robkleiman.net/writing/chalk-interview-examples-12172025)

---

## The Prompt

The starter project had a basic `Park` model and a single resolver that fetched park names from the [NPS API](https://www.nps.gov/subjects/developer/api-documentation.htm). I was asked to extend it into something that could support real business decisions around sales territory planning.

## My Approach

I broke the problem into four steps, each building on the last:

### 1. Enrich the data

The NPS API returns activities and GPS coordinates per park, but the starter only captured names and descriptions. I added `activities: list[str]` and `lat_long: str` to the `Park` model to pull these through.

### 2. Filter for relevance

Two boolean resolvers scan each park's activity list for keywords:
- `has_fishing` -- matches "Fishing", "Freshwater Fishing", "Fly Fishing", etc.
- `has_water` -- matches any water-related activity

This lets you answer "which parks in California have fishing?" with a single Chalk query.

### 3. Calculate pairwise distances

For every pair of parks within a state, I compute straight-line distance using the **Haversine formula** (great-circle distance from GPS coordinates) and estimate drive time at 50 mph. For California's 28 parks, this produces 378 unique pairs with distance and time estimates.

The results are stored as `ParkPairDriveTime` features -- each identified by a composite key like `"yose:alca"`.

### 4. Optimize the route

To answer "how long is the full road trip?", I implemented a **nearest-neighbor heuristic**:
1. Start at the northernmost park in the state
2. Drive to the nearest unvisited park
3. Repeat until all parks are visited

I also built a per-park variant (`road_trip_hours_from_here`) so you can compare starting points and determine where to base a rep.

## Results

Querying California parks:

```
chalk query --branch parks --in park.id=yose --out park.name --out park.road_trip_hours_from_here
> park.name: "Yosemite"
> park.road_trip_hours_from_here: 36.0

chalk query --branch parks --in park.id=alca --out park.name --out park.road_trip_hours_from_here
> park.name: "Alcatraz Island"
> park.road_trip_hours_from_here: 39.3
```

Starting from Yosemite saves ~3 hours vs. Alcatraz -- it's more centrally located. This is the kind of insight a sales manager needs to plan territories and budget travel.

## Project Structure

```
src/
  models.py      -- Feature definitions (State, Park, ParkPairDriveTime)
  pipelines.py   -- Resolvers: API fetch, activity filters, Haversine distance,
                     nearest-neighbor routing
tests/
  test_get_parks.py -- Basic resolver test
chalk.yaml         -- Chalk project config (Python 3.12)
```

### Key design decisions

- **`State` holds DataFrames** of parks and drive times, so everything is queryable at the state level
- **`ParkPairDriveTime`** uses composite IDs (`"yose:alca"`) for unique pair lookups
- **Helper functions** (`parse_lat_long`, `calc_distance_miles`, `estimate_drive_time_minutes`) are separated from `@online` resolvers for testability
- **Nearest-neighbor over brute-force TSP** -- practical, fast, and good enough for planning estimates

## What I'd improve

- **Real road distances** -- Haversine gives straight-line. A routing API (Google Directions, OSRM) would give actual road miles.
- **Filter routes to fishing-only parks** -- currently the trip hits all parks in a state. A production version would filter to `has_fishing=True` parks.
- **Multi-state regions** -- some reps cover multiple states. An additional `Region` feature would handle this.
- **Caching with offline resolvers** -- the NPS API is called on every query. Chalk's offline resolvers would be the natural next step.

## Running it

```bash
# Install Chalk CLI
curl -s -L https://api.chalk.ai/install.sh | sh

# Login
chalk login

# Deploy to a branch
git checkout -b parks
chalk apply --branch

# Query road trip hours from Yosemite
chalk query --branch parks --in park.id=yose --out park.name --out park.road_trip_hours_from_here

# Query all fishing parks in California
chalk query --branch parks --in state.id=CA --out state.park_count --out state.parks.has_fishing
```

## Tech stack

- **[Chalk](https://docs.chalk.ai)** -- feature definitions (`@features`) and resolver pipelines (`@online`)
- **Python 3.12**
- **[National Parks Service API](https://www.nps.gov/subjects/developer/api-documentation.htm)** -- data source
- **Haversine formula** -- geospatial distance
- **Nearest-neighbor heuristic** -- route optimization
