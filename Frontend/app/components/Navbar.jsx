
import { Navbar } from "@/components/ui/mini-navbar";

const Nav = () => {

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans overflow-hidden">
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <img className="w-full h-full object-cover grayscale" src={"https://cdn.pixabay.com/photo/2016/06/05/07/59/stars-1436950_1280.jpg"} alt="Background Stars"></img>
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4 pt-24">
        <h1 className="text-8xl md:text-9xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight drop-shadow-xl">
        MINI NAVBAR
        </h1>
        <div className="flex flex-col sm:flex-row items-center text-xl text-slate-600 dark:text-gray-300 mb-8 space-y-2 sm:space-y-0 sm:space-x-2">
          <span>Please support by saving this component</span>
          <button
            className="px-4 py-1 border border-slate-400 dark:border-[#333] bg-white/50 dark:bg-[rgba(31,31,31,0.62)] rounded-full text-slate-700 dark:text-white transition-colors duration-200 cursor-pointer text-base
                       inline-flex items-center justify-center hover:bg-white dark:hover:bg-[rgba(31,31,31,0.8)]"
          >
            <span>Thank You</span>
          </button>
        </div>
      </main>


    </div>
  );
};

export default Nav;
