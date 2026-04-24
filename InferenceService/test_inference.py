"""
Smoke tests for the InferenceService /predict and /health endpoints.
Run from project root:  python3 -m pytest InferenceService/test_inference.py -v
"""
import pytest
from fastapi.testclient import TestClient

from InferenceService.app import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "flood" in data["models_loaded"]
    assert data["historical_rows"] == 14


def test_predict_defaults():
    """Predict with default values returns valid floats."""
    resp = client.post("/predict", json={
        "temperature": 25, "pollution": 30, "rainfall": 45,
        "vegetation": 60, "month": 4,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert 0 <= data["flood_risk_probability"] <= 1
    assert isinstance(data["predicted_pm25_next_day"], (int, float))
    assert isinstance(data["predicted_temp_max_next_day"], (int, float))
    assert data["metadata"]["mode"] == "historical-lag-with-scenario-override"


def test_predict_high_rainfall():
    """High rainfall should produce a meaningful flood probability."""
    resp = client.post("/predict", json={
        "temperature": 25, "pollution": 30, "rainfall": 500,
        "vegetation": 60, "month": 7,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert 0 <= data["flood_risk_probability"] <= 1


def test_predict_validation_rejects_invalid():
    """Out-of-range values should be rejected by Pydantic."""
    resp = client.post("/predict", json={"temperature": 999})
    assert resp.status_code == 422  # Pydantic validation error


def test_predict_input_echo():
    """Response should echo back the input values."""
    payload = {"temperature": 30, "pollution": 50, "rainfall": 80, "vegetation": 40, "month": 6}
    resp = client.post("/predict", json=payload)
    assert resp.status_code == 200
    echo = resp.json()["input_echo"]
    assert echo["temperature"] == 30
    assert echo["rainfall"] == 80
    assert echo["month"] == 6


def test_vegetation_not_in_model():
    """Changing vegetation should not change predictions (it's not an ML feature)."""
    base = {"temperature": 25, "pollution": 30, "rainfall": 45, "month": 4}
    r1 = client.post("/predict", json={**base, "vegetation": 10}).json()
    r2 = client.post("/predict", json={**base, "vegetation": 90}).json()
    assert r1["flood_risk_probability"] == r2["flood_risk_probability"]
    assert r1["predicted_pm25_next_day"] == r2["predicted_pm25_next_day"]
    assert r1["predicted_temp_max_next_day"] == r2["predicted_temp_max_next_day"]
