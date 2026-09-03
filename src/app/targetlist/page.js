"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CinematicParticles from "../components/CinematicParticles";
import { Loader2, Star, X, Eye, Check, AlertTriangle, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function WatchlistPage() {
  const { data: session, status } = useSession();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tracks which action ("watched", "remove", "favourite") and state per movie
  const [actionStatus, setActionStatus] = useState({});

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (session) fetchCollection();
  }, [session, status]);

  const fetchCollection = async () => {
    try {
      const res = await fetch("/api/collection?type=watchlist");
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error("Error fetching Intel", err);
    } finally {
      setLoading(false);
    }
  };

  const removeMovie = async (imdbID) => {
    setActionStatus(prev => ({ ...prev, [imdbID]: { action: "remove", state: "loading" } }));
    try {
      const res = await fetch("/api/collection", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbID, type: "watchlist" }),
      });
      if (res.ok) {
        setActionStatus(prev => ({ ...prev, [imdbID]: { action: "remove", state: "success" } }));
        setTimeout(() => setMovies((prev) => prev.filter((m) => m.imdbID !== imdbID)), 800);
      } else throw new Error();
    } catch (err) {
      setActionStatus(prev => ({ ...prev, [imdbID]: { action: "remove", state: "error" } }));
      setTimeout(() => setActionStatus(prev => { const copy = { ...prev }; delete copy[imdbID]; return copy; }), 2000);
    }
  };

  const markAsWatched = async (imdbID) => {
    setActionStatus(prev => ({ ...prev, [imdbID]: { action: "watched", state: "loading" } }));
    try {
      const res1 = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbID, type: "activity" }),
      });
      
      const res2 = await fetch("/api/collection", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbID, type: "watchlist" }),
      });

      if (res1.ok && res2.ok) {
        setActionStatus(prev => ({ ...prev, [imdbID]: { action: "watched", state: "success" } }));
        setTimeout(() => setMovies((prev) => prev.filter((m) => m.imdbID !== imdbID)), 800);
      } else throw new Error();
    } catch (err) {
      setActionStatus(prev => ({ ...prev, [imdbID]: { action: "watched", state: "error" } }));
      setTimeout(() => setActionStatus(prev => { const copy = { ...prev }; delete copy[imdbID]; return copy; }), 2000);
    }
  };

  const moveToFavorites = async (imdbID) => {
    setActionStatus(prev => ({ ...prev, [imdbID]: { action: "favourite", state: "loading" } }));
    try {
      const res1 = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbID, type: "favourite" }),
      });
      
      const res2 = await fetch("/api/collection", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbID, type: "watchlist" }),
      });

      if (res1.ok && res2.ok) {
        setActionStatus(prev => ({ ...prev, [imdbID]: { action: "favourite", state: "success" } }));
        setTimeout(() => setMovies((prev) => prev.filter((m) => m.imdbID !== imdbID)), 800);
      } else throw new Error();
    } catch (err) {
      setActionStatus(prev => ({ ...prev, [imdbID]: { action: "favourite", state: "error" } }));
      setTimeout(() => setActionStatus(prev => { const copy = { ...prev }; delete copy[imdbID]; return copy; }), 2000);
    }
  };

  if (status === "unauthenticated") {
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

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20 relative z-10">
        
        <div className="text-center mb-16 border-b border-zinc-900 pb-8">
          <p className="text-zinc-500 tracking-[0.3em] text-[10px] uppercase mb-2 font-semibold">Active Directive</p>
          <h1 className="font-oswald text-4xl md:text-5xl uppercase tracking-widest text-white">Target List</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-zinc-500"><Loader2 className="animate-spin" size={32} /></div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 font-oswald tracking-widest uppercase">No active targets found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-6 gap-x-5 md:gap-y-8 md:gap-x-8 xl:gap-x-10">
            {movies.map((movie) => {
              const currentAction = actionStatus[movie.imdbID]?.action;
              const currentState = actionStatus[movie.imdbID]?.state;
              const isLocked = !!currentAction;

              return (
                <div key={movie.imdbID} className="group relative bg-zinc-950 border border-zinc-900 overflow-hidden flex flex-col h-full hover:border-zinc-700 transition-colors">
                  <div className="aspect-[2/3] w-full bg-zinc-900 relative">
                    
                    {movie.imdbRating !== "N/A" && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 border border-zinc-700/50 flex items-center gap-1 z-10 group-hover:opacity-0 transition-opacity">
                        <Star size={10} className="text-yellow-500" fill="currentColor" />
                        <span className="text-[10px] font-oswald tracking-widest pt-[1px]">{movie.imdbRating}</span>
                      </div>
                    )}

                    <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                    
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3 z-20">
                      
                      {/* Mark Watched Button */}
                      <button 
                        onClick={() => markAsWatched(movie.imdbID)} 
                        disabled={isLocked}
                        className={`w-full flex justify-center items-center gap-2 border px-2 py-2 font-oswald uppercase tracking-widest text-[10px] md:text-[11px] transition-all disabled:opacity-100 ${
                          currentAction === "watched" && currentState === "success" ? "border-emerald-500 text-emerald-400 bg-emerald-950/60" :
                          currentAction === "watched" && currentState === "error" ? "border-red-500 text-red-400 bg-red-950/60" :
                          isLocked ? "border-zinc-800 text-zinc-600" :
                          "border-zinc-400 text-zinc-200 hover:bg-white hover:text-black"
                        }`}
                      >
                        {currentAction === "watched" && currentState === "loading" ? <Loader2 size={14} className="animate-spin" /> : 
                         currentAction === "watched" && currentState === "success" ? <Check size={14} /> : 
                         currentAction === "watched" && currentState === "error" ? <AlertTriangle size={14} /> : 
                         <Eye size={14} />}
                        
                        {currentAction === "watched" && currentState === "loading" ? "Processing..." : 
                         currentAction === "watched" && currentState === "success" ? "Secured" : 
                         currentAction === "watched" && currentState === "error" ? "Failed" : 
                         "Mark Watched"}
                      </button>

                      {/* Move to Favorites Button (Now Tactical Emerald Green) */}
                      <button 
                        onClick={() => moveToFavorites(movie.imdbID)} 
                        disabled={isLocked}
                        className={`w-full flex justify-center items-center gap-2 border px-2 py-2 font-oswald uppercase tracking-widest text-[10px] md:text-[11px] transition-all disabled:opacity-100 ${
                          currentAction === "favourite" && currentState === "success" ? "border-emerald-500 text-emerald-400 bg-emerald-950/60" :
                          currentAction === "favourite" && currentState === "error" ? "border-red-500 text-red-400 bg-red-950/60" :
                          isLocked ? "border-zinc-800 text-zinc-600" :
                          "border-emerald-900/50 text-emerald-500 hover:bg-emerald-900 hover:text-white"
                        }`}
                      >
                        {currentAction === "favourite" && currentState === "loading" ? <Loader2 size={14} className="animate-spin" /> : 
                         currentAction === "favourite" && currentState === "success" ? <Check size={14} /> : 
                         currentAction === "favourite" && currentState === "error" ? <AlertTriangle size={14} /> : 
                         <Heart size={14} />}
                        
                        {currentAction === "favourite" && currentState === "loading" ? "Transferring..." : 
                         currentAction === "favourite" && currentState === "success" ? "Vaulted" : 
                         currentAction === "favourite" && currentState === "error" ? "Failed" : 
                         "Favourite"}
                      </button>

                      {/* Abort Target Button */}
                      <button 
                        onClick={() => removeMovie(movie.imdbID)} 
                        disabled={isLocked}
                        className={`w-full flex justify-center items-center gap-2 border px-2 py-2 font-oswald uppercase tracking-widest text-[10px] md:text-[11px] transition-all disabled:opacity-100 ${
                          currentAction === "remove" && currentState === "success" ? "border-emerald-500 text-emerald-400 bg-emerald-950/60" :
                          currentAction === "remove" && currentState === "error" ? "border-red-500 text-red-400 bg-red-950/60" :
                          isLocked ? "border-zinc-800 text-zinc-600" :
                          "border-red-900/50 text-red-500 hover:bg-red-900 hover:text-white"
                        }`}
                      >
                        {currentAction === "remove" && currentState === "loading" ? <Loader2 size={14} className="animate-spin" /> : 
                         currentAction === "remove" && currentState === "success" ? <Check size={14} /> : 
                         currentAction === "remove" && currentState === "error" ? <AlertTriangle size={14} /> : 
                         <X size={14} />}
                        
                        {currentAction === "remove" && currentState === "loading" ? "Purging..." : 
                         currentAction === "remove" && currentState === "success" ? "Purged" : 
                         currentAction === "remove" && currentState === "error" ? "Failed" : 
                         "Abort Target"}
                      </button>
                      
                    </div>
                  </div>

                  <div className="p-3 flex-1 bg-zinc-950 border-t border-zinc-900">
                    <h3 className="font-oswald text-sm md:text-base uppercase tracking-wider truncate mb-1">{movie.Title}</h3>
                    <div className="text-[9px] md:text-[10px] text-zinc-500 tracking-widest truncate">
                      {movie.Released !== "N/A" ? movie.Released : movie.Year} • {movie.Runtime}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}