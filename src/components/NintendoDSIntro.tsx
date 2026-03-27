"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function NintendoDSIntro({ onDone }: { onDone?: () => void } = {}) {
  // "idle"   → pantalla negra, esperando click
  // "booting" → animación corriendo + sonido
  // "leaving" → fade out final
  // "gone"   → desmontado
  const [phase, setPhase] = useState<"idle" | "booting" | "leaving" | "gone">("idle");
  const [blinkVisible, setBlinkVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function addTimer(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  function boot() {
    if (phase !== "idle") return;

    // Play real audio — funciona porque viene de un click del usuario
    const audio = new Audio("/sounds/ds-intro.mp3");
    audio.volume = 1;
    audio.play();

    setPhase("booting");
    addTimer(() => setBlinkVisible(true), 1800);
  }

  function dismiss() {
    if (phase !== "booting" || !blinkVisible) return;
    setPhase("leaving");
    addTimer(() => setGone(), 500);
  }

  function setGone() {
    timers.current.forEach(clearTimeout);
    setPhase("gone");
    onDone?.();
  }

  if (phase === "gone") return null;

  return (
    <div
      className={`fixed inset-0 z-50 select-none transition-opacity duration-500 ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
      onClick={phase === "idle" ? boot : dismiss}
      style={{ cursor: phase === "idle" ? "default" : "pointer" }}
    >
      {/* ── Pantalla idle: negro puro, sin texto (como DS apagada) ─── */}
      {phase === "idle" && (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* ── Animación de boot ────────────────────────────────────────── */}
      {phase !== "idle" && (
        <>
          {/* Contenido (health screen) */}
          <div className="absolute inset-0 bg-ds-bg flex flex-col items-center justify-center animate-ds-content-in">

            {/* Nintendo DS logo — next/image para mejor calidad */}
            <div className="mb-8 relative w-[280px] h-[120px]">
              <Image
              src="/logo-nintendo.png"
              alt="Nintendo DS"
              fill
              className="object-contain"
              quality={100}
              priority
              draggable={false}
              />
            </div>

            {/* Warning block */}
            <div className="flex flex-col items-center gap-3 text-center">

              {/* Header */}
              <div className="flex items-center gap-2">
                <svg width="22" height="20" viewBox="0 0 22 20" aria-hidden>
                  <path d="M11 1.5 L20.5 18.5 H1.5 Z" fill="#f5c518" stroke="#555" strokeWidth="0.8"/>
                  <text
                    x="11" y="16"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#333"
                    fontFamily="Arial, sans-serif"
                  >!</text>
                </svg>
                <span
                  className="font-arial-black text-ds-primary text-[16px] tracking-[0.64px] whitespace-nowrap"
                  style={{ fontWeight: 900 }}
                >
                  WARNING - HEALTH AND SAFETY
                </span>
              </div>

              {/* Body */}
              <div
                className="text-ds-primary text-[11.52px] tracking-[0.46px] uppercase leading-[19.6px]"
                style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}
              >
                <p>BEFORE PLAYING, READ THE HEALTH</p>
                <p>AND SAFETY PRECAUTIONS BOOKLET</p>
                <p>FOR IMPORTANT INFORMATION</p>
                <p>ABOUT YOUR HEALTH AND SAFETY.</p>
              </div>

              {/* URL */}
              <div
                className="text-ds-secondary text-[9.6px] tracking-[0.29px] leading-[14.4px] mt-1"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <p>TO GET AN EXTRA COPY FOR YOUR REGION, GO ONLINE AT</p>
                <p className="text-ds-link">www.nintendo.com/healthsafety/</p>
              </div>
            </div>

            {/* Touch to continue */}
            <p
              className={`absolute bottom-16 text-ds-muted text-[10.4px] tracking-[0.21px] transition-opacity duration-300 ${
                blinkVisible ? "animate-ds-blink" : "opacity-0"
              }`}
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Touch the Touch Screen to continue.
            </p>
          </div>

          {/* Boot overlay: negro → flash blanco → desaparece */}
          <div className="absolute inset-0 animate-ds-overlay pointer-events-none" />
        </>
      )}
    </div>
  );
}
