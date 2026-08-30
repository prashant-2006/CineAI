"use client";
import { useEffect, useState } from "react";

export default function CinematicParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 40 random particles
    const particleCount = 40;
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 10 + 15}s`, // Between 15s and 25s
      animationDelay: `-${Math.random() * 20}s`, // Randomize start time
      opacity: Math.random() * 0.4 + 0.1, // Subtle opacity
      size: `${Math.random() * 3 + 1}px`, // 1px to 4px
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bg-white rounded-full animate-particles shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            "--max-opacity": p.opacity,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    </div>
  );
}