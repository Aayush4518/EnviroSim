/**
 * Simulate controller — validates frontend input, proxies to Python inference.
 *
 * Request contract (POST /simulate):
 *   { temperature: number, pollution: number, rainfall: number, vegetation: number, month?: number }
 *
 * Response contract:
 *   { status, source, input, prediction: { flood_risk_probability, predicted_pm25_next_day, predicted_temp_max_next_day, ... } }
 */

const INFERENCE_URL = process.env.PY_INFERENCE_URL || "http://127.0.0.1:8000";

// ---- Input validation ----

function validateNumber(val, name, min, max, fallback) {
  const n = Number(val ?? fallback);
  if (!Number.isFinite(n)) return { error: `${name} must be a finite number` };
  if (n < min || n > max) return { error: `${name} must be between ${min} and ${max}` };
  return { value: n };
}

function normalizeAndValidate(body = {}) {
  const checks = [
    validateNumber(body.temperature, "temperature", -10, 65, 25),
    validateNumber(body.pollution, "pollution", 0, 600, 30),
    validateNumber(body.rainfall, "rainfall", 0, 1000, 45),
    validateNumber(body.vegetation, "vegetation", 0, 100, 60),
    validateNumber(body.month, "month", 1, 12, new Date().getMonth() + 1),
  ];

  const errors = checks.filter((c) => c.error).map((c) => c.error);
  if (errors.length > 0) return { errors };

  return {
    payload: {
      temperature: checks[0].value,
      pollution: checks[1].value,
      rainfall: checks[2].value,
      vegetation: checks[3].value,
      month: Math.round(checks[4].value),
    },
  };
}

// ---- Controller ----

async function simulateController(req, res) {
  const { errors, payload } = normalizeAndValidate(req.body);

  if (errors) {
    return res.status(400).json({ status: "error", message: "Validation failed", errors });
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 10_000);

  try {
    const response = await fetch(`${INFERENCE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({
        status: "error",
        message: "Inference service returned an error",
        details: text,
      });
    }

    const inference = await response.json();
    return res.json({
      status: "ok",
      source: "ml-inference",
      input: payload,
      prediction: inference,
    });
  } catch (error) {
    const isAbort = error && error.name === "AbortError";
    return res.status(503).json({
      status: "error",
      message: isAbort ? "Inference request timed out" : "Failed to reach inference service",
      details: String(error),
      inference_url: INFERENCE_URL,
    });
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { simulateController };