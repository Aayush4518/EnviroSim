const express = require("express");
const cors = require("cors");
const { simulateController } = require("./controllers/simulate");

const app = express();

const cors = require("cors");

app.use(cors({
  origin: "https://enviro-sim.vercel.app", // allow all 
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.post("/simulate", simulateController);

const PORT = process.env.PORT || 6969;

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`🚀 Backend running on port ${PORT}`); //hey
});
=======
  console.log(`🚀 Backend running on port ${PORT}`);
});
>>>>>>> 1830e99 (Enhance CORS settings in index.js)
