"use client";

import React from 'react';
import Nav from '../components/Navbar';

const Documentation = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Nav />

      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
        <div className="mb-12 rounded-3xl border border-slate-200 bg-slate-50/80 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            EnviroSim Guide
          </p>
          <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Documentation</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            EnviroSim helps teams explore how environmental conditions can affect local infrastructure through an
            interactive simulation interface. This page explains the current workflow, the meaning of each control,
            and how to interpret the results presented in the simulator.
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                The simulator is designed to help users examine the relationship between environmental variables and
                infrastructure stress. It combines a map-based view with adjustable controls so scenario changes can be
                reviewed visually and comparatively.
              </p>
              <p>
                The current experience focuses on rapid experimentation: users can modify environmental inputs, inspect
                the visual response on the map, and review a summarized risk score derived from the selected conditions.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Getting Started</h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>To begin using EnviroSim:</p>
              <ol className="ml-5 list-decimal space-y-2">
                <li>Open the <strong>Simulate</strong> page from the main navigation.</li>
                <li>Adjust the environmental controls to represent the scenario you want to review.</li>
                <li>Observe how the map and summary panels respond to the updated values.</li>
                <li>Use the heatmap options to focus on specific categories of environmental risk.</li>
                <li>Compare multiple scenarios by changing one variable at a time.</li>
              </ol>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Environmental Controls</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Temperature</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Represents ambient heat conditions. Higher temperature values can indicate increased thermal stress on
                  built surfaces, public utilities, and surrounding urban systems.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Pollution</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Reflects relative air-quality pressure. Increased pollution values can be used to explore scenarios
                  involving reduced environmental quality and potential long-term strain on materials and public health.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Rainfall</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Used to simulate changes in precipitation intensity. Higher rainfall values are particularly relevant
                  when reviewing water accumulation, drainage sensitivity, and flood-prone zones.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Vegetation</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Represents green coverage and plant density in the area. Vegetation levels affect temperature regulation,
                  air quality, and overall environmental health through natural cooling and pollution absorption.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Simulation Outputs</h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p>
                EnviroSim presents results through a combination of visual overlays and summary indicators. These
                outputs are intended to support scenario comparison rather than replace domain-specific engineering or
                planning review.
              </p>
              <div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Risk Score</h3>
                <p>
                  The summary risk score provides a simplified indicator of environmental pressure based on the current
                  parameter combination.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Map View</h3>
                <p>
                  The map provides a spatial context for analysis and helps users understand where environmental stress
                  may be concentrated.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Heatmap Layers</h3>
                <p>
                  Heatmaps allow users to isolate categories such as pollution, flood exposure, or temperature-related
                  stress for more focused review.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">How To Interpret Results</h2>
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                <strong>Lower values</strong> generally represent less environmental stress within the current scenario.
              </p>
              <p>
                <strong>Moderate values</strong> suggest conditions worth monitoring, especially when several variables
                rise together.
              </p>
              <p>
                <strong>Higher values</strong> indicate a stronger potential for impact and should be read as a signal
                for closer investigation rather than a standalone conclusion.
              </p>
              <p>
                For best results, compare changes incrementally and evaluate how each variable influences the combined
                output.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Use Cases</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Urban Planning Review</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Explore how different environmental conditions may influence infrastructure planning decisions at a
                  local scale.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Scenario Comparison</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Test multiple combinations of rainfall, pollution, temperature, and wind to compare relative risk.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Academic Demonstration</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Use the simulator as a visual aid when discussing environmental pressure and infrastructure response.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Early Concept Validation</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Review broad patterns before committing to deeper data analysis or model development.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">What is EnviroSim intended for?</h4>
                <p className="text-slate-700 dark:text-slate-300">
                  EnviroSim is intended for interactive scenario exploration and communication. It is useful for
                  reviewing how changing environmental conditions may influence infrastructure-related risk.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">How should the results be used?</h4>
                <p className="text-slate-700 dark:text-slate-300">
                  Results should be used as directional indicators that support discussion, prioritization, and further
                  analysis. They should not be treated as a substitute for validated engineering assessment.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-slate-900 dark:text-white">Can the simulator support multiple scenarios?</h4>
                <p className="text-slate-700 dark:text-slate-300">
                  Yes. The interface is well suited to repeated scenario testing. A good workflow is to adjust one input
                  at a time and observe how the score and map response change.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Notes</h2>
            <p className="text-slate-700 dark:text-slate-300">
              As the platform evolves, this documentation should stay aligned with the simulator’s actual capabilities.
              When new model integrations, exports, or datasets are added, this page can serve as the central reference
              for both users and collaborators.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Documentation;
