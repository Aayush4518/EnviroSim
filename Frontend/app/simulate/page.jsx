"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map';
import EnvironmentControls from '@/app/components/ui/environment-controls';
import { Navbar } from '@/app/components/ui/mini-navbar';

const Simulate = () => {
  const [environmentValues, setEnvironmentValues] = useState({
    temperature: 25,
    pollution: 30,
    rainfall: 45,
    vegetation: 60,
  });
  const [predictionState, setPredictionState] = useState({
    loading: false,
    error: "",
    data: null,
  });

  const [stars, setStars] = useState([]);

  // Generate stars only on client side
  useEffect(() => {
    const generatedStars = Array.from({ length: 250 }).map((_, i) => {
      const floatClass = ['star-float', 'star-float-2', 'star-float-3'][i % 3];
      const isBrightStar = Math.random() > 0.85;
      const starSize = isBrightStar ? Math.random() * 1.5 + 1.5 : Math.random() * 2 + 0.5;
      
      return {
        id: i,
        floatClass,
        isBrightStar,
        starSize,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: isBrightStar ? Math.random() * 0.3 + 0.7 : Math.random() * 0.6 + 0.2,
        duration: Math.random() * 8 + 12,
        delay: Math.random() * 15,
      };
    });
    setStars(generatedStars);
  }, []);

  const handleEnvironmentChange = useCallback((values) => {
    const scaledValues = {
      temperature: (values.temperature / 360) * 50,
      pollution: (values.pollution / 360) * 100,
      rainfall: (values.rainfall / 360) * 360,
      vegetation: (values.vegetation / 360) * 100,
    };
    setEnvironmentValues(scaledValues);
  }, []);

  // Extract ML prediction values
  const floodProb = predictionState.data?.prediction?.flood_risk_probability;
  const predictedPM25 = predictionState.data?.prediction?.predicted_pm25_next_day;
  const predictedTemp = predictionState.data?.prediction?.predicted_temp_max_next_day;

  // Environmental risk score — computed server-side from ML model outputs
  // Uses EPA AQI breakpoints for PM2.5 + IMD Bangalore thresholds for temperature
  const envRisk = predictionState.data?.prediction?.environmental_risk;
  const combinedRisk = Math.round(envRisk?.combined_risk_score ?? 0);
  const riskLabel = envRisk?.combined_risk_label ?? "Loading...";

  return (
    <main className="min-h-screen bg-black text-white transition-colors duration-300 overflow-hidden">
      <Navbar />

      {/* Starry Night Background with Nebula Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient background with nebula colors */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-black to-blue-950"></div>
        
        {/* Nebula glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl"></div>
        
        {/* Stars */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`absolute rounded-full bg-white animate-twinkle ${star.floatClass}`}
              style={{
                width: star.starSize + 'px',
                height: star.starSize + 'px',
                left: star.left + '%',
                top: star.top + '%',
                opacity: star.opacity,
                animationDuration: star.duration + 's',
                animationDelay: star.delay + 's',
                boxShadow: star.isBrightStar ? '0 0 4px rgba(255, 255, 255, 0.6)' : 'none',
                filter: star.isBrightStar ? 'brightness(1.2)' : 'brightness(1)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-28 sm:px-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Environmental Simulator
          </h1>
          <p className="text-sm md:text-base text-gray-400">Real-time visualization of environmental impact</p>
        </div>

        {/* Main Grid Layout */}
        <div className="space-y-6">
          {/* Map Section - Full Width */}
          <div className="h-[700px] rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl hover:border-slate-700 transition-all duration-300 overflow-hidden">
            <div className="flex items-center gap-2 p-4 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
              <span className="text-xl">🗺️</span>
              <h2 className="text-sm font-bold text-white">Interactive Map</h2>
              <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/50">Live</span>
            </div>
            <div className="h-[calc(700px-57px)] w-full">
              <Map />
            </div>
          </div>

          {/* Controls Section - Horizontal Below Map */}
          <div className="space-y-4">
            {/* Environment Controls with Sliders */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-4 shadow-2xl">
              <EnvironmentControls
                onValuesChange={handleEnvironmentChange}
                onPredictionChange={({ loading, error, data }) => {
                  setPredictionState((prev) => ({
                    loading,
                    error: error || "",
                    data: data !== undefined ? data : prev.data,
                  }));
                }}
                layout="horizontal"
              />
            </div>

            {/* Stats & Risk Below Controls */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Risk Score Card */}
              <div className={`rounded-xl border border-gradient bg-gradient-to-br ${
                combinedRisk < 25 ? 'from-green-500 to-emerald-500' :
                combinedRisk < 50 ? 'from-yellow-500 to-amber-500' :
                combinedRisk < 75 ? 'from-orange-500 to-red-500' :
                'from-red-600 to-red-800'
              } p-0.5 shadow-2xl`}>
                <div className="rounded-xl bg-slate-950 p-4 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🎯</span>
                    <h2 className="text-sm font-bold text-white">Risk Level</h2>
                  </div>
                  <div className="text-4xl font-bold mb-1 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
                    {combinedRisk}%
                  </div>
                  <p className={`text-xs font-semibold ${
                    combinedRisk < 20 ? 'text-green-400' :
                    combinedRisk < 40 ? 'text-yellow-400' :
                    combinedRisk < 60 ? 'text-orange-400' :
                    combinedRisk < 80 ? 'text-red-400' : 'text-red-500'
                  }`}>
                    {riskLabel}
                  </p>
                  <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${
                        combinedRisk < 25 ? 'from-green-500 to-emerald-500' :
                        combinedRisk < 50 ? 'from-yellow-500 to-amber-500' :
                        combinedRisk < 75 ? 'from-orange-500 to-red-500' :
                        'from-red-600 to-red-800'
                      } transition-all duration-500`}
                      style={{ width: `${combinedRisk}%` }}
                    ></div>
                  </div>
                  {predictionState.loading && (
                    <p className="mt-2 text-[10px] text-blue-300">Fetching latest model prediction...</p>
                  )}
                  {predictionState.error && (
                    <p className="mt-2 text-[10px] text-red-300">{predictionState.error}</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-4 space-y-2">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <span>📊</span> Current Values
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Temperature</span>
                    <span className="font-semibold text-blue-400">
                      {environmentValues.temperature.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pollution</span>
                    <span className="font-semibold text-orange-400">
                      {environmentValues.pollution.toFixed(1)} µg/m³
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Rainfall</span>
                    <span className="font-semibold text-cyan-400">{environmentValues.rainfall.toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Vegetation</span>
                    <span className="font-semibold text-green-400">{environmentValues.vegetation.toFixed(1)} %</span>
                  </div>
                </div>
              </div>

              {/* Models Summary */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-4 space-y-2">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm mb-2">
                  <span>🧠</span> ML Predictions
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1"><span>🌊</span> Flood Probability</span>
                    <span className="font-semibold text-blue-400">{typeof floodProb === "number" ? Math.round(floodProb * 100) : "--"}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1"><span>💨</span> PM2.5 Next Day</span>
                    <span className={`font-semibold ${(predictedPM25 ?? 0) > 150 ? 'text-red-400' : (predictedPM25 ?? 0) > 55 ? 'text-orange-400' : 'text-green-400'}`}>
                      {predictedPM25 ?? "--"} µg/m³
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1"><span>🌡️</span> Max Temp Next Day</span>
                    <span className={`font-semibold ${(predictedTemp ?? 0) > 37 ? 'text-red-400' : (predictedTemp ?? 0) > 33 ? 'text-orange-400' : 'text-green-400'}`}>
                      {predictedTemp ?? "--"}°C
                    </span>
                  </div>
                  {envRisk && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <p className="text-[10px] text-gray-500 mb-1">Risk breakdown (EPA + IMD thresholds):</p>
                      <div className="flex gap-2 text-[10px]">
                        <span className="text-blue-300">🌊 {envRisk.flood_risk_score}%</span>
                        <span className="text-orange-300">💨 {envRisk.air_quality_risk_score}%</span>
                        <span className="text-red-300">🌡️ {envRisk.heat_stress_risk_score}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Model Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-4 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🌊</div>
            <h3 className="font-bold text-white text-xs mb-1">Flood Model</h3>
            <p className="text-xs text-gray-400">Rainfall & terrain analysis</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-4 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💨</div>
            <h3 className="font-bold text-white text-xs mb-1">Pollution Model</h3>
            <p className="text-xs text-gray-400">Air quality impact</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-4 hover:border-red-500/50 transition-all duration-300 group cursor-pointer">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🌡️</div>
            <h3 className="font-bold text-white text-xs mb-1">Temperature Model</h3>
            <p className="text-xs text-gray-400">Thermal stress evaluation</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Simulate;
