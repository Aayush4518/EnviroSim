const axios = require("axios");

let lastCallTime = 0;

function getConfiguredMlUrl() {
  return (
    process.env.PY_INFERENCE_URL ||
    process.env.ML_URL ||
    "http://127.0.0.1:8000"
  );
}

function getInferenceUrls() {
  const normalized =
    getConfiguredMlUrl()
      .replace(/\/+$/, "")
      .replace(/\/docs$/, "")
      .replace(/\/openapi\.json$/, "");

  const candidates = [];

  if (/\/predict$/i.test(normalized)) {
    candidates.push(normalized);
    candidates.push(`${normalized}/`);
  } else {
    candidates.push(normalized);
    candidates.push(`${normalized}/predict`);
    candidates.push(`${normalized}/predict/`);
  }

  return [...new Set(candidates)];
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
    const inferenceUrls = getInferenceUrls();
    let lastError;

    for (const inferenceUrl of inferenceUrls) {
      try {
        console.log("Calling ML:", inferenceUrl);
        const response = await axios.post(inferenceUrl, req.body, {
          timeout: 30000,
        });
        return res.json(response.data);
      } catch (err) {
        lastError = err;
        if (err.response?.status !== 404) {
          throw err;
        }
      }
    }

    throw lastError || new Error("No valid ML endpoint resolved");
  } catch (err) {
    const upstreamStatus = err.response?.status;
    console.log("ML error:", err.response?.data || err.message);

    return res.status(upstreamStatus ? 502 : 500).json({
      error: "ML service error",
      inferenceUrl: getInferenceUrls()[0],
      details: err.response?.data || err.message,
    });
  }
};

module.exports = { simulateController };
