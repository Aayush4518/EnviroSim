"use client";

import React from 'react';
import Map from '../components/Map';
import Nav from '../components/Navbar';

const Home = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-red-500/90 bg-slate-50 dark:bg-slate-900/70 p-6 shadow-xl shadow-black/20 dark:shadow-black/40">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Slider</h2>
              <div className="h-32 rounded-3xl border border-red-500/80 bg-slate-100 dark:bg-slate-950/80" />
            </div>

            <div className="rounded-3xl border border-red-500/90 bg-slate-50 dark:bg-slate-900/70 p-6 shadow-xl shadow-black/20 dark:shadow-black/40">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Wow Features</h2>
              <div className="h-40 rounded-3xl border border-red-500/80 bg-slate-100 dark:bg-slate-950/80" />
            </div>

            <div className="rounded-3xl border border-red-500/90 bg-slate-50 dark:bg-slate-900/70 p-6 shadow-xl shadow-black/20 dark:shadow-black/40">
              <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Area Insights</h2>
              <div className="h-40 rounded-3xl border border-red-500/80 bg-slate-100 dark:bg-slate-950/80" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
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

          <div className="rounded-[2rem] border border-white/10 dark:border-white/10 bg-slate-100 dark:bg-slate-900/80 p-6 shadow-2xl shadow-black/30 dark:shadow-black/30 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-rose-500 dark:text-rose-300">Simulator map</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Regional Climate View</h2>
              </div>
              <div className="rounded-2xl border border-white/10 dark:border-white/10 bg-slate-200 dark:bg-slate-800/75 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-700 dark:text-slate-300">
                Live preview
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 dark:border-white/10 bg-slate-200 dark:bg-slate-950/75">
              <div className="relative h-[55vh] min-h-full w-full bg-white dark:bg-slate-800">
                <Map />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-100 dark:from-slate-950 via-slate-100/10 dark:via-slate-950/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;

