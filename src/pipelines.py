import math
import os
import requests
from chalk import DataFrame, Features, online
from itertools import combinations

from src.models import Park, State, ParkPairDriveTime

# Free API key from the National Parks Service (https://www.nps.gov/subjects/developer/get-started.htm)
NPS_API_KEY = os.environ.get("NPS_API_KEY", "YOUR_NPS_API_KEY")


@online
def get_parks() -> DataFrame[Park.id, Park.name, Park.state_id, Park.description, Park.activities, Park.lat_long]:
    """This function fetches some basics of the parks from the NPS API"""
    response = requests.get(
        f"https://developer.nps.gov/api/v1/parks?limit=500&api_key={NPS_API_KEY}",
        headers={"accept": "application/json"},
    ).json()
    parks = []
    for park in response["data"]:
        parks.append(
            Park(
                id=park["parkCode"],
                name=park["name"],
                state_id=park["states"],  # Keep as-is, e.g., "CA,NV"
                description=park["description"],
                activities=[a["name"] for a in park["activities"]],
                lat_long=park["latLong"],
            )
        )
    return DataFrame(parks)


@online
def get_single_park(park_id: Park.id) -> Features[Park.id, Park.name, Park.state_id, Park.description, Park.activities, Park.lat_long]:
    """Fetch a single park's data by ID from the NPS API"""
    response = requests.get(
        f"https://developer.nps.gov/api/v1/parks?parkCode={park_id}&api_key={NPS_API_KEY}",
        headers={"accept": "application/json"},
    ).json()

    if not response["data"]:
        return None

    park = response["data"][0]
    return Park(
        id=park["parkCode"],
        name=park["name"],
        state_id=park["states"],
        description=park["description"],
        activities=[a["name"] for a in park["activities"]],
        lat_long=park["latLong"],
    )


@online
def get_has_long_description(desc: Park.description) -> Park.has_long_description:
    """This function checks if the park has a long description"""
    return len(desc) > 100

@online
def get_park_count(parks: State.parks[Park.id]) -> State.park_count:
    """Count the number of parks in a state"""
    return len(list(parks))


@online
def get_has_water(activities: Park.activities) -> Park.has_water:
    """Check if any activity contains the word 'water'"""
    return any("water" in activity.lower() for activity in activities)


@online
def get_has_fishing(activities: Park.activities) -> Park.has_fishing:
    """Check if any activity contains the word 'fish'"""
    return any("fish" in activity.lower() for activity in activities)


def parse_lat_long(s: str) -> tuple[float, float] | None:
    """Parse 'lat:37.58, long:-85.67' format"""
    if not s:
        return None
    try:
        parts = s.split(", ")
        lat = float(parts[0].replace("lat:", ""))
        lon = float(parts[1].replace("long:", ""))
        return lat, lon
    except (ValueError, IndexError):
        return None

def calc_distance_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 3959  # Earth's radius in miles
    lat1, lat2, lon1, lon2 = map(math.radians, [lat1, lat2, lon1, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def estimate_drive_time_minutes(distance_miles: float) -> float:
    """Estimate drive time assuming average 50 mph"""
    return (distance_miles / 50) * 60


def get_parks_with_coords(parks):
    """Helper to filter parks with valid coordinates and find northernmost"""
    parks_with_coords = []
    for p in list(parks):
        coords = parse_lat_long(p.lat_long)
        if coords:
            parks_with_coords.append((p, coords))

    if not parks_with_coords:
        return [], None

    # Sort by latitude (descending) to start from northernmost
    parks_with_coords.sort(key=lambda x: x[1][0], reverse=True)
    return parks_with_coords, parks_with_coords[0][0].name


@online
def get_simple_road_trip_start_park(parks: State.parks[Park.id, Park.name, Park.lat_long]) -> State.simple_road_trip_start_park:
    """Get the starting park for the road trip (northernmost park)"""
    _, start_park_name = get_parks_with_coords(parks)
    return start_park_name or ""


@online
def get_simple_road_trip_hours(parks: State.parks[Park.id, Park.name, Park.lat_long]) -> State.simple_road_trip_hours:
    """Calculate hours to visit all parks once using simple nearest-neighbor route"""
    parks_with_coords, _ = get_parks_with_coords(parks)

    if len(parks_with_coords) < 2:
        return 0.0

    # Simple nearest-neighbor: start at northernmost park, always go to nearest unvisited
    visited = [parks_with_coords[0]]
    unvisited = parks_with_coords[1:]
    total_minutes = 0.0

    while unvisited:
        current = visited[-1]
        # Find nearest unvisited park
        nearest = None
        nearest_dist = float('inf')
        for candidate in unvisited:
            dist = calc_distance_miles(
                current[1][0], current[1][1],
                candidate[1][0], candidate[1][1]
            )
            if dist < nearest_dist:
                nearest_dist = dist
                nearest = candidate

        total_minutes += estimate_drive_time_minutes(nearest_dist)
        visited.append(nearest)
        unvisited.remove(nearest)

    return round(total_minutes / 60, 1)  # Convert to hours


@online
def get_road_trip_hours_from_here(
    park_id: Park.id,
    park_lat_long: Park.lat_long,
    state_parks: Park.state.parks[Park.id, Park.name, Park.lat_long]
) -> Park.road_trip_hours_from_here:
    """Calculate hours to visit all parks in state starting from this specific park"""
    # Get coordinates for all parks in the state
    parks_with_coords = []
    start_park = None
    start_coords = parse_lat_long(park_lat_long)

    if not start_coords:
        return 0.0

    for p in list(state_parks):
        coords = parse_lat_long(p.lat_long)
        if coords:
            if p.id == park_id:
                start_park = (p, coords)
            else:
                parks_with_coords.append((p, coords))

    if not start_park or len(parks_with_coords) < 1:
        return 0.0

    # Simple nearest-neighbor starting from this park
    visited = [start_park]
    unvisited = parks_with_coords
    total_minutes = 0.0

    while unvisited:
        current = visited[-1]
        nearest = None
        nearest_dist = float('inf')
        for candidate in unvisited:
            dist = calc_distance_miles(
                current[1][0], current[1][1],
                candidate[1][0], candidate[1][1]
            )
            if dist < nearest_dist:
                nearest_dist = dist
                nearest = candidate

        total_minutes += estimate_drive_time_minutes(nearest_dist)
        visited.append(nearest)
        unvisited.remove(nearest)

    return round(total_minutes / 60, 1)


@online
def get_park_drive_times(
    state_id: State.id,
    parks: State.parks[Park.id, Park.name, Park.lat_long]
) -> DataFrame[ParkPairDriveTime.id, ParkPairDriveTime.state_id, ParkPairDriveTime.park1_name, ParkPairDriveTime.park2_name, ParkPairDriveTime.distance_miles, ParkPairDriveTime.drive_time_minutes]:
    """Calculate drive times between all pairs of parks in a state"""
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
