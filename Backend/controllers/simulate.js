const axios = require("axios");

function getConfiguredMlUrl() {
  return (
    process.env.PY_INFERENCE_URL ||
    process.env.ML_URL ||
    "http://127.0.0.1:8000"
  );
}

function getInferenceUrls() {
  const normalized = getConfiguredMlUrl()
    .replace(/\/+$/, "")
    .replace(/\/docs$/, "")
    .replace(/\/openapi\.json$/, "");

  return [normalized];
}

const simulateController = async (req, res) => {
  try {
    const inferenceUrls = getInferenceUrls();
    let lastError;

    for (const inferenceUrl of inferenceUrls) {
      try { //comment 
        const endpoint = `${process.env.ML_URL}/predict`;
        console.log("FINAL ML URL:", endpoint);
        console.log("Calling ML at:", endpoint);
        const response = await axios.post(endpoint, req.body, {
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
