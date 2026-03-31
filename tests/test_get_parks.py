from src.pipelines import get_parks


def test_get_parks():
    response = get_parks()
    assert response is not None
