const { runSimulation } = require('../Data/simulation'); // Import the runSimulation function from the simulation module

function simulateController(req, res) {
  console.log("🔥 HIT BACKEND");
  console.log("Incoming:", req.body);

  const { rainfall = 0, pollution = 0, vegetation = 0 } = req.body;
  const result = runSimulation({ rainfall, pollution, vegetation });

  console.log("Simulated result:", result);
  res.json(result);
}

module.exports = { simulateController } // Export the simulateController function for use in other parts of the application