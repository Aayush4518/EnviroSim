# ML work checkpoint — session notes

Use this file to resume tomorrow without re-deriving context. Last updated for **2026-04-18**.

---

## Project layout (relevant paths)

| Path | Purpose |
|------|---------|
| `Data/cleaned-data/merged-data.csv` | Main daily table: Bangalore, ~2015–mid-2024, rain, temps, pollutants, AQI, AQI_Bucket |
| `Data/Models/flood_model.py` | Train & artifact for flood / heavy-rain risk |
| `Data/Models/pollution_model.py` | Train & artifact for next-day PM2.5 |
| `Data/Models/temperature_model.py` | Train & artifact for next-day max temperature |
| Artifacts (generated) | `Data/Models/*.joblib` next to each script |

Raw/cleaned splits also exist under `Data/Dataset/` and `Data/cleaned-data/`; **all three models read `merged-data.csv` only.**

---

## Shared methodology (important)

1. **Time order preserved** — data sorted by `Date` (`dayfirst=True` in pandas).
2. **Train/test split** — chronological, first **80%** train, last **20%** test (no random shuffle).
3. **No circular labels** — do not define the target as a trivial function of the *same* features used in `X` (that produced fake ~100% accuracy in early notebooks).
4. **Flood vs regression** — flood model is **classification** (heavy upcoming week rain proxy); pollution and temperature are **regression** (next-day PM2.5 and next-day Temp Max).

---

## 1. Flood model (`flood_model.py`)

**Intent:** Binary risk that the **next 7 days** will have **high cumulative rainfall** (proxy for flood-relevant conditions), not a hydrology simulation.

**Data:** `Rain (mm)` from merged CSV.

**Target `y`:** `future_7d_mm` (sum of rain on days *t+1* … *t+7*) ≥ threshold. The threshold is the **85th percentile** of that future sum **computed on the training slice only** (so test years are not used to set the cutoff).

**Features `X`:** `rain_lag1` … `rain_lag14` and `month` only — **no same-day rain**, no future values.

**Model:** `RandomForestClassifier` in a pipeline with median imputation.

**Artifact:** `Data/Models/flood_model.joblib`

**Inference helper:** `predict_risk_frame(df)` — expects columns matching `bundle["feature_cols"]`; returns **P(class 1)** (probability of “heavy week ahead” under the train-derived threshold).

**Run:**
```bash
cd /home/archon/Desktop/EnviroSim
python3 Data/Models/flood_model.py
```

---

## 2. Pollution model (`pollution_model.py`)

**Intent:** Predict **next-day PM2.5 (µg/m³)**. We deliberately did **not** use raw **AQI** alone as the main target because `AQI` / `AQI_Bucket` are inconsistent in this dataset; PM2.5 is more stable physically.

**Data:** merged CSV columns mapped internally: PM2.5, PM10, NO2, O3, rain, temps, AQI.

**Target `y`:** `PM2.5` on day *t+1*.

**Features `X`:** For each series, lags **t−1 … t−14**, plus **same-day (*t*)** readings (`*_d0`) for an **end-of-day → next day** forecast, plus `month`.

**Model:** `RandomForestRegressor` + median imputation.

**Artifact:** `Data/Models/pollution_model.joblib`

**Inference helper:** `predict_pm25_frame(df)` — continuous predicted PM2.5 for *t+1*.

**Metrics caveat (realistic):** In this CSV, **day-to-day PM2.5 autocorrelation is ~0**, so **R² on the test set can be slightly negative** even when the model still **beats a persistence baseline** (“tomorrow ≈ today”). The script prints:

- Test MAE (model)
- Baseline MAE — persistence
- Baseline MAE — train mean  

Use those together with R².

**Run:**
```bash
python3 Data/Models/pollution_model.py
```

---

## 3. Temperature model (`temperature_model.py`)

**Intent:** Predict **next-day maximum temperature (°C)**.

**Data:** `Temp Max( C )`, `Temp Min ( C )`, `Rain (mm)`, `PM2.5` from merged CSV.

**Target `y`:** `Temp Max` on day *t+1*.

**Features `X`:** Lags **t−1 … t−14** of the variables above + `month` (past-only, no same-day `d0` column in the shipped version — performance was already strong).

**Model:** `RandomForestRegressor` + median imputation.

**Artifact:** `Data/Models/temperature_model.joblib`

**Inference helper:** `predict_max_temp_frame(df)`.

**Typical outcome (example run):** test MAE ~1.2 °C, R² ~0.75 on held-out tail — useful for a demo pipeline.

**Run:**
```bash
python3 Data/Models/temperature_model.py
```

**Implementation detail:** RMSE uses `np.sqrt(mean_squared_error(...))` because newer **scikit-learn** removed the `squared=` argument on `mean_squared_error`.

---

## Jupyter / exploratory work (earlier in session)

- Notebook work (e.g. `Untitled.ipynb`) used relative paths like `Data/...` — **run Jupyter with cwd = project root** or use **absolute paths** to `merged-data.csv`.
- Early **flood** notebook used a **hand-made `flood_label`** from same-day / rolling rain features that duplicated information in `X` → **misleading ~100% test accuracy**; the production `flood_model.py` replaces that design.

---

## Loading any saved bundle in code

```python
from pathlib import Path
import joblib

root = Path("/home/archon/Desktop/EnviroSim")  # adjust if needed
bundle = joblib.load(root / "Data/Models/flood_model.joblib")
model = bundle["model"]
cols = bundle["feature_cols"]
# metrics: bundle.get("metrics")
```

Same pattern for `pollution_model.joblib` and `temperature_model.joblib`.

---

## Suggested next steps (tomorrow)

1. **Backend wiring:** Call Python from Node, or expose a small FastAPI/Flask service that loads the three `joblib` files and accepts the features your UI can supply.
2. **Regenerate artifacts** after any data refresh: rerun the three `python3 Data/Models/*.py` commands.
3. **Pollution:** If you need **AQI** for the UI, map predicted PM2.5 to an AQI-like band with documented mapping, or add a separate AQI experiment knowing label noise.
4. **Optional:** Add `requirements.txt` (e.g. `pandas`, `scikit-learn`, `joblib`) for reproducible training environments.
5. **Git:** Consider ignoring large `*.joblib` files if binaries should not be committed.

---

## Quick command summary

```bash
cd /home/archon/Desktop/EnviroSim
python3 Data/Models/flood_model.py
python3 Data/Models/pollution_model.py
python3 Data/Models/temperature_model.py
```

All three read **`Data/cleaned-data/merged-data.csv`** unless you pass `--data /path/to/other.csv`.
