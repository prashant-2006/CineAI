"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CinematicParticles from "../components/CinematicParticles";
import { Loader2, Film, Tv, Activity, UserCircle, Smile, Star, BookmarkPlus, Heart, Check, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  
  const [step, setStep] = useState(1);
  const [targetType, setTargetType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [movies, setMovies] = useState([]);
  
  const [actionStatus, setActionStatus] = useState({});

  useEffect(() => {
    if (status === "unauthenticated") setStep(0);
  }, [status]);

  const handleGenerate = async (basis) => {
    if (basis !== "activity") {
      alert("This directive is currently locked/offline.");
      return;
    }
    
    setStep(3);
    setLoading(true);
    setError("");
    setMovies([]);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetBasis: basis }),
      });
      
      const data = await res.json();
      
      if (data.error === "NO_ACTIVITY") {
        setError("No recent activity found. Feed data to the mainframe first.");
      } else if (data.error) {
        setError(data.error);
      } else {
        setMovies(data.results);
      }
    } catch (err) {
      setError("Critical system failure during AI uplink.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAction = async (movie, type) => {
    setActionStatus(prev => ({ ...prev, [movie.imdbID]: { action: type, state: "loading" } }));
    try {
      const res = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbID: movie.imdbID, type }),
      });
      if (res.ok) {
        setActionStatus(prev => ({ ...prev, [movie.imdbID]: { action: type, state: "success" } }));
      } else throw new Error();
    } catch (err) {
      setActionStatus(prev => ({ ...prev, [movie.imdbID]: { action: type, state: "error" } }));
    } finally {
      setTimeout(() => setActionStatus(prev => { const copy = { ...prev }; delete copy[movie.imdbID]; return copy; }), 2000);
    }
  };

  if (status === "unauthenticated" || step === 0) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <Navbar />
        <p className="text-zinc-500 tracking-[0.3em] uppercase text-xs">Access Denied</p>
        <Link href="/login" className="mt-4 border border-zinc-700 px-6 py-3 font-oswald uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Authenticate</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      <Navbar />
      <CinematicParticles />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none z-0" />

      {/* Main Container */}
      <div className="flex-1 w-full max-w-[90rem] mx-auto px-4 md:px-8 xl:px-12 pt-32 pb-16 relative z-10 flex flex-col">
        
        {/* PERSISTENT HEADER */}
        <div className="text-center mb-10 border-b border-zinc-900 pb-8 shrink-0">
          <p className="text-zinc-500 tracking-[0.3em] text-[10px] uppercase mb-2 font-semibold">Gemini Intelligence AI</p>
          <h1 className="font-oswald text-4xl md:text-5xl uppercase tracking-widest text-white">Recommendations</h1>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          
          {/* STEP 1: Select Format */}
          {step === 1 && (
            <div className="w-full max-w-3xl flex flex-col items-center animate-[pulse_0.3s_ease-in-out]">
              <h2 className="font-oswald text-xl tracking-widest uppercase text-zinc-300 mb-8">Select Target Format</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <button onClick={() => { setTargetType('movie'); setStep(2); }} className="group flex flex-col items-center gap-4 bg-zinc-950/80 border border-zinc-800 hover:border-zinc-500 p-10 transition-all">
                  <Film size={48} className="text-zinc-600 group-hover:text-white transition-colors" />
                  <span className="font-oswald uppercase tracking-widest text-lg">Feature Films</span>
                </button>
                <button onClick={() => { setTargetType('series'); setStep(2); }} className="group flex flex-col items-center gap-4 bg-zinc-950/80 border border-zinc-800 hover:border-zinc-500 p-10 transition-all">
                  <Tv size={48} className="text-zinc-600 group-hover:text-white transition-colors" />
                  <span className="font-oswald uppercase tracking-widest text-lg">Classified Series</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Logic */}
          {step === 2 && (
            <div className="w-full max-w-4xl flex flex-col items-center animate-[pulse_0.3s_ease-in-out]">
              <h2 className="font-oswald text-xl tracking-widest uppercase text-zinc-300 mb-8">Select Analysis Vector</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <button onClick={() => handleGenerate('activity')} className="group flex flex-col items-center gap-4 bg-zinc-950/80 border border-zinc-500 hover:bg-white hover:text-black p-8 transition-all">
                  <Activity size={32} className="text-white group-hover:text-black transition-colors" />
                  <span className="font-oswald uppercase tracking-widest text-sm text-center">Recent Activity<br/><span className="text-[9px] opacity-70">(Active)</span></span>
                </button>
                <button disabled className="group flex flex-col items-center gap-4 bg-black border border-zinc-900 p-8 opacity-50 cursor-not-allowed">
                  <UserCircle size={32} className="text-zinc-700" />
                  <span className="font-oswald uppercase tracking-widest text-sm text-zinc-600 text-center">Operative Profile<br/><span className="text-[9px]">(Offline)</span></span>
                </button>
                <button disabled className="group flex flex-col items-center gap-4 bg-black border border-zinc-900 p-8 opacity-50 cursor-not-allowed">
                  <Smile size={32} className="text-zinc-700" />
                  <span className="font-oswald uppercase tracking-widest text-sm text-zinc-600 text-center">Psychological Mood<br/><span className="text-[9px]">(Offline)</span></span>
                </button>
              </div>
              <button onClick={() => setStep(1)} className="mt-12 text-zinc-500 text-xs font-oswald uppercase tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                ← Abort / Back
              </button>
            </div>
          )}

          {/* STEP 3: Loading & Results Grid */}
          {step === 3 && (
            <div className="w-full flex-1 flex flex-col">
              
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-zinc-500">
                  <Loader2 className="animate-spin mb-6" size={48} />
                  <p className="font-oswald tracking-[0.2em] uppercase text-sm animate-pulse">Establishing AI Uplink...</p>
                  <p className="text-[10px] tracking-widest uppercase mt-2 text-zinc-600">Cross-Referencing Global Database</p>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <AlertTriangle className="text-red-900 mb-4" size={48} />
                  <p className="text-red-500 font-oswald text-xl tracking-widest uppercase mb-6 text-center">{error}</p>
                  <button onClick={() => setStep(1)} className="border border-zinc-700 px-8 py-3 font-oswald uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors">Reset System</button>
                </div>
              ) : (
                <div className="w-full flex flex-col animate-[pulse_0.3s_ease-in-out]">
                  
                  {/* Results Sub-Header with Controls */}
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 mb-4 border-b border-zinc-900/50 pb-4">
                    <div className="text-center md:text-left">
                      <h3 className="font-oswald text-xl md:text-2xl uppercase tracking-widest text-white">Target Results Acquired</h3>
                      <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mt-1">Based on recent {targetType} activity</p>
                    </div>
                    
                    <div className="flex gap-2 md:gap-3">
                      <button onClick={() => setStep(1)} className="flex items-center justify-center gap-2 text-zinc-300 text-[10px] md:text-xs font-oswald uppercase tracking-widest hover:text-white transition-colors border border-zinc-700 px-4 py-2 hover:border-zinc-500 bg-zinc-950/80 hover:bg-zinc-900">
                        <ArrowLeft size={14} /> <span>Go Back</span>
                      </button>
                      <button onClick={() => handleGenerate('activity')} className="flex items-center justify-center gap-2 text-emerald-400 text-[10px] md:text-xs font-oswald uppercase tracking-widest hover:text-emerald-300 transition-colors border border-emerald-900 px-4 py-2 hover:border-emerald-500 bg-emerald-950/20 hover:bg-emerald-900/40">
                        <RefreshCw size={14} /> <span>Reroute Intel</span>
                      </button>
                    </div>
                  </div>

                  {/* 7-Card Grid - Updated to lg:grid-cols-7 to force 1 line on desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6 lg:gap-8 w-full justify-items-center">
                    {movies.map((movie) => {
                      const currentAction = actionStatus[movie.imdbID]?.action;
                      const currentState = actionStatus[movie.imdbID]?.state;
                      const isLocked = !!currentAction;

                      return (
                        <div key={movie.imdbID} className="group relative bg-zinc-950 border border-zinc-900 overflow-hidden flex flex-col h-full hover:border-zinc-700 transition-colors w-full max-w-[200px]">
                          
                          <div className="aspect-[2/3] w-full bg-zinc-900 relative">
                            
                            {movie.imdbRating && movie.imdbRating !== "N/A" && (
                              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 border border-zinc-700/50 flex items-center gap-1 z-10 group-hover:opacity-0 transition-opacity">
                                <Star size={10} className="text-yellow-500" fill="currentColor" />
                                <span className="text-[10px] font-oswald tracking-widest pt-[1px]">{movie.imdbRating}</span>
                              </div>
                            )}
                            
                            <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                            
                            {/* Highly Visible Action Buttons */}
                            <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-4 z-20">
                              
                              <button 
                                onClick={() => handleSaveAction(movie, 'watchlist')} 
                                disabled={isLocked} 
                                className={`w-full flex justify-center items-center gap-2 border px-3 py-3 font-oswald uppercase tracking-widest text-xs transition-all disabled:opacity-100 ${
                                  currentAction === "watchlist" && currentState === "success" ? "border-white bg-white text-black" : 
                                  currentAction === "watchlist" && currentState === "error" ? "border-red-500 text-red-400 bg-red-950/80" : 
                                  isLocked ? "border-zinc-800 text-zinc-600 bg-black" : 
                                  "border-zinc-300 text-white bg-black/50 hover:bg-white hover:text-black"
                                }`}
                              >
                                {currentAction === "watchlist" && currentState === "loading" ? <Loader2 size={16} className="animate-spin" /> : 
                                 currentAction === "watchlist" && currentState === "success" ? <Check size={16} /> : 
                                 currentAction === "watchlist" && currentState === "error" ? <AlertTriangle size={16} /> : 
                                 <BookmarkPlus size={16} />}
                                 
                                {currentAction === "watchlist" && currentState === "loading" ? "Securing" : 
                                 currentAction === "watchlist" && currentState === "success" ? "Acquired" : 
                                 "Target List"}
                              </button>

                              <button 
                                onClick={() => handleSaveAction(movie, 'favourite')} 
                                disabled={isLocked} 
                                className={`w-full flex justify-center items-center gap-2 border px-3 py-3 font-oswald uppercase tracking-widest text-xs transition-all disabled:opacity-100 ${
                                  currentAction === "favourite" && currentState === "success" ? "border-emerald-500 text-emerald-400 bg-emerald-950/80" : 
                                  currentAction === "favourite" && currentState === "error" ? "border-red-500 text-red-400 bg-red-950/80" : 
                                  isLocked ? "border-zinc-800 text-zinc-600 bg-black" : 
                                  "border-emerald-500 text-emerald-400 bg-black/50 hover:border-emerald-400 hover:bg-emerald-900/90 hover:text-white"
                                }`}
                              >
                                {currentAction === "favourite" && currentState === "loading" ? <Loader2 size={16} className="animate-spin" /> : 
                                 currentAction === "favourite" && currentState === "success" ? <Check size={16} /> : 
                                 currentAction === "favourite" && currentState === "error" ? <AlertTriangle size={16} /> : 
                                 <Heart size={16} />}
                                 
                                {currentAction === "favourite" && currentState === "loading" ? "Vaulting" : 
                                 currentAction === "favourite" && currentState === "success" ? "Vaulted" : 
                                 "Favourite"}
                              </button>

                            </div>
                          </div>
                          
                          <div className="p-4 flex-1 bg-zinc-950 border-t border-zinc-900">
                            <h3 className="font-oswald text-base uppercase tracking-wider truncate mb-1.5" title={movie.Title}>{movie.Title}</h3>
                            <div className="text-[11px] text-zinc-500 tracking-widest truncate">{movie.Released !== "N/A" ? movie.Released : movie.Year} • {movie.Runtime}</div>
                          </div>
                          
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}