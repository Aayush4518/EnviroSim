# Option A Implementation Checklist

## Architecture
- [x] Add dedicated Python inference API service.
- [x] Keep Node backend as public API and proxy to Python.
- [x] Define one normalized JSON contract between frontend and backend.

## Backend (Node)
- [x] Replace mock `runSimulation` path with inference proxy call.
- [x] Add timeout and error handling for Python service outages.
- [x] Add `/health` endpoint.
- [x] Keep `/simulate` as the frontend-facing endpoint.
- [x] Add input validation with range checks and clear 400 errors.

## Inference Service (Python)
- [x] Create `InferenceService/app.py` with `/health` and `/predict`.
- [x] Load all three joblib bundles once at startup.
- [x] Return flood probability, next-day PM2.5, and next-day max temperature.
- [x] Add `requirements.txt`.
- [x] Replace synthetic lag generation with real historical data from `merged-data.csv`.
- [x] Compute pollutant derivation ratios from full dataset.
- [x] Inject user slider values at lag1 with real data for lag2..14.
- [x] Add Pydantic response model for strict schema.

## Frontend
- [x] Connect simulate UI to backend prediction response.
- [x] Show loading / error states while inference is running.
- [x] Display model outputs in the simulate cards.
- [x] Fix infinite re-render bug (useRef for callback + remove from deps).
- [x] Centralize API calls through `utils/api.js`.
- [x] Separate "Current Values" (slider inputs) from "ML Models" (predictions).

## Tests
- [x] Inference `/predict` smoke tests (6 tests, pytest).
- [x] Backend `/simulate` contract tests (6 tests, node).

## Documentation
- [x] README with architecture, quick start, test commands, and API contract.
- [x] Updated checklist.

## Follow-up (Recommended next pass)
- [ ] Replace generic pollutant ratios with per-location or per-season ratios.
- [ ] Add backend schema validation library (e.g., zod).
- [ ] Add integration tests for full frontend → backend → inference flow.
- [ ] Wire heatmap layers to model predictions instead of hardcoded points.
- [ ] Add top-level run scripts (docker-compose or similar).
