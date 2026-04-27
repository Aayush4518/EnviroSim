const express = require('express');
const cors = require('cors');
const { simulateController } = require('./controllers/simulate');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Simulate endpoint - routes to controller
app.post("/simulate", simulateController);

app.listen(6969, () => {
  console.log("Backend running on http://localhost:6969");
});