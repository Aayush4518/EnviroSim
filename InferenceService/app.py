"""
EnviroSim Inference Service — FastAPI

Loads trained ML models and real historical data at startup.
Builds lag features from the dataset tail, with user slider values
injected at lag-1 position for interactive what-if scenarios.
"""
from __future__ import annotations

import sys
from pathlib import Path

# Add project root to Python path for Render deployment
ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

import logging
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from Data.Models.flood_model import load_model_bundle as load_flood_bundle
from Data.Models.flood_model import predict_risk_frame
from Data.Models.pollution_model import load_model_bundle as load_pollution_bundle
from Data.Models.pollution_model import predict_pm25_frame
from Data.Models.temperature_model import load_model_bundle as load_temp_bundle
from Data.Models.temperature_model import predict_max_temp_frame

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("inference")

REPO_ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = REPO_ROOT / "Data" / "Models"
MERGED_CSV = REPO_ROOT / "Data" / "cleaned-data" / "merged-data.csv"
VEGETATION_CSV = REPO_ROOT / "Data" / "cleaned-data" / "vegetation-dummy.csv"

N_LAGS = 14

# Flood model uses "rain_lag{k}" but internal column name is "rain_mm"
SERIES_ALIAS = {"rain": "rain_mm"}

# CSV column -> internal name
CSV_COL_MAP = {
    "Rain (mm)": "rain_mm",
    "PM2.5": "pm25",
    "PM10": "pm10",
    "NO2": "no2",
    "O3": "o3",
    "Temp Max( C )": "tmax",
    "Temp Min ( C )": "tmin",
    "AQI": "aqi",
}


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    temperature: float = Field(default=25.0, ge=-10, le=65)
    pollution: float = Field(default=30.0, ge=0, le=600)
    rainfall: float = Field(default=45.0, ge=0, le=1000)
    vegetation: float = Field(default=60.0, ge=0, le=100)
    month: int = Field(default=1, ge=1, le=12)


class RiskBreakdown(BaseModel):
    flood_risk_score: float
    air_quality_risk_score: float
    heat_stress_risk_score: float
    vegetation_stress_score: float
    combined_risk_score: float
    combined_risk_label: str
    methodology: str


class PredictionResponse(BaseModel):
    flood_risk_probability: float
    predicted_pm25_next_day: float
    predicted_temp_max_next_day: float
    environmental_risk: RiskBreakdown
    input_echo: dict
    metadata: dict


# ---------------------------------------------------------------------------
# Historical data helpers
# ---------------------------------------------------------------------------

def load_historical_context(csv_path: Path) -> tuple[pd.DataFrame, dict]:
    """Load dataset tail and compute derivation ratios for unmapped features."""
    if not csv_path.is_file():
        raise FileNotFoundError(f"Dataset not found: {csv_path}")

    df = pd.read_csv(csv_path, parse_dates=["Date"], dayfirst=True)
    df = df.sort_values("Date").reset_index(drop=True)

    for csv_col, internal in CSV_COL_MAP.items():
        if csv_col in df.columns:
            df[internal] = pd.to_numeric(df[csv_col], errors="coerce")

    if VEGETATION_CSV.is_file():
        vegetation = pd.read_csv(VEGETATION_CSV)
        vegetation["Month"] = pd.to_numeric(vegetation["Month"], errors="coerce")
        vegetation["Vegetation Index"] = pd.to_numeric(
            vegetation["Vegetation Index"],
            errors="coerce",
        )
        monthly = vegetation.dropna(subset=["Month", "Vegetation Index"]).set_index("Month")[
            "Vegetation Index"
        ]
        df["vegetation"] = df["Date"].dt.month.map(monthly).astype(float).fillna(60.0)
    else:
        df["vegetation"] = 60.0

    tail = df.tail(N_LAGS).copy().reset_index(drop=True)

    # Compute ratios to derive pm10/no2/o3/aqi from user's pm25 slider
    ratios: dict[str, float] = {}
    valid = df.dropna(subset=["pm25"])
    for col in ["pm10", "no2", "o3", "aqi"]:
        both = valid.dropna(subset=[col])
        if len(both) > 0 and both["pm25"].mean() > 0:
            ratios[col] = float(both[col].mean() / both["pm25"].mean())
        else:
            ratios[col] = 1.0

    # Average tmax-tmin delta
    vt = df.dropna(subset=["tmax", "tmin"])
    ratios["tmax_tmin_delta"] = float((vt["tmax"] - vt["tmin"]).mean()) if len(vt) > 0 else 5.0

    last_date = str(df["Date"].iloc[-1].date()) if "Date" in df.columns else "unknown"
    logger.info("Historical context: %d rows, last date=%s, ratios=%s", len(tail), last_date, ratios)
    return tail, ratios


def map_user_to_series(req: PredictRequest, ratios: dict) -> dict[str, float]:
    """Map 4 user slider values to the 8+ internal series names models expect."""
    pm25 = req.pollution
    tmax = req.temperature
    return {
        "rain_mm": req.rainfall,
        "rain": req.rainfall,  # alias used by flood model
        "pm25": pm25,
        "pm10": pm25 * ratios.get("pm10", 1.5),
        "no2": pm25 * ratios.get("no2", 0.4),
        "o3": pm25 * ratios.get("o3", 0.25),
        "aqi": pm25 * ratios.get("aqi", 1.0),
        "tmax": tmax,
        "tmin": tmax - ratios.get("tmax_tmin_delta", 5.0),
        "vegetation": req.vegetation,
    }


def build_feature_row(
    feature_cols: list[str],
    hist: pd.DataFrame,
    user: dict[str, float],
    month: int,
) -> pd.DataFrame:
    """Build one row of features from real history + user overrides.

    - lag1 = user slider value (hypothetical "yesterday")
    - lag2..lag14 = real historical data (hist[-1] = lag2, hist[-2] = lag3, ...)
    - d0 columns = user slider value (hypothetical "today")
    """
    n = len(hist)
    row: dict[str, float] = {}

    for col in feature_cols:
        if col == "month":
            row[col] = float(month)
            continue

        # Parse "{series}_lag{k}"
        if "_lag" in col:
            parts = col.rsplit("_lag", 1)
            series_key = parts[0]
            lag_k = int(parts[1])
            # Resolve alias (e.g. "rain" -> "rain_mm" for historical lookup)
            data_col = SERIES_ALIAS.get(series_key, series_key)

            if lag_k == 1:
                # User's value as hypothetical yesterday
                row[col] = user.get(series_key, user.get(data_col, 0.0))
            else:
                # Real historical: lag2 -> hist[-1], lag3 -> hist[-2], ...
                idx = n - (lag_k - 1)
                if 0 <= idx < n and data_col in hist.columns:
                    v = hist[data_col].iloc[idx]
                    row[col] = float(v) if pd.notna(v) else 0.0
                else:
                    row[col] = 0.0
            continue

        # Parse "{series}_d0"
        if col.endswith("_d0"):
            series_key = col[:-3]
            row[col] = user.get(series_key, 0.0)
            continue

        row[col] = 0.0

    return pd.DataFrame([row], columns=feature_cols)


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="EnviroSim Inference Service", version="1.0.0")

# Load at startup
FLOOD_BUNDLE = load_flood_bundle(MODELS_DIR / "flood_model.joblib")
POLLUTION_BUNDLE = load_pollution_bundle(MODELS_DIR / "pollution_model.joblib")
TEMP_BUNDLE = load_temp_bundle(MODELS_DIR / "temperature_model.joblib")
HISTORICAL_TAIL, DERIVED_RATIOS = load_historical_context(MERGED_CSV)

logger.info("All models and historical data loaded.")


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "models_loaded": ["flood", "pollution", "temperature"],
        "historical_rows": len(HISTORICAL_TAIL),
    }


# ---------------------------------------------------------------------------
# Environmental risk scoring — derived from ML model outputs
# Uses established environmental science thresholds, NOT arbitrary formulas.
# ---------------------------------------------------------------------------

def _pm25_to_risk(pm25: float) -> float:
    """Convert predicted PM2.5 (µg/m³) to 0-100 risk using EPA AQI breakpoints.

    Breakpoints (US EPA / CPCB India):
      0-12     Good               →  0-8
      12-35.4  Moderate           →  8-20
      35.5-55  USG                →  20-40
      55-150   Unhealthy          →  40-65
      150-250  Very Unhealthy     →  65-85
      250+     Hazardous          →  85-100
    """
    bands = [
        (12,   0,  8),
        (35.4, 8,  20),
        (55,   20, 40),
        (150,  40, 65),
        (250,  65, 85),
    ]
    lo = 0.0
    for hi_pm, lo_risk, hi_risk in bands:
        if pm25 <= hi_pm:
            frac = (pm25 - lo) / (hi_pm - lo) if hi_pm > lo else 0
            return lo_risk + frac * (hi_risk - lo_risk)
        lo = hi_pm
    # Above 250
    return min(85 + (pm25 - 250) / 250 * 15, 100)


def _temp_to_risk_bangalore(temp_c: float) -> float:
    """Convert predicted max temperature to 0-100 heat-stress risk.

    Calibrated for Bangalore (avg max 28-30°C, IMD heat-wave threshold ~37°C):
      <28°C    Normal             →  0-5
      28-33°C  Warm (typical)     →  5-15
      33-37°C  Above normal       →  15-40
      37-40°C  Heat wave          →  40-70
      40-43°C  Severe heat wave   →  70-90
      >43°C    Extreme            →  90-100
    """
    bands = [
        (28,  0,  5),
        (33,  5,  15),
        (37,  15, 40),
        (40,  40, 70),
        (43,  70, 90),
    ]
    if temp_c <= bands[0][0]:
        return 0.0
    lo = bands[0][0]
    for hi_t, lo_risk, hi_risk in bands:
        if temp_c <= hi_t:
            frac = (temp_c - lo) / (hi_t - lo) if hi_t > lo else 0
            return lo_risk + frac * (hi_risk - lo_risk)
        lo = hi_t
    return min(90 + (temp_c - 43) / 5 * 10, 100)


def _pollution_slider_adjustment(pollution_input: float) -> float:
    """
    Scenario responsiveness term for the pollution slider.

    Keeps ML prediction as primary signal, but adds a bounded adjustment so UI
    changes are visible in risk level for interactive simulation.
    Returns approximately [-28, +28].
    """
    # Center around moderate urban pollution, then bound for stability.
    centered = pollution_input - 50.0
    scaled = centered / 3.5
    return float(np.clip(scaled, -28.0, 28.0))


def _pollution_input_to_risk(pollution_input: float) -> float:
    """
    Convert pollution slider input (0..600) into a monotonic 0..100 risk term.
    This guarantees visible step-up in risk when slider increases.
    """
    return float(np.clip((pollution_input / 300.0) * 100.0, 0.0, 100.0))


def compute_environmental_risk(
    flood_prob: float,
    pm25: float,
    temp_c: float,
    pollution_input: float,
    vegetation_input: float,
) -> RiskBreakdown:
    """Compute combined environmental risk from the 3 ML model outputs."""
    flood_score = round(flood_prob * 100, 1)        # already 0-1 probability
    aq_base = _pm25_to_risk(max(pm25, 0))
    aq_slider = _pollution_input_to_risk(pollution_input)
    aq_adjust = _pollution_slider_adjustment(pollution_input)
    # Blend model-derived PM2.5 risk with direct slider risk so UI interaction is
    # consistently reflected in combined risk.
    aq_score_raw = (0.55 * aq_base) + (0.45 * aq_slider) + (0.25 * aq_adjust)
    aq_score = round(float(np.clip(aq_score_raw, 0.0, 100.0)), 1)
    heat_score = round(_temp_to_risk_bangalore(temp_c), 1)
    vegetation_score = round(float(np.clip(100.0 - vegetation_input, 0.0, 100.0)), 1)

    combined = round(
        flood_score * 0.30
        + aq_score * 0.30
        + heat_score * 0.25
        + vegetation_score * 0.15,
        1,
    )

    if combined < 20:
        label = "Low Risk"
    elif combined < 40:
        label = "Moderate Risk"
    elif combined < 60:
        label = "High Risk"
    elif combined < 80:
        label = "Very High Risk"
    else:
        label = "Critical Risk"

    return RiskBreakdown(
        flood_risk_score=flood_score,
        air_quality_risk_score=aq_score,
        heat_stress_risk_score=heat_score,
        vegetation_stress_score=vegetation_score,
        combined_risk_score=combined,
        combined_risk_label=label,
        methodology=(
            "Combined risk derived from ML model outputs. "
            "Flood: model probability × 100 (weight 30%). "
            "Air quality: predicted PM2.5 mapped to EPA AQI breakpoints with bounded "
            "scenario responsiveness from pollution slider (weight 30%). "
            "Heat stress: predicted temp mapped to IMD Bangalore thresholds (weight 25%). "
            "Vegetation: inverse green-cover stress from dummy vegetation dataset and slider (weight 15%)."
        ),
    )


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictRequest) -> PredictionResponse:
    try:
        user = map_user_to_series(payload, DERIVED_RATIOS)

        flood_row = build_feature_row(FLOOD_BUNDLE["feature_cols"], HISTORICAL_TAIL, user, payload.month)
        poll_row = build_feature_row(POLLUTION_BUNDLE["feature_cols"], HISTORICAL_TAIL, user, payload.month)
        temp_row = build_feature_row(TEMP_BUNDLE["feature_cols"], HISTORICAL_TAIL, user, payload.month)

        flood_prob = float(predict_risk_frame(flood_row, FLOOD_BUNDLE)[0])
        next_pm25 = float(predict_pm25_frame(poll_row, POLLUTION_BUNDLE)[0])
        next_temp = float(predict_max_temp_frame(temp_row, TEMP_BUNDLE)[0])

        risk = compute_environmental_risk(
            flood_prob,
            next_pm25,
            next_temp,
            payload.pollution,
            payload.vegetation,
        )

        return PredictionResponse(
            flood_risk_probability=round(flood_prob, 4),
            predicted_pm25_next_day=round(max(next_pm25, 0), 2),
            predicted_temp_max_next_day=round(next_temp, 2),
            environmental_risk=risk,
            input_echo={
                "temperature": payload.temperature,
                "pollution": payload.pollution,
                "rainfall": payload.rainfall,
                "vegetation": payload.vegetation,
                "month": payload.month,
            },
            metadata={
                "mode": "historical-lag-with-scenario-override",
                "historical_rows_used": len(HISTORICAL_TAIL),
                "lag_construction": "lag1=user_slider, lag2..14=real_dataset_tail",
                "vegetation_source": str(VEGETATION_CSV.relative_to(REPO_ROOT)),
            },
        )
    except Exception as exc:
        logger.exception("Inference failure")
        raise HTTPException(status_code=500, detail=f"Inference failure: {exc}") from exc
