"use client";
import { Navbar } from "./components/ui/mini-navbar";
import Map from "./components/Map";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-28 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 lg:gap-12">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-rose-300">Micro climate simulator</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Build the next climate insights dashboard.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                A lightweight prototype for a climate change simulator. Start with map-driven insights, control sliders, and modular cards for features, area statistics, construction density, and green cover toggles.
              </p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-red-500/80 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="mb-4 text-xl font-semibold text-white">Slider</h2>
                <div className="h-32 rounded-2xl border border-red-500/80 bg-slate-950/80" />
              </div>

              <div className="rounded-[1.75rem] border border-red-500/80 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="mb-4 text-xl font-semibold text-white">Wow Features</h2>
                <div className="h-40 rounded-2xl border border-red-500/80 bg-slate-950/80" />
              </div>

              <div className="rounded-[1.75rem] border border-red-500/80 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="mb-4 text-xl font-semibold text-white">Area Insights</h2>
                <div className="h-40 rounded-2xl border border-red-500/80 bg-slate-950/80" />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-red-500/80 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                  <h3 className="mb-4 text-lg font-semibold text-white">Construction Density Slider</h3>
                  <div className="h-24 rounded-2xl border border-red-500/80 bg-slate-950/80" />
                </div>

                <div className="rounded-[1.75rem] border border-red-500/80 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                  <h3 className="mb-4 text-lg font-semibold text-white">Green Cover Toggle / Slider</h3>
                  <div className="h-24 rounded-2xl border border-red-500/80 bg-slate-950/80" />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-rose-300">Simulator map</p>
                  <h2 className="text-2xl font-semibold text-white">Regional Climate View</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-800/75 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                  Live preview
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/75">
                <div className="relative h-[55vh] min-h-[360px] w-full">
                  <Map />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
