"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CinematicParticles from "../components/CinematicParticles";
import { Loader2, Settings2, Save, Check, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const OPTIONS = {
  genre: ["Action", "Sci-Fi", "Thriller", "Horror", "Drama", "Comedy"],
  language: ["English", "Hindi", "Spanish", "Korean", "Japanese"],
  industry: ["Hollywood", "Bollywood", "Korean Cinema", "Anime", "European"],
  releasePeriod: ["Classic (Pre-2000)", "Modern (2000-2019)", "Current (2020+)"]
};

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  
  // Tactical status tracking: "idle" | "saving" | "success" | "error"
  const [saveStatus, setSaveStatus] = useState("idle"); 
  
  const [prefs, setPrefs] = useState({
    genre: OPTIONS.genre,
    language: OPTIONS.language,
    industry: OPTIONS.industry,
    releasePeriod: OPTIONS.releasePeriod,
  });

  useEffect(() => {
    if (status === "unauthenticated") { setLoading(false); return; }
    if (session) fetchPreferences();
  }, [session, status]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/preferences");
      if (res.ok) {
        const data = await res.json();
        setPrefs({
          genre: data.genre || OPTIONS.genre,
          language: data.language || OPTIONS.language,
          industry: data.industry || OPTIONS.industry,
          releasePeriod: data.releasePeriod || OPTIONS.releasePeriod,
        });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      
      if (res.ok) {
        setSaveStatus("success");
      } else {
        setSaveStatus("error");
      }
    } catch (err) { 
      setSaveStatus("error"); 
    } finally { 
      // Reset button back to idle after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000); 
    }
  };

  const toggleOption = (category, value) => {
    setPrefs((prev) => {
      const currentArray = prev[category];
      const isSelected = currentArray.includes(value);
      return {
        ...prev,
        [category]: isSelected 
          ? currentArray.filter((item) => item !== value) 
          : [...currentArray, value] 
      };
    });
  };

  if (status === "unauthenticated") return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
      <Navbar />
      <p className="text-zinc-500 tracking-[0.3em] uppercase text-xs">Access Denied</p>
      <Link href="/login" className="mt-4 border border-zinc-700 px-6 py-3 font-oswald uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Authenticate</Link>
    </main>
  );

  return (
    <main className="min-h-[100svh] bg-black text-white flex flex-col relative overflow-hidden">
      <Navbar />
      <CinematicParticles />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none z-0" />

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-10 relative z-10 flex flex-col">
        
        <div className="text-center mb-6">
          <Settings2 className="mx-auto text-zinc-500 mb-2" size={24} />
          <p className="text-zinc-500 tracking-[0.3em] text-[10px] uppercase mb-1 font-semibold">Operative Profile</p>
          <h1 className="font-oswald text-3xl uppercase tracking-widest text-white">System Parameters</h1>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center text-zinc-500"><Loader2 className="animate-spin" size={32} /></div>
        ) : (
          <form onSubmit={handleSave} className="flex-1 flex flex-col bg-zinc-950/80 border border-zinc-900 backdrop-blur-md overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <img src={session?.user?.image || "/default-avatar.png"} referrerPolicy="no-referrer" alt="Profile" className="w-12 h-12 rounded-full border-2 border-zinc-700" />
                <div>
                  <p className="font-oswald text-base tracking-widest uppercase leading-none mb-1">{session?.user?.name}</p>
                  <p className="text-zinc-500 text-[10px] tracking-wider uppercase">{session?.user?.email}</p>
                </div>
              </div>
              
              {/* Tactical Status Button */}
              <button 
                type="submit" 
                disabled={saveStatus === "saving" || saveStatus === "success"} 
                className={`flex items-center justify-center gap-2 px-6 py-2.5 font-oswald uppercase tracking-widest text-xs font-bold transition-all duration-300 disabled:opacity-80 border ${
                  saveStatus === "success" ? "bg-emerald-900/40 text-emerald-400 border-emerald-500" :
                  saveStatus === "error" ? "bg-red-900/40 text-red-400 border-red-500" :
                  "bg-white text-black border-white hover:bg-zinc-300 disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:border-zinc-700"
                }`}
              >
                {saveStatus === "idle" && <Save size={14} />}
                {saveStatus === "saving" && <Loader2 className="animate-spin" size={14} />}
                {saveStatus === "success" && <Check size={14} />}
                {saveStatus === "error" && <AlertTriangle size={14} />}
                
                {saveStatus === "idle" && "Save Parameters"}
                {saveStatus === "saving" && "Encrypting..."}
                {saveStatus === "success" && "Data Secured"}
                {saveStatus === "error" && "Link Failed"}
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              
              <div className="flex flex-col gap-6">
                
                {/* GENRE */}
                <div>
                  <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold border-b border-zinc-800 pb-2 mb-3">Target Genres</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {OPTIONS.genre.map((opt) => (
                      <div key={opt} onClick={() => toggleOption("genre", opt)} className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all duration-200 ${prefs.genre.includes(opt) ? 'border-white bg-zinc-900' : 'border-zinc-700 bg-black group-hover:border-zinc-500'}`}>
                          {prefs.genre.includes(opt) && <div className="w-1.5 h-1.5 bg-white shadow-[0_0_5px_white]" />}
                        </div>
                        <span className={`text-[10px] md:text-xs font-oswald uppercase tracking-wider transition-colors mt-0.5 ${prefs.genre.includes(opt) ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RELEASE PERIOD */}
                <div>
                  <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold border-b border-zinc-800 pb-2 mb-3">Release Window</h3>
                  <div className="flex flex-col gap-3">
                    {OPTIONS.releasePeriod.map((opt) => (
                      <div key={opt} onClick={() => toggleOption("releasePeriod", opt)} className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all duration-200 ${prefs.releasePeriod.includes(opt) ? 'border-white bg-zinc-900' : 'border-zinc-700 bg-black group-hover:border-zinc-500'}`}>
                          {prefs.releasePeriod.includes(opt) && <div className="w-1.5 h-1.5 bg-white shadow-[0_0_5px_white]" />}
                        </div>
                        <span className={`text-[10px] md:text-xs font-oswald uppercase tracking-wider transition-colors mt-0.5 ${prefs.releasePeriod.includes(opt) ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex flex-col gap-6">
                
                {/* INDUSTRY */}
                <div>
                  <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold border-b border-zinc-800 pb-2 mb-3">Cinema Sectors</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {OPTIONS.industry.map((opt) => (
                      <div key={opt} onClick={() => toggleOption("industry", opt)} className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all duration-200 ${prefs.industry.includes(opt) ? 'border-white bg-zinc-900' : 'border-zinc-700 bg-black group-hover:border-zinc-500'}`}>
                          {prefs.industry.includes(opt) && <div className="w-1.5 h-1.5 bg-white shadow-[0_0_5px_white]" />}
                        </div>
                        <span className={`text-[10px] md:text-xs font-oswald uppercase tracking-wider transition-colors mt-0.5 ${prefs.industry.includes(opt) ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LANGUAGE */}
                <div>
                  <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold border-b border-zinc-800 pb-2 mb-3">Audio Languages</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {OPTIONS.language.map((opt) => (
                      <div key={opt} onClick={() => toggleOption("language", opt)} className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all duration-200 ${prefs.language.includes(opt) ? 'border-white bg-zinc-900' : 'border-zinc-700 bg-black group-hover:border-zinc-500'}`}>
                          {prefs.language.includes(opt) && <div className="w-1.5 h-1.5 bg-white shadow-[0_0_5px_white]" />}
                        </div>
                        <span className={`text-[10px] md:text-xs font-oswald uppercase tracking-wider transition-colors mt-0.5 ${prefs.language.includes(opt) ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </form>
        )}
      </div>
    </main>
  );
}