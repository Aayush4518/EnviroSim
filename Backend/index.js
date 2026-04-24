const express = require('express');
const cors = require('cors');
const { runSimulation } = require('../Data/simulation');

const app = express();

app.use(cors())
app.use(express.json())

//ROUTES

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EnviroSim backend is running',
    routes: ['POST /simulate'],
  });
});

app.post('/simulate', (req, res) => {
  console.log('🔥 HIT BACKEND');
  console.log('Incoming:', req.body);

  const { rainfall = 0, pollution = 0, vegetation = 0 } = req.body;
  const result = runSimulation({ rainfall, pollution, vegetation });

  console.log('Simulated result:', result);
  res.json(result);
});

app.listen(6969, ()=>{
    console.log('Backend running on http://localhost:6969');
})
