"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import CinematicParticles from "../components/CinematicParticles";
import Link from "next/link";
import { Fingerprint, ChevronLeft, ShieldAlert, Key } from "lucide-react";

export default function LoginPage() {
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    // signIn('google') automatically handles both login and registration
    await signIn("google", { callbackUrl: "/" }); 
  };

  return (
    <main className="min-h-[100svh] bg-black text-white flex flex-col relative overflow-hidden">
      <CinematicParticles />
      
      {/* Background radial gradient spotlight */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none z-0" />

      {/* Top Navigation / Back Button */}
      <div className="absolute top-0 w-full p-6 z-20">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-oswald uppercase tracking-widest text-xs font-bold">
          <ChevronLeft size={16} /> Disconnect
        </Link>
      </div>

      {/* Authentication Terminal */}
      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <ShieldAlert className="text-zinc-600 mb-4" size={40} strokeWidth={1} />
            <p className="text-zinc-500 tracking-[0.3em] text-[10px] uppercase mb-2 font-semibold">
              Restricted Area
            </p>
            <h1 className="font-oswald text-3xl text-white uppercase tracking-widest">
              System Access
            </h1>
          </div>

          {/* Tactical Mode Switcher */}
          <div className="flex border-b border-zinc-800 mb-8">
            <button 
              onClick={() => setAuthMode("login")}
              className={`flex-1 pb-3 text-xs font-oswald uppercase tracking-widest font-bold transition-colors border-b-2 ${
                authMode === "login" ? "border-white text-white" : "border-transparent text-zinc-600 hover:text-zinc-400"
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setAuthMode("register")}
              className={`flex-1 pb-3 text-xs font-oswald uppercase tracking-widest font-bold transition-colors border-b-2 ${
                authMode === "register" ? "border-white text-white" : "border-transparent text-zinc-600 hover:text-zinc-400"
              }`}
            >
              Register
            </button>
          </div>

          {/* Authentication Actions */}
          <div className="flex flex-col gap-4">
            <p className="text-zinc-500 text-xs text-center leading-relaxed mb-2">
              {authMode === "login" 
                ? "Verify your identity through Google Secure Auth to access your database." 
                : "Initialize a new operative profile using your Google credentials."}
            </p>

            <button 
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black px-4 py-3.5 font-oswald uppercase tracking-widest text-sm font-bold hover:bg-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Fingerprint size={18} className="group-hover:scale-110 transition-transform" />
                  {authMode === "login" ? "Authenticate with Google" : "Register with Google"}
                </>
              )}
            </button>

            {/* Fake "Classified" Alternative method to maintain the aesthetic */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-700 text-[10px] uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <button 
              disabled
              className="w-full flex items-center justify-center gap-3 bg-transparent border border-zinc-800 text-zinc-600 px-4 py-3.5 font-oswald uppercase tracking-widest text-sm font-bold cursor-not-allowed"
              title="Manual Override Disabled"
            >
              <Key size={18} />
              Manual Override (Locked)
            </button>
          </div>

          {/* Footer Warning */}
          <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
            <p className="text-zinc-700 text-[9px] uppercase tracking-widest leading-loose">
              Unauthorized access is strictly monitored. <br /> All connection attempts are logged.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}