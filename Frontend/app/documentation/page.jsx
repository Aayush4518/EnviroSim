"use client";

import React, { useState } from 'react';
import { Navbar } from "@/app/components/ui/mini-navbar";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ml', label: 'ML Models' },
    { id: 'backend', label: 'Backend API' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'legal', label: 'Legal' }
  ];

  return (
    <main className="min-h-screen mt-10 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
        <div className="mb-12 rounded-3xl border border-slate-200 bg-slate-50/80 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            EnviroSim Guide
          </p>
          <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Complete Documentation</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Comprehensive guide covering ML models, backend APIs, frontend architecture, and everything you need to use, integrate with, or contribute to EnviroSim.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* OVERVIEW SECTION */}
          {activeTab === 'overview' && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <p>
                    EnviroSim is a comprehensive environmental risk monitoring and prediction platform for Bangalore. It combines machine learning models with interactive visualization to help users understand environmental risks across 26+ neighborhoods.
                  </p>
                  <p>
                    The platform processes real-time environmental data and generates predictions for:
                  </p>
                  <ul className="ml-5 space-y-2 list-disc">
                    <li><strong>Air Pollution (PM2.5)</strong> - Next-day air quality predictions</li>
                    <li><strong>Flood Risk Probability</strong> - Flood likelihood based on rainfall and area topology</li>
                    <li><strong>Temperature Predictions</strong> - Heat stress index forecasts</li>
                  </ul>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">System Architecture</h2>
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">EnviroSim consists of three main components working in harmony:</p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-800 dark:text-slate-200">
{`Frontend (Next.js :3000)
    ↓
Backend (Express :6969)
    ↓
InferenceService (FastAPI :8000)
    ↓
ML Models + Real Data`}
                    </pre>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Frontend</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Next.js React app with interactive maps and controls for scenario simulation</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Backend</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Express server for validation, routing, and API gateway between frontend and inference</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Inference</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">FastAPI service running ML models for real-time predictions</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Getting Started</h2>
                <div className="space-y-3 text-slate-700 dark:text-slate-300">
                  <p><strong>For Users:</strong></p>
                  <ol className="ml-5 list-decimal space-y-2">
                    <li>Visit the Dashboard to view current environmental risks across Bangalore</li>
                    <li>Use the Simulation tool to test what-if scenarios</li>
                    <li>Adjust pollution, rainfall, temperature, and vegetation levels</li>
                    <li>View risk predictions on the interactive heatmap</li>
                    <li>Compare scenarios to understand environmental impacts</li>
                  </ol>
                </div>
              </section>
            </>
          )}

          {/* ML MODELS SECTION */}
          {activeTab === 'ml' && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Machine Learning Models</h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <p>EnviroSim uses three specialized ML models for environmental predictions:</p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">1. Pollution Model (PM2.5 Prediction)</h3>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Purpose</h4>
                    <p>Predicts next-day air pollution levels (PM2.5 in µg/m³) based on current environmental conditions.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Input Features</h4>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Temperature (°C)</li>
                      <li>Pollution level (current)</li>
                      <li>Rainfall (mm)</li>
                      <li>Vegetation coverage (%)</li>
                      <li>Month (seasonal factor)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Output</h4>
                    <p><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">predicted_pm25_next_day</code> - PM2.5 concentration forecast</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Model Details</h4>
                    <p>Stored as <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">pollution_model.joblib</code> - Uses ensemble techniques for robust predictions.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">2. Flood Model (Flood Risk Probability)</h3>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Purpose</h4>
                    <p>Calculates flood risk probability (0.0-1.0) for an area based on rainfall and environmental factors.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Input Features</h4>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Rainfall (mm)</li>
                      <li>Temperature (°C)</li>
                      <li>Pollution level</li>
                      <li>Vegetation coverage (%)</li>
                      <li>Month (seasonal patterns)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Output</h4>
                    <p><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">flood_risk_probability</code> - Float between 0 and 1 (0 = no risk, 1 = extreme risk)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Model Details</h4>
                    <p>Stored as <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">flood_model.joblib</code> - Classification model trained on historical flood patterns.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">3. Temperature Model (Heat Stress Prediction)</h3>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Purpose</h4>
                    <p>Predicts maximum temperature for the next day to assess heat stress on infrastructure.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Input Features</h4>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Current temperature (°C)</li>
                      <li>Pollution level</li>
                      <li>Rainfall (mm)</li>
                      <li>Vegetation coverage (%)</li>
                      <li>Month (seasonal variation)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Output</h4>
                    <p><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">predicted_temp_max_next_day</code> - Forecasted maximum temperature in °C</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Model Details</h4>
                    <p>Stored as <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">temperature_model.joblib</code> - Regression model for heat forecasting.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Model Training & Data</h3>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Data Sources</h4>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Historical air quality data for Bangalore</li>
                      <li>Temperature records from weather stations</li>
                      <li>Rainfall data from meteorological databases</li>
                      <li>Historical flood incident records</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Data Cleaning</h4>
                    <p>All raw data is cleaned and standardized. Cleaned datasets are available in <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Data/cleaned-data/</code> directory.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Model Selection</h4>
                    <p>Models are selected based on accuracy, inference time, and interpretability for urban planning applications.</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* BACKEND SECTION */}
          {activeTab === 'backend' && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Backend API Documentation</h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <p>The backend is an Express.js server that validates requests and proxies them to the inference service.</p>
                  <p><strong>Base URL:</strong> <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">http://localhost:6969</code></p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white" id="api">Endpoints</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">POST /simulate</h4>
                    <p className="text-slate-700 dark:text-slate-300 mb-3">Generate environmental predictions for given parameters.</p>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-3 border border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Request Body:</p>
                      <pre className="text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
{`{
  "temperature": 30,
  "pollution": 50,
  "rainfall": 80,
  "vegetation": 40,
  "month": 4
}`}
                      </pre>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-3 border border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Response:</p>
                      <pre className="text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
{`{
  "status": "ok",
  "source": "ml-inference",
  "input": {
    "temperature": 30,
    "pollution": 50,
    "rainfall": 80,
    "vegetation": 40,
    "month": 4
  },
  "prediction": {
    "flood_risk_probability": 0.243,
    "predicted_pm25_next_day": 261.35,
    "predicted_temp_max_next_day": 29.91
  }
}`}
                      </pre>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Parameters:</p>
                      <ul className="ml-5 list-disc space-y-1 text-slate-700 dark:text-slate-300 text-sm">
                        <li><strong>temperature</strong> (number, 0-50): Current temperature in Celsius</li>
                        <li><strong>pollution</strong> (number, 0-500): PM2.5 level in µg/m³</li>
                        <li><strong>rainfall</strong> (number, 0-500): Rainfall in millimeters</li>
                        <li><strong>vegetation</strong> (number, 0-100): Vegetation coverage percentage</li>
                        <li><strong>month</strong> (number, 1-12): Month for seasonal factors</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">GET /health</h4>
                    <p className="text-slate-700 dark:text-slate-300 mb-3">Check backend server health.</p>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Response:</p>
                      <pre className="text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
{`{
  "status": "ok",
  "message": "Backend is running"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Error Handling</h3>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <p>API errors return appropriate HTTP status codes and error messages:</p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Example Error Response:</p>
                    <pre className="text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
{`{
  "status": "error",
  "message": "Invalid input parameters",
  "details": "pollution must be between 0 and 500"
}`}
                    </pre>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Running the Backend</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <pre className="text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
{`cd Backend
npm install
PY_INFERENCE_URL=http://127.0.0.1:8000 npm run dev`}
                  </pre>
                </div>
              </section>
            </>
          )}

          {/* FRONTEND SECTION */}
          {activeTab === 'frontend' && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Frontend Architecture</h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <p>The frontend is built with Next.js and React, providing an interactive interface for environmental monitoring and simulation.</p>
                  <p><strong>Technology Stack:</strong> Next.js, React, TypeScript, Tailwind CSS, Lucide Icons</p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Key Pages</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Landing Page (/)</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Introduction to EnviroSim with interactive globe animation and navigation to main features.</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Dashboard (/home)</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Real-time environmental data visualization with interactive heatmap showing risk levels across neighborhoods.</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Simulation (/simulate)</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Advanced scenario planning tool with sliders to adjust environmental parameters and see predictions in real-time.</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Documentation (/documentation)</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Comprehensive guide covering all systems and APIs.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Key Components</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Map.jsx</code></h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Interactive map component showing Bangalore neighborhoods with risk heatmaps.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Control.jsx</code></h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Control panel with sliders for temperature, pollution, rainfall, and vegetation adjustments.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">globe.tsx</code></h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">3D globe visualization for immersive landing page experience.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">landing-page.tsx</code></h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-1">Scrollable landing page with animated sections and navigation.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">API Integration</h3>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <p>The frontend communicates with the backend via REST API calls defined in <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">utils/api.js</code>:</p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <pre className="text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
{`// Example: Fetch simulation predictions
const response = await fetch('/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    temperature: 30,
    pollution: 50,
    rainfall: 80,
    vegetation: 40,
    month: 4
  })
});
const data = await response.json();`}
                    </pre>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Running the Frontend</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <pre className="text-sm overflow-x-auto text-slate-800 dark:text-slate-200">
{`cd Frontend
npm install
npm run dev

# Frontend runs on http://localhost:3000`}
                  </pre>
                </div>
              </section>
            </>
          )}

          {/* LEGAL SECTION */}
          {activeTab === 'legal' && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70" id="privacy">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Data Collection</h3>
                    <p>
                      EnviroSim collects environmental data to provide predictions and monitoring services. Data collection includes:
                    </p>
                    <ul className="ml-5 list-disc space-y-1 mt-2">
                      <li>Environmental parameters you input into simulation tools</li>
                      <li>Location-based weather and air quality data</li>
                      <li>Usage analytics for platform improvement</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Data Usage</h3>
                    <p>
                      Collected data is used to:
                    </p>
                    <ul className="ml-5 list-disc space-y-1 mt-2">
                      <li>Generate accurate environmental predictions</li>
                      <li>Improve ML models through periodic retraining</li>
                      <li>Provide personalized risk alerts</li>
                      <li>Analyze platform usage trends</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Data Protection</h3>
                    <p>
                      All data is encrypted in transit and at rest. Access to personal data is restricted to authorized personnel only.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Third-Party Sharing</h3>
                    <p>
                      We do not sell personal data to third parties. Aggregated, anonymized data may be used for research and public health initiatives.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70" id="terms">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Terms of Service</h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Acceptable Use</h3>
                    <p>
                      Users agree to use EnviroSim for legitimate environmental monitoring and planning purposes. Prohibited activities include:
                    </p>
                    <ul className="ml-5 list-disc space-y-1 mt-2">
                      <li>Unauthorized access to system resources</li>
                      <li>Reverse engineering or attempting to extract proprietary models</li>
                      <li>Commercial use without authorization</li>
                      <li>Generating misleading forecasts for public dissemination</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Disclaimer</h3>
                    <p>
                      EnviroSim predictions are provided as-is for informational and planning purposes. We do not guarantee absolute accuracy. 
                      Predictions should be validated with professional engineering analysis before making critical infrastructure decisions.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Liability Limitation</h3>
                    <p>
                      EnviroSim is not liable for damages resulting from reliance on predictions, service interruptions, or data loss. 
                      Users assume all responsibility for decisions made using platform data.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Service Availability</h3>
                    <p>
                      We strive for 99.5% uptime but do not guarantee continuous service. Scheduled maintenance and emergencies may cause temporary unavailability.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Attribution & Credits</h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Data Sources</h3>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Bangalore Air Quality Data - Indian Ministry of Environment</li>
                      <li>Weather Data - India Meteorological Department (IMD)</li>
                      <li>Historical Flood Records - Bangalore Municipal Corporation</li>
                      <li>Satellite Vegetation Data - NASA MODIS</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Technology Stack</h3>
                    <p>Built with Next.js, FastAPI, Express.js, and scikit-learn</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Support & Feedback</h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <p>For questions, feedback, or reporting issues, please contact:</p>
                  <p className="font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded">support@envirosim.local</p>
                  <p className="text-sm">We value your input and continuously work to improve EnviroSim.</p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Documentation;
