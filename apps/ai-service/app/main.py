from flask import Flask, jsonify, request


def demand_forecast(features: dict) -> float:
    ngo_load = features.get("ngo_load", 0.5)
    historical = features.get("historical_demand", 0.5)
    seasonality = features.get("seasonality_index", 0.5)
    return round((0.45 * historical + 0.35 * seasonality + 0.2 * (1 - ngo_load)) * 100, 2)


def match_score(payload: dict) -> list[dict]:
    candidates = payload.get("candidates", [])
    expiry_minutes = payload.get("minutes_to_expiry", 120)
    ranked = []
    for candidate in candidates:
        distance_score = 1 - min(candidate.get("distance_km", 0) / 30, 1)
        response_score = 1 - min(candidate.get("avg_response_minutes", 0) / 60, 1)
        acceptance_score = min(max(candidate.get("acceptance_rate", 0), 0), 1)
        urgency_score = 1 - min(expiry_minutes / 720, 1)
        total = round(
            distance_score * 0.28
            + response_score * 0.22
            + acceptance_score * 0.2
            + urgency_score * 0.3,
            4,
        )
        ranked.append(
            {
                "ngo_id": candidate["id"],
                "score": total,
                "explanations": {
                    "distance": round(distance_score, 3),
                    "response": round(response_score, 3),
                    "acceptance": round(acceptance_score, 3),
                    "urgency": round(urgency_score, 3),
                },
            }
        )
    return sorted(ranked, key=lambda item: item["score"], reverse=True)


def fraud_anomaly(payload: dict) -> dict:
    device_changes = payload.get("device_changes", 0)
    ip_velocity = payload.get("ip_velocity", 0)
    duplicate_images = payload.get("duplicate_images", 0)
    geo_jump_km = payload.get("geo_jump_km", 0)
    score = min(
        0.99,
        round(
            device_changes * 0.08
            + ip_velocity * 0.015
            + duplicate_images * 0.12
            + geo_jump_km * 0.01,
            2,
        ),
    )
    return {
        "anomaly_score": score,
        "label": "high_risk" if score >= 0.75 else "review" if score >= 0.45 else "normal",
    }


def quality_from_image(payload: dict) -> dict:
    brightness = payload.get("brightness", 0.7)
    texture = payload.get("texture_score", 0.7)
    discoloration = payload.get("discoloration_score", 0.1)
    freshness = max(0.0, min(1.0, brightness * 0.3 + texture * 0.4 + (1 - discoloration) * 0.3))
    label = "fresh" if freshness >= 0.7 else "review" if freshness >= 0.45 else "spoiled"
    usable_hours = 6 if label == "fresh" else 2 if label == "review" else 0
    return {
        "quality_label": label,
        "confidence": round(freshness, 2),
        "usable_hours": usable_hours,
    }


def create_app() -> Flask:
    app = Flask(__name__)

    @app.get("/healthz")
    def health():
        return jsonify({"success": True, "service": "ai-service"})

    @app.post("/predict/demand")
    def predict_demand():
        payload = request.get_json(force=True) or {}
        score = demand_forecast(payload)
        return jsonify({"success": True, "prediction": {"demand_score": score}})

    @app.post("/recommend/ngo")
    def recommend_ngo():
        payload = request.get_json(force=True) or {}
        candidates = payload.get("candidates", [])
        quantity = payload.get("quantity", 1)
        ranked = sorted(
            [
                {
                    "ngo_id": candidate["id"],
                    "score": round(
                        (1 - min(candidate.get("distance_km", 0) / 30, 1)) * 0.4
                        + min(candidate.get("capacity", 0) / max(quantity, 1), 1) * 0.3
                        + (1 - min(payload.get("minutes_to_expiry", 60) / 720, 1)) * 0.3,
                        4,
                    ),
                }
                for candidate in candidates
            ],
            key=lambda item: item["score"],
            reverse=True,
        )
        return jsonify({"success": True, "recommendations": ranked})

    @app.post("/predict/match-score")
    def predict_match_score():
        payload = request.get_json(force=True) or {}
        return jsonify({"success": True, "recommendations": match_score(payload)})

    @app.post("/predict/expiry-risk")
    def predict_expiry_risk():
        payload = request.get_json(force=True) or {}
        minutes = payload.get("minutes_to_expiry", 0)
        transport_delay = payload.get("transport_delay_minutes", 0)
        risk = min(0.99, round((transport_delay / max(minutes, 1)) * 0.8, 2))
        return jsonify({"success": True, "prediction": {"expiry_risk": risk}})

    @app.post("/predict/fraud-anomaly")
    def predict_fraud_anomaly():
        payload = request.get_json(force=True) or {}
        return jsonify({"success": True, "prediction": fraud_anomaly(payload)})

    @app.post("/vision/food-quality")
    def vision_food_quality():
        payload = request.get_json(force=True) or {}
        return jsonify({"success": True, "prediction": quality_from_image(payload)})

    return app
