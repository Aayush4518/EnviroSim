"""
Next-day *maximum temperature* regressor, Bangalore daily data.

Design:
  - Target: **Temp Max on day t+1** (°C) — future relative to feature time.
  - Features: **past-only** lags of temperature, rain, and a few pollution
    covariates (known by end of prior days), plus month — no leakage from same-day t.

Outputs:
  - Train via __main__ → `temperature_model.joblib`.
  - `load_model_bundle()` / `predict_max_temp_frame()` for integration.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

THIS_DIR = Path(__file__).resolve().parent
DATA_DIR = THIS_DIR.parent / "cleaned-data"
MERGED_CSV = DATA_DIR / "merged-data.csv"
VEGETATION_CSV = DATA_DIR / "vegetation-dummy.csv"
DEFAULT_ARTIFACT = THIS_DIR / "temperature_model.joblib"

N_LAGS = 14
TRAIN_FRACTION = 0.8
RANDOM_STATE = 42

LAG_BASE_COLS = [
    ("tmax", "Temp Max( C )"),
    ("tmin", "Temp Min ( C )"),
    ("rain_mm", "Rain (mm)"),
    ("pm25", "PM2.5"),
]


def _repo_root() -> Path:
    return THIS_DIR.parent.parent


def add_dummy_vegetation(df: pd.DataFrame, csv_path: Path | None = None) -> pd.DataFrame:
    """Attach monthly dummy vegetation percentage to each dated row."""
    path = csv_path or VEGETATION_CSV
    out = df.copy()
    if not path.is_file():
        out["vegetation"] = 60.0
        return out

    vegetation = pd.read_csv(path)
    vegetation["Month"] = pd.to_numeric(vegetation["Month"], errors="coerce")
    vegetation["Vegetation Index"] = pd.to_numeric(vegetation["Vegetation Index"], errors="coerce")
    monthly = vegetation.dropna(subset=["Month", "Vegetation Index"]).set_index("Month")["Vegetation Index"]
    out["vegetation"] = out["Date"].dt.month.map(monthly).astype(float).fillna(60.0)
    return out


def load_merged_data(csv_path: Path | None = None) -> pd.DataFrame:
    path = csv_path or MERGED_CSV
    if not path.is_file():
        raise FileNotFoundError(f"Missing dataset: {path}")
    df = pd.read_csv(path, parse_dates=["Date"], dayfirst=True)
    df = df.sort_values("Date").reset_index(drop=True)
    for internal, raw in LAG_BASE_COLS:
        if raw not in df.columns:
            raise ValueError(f"Expected column {raw!r} in {path}")
        df[internal] = pd.to_numeric(df[raw], errors="coerce")
    return add_dummy_vegetation(df)


def _lag_feature_dict(df: pd.DataFrame, n_lags: int) -> dict[str, pd.Series]:
    cols: dict[str, pd.Series] = {}
    for internal, _ in LAG_BASE_COLS:
        base = df[internal]
        for k in range(1, n_lags + 1):
            cols[f"{internal}_lag{k}"] = base.shift(k)
    for k in range(1, n_lags + 1):
        cols[f"vegetation_lag{k}"] = df["vegetation"].shift(k)
    return cols


def add_past_lags_multiseries(df: pd.DataFrame, n_lags: int = N_LAGS) -> tuple[pd.DataFrame, list[str]]:
    lag_df = pd.DataFrame(_lag_feature_dict(df, n_lags))
    out = pd.concat([df[["Date"]].reset_index(drop=True), lag_df], axis=1)
    out["month"] = out["Date"].dt.month
    out["_tmax_next"] = df["tmax"].shift(-1).values
    feature_names = list(lag_df.columns) + ["month"]
    return out, feature_names


def time_split_rows(n_rows: int, train_fraction: float = TRAIN_FRACTION) -> tuple[np.ndarray, np.ndarray]:
    n_train = int(n_rows * train_fraction)
    idx = np.arange(n_rows)
    return idx[:n_train], idx[n_train:]


def build_pipeline(feature_cols: list[str]) -> Pipeline:
    pre = ColumnTransformer(
        [("num", SimpleImputer(strategy="median"), feature_cols)],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    pre.set_output(transform="pandas")
    reg = RandomForestRegressor(
        n_estimators=200,
        max_depth=14,
        min_samples_leaf=6,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    return Pipeline([("prep", pre), ("reg", reg)])


def build_frame(csv_path: Path | None = None) -> tuple[pd.DataFrame, list[str]]:
    df_raw = load_merged_data(csv_path)
    d, feature_cols = add_past_lags_multiseries(df_raw, N_LAGS)
    need = feature_cols + ["_tmax_next"]
    d = d.dropna(subset=need).reset_index(drop=True)
    return d, feature_cols


def train_and_evaluate(
    d: pd.DataFrame,
    feature_cols: list[str],
    train_idx: np.ndarray,
    test_idx: np.ndarray,
) -> tuple[Pipeline, dict]:
    y = d["_tmax_next"].to_numpy()
    X = d[feature_cols]
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    pipe = build_pipeline(feature_cols)
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    metrics = {
        "n_train": int(len(train_idx)),
        "n_test": int(len(test_idx)),
        "test_mae_c": mae,
        "test_rmse_c": rmse,
        "test_r2": r2,
        "target_mean_test_c": float(np.mean(y_test)),
        "target_std_test_c": float(np.std(y_test)),
    }
    return pipe, metrics


def train_full_pipeline(
    csv_path: Path | None = None,
    artifact_path: Path | None = None,
) -> dict:
    d, feature_cols = build_frame(csv_path)
    train_idx, test_idx = time_split_rows(len(d))
    pipe, metrics = train_and_evaluate(d, feature_cols, train_idx, test_idx)

    bundle = {
        "model": pipe,
        "feature_cols": feature_cols,
        "label_definition": "Predict Temp Max (°C) on day t+1 from lagged weather/pollution (t-1 … t-N)",
        "n_lags": N_LAGS,
        "lag_series": [x[0] for x in LAG_BASE_COLS] + ["vegetation"],
        "data_source": str(
            MERGED_CSV.relative_to(_repo_root())
            if MERGED_CSV.is_file() and _repo_root() in MERGED_CSV.parents
            else MERGED_CSV
        ),
        "random_state": RANDOM_STATE,
        "metrics": metrics,
    }

    out = artifact_path or DEFAULT_ARTIFACT
    joblib.dump(bundle, out)
    bundle["artifact_path"] = str(out)
    return bundle


def load_model_bundle(path: Path | None = None) -> dict:
    return joblib.load(path or DEFAULT_ARTIFACT)


def predict_max_temp_frame(df_features: pd.DataFrame, bundle: dict | None = None) -> np.ndarray:
    """Predict next-day max temperature (°C). Rows must include bundle['feature_cols']."""
    b = bundle if bundle is not None else load_model_bundle()
    pipe: Pipeline = b["model"]
    cols = b["feature_cols"]
    missing = [c for c in cols if c not in df_features.columns]
    if missing:
        raise ValueError(f"Missing columns for prediction: {missing}")
    return pipe.predict(df_features[cols])


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Train next-day max temperature regressor")
    parser.add_argument("--data", type=Path, default=None, help=f"CSV (default: {MERGED_CSV})")
    parser.add_argument("--out", type=Path, default=DEFAULT_ARTIFACT, help=f"joblib path (default: {DEFAULT_ARTIFACT})")
    args = parser.parse_args(argv)
    csv_path = args.data if args.data is not None else MERGED_CSV
    if not csv_path.is_file():
        print(f"Error: data file not found: {csv_path}", file=sys.stderr)
        return 1

    print("Training temperature (next-day Temp Max) model …")
    print(f"  Data: {csv_path}")
    bundle = train_full_pipeline(csv_path=csv_path, artifact_path=args.out)
    m = bundle["metrics"]
    print(f"  Saved: {bundle['artifact_path']}")
    print(f"  Test MAE: {m['test_mae_c']:.3f} °C")
    print(f"  Test RMSE: {m['test_rmse_c']:.3f} °C")
    print(f"  Test R²: {m['test_r2']:.3f}")
    print(f"  Test target mean ± std: {m['target_mean_test_c']:.2f} ± {m['target_std_test_c']:.2f} °C")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
