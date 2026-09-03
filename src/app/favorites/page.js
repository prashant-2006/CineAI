"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CinematicParticles from "../components/CinematicParticles";
import { Loader2, Star, X, Check, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tactical state to track button status per movie ID
  const [actionStatus, setActionStatus] = useState({});

  useEffect(() => {
    if (status === "unauthenticated") { setLoading(false); return; }
    if (session) fetchCollection();
  }, [session, status]);

  const fetchCollection = async () => {
    try {
      const res = await fetch("/api/collection?type=favourite");
      const data = await res.json();
      setMovies(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const removeMovie = async (imdbID) => {
    // Set status to loading for this specific movie
    setActionStatus(prev => ({ ...prev, [imdbID]: { state: "loading" } }));
    
    try {
      const res = await fetch("/api/collection", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbID, type: "favourite" }),
      });
      
      if (res.ok) {
        // Show success state
        setActionStatus(prev => ({ ...prev, [imdbID]: { state: "success" } }));
        // Delay removal by 800ms so the user sees the confirmation
        setTimeout(() => {
          setMovies((prev) => prev.filter((m) => m.imdbID !== imdbID));
        }, 800);
      } else {
        throw new Error("Failed");
      }
    } catch (err) { 
      // Show error state, then reset after 2 seconds
      setActionStatus(prev => ({ ...prev, [imdbID]: { state: "error" } }));
      setTimeout(() => {
        setActionStatus(prev => {
          const copy = { ...prev };
          delete copy[imdbID];
          return copy;
        });
      }, 2000);
    }
  };

  if (status === "unauthenticated") return <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center"><Navbar /><Link href="/login" className="border border-zinc-700 px-6 py-3 font-oswald uppercase tracking-widest hover:bg-white hover:text-black">Authenticate</Link></main>;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      <Navbar />
      <CinematicParticles />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none z-0" />

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20 relative z-10">
        <div className="text-center mb-16 border-b border-zinc-900 pb-8">
          <p className="text-zinc-500 tracking-[0.3em] text-[10px] uppercase mb-2 font-semibold">The Vault</p>
          <h1 className="font-oswald text-4xl md:text-5xl uppercase tracking-widest text-white">Favorites</h1>
        </div>

        {loading ? ( <div className="flex justify-center py-20 text-zinc-500"><Loader2 className="animate-spin" size={32} /></div> ) 
        : movies.length === 0 ? ( <div className="text-center py-20 text-zinc-600 font-oswald tracking-widest uppercase">Vault is empty.</div> ) 
        : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-6 gap-x-5 md:gap-y-8 md:gap-x-8 xl:gap-x-10">
            {movies.map((movie) => {
              const bStatus = actionStatus[movie.imdbID]?.state;
              const isProcessing = bStatus === "loading";
              const isSuccess = bStatus === "success";
              const isError = bStatus === "error";

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
                    
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-3 z-20">
                      
                      <button 
                        onClick={() => removeMovie(movie.imdbID)} 
                        disabled={!!bStatus}
                        className={`w-full flex items-center justify-center gap-2 border px-3 py-2.5 font-oswald uppercase tracking-widest text-[11px] transition-all disabled:opacity-100 ${
                          isSuccess ? "border-emerald-500 text-emerald-400 bg-emerald-950/60" :
                          isError ? "border-red-500 text-red-400 bg-red-950/60" :
                          "border-red-900/50 text-red-500 hover:bg-red-900 hover:text-white"
                        }`}
                      >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 
                         isSuccess ? <Check size={16} /> : 
                         isError ? <AlertTriangle size={16} /> : 
                         <X size={16} />}
                        
                        {isProcessing ? "Purging..." : 
                         isSuccess ? "Purged" : 
                         isError ? "Failed" : 
                         "Remove Intel"}
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