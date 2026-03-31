import requests
from chalk import DataFrame, online

from src.models import Park


@online
def get_parks() -> DataFrame[Park.id, Park.name, Park.state_id, Park.description]:
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
                state_id=park["states"],
                description=park["description"],
            )
        )
    return DataFrame(parks)


@online
def get_has_long_description(desc: Park.description) -> Park.has_long_description:
    """This function checks if the park has a long description"""
    return len(desc) > 100
