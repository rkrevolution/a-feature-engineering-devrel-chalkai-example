from chalk import DataFrame
from chalk.features import features


@features
class State:
    id: str
    parks: "DataFrame[Park]"


@features
class Park:
    id: str
    description: str
    has_long_description: bool
    name: str
    state_id: State.id
    state: State
