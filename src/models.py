from chalk import DataFrame
from chalk.features import features


@features
class State:
    id: str
    parks: "DataFrame[Park]"
    park_drive_times: "DataFrame[ParkPairDriveTime]"
    park_count: int
    simple_road_trip_hours: float  # Hours to visit all parks once (nearest-neighbor route)
    simple_road_trip_start_park: str  # Name of the starting park (northernmost)

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
    road_trip_hours_from_here: float  # Hours to visit all parks in state starting from this park


@features
class ParkPairDriveTime:
    id: str  # "park1_id:park2_id"
    state_id: State.id
    state: State
    park1_name: str
    park2_name: str
    distance_miles: float
    drive_time_minutes: float
