"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

/* ─── Tokens ──────────────────────────────────────────────────────────────── */
const PF    = "'Playfair Display', Georgia, serif";
const GM    = "var(--font-geist-mono), 'Courier New', monospace";
const GS    = "var(--font-geist-sans), sans-serif";
const TERRA = "#D4916E";
const CREAM = "#F3EBE2";
const DARK  = "#1A1A1A";
const MID   = "#3D3D3D";
const LINE  = "#D4C5B8";

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Slide = {
  id: number;
  date: string;
  title: string;
  desc: string;
  img?: string;
  emoji?: string;
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function HistoriaScrollTimeline() {
  const [slides, setSlides]         = useState<Slide[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lightboxSrc, setLightbox]  = useState<string | null>(null);
  const [visible, setVisible]       = useState<Set<number>>(new Set());
  const cardRefs                    = useRef<(HTMLDivElement | null)[]>([]);

  /* Fetch slides */
  useEffect(() => {
    fetch(`${API}/historia/slides`)
      .then(r => r.json())
      .then((data: Array<{ id: number; date: string; title: string; desc: string; img_url: string | null; emoji?: string | null }>) => {
        setSlides(data.map(s => ({
          id: s.id,
          date: s.date,
          title: s.title,
          desc: s.desc,
          img: s.img_url ?? undefined,
          emoji: s.emoji ?? undefined,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ background: CREAM, padding: "80px clamp(24px, 6.9vw, 100px)", textAlign: "center" }}>
        <span style={{ fontFamily: PF, fontSize: 36, fontStyle: "italic", color: TERRA }}>...</span>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section style={{ background: CREAM, padding: "clamp(60px, 8vw, 100px) clamp(24px, 6.9vw, 100px)" }}>
      <p style={{ fontFamily: GM, fontSize: 10, letterSpacing: 5, color: LINE, margin: "0 0 60px" }}>
        NUESTRA LÍNEA DEL TIEMPO
      </p>

      {/* Timeline body — built in Task 2 */}
      <div style={{ position: "relative" }}>
        {slides.map((slide, i) => (
          <div key={slide.id} ref={el => { cardRefs.current[i] = el; }}>
            <p style={{ fontFamily: GS, color: DARK }}>{slide.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
