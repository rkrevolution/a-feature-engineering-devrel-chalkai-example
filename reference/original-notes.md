You want to help customers sell fishing gear - you need to send traveling sales reps out to the right places. How to forecast their mileage this year in driving to the parks in questions 
within their regions.

## Starting with your new Model.py definitions 

First you need to get the activities for each park:
In model.py update it to 
```
`@features`
`class Park:`
    `id: str`
    `description: str`
    `has_long_description: bool`
    `name: str`
    `state_id: State.id`
    `state: State`
    `activities: list[str]`
    `has_water: bool`
    `has_fishing: bool`
    `lat_long: str`
```

Note: The parks API returns this as a list so in your @features add activities: list[str] which you'll then parse later in the pipelines file - just mind the type for now.  Since for each state we'll want to get the number of parks and then aggregation of drive times between each park update the model to include that as well

```
`@features`
`class State:`
    `id: str`
    `parks: "DataFrame[Park]"`
    `park_drive_times: "DataFrame[ParkPairDriveTime]"`
    `park_count: int`

```

To make the drive times visible for each pair of parks within any given state update the "ParkPairDriveTime" for the upcoming mathematical calculations that help us get distance.

```
`@features`
`class ParkPairDriveTime:`
    `id: str  # "park1_id:park2_id"`
    `state_id: State.id`
    `state: State`
    `park1_name: str`
    `park2_name: str`
    `distance_miles: float`
    `drive_time_minutes: float`
```

## Updating your Pipelines.py file

Moving on to pipelines.py file: 

To ensure the pipeline file has the right attributes add the needed attributes of activities, latLong and then we'll filter on those in later chalk quires. 

```
@online
def get_parks() -> DataFrame[Park.id, Park.name, Park.state_id, Park.description, Park.activities, Park.lat_long]:
    """This function fetches some basics of the parks from the NPS API"""
    response = requests.get(
        "https://developer.nps.gov/api/v1/parks?limit=500&api_key=5QeA6ARYfLEdYl0c8jJiNQyd4J5UK4l5KR7Owcpg",
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
```


### Activities - parsing our your list 
Note: since the activities for this park are being returned as a list - it must first be parsed and then checked for the boolean whether it has fishing or water in them. 
then ensure its added in this way to go through the activities list 

```
activities=[a["name"] for a in park["activities"]],
```

From the activities, lets now check if the activities contain water or fishing Check activities first if it contains in the words fishing or water  

`@online`
`def get_has_water(activities: Park.activities) -> Park.has_water:`
    `"""Check if any activity contains the word 'water'"""`
    `return any("water" in activity.lower() for activity in activities)`

`@online`
`def get_has_fishing(activities: Park.activities) -> Park.has_fishing:`
    `"""Check if any activity contains the word 'fish'"""`
    `return any("fish" in activity.lower() for activity in activities)`

from the returned parks verify in Chalk.ai that it the features bools are registered:

```
chalk query --branch parks --in state.id=CA --out state.park_count --out state.parks.has_water  
```
```
**Results**                                                                                                                       
https://chalk.ai/environments/dmo2ad5trrq3/query-runs/cmjak42ym00hy08leak0di39s?ts=1766008920654                                                                               
Branch: parks                                                                                                                                               
Environment: dmo2ad5trrq3                                                                                                                 
 Name                   Hit?  Value                                                                                                                 
 **state.park_count**             28                                                                                             
 **state.parks.has_water**        [false,false,false,true,false,false,false,false,true,false,false,true,false,false,false,false,false,false,false,false,true,false,false,false,true

national-parks % chalk query --branch parks --in state.id=CA --out state.park_count --out state.parks.has_fishing
```

```
**Results**                                                                                                                                            
https://chalk.ai/environments/dmo2ad5trrq3/query-runs/cmjak4u6v00ms08lec4wt805y?ts=1766008955792                                                                                                
Branch: parks                                                                                                                          
Environment: dmo2ad5trrq3                                                                                                     
Name                     Hit?  Value                                                                                                                
 **state.park_count**               28                                                                                                           
 **state.parks.has_fishing**        [false,false,false,true,false,true,false,true,true,false,false,true,false,false,false,false,false,true,false,false,true,false,false,false,true,false,true,true]

```

Up next - let's get the number off parks in a state
```
@online
def get_park_count(parks: State.parks[Park.id]) -> State.park_count:
    """Count the number of parks in a state"""
    return len(list(parks))
```

then get states 
Once we know which states they're in we can then calculate the distance between the parts baked on lat_long  adding `lat_long: str` to the models.py

Lets get the latLong back form the API 

```
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
```

to calcual;te drive times  between the parks we need to look at the parks in each state and the distance in miles. We can use the Haversine math formula for this which will convert the lat long into miles  -- lets plan to do it on California parks. 

==*to have these features stored in chalks use the `store-plan-stages=True` feature flag.*==

```
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
```

From the distance calucated using the haversine formula you can then estimate the driving required from park to park withinb the state
```
def estimate_drive_time_minutes(distance_miles: float) -> float:
    """Estimate drive time assuming average 50 mph"""
    return (distance_miles / 50) * 60
```

Now based on the estimated drive times between each one
```
@online
def get_park_drive_times(
    state_id: State.id,
    parks: State.parks[Park.id, Park.name, Park.lat_long]
) -> DataFrame[ParkPairDriveTime.id, ParkPairDriveTime.state_id, ParkPairDriveTime.park1_name, ParkPairDriveTime.park2_name, ParkPairDriveTime.distance_miles, ParkPairDriveTime.drive_time_minutes]:
    """Calculate drive times between all pairs of parks in a state"""
    park_list = list(parks)
    drive_times = []

    for park1, park2 in combinations(park_list, 2):
        coords1 = parse_lat_long(park1[Park.lat_long])
        coords2 = parse_lat_long(park2[Park.lat_long])

        if coords1 and coords2:
            distance = calc_distance_miles(coords1[0], coords1[1], coords2[0], coords2[1])
            drive_time = estimate_drive_time_minutes(distance)

            drive_times.append(ParkPairDriveTime(
                id=f"{park1[Park.id]}:{park2[Park.id]}",
                state_id=state_id,
                park1_name=park1[Park.name],
                park2_name=park2[Park.name],
                distance_miles=round(distance, 1),
                drive_time_minutes=round(drive_time, 1),
            ))

    return DataFrame(drive_times)
```

To get the drive times for all the parks in California run this chalk command

## Seeing your results in Chalk.ai

```
chalk query --branch parks --in state.id=CA --out state.park_drive_times
```

To calculate the estimated hours on road needed by your sales rep 

We can see that 36 hours on the road are estimated for this person if they drove the the closest park in succession from alacatraaz 

```
chalk query --branch parks --in park.id=alca --out park.name --out park.road_trip_hours_from_here

```

Result:
```
 **park.name**                             "Alcatraz Island"
 **park.road_trip_hours_from_here**        39.3
```

Where as 
```
chalk query --branch parks --in park.id=yose --out park.name --out park.road_trip_hours_from_here
```

```
 Name                            Hit?  Value                                     
──────────────────────────────────────────────────                             
 **park.name**                             "Yosemite"                            
 **park.road_trip_hours_from_here**        36.0
```

So depending on where this sales rep is located or thier starting point you can determine how many hours they'll be on the road, billable time and estimated gas mileage or other expenses. 

Let's go fish for some prospects! 

Questions: check the Chalk.ai developer docs to learn more about the SDK, CLI and how chalk can reduce your latency to help plan your annual compensation for your in-field sales reps. 
https://docs.chalk.ai/docs/what-is-chalk
