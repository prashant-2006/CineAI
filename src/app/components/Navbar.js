"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Menu, User, X, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Fetch authentication state from NextAuth
  const { data: session, status } = useSession();
  
  // Reference to close dropdown when clicking outside
  const profileRef = useRef(null);

  // Prevent scrolling when full-page mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  // Close profile dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full border-b border-zinc-900 bg-black/60 backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between relative z-50">
        
        {/* Logo & Desktop Links */}
        <div className="flex items-center gap-8 truncate mr-4">
          <Link href="/" className="font-oswald text-xl md:text-2xl font-bold tracking-widest text-white uppercase truncate">
            CINE<span className="text-zinc-600">.AI</span>
          </Link>
          
          <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-400 tracking-widest">
            <Link href="#" className="hover:text-white transition-colors uppercase">Watchlist</Link>
            <Link href="#" className="hover:text-white transition-colors uppercase">Favorites</Link>
            <Link href="#" className="hover:text-white transition-colors uppercase">Activity</Link>
            <Link href="#" className="hover:text-white transition-colors uppercase text-zinc-300">Recommendations</Link>
          </div>
        </div>
        
        {/* Actions & Mobile Toggle */}
        <div className="flex items-center gap-4 md:gap-6 text-zinc-400 shrink-0">
          
          <Link href="/search" className="hover:text-white flex items-center gap-2 transition-colors p-1">
            <span className="hidden md:block text-xs uppercase tracking-widest font-bold">Search</span>
            <Search size={20} strokeWidth={1.5} />
          </Link>

          {/* AUTHENTICATION SECTION */}
          {status === "loading" ? (
            // Loading skeleton
            <div className="w-8 h-8 rounded-full border border-zinc-800 animate-pulse bg-zinc-900" />
          ) : session ? (
            // Logged In: Profile Picture & Tactical Dropdown
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 focus:outline-none"
              >
                <img 
                  src={session.user?.image || "/default-avatar.png"} 
                  alt="Operative Profile" 
                  className="w-8 h-8 rounded-full border-2 border-zinc-700 object-cover"
                  referrerPolicy="no-referrer" /* 👈 This fixes the Google image block */
                />
              </button>

              {/* Classified Profile Dropdown */}
              <div className={`absolute top-12 right-0 w-64 bg-black/95 border border-zinc-800 backdrop-blur-xl p-5 shadow-2xl transition-all duration-200 ${isProfileDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <p className="text-zinc-600 text-[9px] uppercase tracking-[0.3em] font-semibold border-b border-zinc-800 pb-2 mb-3">
                  Operative Intel
                </p>
                <div className="mb-4">
                  <p className="font-oswald text-white tracking-widest text-sm uppercase truncate">
                    {session.user?.name || "Unknown"}
                  </p>
                  <p className="text-zinc-500 text-[10px] tracking-wider truncate mt-0.5">
                    {session.user?.email || "Classified Data"}
                  </p>
                </div>
                
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-between text-zinc-400 hover:text-red-500 border border-zinc-800 hover:border-red-900/50 bg-zinc-950/50 hover:bg-red-950/20 px-3 py-2.5 text-xs font-oswald uppercase tracking-widest transition-colors"
                >
                  Disconnect <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            // Not Logged In: Default Login Button
            <Link href="/login" className="hover:text-white flex items-center gap-2 transition-colors p-1">
              <span className="hidden md:block text-xs uppercase tracking-widest font-bold">Login</span>
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          {/* Hamburger Toggle */}
          <button 
            className="md:hidden hover:text-white transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Smooth FULL-PAGE Mobile Menu */}
      <div 
        className={`md:hidden fixed top-20 left-0 w-full h-[calc(100svh-5rem)] bg-black/95 backdrop-blur-2xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-10 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-8"
        }`}
      >
        <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl hover:text-white transition-colors uppercase font-oswald tracking-widest text-zinc-400">
          Watchlist
        </Link>
        <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl hover:text-white transition-colors uppercase font-oswald tracking-widest text-zinc-400">
          Favorites
        </Link>
        <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl hover:text-white transition-colors uppercase font-oswald tracking-widest text-zinc-400">
          Activity
        </Link>
        <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl hover:text-white transition-colors uppercase font-oswald tracking-widest text-zinc-200">
          Recommendations
        </Link>

        {/* Mobile Disconnect if logged in */}
        {session && (
          <button 
            onClick={() => {
              signOut();
              setIsMobileMenuOpen(false);
            }} 
            className="mt-8 text-lg flex items-center gap-3 hover:text-red-500 text-red-900 transition-colors uppercase font-oswald tracking-widest"
          >
            <LogOut size={20} /> Sever Connection
          </button>
        )}
      </div>
    </nav>
  );
}