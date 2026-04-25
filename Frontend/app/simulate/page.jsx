"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map';
import EnvironmentControls from '@/app/components/ui/environment-controls';
import { Navbar } from '@/app/components/ui/mini-navbar';
import { simulate } from '@/app/utils/api';

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
  const [scenarioState, setScenarioState] = useState({
    loading: false,
    error: "",
    activeId: null,
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
  const formatScore = (value) => (typeof value === "number" ? `${Math.round(value)}%` : "--");
  const getBand = (score) => {
    if (typeof score !== "number") return "Waiting";
    if (score >= 75) return "Critical";
    if (score >= 55) return "High";
    if (score >= 35) return "Moderate";
    return "Low";
  };
  const getRiskTone = (score) => {
    if (typeof score !== "number") return "text-slate-300 border-slate-700 bg-slate-800/60";
    if (score >= 75) return "text-red-200 border-red-400/30 bg-red-500/10";
    if (score >= 55) return "text-orange-200 border-orange-400/30 bg-orange-500/10";
    if (score >= 35) return "text-yellow-200 border-yellow-400/30 bg-yellow-500/10";
    return "text-green-200 border-green-400/30 bg-green-500/10";
  };

  const wowScenarios = [
    {
      id: "ten-day-rain",
      title: "What if it rained for 10 days straight?",
      shortTitle: "10-Day Rain",
      description: "Heavy monsoon stress test for flood pressure.",
      values: { temperature: 24, pollution: 40, rainfall: 500, vegetation: 55, month: 7 },
    },
    {
      id: "heat-wave",
      title: "What if a heat wave hit the area?",
      shortTitle: "Heat Wave",
      description: "High-temperature scenario for heat-stress response.",
      values: { temperature: 42, pollution: 85, rainfall: 5, vegetation: 32, month: 4 },
    },
    {
      id: "traffic-smog",
      title: "What if traffic pollution doubled?",
      shortTitle: "Traffic Smog",
      description: "Pollution spike with warm, low-rain conditions.",
      values: { temperature: 33, pollution: 180, rainfall: 12, vegetation: 38, month: 2 },
    },
    {
      id: "green-corridor",
      title: "What if vegetation improved across the block?",
      shortTitle: "Green Cover",
      description: "More tree cover with moderate weather inputs.",
      values: { temperature: 28, pollution: 45, rainfall: 35, vegetation: 90, month: 8 },
    },
    {
      id: "builder-clears-vegetation",
      title: "What if a builder removed most plants from this area?",
      shortTitle: "Vegetation Loss",
      description: "Construction-style green-cover loss with warmer local conditions.",
      values: { temperature: 36, pollution: 110, rainfall: 25, vegetation: 12, month: 5 },
    },
    {
      id: "drain-blocked",
      title: "What if storm drains were blocked during rain?",
      shortTitle: "Blocked Drains",
      description: "Rainfall stress with higher flood sensitivity for low-lying streets.",
      values: { temperature: 26, pollution: 55, rainfall: 340, vegetation: 42, month: 7 },
    },
    {
      id: "festival-traffic",
      title: "What if festival traffic packed the roads?",
      shortTitle: "Traffic Surge",
      description: "Short-term emissions spike with stagnant warm weather.",
      values: { temperature: 34, pollution: 240, rainfall: 0, vegetation: 45, month: 10 },
    },
    {
      id: "cool-rainy-green",
      title: "What if rain returned and vegetation stayed healthy?",
      shortTitle: "Recovery Day",
      description: "A lower-stress recovery scenario with cooler, greener conditions.",
      values: { temperature: 25, pollution: 25, rainfall: 70, vegetation: 88, month: 8 },
    },
  ];

  const activeScenario = wowScenarios.find((scenario) => scenario.id === scenarioState.activeId);
  const scenarioPrediction = scenarioState.data?.prediction;
  const scenarioRisk = scenarioPrediction?.environmental_risk;

  const runWowScenario = async (scenario) => {
    if (scenarioState.activeId === scenario.id) {
      setScenarioState({
        loading: false,
        error: "",
        activeId: null,
        data: null,
      });
      return;
    }

    setScenarioState({
      loading: true,
      error: "",
      activeId: scenario.id,
      data: scenarioState.data,
    });
    setEnvironmentValues({
      temperature: scenario.values.temperature,
      pollution: scenario.values.pollution,
      rainfall: scenario.values.rainfall,
      vegetation: scenario.values.vegetation,
    });
    setPredictionState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const data = await simulate(scenario.values);
      setScenarioState({
        loading: false,
        error: "",
        activeId: scenario.id,
        data,
      });
      setPredictionState({
        loading: false,
        error: "",
        data,
      });
    } catch (err) {
      const message = err?.message || "Failed to run scenario";
      setScenarioState({
        loading: false,
        error: message,
        activeId: scenario.id,
        data: null,
      });
      setPredictionState((prev) => ({ ...prev, loading: false, error: message }));
    }
  };

  const modelCards = [
    {
      title: "Flood Model",
      icon: "🌊",
      border: "border-blue-500/20 hover:border-blue-400/60",
      glow: "group-hover:shadow-blue-500/10",
      chip: "bg-blue-500/10 text-blue-200 border-blue-400/20",
      value: typeof floodProb === "number" ? `${Math.round(floodProb * 100)}%` : "--",
      label: "Upcoming heavy-rain probability",
      score: envRisk?.flood_risk_score,
      accent: "text-blue-300",
      bar: "from-blue-500 to-cyan-400",
      track: "bg-blue-950/50",
      input: `${environmentValues.rainfall.toFixed(0)} mm rainfall`,
      note:
        typeof envRisk?.flood_risk_score === "number"
          ? `${envRisk.flood_risk_score >= 55 ? "Higher" : envRisk.flood_risk_score >= 35 ? "Moderate" : "Lower"} flood pressure around the selected map area.`
          : "Waiting for rainfall model output.",
    },
    {
      title: "Pollution Model",
      icon: "💨",
      border: "border-orange-500/20 hover:border-orange-400/60",
      glow: "group-hover:shadow-orange-500/10",
      chip: "bg-orange-500/10 text-orange-200 border-orange-400/20",
      value: typeof predictedPM25 === "number" ? `${predictedPM25} µg/m³` : "--",
      label: "Predicted PM2.5 next day",
      score: envRisk?.air_quality_risk_score,
      accent: "text-orange-300",
      bar: "from-orange-500 to-red-500",
      track: "bg-orange-950/40",
      input: `${environmentValues.pollution.toFixed(0)} µg/m³ slider`,
      note:
        typeof envRisk?.air_quality_risk_score === "number"
          ? `${envRisk.air_quality_risk_score >= 55 ? "Poorer" : envRisk.air_quality_risk_score >= 35 ? "Elevated" : "Lower"} air-quality risk for nearby streets.`
          : "Waiting for pollution model output.",
    },
    {
      title: "Temperature Model",
      icon: "🌡️",
      border: "border-red-500/20 hover:border-red-400/60",
      glow: "group-hover:shadow-red-500/10",
      chip: "bg-red-500/10 text-red-200 border-red-400/20",
      value: typeof predictedTemp === "number" ? `${predictedTemp}°C` : "--",
      label: "Predicted max temp next day",
      score: envRisk?.heat_stress_risk_score,
      accent: "text-red-300",
      bar: "from-red-500 to-pink-500",
      track: "bg-red-950/40",
      input: `${environmentValues.temperature.toFixed(0)}°C slider`,
      note:
        typeof envRisk?.heat_stress_risk_score === "number"
          ? `${envRisk.heat_stress_risk_score >= 55 ? "High" : envRisk.heat_stress_risk_score >= 35 ? "Moderate" : "Low"} heat-stress signal in this area.`
          : "Waiting for temperature model output.",
    },
  ];

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
              <Map
                predictionData={predictionState.data}
                predictionLoading={predictionState.loading}
              />
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

        {/* Bottom Section - Live Model Area Cards */}
        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Model Insights</p>
              <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">Area Risk Breakdown</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Each model updates from the current sliders and explains how it contributes to the selected area risk.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3">
              <div>
                <p className="text-xs text-slate-400">Combined</p>
                <p className="text-sm font-semibold text-slate-200">{riskLabel}</p>
              </div>
              <div className="text-xl font-bold text-white">{combinedRisk}%</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {modelCards.map((card) => {
              const score = typeof card.score === "number" ? Math.round(card.score) : 0;
              const band = getBand(card.score);

              return (
                <article
                  key={card.title}
                  className={`group flex min-h-[236px] flex-col rounded-lg border ${card.border} bg-slate-900/70 p-4 shadow-xl transition-all duration-300 ${card.glow}`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-lg">
                        {card.icon}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-white">{card.title}</h3>
                        <p className="mt-0.5 text-sm leading-5 text-slate-400">{card.label}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${card.chip}`}>
                      {band}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-slate-950/70 p-3">
                      <p className="text-xs font-medium text-slate-400">Prediction</p>
                      <p className={`mt-1 text-lg font-bold leading-7 ${card.accent}`}>{card.value}</p>
                    </div>
                    <div className="rounded-md bg-slate-950/70 p-3">
                      <p className="text-xs font-medium text-slate-400">Risk Score</p>
                      <p className="mt-1 text-lg font-bold leading-7 text-white">{formatScore(card.score)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">Model contribution</span>
                      <span className={card.accent}>{score}%</span>
                    </div>
                    <div className={`h-2 overflow-hidden rounded-full ${card.track}`}>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${card.bar} transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col justify-between gap-3">
                    <p className="text-sm leading-6 text-slate-300">{card.note}</p>
                    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm">
                      <span className="text-slate-400">Scenario input</span>
                      <span className="font-medium text-slate-300">{card.input}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Wow Features</p>
              <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">What If Scenarios</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Tap a preset question to run it through the flood, pollution, and temperature models.
              </p>
            </div>
            {scenarioState.loading && (
              <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-200">
                Running scenario...
              </span>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {wowScenarios.map((scenario) => {
              const isActive = scenarioState.activeId === scenario.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => runWowScenario(scenario)}
                  className={`cursor-pointer rounded-lg border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-cyan-400/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                      : "border-slate-800 bg-slate-900/70 hover:border-slate-600 hover:bg-slate-900"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{scenario.shortTitle}</span>
                    <span className="text-xs text-slate-500">{isActive ? "Clear" : "Run"}</span>
                  </div>
                  <p className="text-sm font-medium leading-5 text-slate-200">{scenario.title}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-400">{scenario.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {activeScenario ? activeScenario.title : "Choose a scenario to see model stats"}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {activeScenario
                    ? "Preset values are applied to the dashboard and evaluated by the ML service."
                    : "The output will show combined risk plus flood, PM2.5, and temperature predictions."}
                </p>
              </div>
              <div className={`w-fit rounded-full border px-3 py-1 text-sm font-semibold ${getRiskTone(scenarioRisk?.combined_risk_score)}`}>
                {scenarioRisk ? `${scenarioRisk.combined_risk_label} · ${Math.round(scenarioRisk.combined_risk_score)}%` : "No scenario yet"}
              </div>
            </div>

            {scenarioState.error && (
              <p className="mt-3 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {scenarioState.error}
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-slate-950/70 p-3">
                <p className="text-sm text-slate-400">Flood probability</p>
                <p className="mt-1 text-lg font-bold text-blue-300">
                  {typeof scenarioPrediction?.flood_risk_probability === "number"
                    ? `${Math.round(scenarioPrediction.flood_risk_probability * 100)}%`
                    : "--"}
                </p>
              </div>
              <div className="rounded-md bg-slate-950/70 p-3">
                <p className="text-sm text-slate-400">PM2.5 next day</p>
                <p className="mt-1 text-lg font-bold text-orange-300">
                  {typeof scenarioPrediction?.predicted_pm25_next_day === "number"
                    ? `${scenarioPrediction.predicted_pm25_next_day} µg/m³`
                    : "--"}
                </p>
              </div>
              <div className="rounded-md bg-slate-950/70 p-3">
                <p className="text-sm text-slate-400">Max temp next day</p>
                <p className="mt-1 text-lg font-bold text-red-300">
                  {typeof scenarioPrediction?.predicted_temp_max_next_day === "number"
                    ? `${scenarioPrediction.predicted_temp_max_next_day}°C`
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Simulate;
