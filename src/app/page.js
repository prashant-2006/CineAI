import Navbar from "./components/Navbar";
import CinematicParticles from "./components/CinematicParticles";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    // Locked height so it doesn't scroll at all now that it's a single screen
    <main className="h-[100svh] overflow-hidden bg-black text-white selection:bg-zinc-800 selection:text-white flex flex-col relative">
      <Navbar />
      <CinematicParticles />
      
      {/* Background radial gradient spotlight */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none z-0" />

      {/* --- HERO SECTION --- */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center items-center lg:items-start text-center lg:text-left relative z-10 pt-10">
        
        <p className="text-zinc-500 tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs uppercase mb-4 md:mb-6 font-semibold">
          Neural Recommendation Engine
        </p>
        
        <h1 className="font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-extrabold uppercase tracking-tighter text-white mb-4 md:mb-6 leading-[0.9] text-shadow-glow">
          Decode <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
            Your Taste
          </span>
        </h1>
        
        <p className="max-w-2xl text-zinc-400 text-sm sm:text-base md:text-lg leading-snug md:leading-relaxed mb-8 md:mb-10 lg:border-l-2 lg:border-zinc-700 lg:pl-4 px-2 lg:px-0">
          Powered by Gemini AI. Track your active watchlist, save your cinematic masterpieces, and let our intelligence engine predict your next obsession before you even know you want it.
        </p>

        <div>
          <Link href="/search" className="group flex items-center justify-center gap-2 md:gap-3 bg-white text-black px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-oswald uppercase tracking-widest font-bold hover:bg-zinc-300 transition-all">
            Access Database
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
      </section>
    </main>
  );
}