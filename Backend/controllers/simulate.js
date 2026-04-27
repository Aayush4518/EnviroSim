const axios = require("axios");

let lastCallTime = 0;

function getInferenceUrl() {
  const configuredUrl =
    process.env.PY_INFERENCE_URL ||
    process.env.ML_URL ||
    "http://127.0.0.1:8000";

  const normalized = configuredUrl.replace(/\/+$/, "");
  return normalized.endsWith("/predict")
    ? normalized
    : `${normalized}/predict`;
}

const simulateController = async (req, res) => {
  const now = Date.now();

  if (now - lastCallTime < 1000) {
    return res.status(429).json({
      error: "Too many requests, slow down",
    });
  }

  lastCallTime = now;

  try {
    const inferenceUrl = getInferenceUrl();
    const response = await axios.post(inferenceUrl, req.body, {
      timeout: 30000,
    });
    return res.json(response.data);
  } catch (err) {
    const inferenceUrl = getInferenceUrl();
    const upstreamStatus = err.response?.status;

    return res.status(upstreamStatus ? 502 : 500).json({
      error: "ML service error",
      inferenceUrl,
      details: err.response?.data || err.message,
    });
  }
};

module.exports = { simulateController };
