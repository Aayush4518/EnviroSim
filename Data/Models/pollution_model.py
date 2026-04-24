"""
Next-day **PM2.5** regressor (µg/m³), Bangalore daily data.

Design:
  - Target: **PM2.5 on day t+1** — physically stable vs raw `AQI`, which in this
    dataset is inconsistently bucketed relative to concentrations.
  - Features: **past lags** (t-1…t-N) plus **same-day (t) air/weather** to forecast
    end-of-day **t+1** PM2.5 (same-day is not the label; label is t+1 only).

Saves `pollution_model.joblib`; use `predict_pm25_frame()` for integration.
You can map PM2.5 to AQI bands in the app if needed.
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
DEFAULT_ARTIFACT = THIS_DIR / "pollution_model.joblib"

N_LAGS = 14
TRAIN_FRACTION = 0.8
RANDOM_STATE = 42

LAG_BASE_COLS = [
    ("pm25", "PM2.5"),
    ("pm10", "PM10"),
    ("no2", "NO2"),
    ("o3", "O3"),
    ("rain_mm", "Rain (mm)"),
    ("tmax", "Temp Max( C )"),
    ("tmin", "Temp Min ( C )"),
    ("aqi", "AQI"),
]


def _repo_root() -> Path:
    return THIS_DIR.parent.parent


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
    return df


def _lag_feature_dict(df: pd.DataFrame, n_lags: int) -> dict[str, pd.Series]:
    cols: dict[str, pd.Series] = {}
    for internal, _ in LAG_BASE_COLS:
        base = df[internal]
        for k in range(1, n_lags + 1):
            cols[f"{internal}_lag{k}"] = base.shift(k)
    return cols


def add_past_lags_multiseries(
    df: pd.DataFrame, n_lags: int = N_LAGS
) -> tuple[pd.DataFrame, list[str]]:
    lag_df = pd.DataFrame(_lag_feature_dict(df, n_lags))
    out = pd.concat([df[["Date"]].reset_index(drop=True), lag_df], axis=1)
    out["month"] = out["Date"].dt.month
    same_cols: list[str] = []
    for internal, _ in LAG_BASE_COLS:
        col = f"{internal}_d0"
        out[col] = df[internal].to_numpy()
        same_cols.append(col)
    out["_pm25_next"] = df["pm25"].shift(-1).to_numpy()
    feature_names = list(lag_df.columns) + same_cols + ["month"]
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
    need = feature_cols + ["_pm25_next"]
    d = d.dropna(subset=need).reset_index(drop=True)
    return d, feature_cols


def train_and_evaluate(
    d: pd.DataFrame,
    feature_cols: list[str],
    train_idx: np.ndarray,
    test_idx: np.ndarray,
) -> tuple[Pipeline, dict]:
    y = d["_pm25_next"].to_numpy(dtype=float)
    X = d[feature_cols]
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    pipe = build_pipeline(feature_cols)
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    # Baselines: this merged PM2.5 series has ~no day-to-day autocorrelation — R² can be
    # negative while MAE still beats predicting “tomorrow = today” (persistence).
    pm_t = d["pm25_d0"].to_numpy(dtype=float)[test_idx]
    train_mean = float(np.mean(y_train))
    baseline_persistence_mae = float(np.mean(np.abs(y_test - pm_t)))
    baseline_train_mean_mae = float(np.mean(np.abs(y_test - train_mean)))

    metrics = {
        "n_train": int(len(train_idx)),
        "n_test": int(len(test_idx)),
        "test_mae_pm25": mae,
        "test_rmse_pm25": rmse,
        "test_r2": r2,
        "baseline_persistence_mae": baseline_persistence_mae,
        "baseline_train_mean_mae": baseline_train_mean_mae,
        "target_mean_test": float(np.mean(y_test)),
        "target_std_test": float(np.std(y_test)),
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
        "label_definition": "Predict PM2.5 (µg/m³) on day t+1 from lagged pollution/weather",
        "n_lags": N_LAGS,
        "lag_series": [x[0] for x in LAG_BASE_COLS],
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


def predict_pm25_frame(df_features: pd.DataFrame, bundle: dict | None = None) -> np.ndarray:
    """Predict next-day PM2.5 (µg/m³). Rows must include bundle['feature_cols']."""
    b = bundle if bundle is not None else load_model_bundle()
    pipe: Pipeline = b["model"]
    cols = b["feature_cols"]
    missing = [c for c in cols if c not in df_features.columns]
    if missing:
        raise ValueError(f"Missing columns for prediction: {missing}")
    return pipe.predict(df_features[cols])


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Train next-day PM2.5 regressor")
    parser.add_argument("--data", type=Path, default=None, help=f"CSV (default: {MERGED_CSV})")
    parser.add_argument("--out", type=Path, default=DEFAULT_ARTIFACT, help=f"joblib path (default: {DEFAULT_ARTIFACT})")
    args = parser.parse_args(argv)
    csv_path = args.data if args.data is not None else MERGED_CSV
    if not csv_path.is_file():
        print(f"Error: data file not found: {csv_path}", file=sys.stderr)
        return 1

    print("Training pollution (next-day PM2.5) model …")
    print(f"  Data: {csv_path}")
    bundle = train_full_pipeline(csv_path=csv_path, artifact_path=args.out)
    m = bundle["metrics"]
    print(f"  Saved: {bundle['artifact_path']}")
    print(f"  Test MAE (model): {m['test_mae_pm25']:.3f} µg/m³")
    print(f"  Test RMSE: {m['test_rmse_pm25']:.3f}")
    print(f"  Test R²: {m['test_r2']:.3f}  (can be <0 when series is noisy vs mean baseline)")
    print(f"  Baseline MAE — persistence (tomorrow≈today): {m['baseline_persistence_mae']:.3f}")
    print(f"  Baseline MAE — train mean: {m['baseline_train_mean_mae']:.3f}")
    print(f"  Test target mean ± std: {m['target_mean_test']:.1f} ± {m['target_std_test']:.1f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
