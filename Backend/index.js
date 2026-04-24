const express = require('express');
const cors = require('cors');
const { simulateController } = require('./controllers/simulate');

const app = express();
const PORT = Number(process.env.PORT || 6969);

app.use(cors())
app.use(express.json())

//ROUTES

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EnviroSim backend is running',
    routes: ['GET /', 'GET /health', 'POST /simulate'],
    inference_url: process.env.PY_INFERENCE_URL || 'http://127.0.0.1:8000',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/simulate', simulateController);

app.listen(PORT, ()=>{
    console.log(`Backend running on http://localhost:${PORT}`);
});
