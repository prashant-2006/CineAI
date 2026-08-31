"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import CinematicParticles from "../components/CinematicParticles";
import { Search, Loader2, BookmarkPlus, Heart, Eye, Clapperboard, Star } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.Response === "True") {
        setResults(data.Search);
      } else {
        setError(data.Error || "No results found."); 
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("System failure. Unable to access database.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (movie, actionType) => {
    const actions = {
      watchlist: "Target List",
      favourite: "Favorites"
    };
    console.log(`Added to ${actionType}:`, movie.Title);
    alert(`${movie.Title} added to ${actions[actionType]}.`);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      <Navbar />
      <CinematicParticles />
      
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none z-0" />

      {/* INCREASED SIDE PADDING (px-6 md:px-12) to slightly pinch the container inwards */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20 relative z-10">
        
        <div className="max-w-xl mx-auto text-center mb-16">
          <p className="text-zinc-500 tracking-[0.3em] text-[10px] uppercase mb-4 font-semibold">
            Query The Database
          </p>
          
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Title..."
              className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-400 outline-none py-3 pl-10 pr-4 text-xl md:text-2xl font-oswald uppercase tracking-widest text-white placeholder:text-zinc-800 transition-colors"
            />
            <button type="submit" className="hidden">Submit</button>
          </form>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-oswald tracking-widest uppercase text-sm">Decrypting files...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-700/80 font-oswald text-xl tracking-widest uppercase mb-2">No Records Found</p>
            <p className="text-zinc-500 text-sm">{error}</p>
          </div>
        )}

        {/* INCREASED HORIZONTAL GAP (gap-x) to widen space between movies & naturally shrink card width */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-6 gap-x-5 md:gap-y-8 md:gap-x-8 xl:gap-x-10">
          {!loading && results.length > 0 && results.map((movie) => (
            <div 
              key={movie.imdbID} 
              className="group relative bg-zinc-950/80 border border-zinc-900 overflow-hidden hover:border-zinc-600 transition-colors flex flex-col h-full"
            >
              <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
                
                {/* Slightly reduced star padding */}
                {movie.imdbRating && movie.imdbRating !== "N/A" && (
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 border border-zinc-700/50 flex items-center gap-1 z-10 group-hover:opacity-0 transition-opacity duration-300">
                    <Star size={10} className="text-yellow-500" fill="currentColor" />
                    <span className="text-[10px] font-oswald text-white tracking-widest pt-[1px]">{movie.imdbRating}</span>
                  </div>
                )}

                {movie.Poster !== "N/A" ? (
                  <img 
                    src={movie.Poster} 
                    alt={movie.Title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100 grayscale-[30%] group-hover:grayscale-0"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center relative border border-zinc-800/50">
                    <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-500 to-transparent" />
                      <Clapperboard className="text-zinc-700 mb-2 z-10" size={28} strokeWidth={1} />
                      <span className="text-zinc-600 font-oswald tracking-[0.2em] uppercase text-[10px] z-10">Classified</span>
                      <span className="text-zinc-800 font-oswald tracking-widest uppercase text-[8px] mt-1 z-10">No Visual Data</span>
                    </div>
                  </div>
                )}
                
                {/* Reduced internal padding of hover menu (p-3) and buttons (py-2) */}
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3 z-20">
                  <button 
                    onClick={() => handleAction(movie, 'watchlist')}
                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-zinc-500 text-zinc-300 px-2.5 py-2 font-oswald uppercase tracking-widest text-[10px] md:text-[11px] font-bold hover:bg-white hover:text-black hover:border-white transition-all"
                  >
                    <BookmarkPlus size={16} strokeWidth={2} /> Target
                  </button>

                  <button 
                    onClick={() => handleAction(movie, 'favourite')}
                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-zinc-600 text-zinc-400 px-2.5 py-2 font-oswald uppercase tracking-widest text-[10px] md:text-[11px] font-bold hover:border-red-800 hover:bg-red-800 hover:text-white transition-all"
                  >
                    <Heart size={16} strokeWidth={2} /> Favourite
                  </button>
                </div>
              </div>

              {/* Reduced footer padding (p-2.5 md:p-3) */}
              <div className="p-2.5 md:p-3 flex-1 flex flex-col justify-between z-10 bg-zinc-950 border-t border-zinc-900">
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  
                  <h3 className="font-oswald text-sm md:text-base text-white uppercase tracking-wider leading-tight mb-0.5 truncate" title={movie.Title}>
                    {movie.Title}
                  </h3>
                  
                  <div className="flex items-center text-[9px] md:text-[10px] text-zinc-500 font-semibold tracking-widest truncate">
                    <span>{movie.Released !== "N/A" ? movie.Released : movie.Year}</span>
                    {movie.Runtime && movie.Runtime !== "N/A" && (
                      <>
                        <span className="mx-1.5 opacity-50">•</span>
                        <span>{movie.Runtime}</span>
                      </>
                    )}
                  </div>

                  {movie.Genre && movie.Genre !== "N/A" && (
                    <p className="text-[8px] md:text-[9px] text-zinc-600 uppercase tracking-widest truncate mt-0.5" title={movie.Genre}>
                      {movie.Genre}
                    </p>
                  )}
                  
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}