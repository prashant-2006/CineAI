"use client";
import { useState, useEffect } from "react";
import { Search, Menu, User, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent scrolling when the full-page mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

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
            <Link href="#" className="hover:text-white transition-colors uppercase">Recommendations</Link>
          </div>
        </div>
        
        {/* Actions & Mobile Toggle */}
        <div className="flex items-center gap-4 md:gap-6 text-zinc-400 shrink-0">
          
          <Link href="/search" className="hover:text-white flex items-center gap-2 transition-colors p-1">
            <span className="hidden md:block text-xs uppercase tracking-widest font-bold">Search</span>
            <Search size={20} strokeWidth={1.5} />
          </Link>

          <button className="hover:text-white flex items-center gap-2 transition-colors p-1">
            <span className="hidden md:block text-xs uppercase tracking-widest font-bold">Login</span>
            <User size={20} strokeWidth={1.5} />
          </button>

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
        className={`md:hidden fixed top-20 left-0 w-full h-[calc(100svh-5rem)] bg-black backdrop-blur-2xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-10 ${
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
        <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl hover:text-white transition-colors uppercase font-oswald tracking-widest text-zinc-400">
          Recommendations
        </Link>
      </div>
    </nav>
  );
}