"use client";

import { useMemo } from "react";

const FLAKES = 120;

export default function Snowfall() {
  const flakes = useMemo(() =>
    Array.from({ length: FLAKES }, (_, i) => {
      const left    = Math.random() * 100;
      const size    = Math.random() * 5 + 2;          // 2–7px
      const delay   = Math.random() * 8;              // 0–8s
      const duration = Math.random() * 6 + 5;         // 5–11s
      const opacity = Math.random() * 0.5 + 0.5;      // 0.5–1.0
      const drift   = (Math.random() - 0.5) * 80;     // deriva horizontal
      return { id: i, left, size, delay, duration, opacity, drift };
    }),
  []);

  return (
    <>
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-20px) translateX(0);   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        {flakes.map((f) => (
          <div
            key={f.id}
            style={{
              position: "absolute",
              top: 0,
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              borderRadius: "50%",
              background: "white",
              opacity: f.opacity,
              "--drift": `${f.drift}px`,
              animation: `fall ${f.duration}s ${f.delay}s linear infinite`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
