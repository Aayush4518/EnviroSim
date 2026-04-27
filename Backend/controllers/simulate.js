const axios = require("axios");

const ML_URL = "https://envirosim.onrender.com";
let lastCallTime = 0;

const simulateController = async (req, res) => {
  const now = Date.now();

  if (now - lastCallTime < 1000) {
    return res.status(429).json({
      error: "Too many requests, slow down",
    });
  }

  lastCallTime = now;

  try {
    const response = await axios.post(`${ML_URL}/predict`, req.body);
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({
      error: "ML service error",
      details: err.response?.data || err.message,
    });
  }
};

module.exports = { simulateController };
