"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

const TERRA = "#D4916E";
const CREAM = "#FAF3E0";
const INK   = "#2C1A10";

export default function CartaOverlay() {
  const [mounted, setMounted]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [texto, setTexto]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  // Logo tap counter
  const tapCount  = useRef(0);
  const tapTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "jime" keyboard sequence
  const keyBuffer = useRef("");

  useEffect(() => { setMounted(true); }, []);

  // Inject Caveat font once
  useEffect(() => {
    const id = "caveat-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap";
      document.head.appendChild(link);
    }
    return () => { document.getElementById("caveat-font")?.remove(); };
  }, []);

  // Inject carta-fade-in keyframe
  useEffect(() => {
    const id = "carta-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `@keyframes carta-fade-in { from { opacity:0; } to { opacity:1; } }`;
      document.head.appendChild(s);
    }
    return () => { document.getElementById("carta-kf")?.remove(); };
  }, []);

  const openCarta = useCallback(async () => {
    if (open) return;
    setOpen(true);
    if (texto !== null) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/carta`);
      const data = await r.json();
      setTexto(data.texto ?? "");
    } catch {
      setTexto("");
    } finally {
      setLoading(false);
    }
  }, [open, texto]);

  const closeCarta = useCallback(() => setOpen(false), []);

  // Logo area tap trigger (fixed invisible zone top-left)
  function handleLogoTap() {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      openCarta();
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
  }

  // "jime" keyboard trigger
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      keyBuffer.current = (keyBuffer.current + e.key.toLowerCase()).slice(-4);
      if (keyBuffer.current === "jime") {
        keyBuffer.current = "";
        openCarta();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCarta]);

  // Block body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape key to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCarta();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeCarta]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Invisible logo tap zone — fixed top-left, matches nav logo position */}
      <div
        onClick={handleLogoTap}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 120, height: 60,
          zIndex: 9998, cursor: "default",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-hidden="true"
      />

      {/* Overlay */}
      {open && (
        <div
          onClick={closeCarta}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10, 8, 6, 0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "clamp(16px, 4vw, 40px)",
            backdropFilter: "blur(3px)",
            animation: "carta-fade-in 0.35s ease forwards",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: CREAM,
              borderRadius: 4,
              width: "100%",
              maxWidth: 580,
              maxHeight: "85svh",
              overflowY: "auto",
              padding: "clamp(28px, 6vw, 52px) clamp(24px, 5vw, 48px)",
              position: "relative",
              boxShadow: "0 8px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(212,145,110,0.15)",
            }}
          >
            {/* Close */}
            <button
              onClick={closeCarta}
              aria-label="Cerrar"
              style={{
                position: "absolute", top: 16, right: 16,
                background: "none", border: "none",
                cursor: "pointer", fontSize: 18,
                color: "#9c8070", lineHeight: 1,
                padding: 4,
              }}
            >✕</button>

            {/* Decorative top line */}
            <div style={{ width: 40, height: 2, background: TERRA, marginBottom: 24 }} />

            {/* Content */}
            {loading ? (
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "#9c8070", margin: 0 }}>
                ...
              </p>
            ) : texto ? (
              <p style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(18px, 2.5vw, 22px)",
                color: INK,
                lineHeight: 1.85,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}>
                {texto}
              </p>
            ) : (
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: "#9c8070", margin: 0 }}>
                Todavía no hay carta...
              </p>
            )}

            {/* Decorative bottom */}
            <div style={{ marginTop: 32, textAlign: "right" }}>
              <span style={{ color: TERRA, fontSize: 22 }}>♥</span>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
