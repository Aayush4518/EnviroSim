# EnviroSim ML Integration Summary

This document summarizes all the work completed to integrate the real pre-trained machine learning models (Flood, Pollution, Temperature) into the EnviroSim simulation environment, transitioning from a mock-simulation architecture to a robust, real-time ML-driven inference engine.

## 1. Architectural Changes
Implemented a three-tier architecture with zero mock/synthetic inference behavior:
*   **Next.js Frontend**: Provides the interactive UI (sliders, map, real-time metrics).
*   **Node.js Proxy Backend**: Serves as the API gateway, handling validation and proxying.
*   **Python FastAPI Inference Service**: Houses the loaded ML models and executes predictions based on historical dataset context and user inputs.

## 2. Python Inference Service (`InferenceService/app.py`)
*   **Endpoint Creation**: Created `/predict` and `/health` endpoints.
*   **Model Loading**: Configured the service to load all three Scikit-Learn `.joblib` models into memory at startup.
*   **Real Historical Context**: Removed all synthetic/hardcoded lag generation. The service now dynamically reads the last 14 rows of the actual `merged-data.csv` dataset.
*   **Feature Construction**: Treats the user's slider input as "Lag 1" (hypothetical yesterday) while using the real dataset tail for Lag 2–14, creating a grounded "What-If" scenario.
*   **Scientifically-Grounded Risk Scoring**: Replaced arbitrary UI risk formulas with a scientifically-grounded combined risk score computed server-side. It uses:
    *   **EPA AQI breakpoints** to evaluate PM2.5 risk.
    *   **IMD Bangalore heat-wave thresholds** to evaluate temperature risk.
    *   **Flood Model Probability** directly from the Random Forest classifier.

## 3. Node.js Backend (`Backend/controllers/simulate.js`)
*   **Input Validation**: Implemented strict server-side validation ensuring inputs (temperature, pollution, rainfall, vegetation) fall within realistic, acceptable ranges.
*   **Proxy Configuration**: Set up robust proxy communication to the Python service using `AbortController` to handle timeouts and proper error code propagation (400, 502, 503).
*   **Contract Standardization**: Standardized the JSON payload request/response schema between the frontend and backend.

## 4. Frontend Fixes and UI Polish
*   **Infinite Re-render Fix**: Resolved a critical infinite re-render loop in `Frontend/app/components/ui/environment-controls.tsx`. Fixed stale closures and React 19 "setState during render" errors by using functional state updates, `useRef` for callback identities, and isolating parent notifications in a dedicated `useEffect`.
*   **Slider Persistence Fix**: Fixed an issue where the frontend "Risk Level" would snap back to a default value after moving a slider. Data is now properly preserved during the `loading` state transition.
*   **UI Mapping**: Updated the simulate page (`Frontend/app/simulate/page.jsx`) to consume and display:
    *   The new combined, ML-grounded Risk Level percentage and label.
    *   Individual raw model predictions (Flood Probability, PM2.5 Next Day, Max Temp Next Day).
    *   A detailed breakdown of the risk score percentages for full transparency.

## 5. Automated Testing
*   **Inference Smoke Tests (`InferenceService/test_inference.py`)**: Wrote 6 `pytest` tests validating health checks, default predictions, extreme value handling, input echoing, and Pydantic validation rejection.
*   **Backend Contract Tests (`Backend/test_simulate.js`)**: Wrote 6 Node.js tests verifying proxy communication, schema adherence, and edge-case handling.
*   **Status**: All 12/12 tests passing.

## 6. How to Run the Project
To run the full end-to-end application, start these three services in separate terminals in this specific order:

1.  **Python Inference Service**:
    ```bash
    cd InferenceService
    pip install -r requirements.txt
    python3 -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
    ```
2.  **Node Backend**:
    ```bash
    cd Backend
    npm install
    PY_INFERENCE_URL=http://127.0.0.1:8000 npm run dev
    ```
3.  **Frontend**:
    ```bash
    cd Frontend
    npm install
    npm run dev
    ```
Visit `http://localhost:3000/simulate` to interact with the live models.
