from app.main import create_app


def test_healthz():
    app = create_app()
    client = app.test_client()
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json["success"] is True


def test_recommend_ngo():
    app = create_app()
    client = app.test_client()
    response = client.post(
        "/recommend/ngo",
        json={
            "quantity": 100,
            "minutes_to_expiry": 120,
            "candidates": [
                {"id": "ngo_a", "distance_km": 4, "capacity": 120},
                {"id": "ngo_b", "distance_km": 16, "capacity": 90},
            ],
        },
    )
    assert response.status_code == 200
    assert response.json["recommendations"][0]["ngo_id"] == "ngo_a"


def test_match_score():
    app = create_app()
    client = app.test_client()
    response = client.post(
        "/predict/match-score",
        json={
            "minutes_to_expiry": 90,
            "candidates": [
                {"id": "ngo_a", "distance_km": 3, "avg_response_minutes": 8, "acceptance_rate": 0.94},
                {"id": "ngo_b", "distance_km": 15, "avg_response_minutes": 30, "acceptance_rate": 0.7},
            ],
        },
    )
    assert response.status_code == 200
    assert response.json["recommendations"][0]["ngo_id"] == "ngo_a"


def test_quality_from_image():
    app = create_app()
    client = app.test_client()
    response = client.post(
        "/vision/food-quality",
        json={"brightness": 0.8, "texture_score": 0.75, "discoloration_score": 0.1},
    )
    assert response.status_code == 200
    assert response.json["prediction"]["quality_label"] in {"fresh", "review", "spoiled"}
