function runSimulation({rainfall, pollution, vegetation}){
    // Simulate the effects of rainfall, pollution, and vegetation on the environment

    let floodRisk = rainfall > 100 ? "High" : "Low";
    let airQuality = pollution > 50 ? "Poor" : "Good";
    let heatLevel = vegetation > 30 ? "Cool" : "Hot";

    return {
        floodRisk,
        airQuality,
        heatLevel
    };
}
module.exports= {runSimulation}
