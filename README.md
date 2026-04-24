# EnviroSim

A simulation tool that visualizes how minor environmental changes affect local infrastructure at the street or building level.

## Architecture

```
Frontend (Next.js :3000)  →  Backend (Express :6969)  →  InferenceService (FastAPI :8000)
     UI sliders                  validation + proxy           ML models + real data
```

## Quick Start

Start three services in separate terminals from the project root:

### 1) Python Inference Service

```bash
pip install -r InferenceService/requirements.txt
python3 -m uvicorn InferenceService.app:app --host 127.0.0.1 --port 8000 --reload
```

### 2) Node Backend

```bash
cd Backend
npm install
PY_INFERENCE_URL=http://127.0.0.1:8000 npm run dev
```

### 3) Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Health Checks

- Python inference: `http://127.0.0.1:8000/health`
- Backend: `http://localhost:6969/health`
- Frontend: `http://localhost:3000/simulate`

## Running Tests

```bash
# Inference smoke tests (standalone, no servers needed)
python3 -m pytest InferenceService/test_inference.py -v

# Backend contract tests (requires inference :8000 + backend :6969 running)
cd Backend && node test_simulate.js
```

## API Contract

### POST /simulate (Backend)

**Request:**
```json
{
  "temperature": 30,
  "pollution": 50,
  "rainfall": 80,
  "vegetation": 40,
  "month": 4
}
```

**Response:**
```json
{
  "status": "ok",
  "source": "ml-inference",
  "input": { "temperature": 30, "pollution": 50, "rainfall": 80, "vegetation": 40, "month": 4 },
  "prediction": {
    "flood_risk_probability": 0.243,
    "predicted_pm25_next_day": 261.35,
    "predicted_temp_max_next_day": 29.91,
    "input_echo": { ... },
    "metadata": {
      "mode": "historical-lag-with-scenario-override",
      "historical_rows_used": 14,
      "lag_construction": "lag1=user_slider, lag2..14=real_dataset_tail",
      "vegetation_note": "Not used by any ML model — UI-only parameter."
    }
  }
}
```