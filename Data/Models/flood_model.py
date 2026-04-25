"""
Flood-style *heavy-rain risk* classifier trained on Bangalore daily data.

Design (fixes circular label issues):
  - Label uses only *future* rainfall (next 7 days after day t), not the same
    columns as features.
  - Features use only *past* rain lags + calendar — no rain_mm[t] and no rolling
    windows that include the label window.

Outputs:
  - Trains when run as __main__, writes `flood_model.joblib` next to this file.
  - Use `load_model_bundle()` and `predict_risk_frame()` for integration.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline

# -----------------------------------------------------------------------------
# Paths
# -----------------------------------------------------------------------------

THIS_DIR = Path(__file__).resolve().parent
DATA_DIR = THIS_DIR.parent / "cleaned-data"
MERGED_CSV = DATA_DIR / "merged-data.csv"
VEGETATION_CSV = DATA_DIR / "vegetation-dummy.csv"
DEFAULT_ARTIFACT = THIS_DIR / "flood_model.joblib"

RAIN_COL = "Rain (mm)"
N_LAGS = 14
# Positive class = next 7d total rainfall >= this quantile of *train* distribution
LABEL_QUANTILE = 0.85
TRAIN_FRACTION = 0.8
RANDOM_STATE = 42


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
    if RAIN_COL not in df.columns:
        raise ValueError(f"Expected column {RAIN_COL!r} in {path}")
    df["rain_mm"] = pd.to_numeric(df[RAIN_COL], errors="coerce")
    return add_dummy_vegetation(df)


def add_future_rainfall_sum(df: pd.DataFrame, days: int = 7) -> pd.Series:
    """Sum of rain_mm on days t+1 .. t+days (not including t)."""
    parts = [df["rain_mm"].shift(-k) for k in range(1, days + 1)]
    return pd.concat(parts, axis=1).sum(axis=1)


def add_past_lags(df: pd.DataFrame, n_lags: int = N_LAGS) -> pd.DataFrame:
    out = df.copy()
    for k in range(1, n_lags + 1):
        out[f"rain_lag{k}"] = out["rain_mm"].shift(k)
        out[f"vegetation_lag{k}"] = out["vegetation"].shift(k)
    out["month"] = out["Date"].dt.month
    return out


def build_xy(df: pd.DataFrame) -> tuple[pd.DataFrame, np.ndarray, list[str], float]:
    """
    Returns X (features), y (binary), feature_names, label_threshold.
    Threshold is computed on the *training* slice only by caller — here we only
    build raw future sum; threshold applied in train_pipeline after split.
    """
    d = add_past_lags(df, N_LAGS)
    d["future_7d_mm"] = add_future_rainfall_sum(d, days=7)

    lag_cols = [f"rain_lag{k}" for k in range(1, N_LAGS + 1)]
    lag_cols += [f"vegetation_lag{k}" for k in range(1, N_LAGS + 1)]
    feature_cols = lag_cols + ["month"]

    d = d.dropna(subset=lag_cols + ["future_7d_mm"]).reset_index(drop=True)

    # Threshold set on train in fit — return placeholder y using global quantile for structure
    # Caller will replace y after computing threshold on train; we return future for that.
    return d, feature_cols


def time_split_rows(n_rows: int, train_fraction: float = TRAIN_FRACTION) -> tuple[np.ndarray, np.ndarray]:
    n_train = int(n_rows * train_fraction)
    idx = np.arange(n_rows)
    return idx[:n_train], idx[n_train:]


def make_labels_train_threshold(
    future_7d: np.ndarray | pd.Series,
    train_mask: np.ndarray,
    quantile: float = LABEL_QUANTILE,
) -> tuple[np.ndarray, float]:
    """Binary y: 1 iff future 7d sum >= train-quantile threshold."""
    train_vals = np.asarray(future_7d)[train_mask]
    train_vals = train_vals[np.isfinite(train_vals)]
    thresh = float(np.quantile(train_vals, quantile))
    y = (np.asarray(future_7d) >= thresh).astype(np.int64)
    return y, thresh


def build_pipeline(feature_cols: list[str]) -> Pipeline:
    """Numeric lags + month (ordinal); impute missing if any."""
    pre = ColumnTransformer(
        [
            (
                "num",
                SimpleImputer(strategy="median"),
                feature_cols,
            ),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    pre.set_output(transform="pandas")

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=8,
        class_weight="balanced_subsample",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    return Pipeline([("prep", pre), ("clf", clf)])


def train_and_evaluate(
    df: pd.DataFrame,
    train_idx: np.ndarray,
    test_idx: np.ndarray,
    feature_cols: list[str],
    future_7d: np.ndarray,
    train_mask: np.ndarray,
) -> tuple[Pipeline, dict, float]:
    y_all, thresh = make_labels_train_threshold(
        future_7d,
        train_mask=train_mask,
        quantile=LABEL_QUANTILE,
    )

    X = df[feature_cols]
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y_all[train_idx], y_all[test_idx]

    pipe = build_pipeline(feature_cols)
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:, 1]

    metrics: dict = {
        "threshold_future_7d_mm": thresh,
        "label_quantile": LABEL_QUANTILE,
        "n_train": int(len(train_idx)),
        "n_test": int(len(test_idx)),
        "positive_rate_train": float(np.mean(y_train)),
        "positive_rate_test": float(np.mean(y_test)),
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "roc_auc": float(roc_auc_score(y_test, y_proba))
        if len(np.unique(y_test)) > 1
        else float("nan"),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(y_test, y_pred, digits=3),
    }
    return pipe, metrics, thresh


def train_full_pipeline(
    csv_path: Path | None = None,
    artifact_path: Path | None = None,
) -> dict:
    df_raw = load_merged_data(csv_path)
    d, feature_cols = build_xy(df_raw)
    future_7d = d["future_7d_mm"].to_numpy()

    train_idx, test_idx = time_split_rows(len(d))
    train_mask = np.zeros(len(future_7d), dtype=bool)
    train_mask[train_idx] = True

    pipe, metrics, thresh = train_and_evaluate(
        d,
        train_idx,
        test_idx,
        feature_cols,
        future_7d,
        train_mask=train_mask,
    )

    bundle = {
        "model": pipe,
        "feature_cols": feature_cols,
        "label_definition": (
            f"future_7d_mm >= {thresh:.4f} mm "
            f"({LABEL_QUANTILE:.0%} quantile of train-set future 7-day totals; "
            "risk of upcoming week heavy rain, proxy for flood-relevant conditions)"
        ),
        "threshold_future_7d_mm": thresh,
        "n_lags": N_LAGS,
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
    p = path or DEFAULT_ARTIFACT
    return joblib.load(p)


def predict_risk_frame(df_past: pd.DataFrame, bundle: dict | None = None) -> np.ndarray:
    """
    Predict P(heavy upcoming 7d rain) for rows that already have rain_lag1..lagN and month.

    df_past must include columns from bundle['feature_cols'].
    """
    b = bundle if bundle is not None else load_model_bundle()
    pipe: Pipeline = b["model"]
    cols = b["feature_cols"]
    missing = [c for c in cols if c not in df_past.columns]
    if missing:
        raise ValueError(f"Missing columns for prediction: {missing}")
    return pipe.predict_proba(df_past[cols])[:, 1]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Train flood / heavy-rain risk model")
    parser.add_argument(
        "--data",
        type=Path,
        default=None,
        help=f"CSV path (default: {MERGED_CSV})",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=DEFAULT_ARTIFACT,
        help=f"joblib bundle path (default: {DEFAULT_ARTIFACT})",
    )
    args = parser.parse_args(argv)

    csv_path = args.data if args.data is not None else MERGED_CSV
    if not csv_path.is_file():
        print(f"Error: data file not found: {csv_path}", file=sys.stderr)
        return 1

    print("Training flood heavy-rain risk model …")
    print(f"  Data: {csv_path}")
    bundle = train_full_pipeline(csv_path=csv_path, artifact_path=args.out)
    m = bundle["metrics"]
    print(f"  Saved: {bundle['artifact_path']}")
    print(f"  Label threshold (train {LABEL_QUANTILE:.0%} quantile of next-7d sum): {bundle['threshold_future_7d_mm']:.3f} mm")
    print(f"  Positives — train: {m['positive_rate_train']:.3f}, test: {m['positive_rate_test']:.3f}")
    print(f"  Test accuracy: {m['accuracy']:.3f}")
    print(f"  Test ROC-AUC: {m['roc_auc']:.3f}")
    print("  Confusion matrix [test]:")
    for row in m["confusion_matrix"]:
        print("   ", row)
    print(m["classification_report"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
