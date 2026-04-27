const axios = require("axios");

// 🔥 Use env variable (set this in Render)
const ML_URL = process.env.ML_URL;

const simulateController = async (req, res) => {
  const { rainfall, pollution, vegetation, temperature } = req.body;

  try {
    const response = await axios.post(`${ML_URL}/predict`, {
      rainfall,
      pollution,
      vegetation,
      temperature,
      month: 1, // you can make this dynamic later
    });

    // ✅ Send ML response back to frontend
    res.json(response.data);

  } catch (error) {
    console.error("❌ ML ERROR:", error.message);

    // If ML gives response error
    if (error.response) {
      return res.status(500).json({
        error: "ML service error",
        details: error.response.data,
      });
    }

    // If request failed (network etc)
    res.status(500).json({
      error: "Failed to connect to ML service",
    });
  }
};

module.exports = { simulateController };