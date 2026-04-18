const express = require('express');
const cors = require('cors'); //for cross-origin resource sharing which means allowing the frontend to access the backend

const app = express();

app.use(cors())
app.use(express.json()) //to parse the incoming request body as JSON

//ROUTES

app.post("/simulate", (req, res) => {
    const { rainfall, pollution, vegetation } = req.body;

    let floodRisk = "low";
    let heatLevel = "low"
    let aqi = "good"            //50 rakh sakta tha lekin chool max hai

    if (rainfall > 70) floodRisk = "high";
    if (vegetation < 30) heatLevel = "high";
    if (pollution > 60) airQuality = "poor";            //change logic later

    res.json({floodRisk, heatLevel, aqi})

})

app.listen(6969, ()=>{
    console.log("Backend running on http://localhost:6969");
})