import Navbar from "./components/Navbar";
import CinematicParticles from "./components/CinematicParticles";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="h-[100svh] overflow-hidden bg-black text-white selection:bg-zinc-800 selection:text-white flex flex-col relative">
      
      {/* LAYER 0: BACKGROUND IMAGE (PC ONLY) */}
      {/* hidden on mobile/tablet, block on lg (PC) screens */}
      <div className="hidden lg:block absolute top-20 bottom-0 right-0 w-[52%] z-0">
        <Image 
          src="/homepage.png" 
          alt="Cinematic Background"
          fill
          priority 
          // Removed opacity-50 to remove the dull "filter" look
          className="object-cover object-top" 
        />
        {/* Soft Edge Fade: Blends the left edge of the image smoothly into the black background */}
        <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-black to-transparent z-10" />
      </div>
      
      {/* LAYER 10: GRADIENT FILTER OVERLAYS */}
      
      {/* OLD SETTING: Mobile & Tablet Overlay (Radial Spotlight) */}
      <div className="absolute inset-0 block lg:hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none z-10" />
      
      {/* NEW SETTING: PC Overlay (Vertical Fade) */}
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-b from-black/5 via-black/10 to-black pointer-events-none z-10" />

      {/* LAYER 20: NAVBAR & PARTICLES */}
      <div className="relative z-20 w-full flex flex-col h-full">
        <Navbar />
        <div className="absolute inset-0 pointer-events-none">
          <CinematicParticles />
        </div>
        
        {/* LAYER 30: HERO TEXT SECTION */}
        <section className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center items-center lg:items-start text-center lg:text-left relative z-30 pt-10">
          
          <p className="text-zinc-500 tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs uppercase mb-4 md:mb-6 font-semibold">
            Neural Recommendation Engine
          </p>
          
          <h1 className="font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter text-white mb-4 md:mb-6 leading-[0.9] text-shadow-glow">
            Decode <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
              Your Taste
            </span>
          </h1>
          
          <p className="max-w-2xl text-zinc-400 text-sm sm:text-base md:text-lg leading-snug md:leading-relaxed mb-8 md:mb-10 lg:border-l-2 lg:border-zinc-700 lg:pl-4 px-2 lg:px-0">
            Powered by Gemini AI. Track your active watchlist, save your cinematic masterpieces, and let our intelligence engine predict your next obsession before you even know you want it.
          </p>

          <div>
            <Link href="/search" className="group flex items-center justify-center gap-2 md:gap-3 bg-white text-black px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-oswald uppercase tracking-widest font-bold hover:bg-zinc-300 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Access Database
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
        </section>
      </div>
    </main>
  );
}