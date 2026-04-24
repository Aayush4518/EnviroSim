"use client";

import React, { useState } from 'react';
import Map from '../components/Map';
import Nav from '../components/Navbar';
import EnvironmentControls from '@/app/components/ui/environment-controls';

const Home = () => {
  const [environmentValues, setEnvironmentValues] = useState({
    temperature: 25,
    pollution: 30,
    rainfall: 45,
    vegetation: 60,
  });
  const handleEnvironmentChange = (values) => {
    // Convert slider values (0-360) back to display ranges for backend
    const scaledValues = {
      temperature: (values.temperature / 360) * 50,
      pollution: (values.pollution / 360) * 100,
      rainfall: (values.rainfall / 360) * 360,
      vegetation: (values.vegetation / 360) * 100,
    };
    setEnvironmentValues(scaledValues);
    // TODO: Send these values to your backend/API to update heatmap data
    console.log('Environment values updated:', scaledValues);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Nav />
      

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <EnvironmentControls
              onValuesChange={handleEnvironmentChange}
            />

            <div className="rounded-3xl border border-red-500/90 bg-slate-50 dark:bg-slate-900/70 p-6 shadow-xl shadow-black/20 dark:shadow-black/40">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Wow Features</h2>
              <div className="h-40 rounded-3xl border border-red-500/80 bg-slate-100 dark:bg-slate-950/80" />
            </div>

            <div className="rounded-3xl border border-red-500/90 bg-slate-50 dark:bg-slate-900/70 p-6 shadow-xl shadow-black/20 dark:shadow-black/40">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Area Insights</h2>
              <div className="h-40 rounded-3xl border border-red-500/80 bg-slate-100 dark:bg-slate-950/80" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-red-500/90 bg-slate-50 dark:bg-slate-900/70 p-6 shadow-xl shadow-black/20 dark:shadow-black/40">
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Construction Density Slider</h3>
                <div className="h-24 rounded-3xl border border-red-500/80 bg-slate-100 dark:bg-slate-950/80" />
              </div>
              <div className="rounded-3xl border border-red-500/90 bg-slate-50 dark:bg-slate-900/70 p-6 shadow-xl shadow-black/20 dark:shadow-black/40">
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Green Cover Toggle / Slider</h3>
                <div className="h-24 rounded-3xl border border-red-500/80 bg-slate-100 dark:bg-slate-950/80" />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 dark:border-white/10 bg-slate-100 dark:bg-slate-900/80 p-4 shadow-2xl shadow-black/30 dark:shadow-black/30 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-rose-500 dark:text-rose-300">Simulator map</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Regional Climate View</h2>
              </div>
              <div className="rounded-2xl border border-white/10 dark:border-white/10 bg-slate-200 dark:bg-slate-800/75 px-2 py-1 text-xs uppercase tracking-[0.22em] text-slate-700 dark:text-slate-300">
                Live preview
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 dark:border-white/10 bg-slate-200 dark:bg-slate-950/75">
              <div className="relative h-[55vh] min-h-full w-full bg-white dark:bg-slate-800">
                <Map />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;

