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

/* ─── Card sub-component ──────────────────────────────────────────────────── */
function Card({
  slide,
  isVis,
  onImg,
  dir = 0,
}: {
  slide: Slide;
  isVis: boolean;
  onImg: (src: string) => void;
  dir?: -1 | 0 | 1;
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #EDE5DC",
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      padding: "clamp(18px, 2.5vw, 26px)",
      maxWidth: 420,
      width: "100%",
      opacity: isVis ? 1 : 0,
      transform: isVis
        ? "translateX(0)"
        : dir === 0
          ? "translateX(-30px)"
          : `translateX(${dir === -1 ? "-50px" : "50px"})`,
      transition: "opacity 500ms ease-out, transform 500ms ease-out",
    }}>
      {/* Date — mobile only (desktop date is on the center column) */}
      {dir === 0 && (
        <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 3, color: TERRA, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
          {slide.date}
        </span>
      )}

      {/* Divider */}
      <div style={{ width: 24, height: 1, background: TERRA, marginBottom: 10 }} />

      {/* Title */}
      <h3 style={{ fontFamily: PF, fontSize: "clamp(18px, 2.2vw, 24px)", fontStyle: "italic", color: DARK, margin: "0 0 8px", lineHeight: 1.25 }}>
        {slide.title}
      </h3>

      {/* Description */}
      <p style={{ fontFamily: GS, fontSize: 14, color: MID, lineHeight: 1.75, margin: 0 }}>
        {slide.desc}
      </p>

      {/* Image */}
      {slide.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.img}
          alt=""
          onClick={() => onImg(slide.img!)}
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 8,
            marginTop: 14,
            cursor: "pointer",
            display: "block",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        />
      )}

      {/* Emoji (only if no image) */}
      {!slide.img && slide.emoji && (
        <div style={{ fontSize: 48, textAlign: "center", marginTop: 14, lineHeight: 1 }}>
          {slide.emoji}
        </div>
      )}
    </div>
  );
}

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

  /* IntersectionObserver — animate cards on scroll */
  useEffect(() => {
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              setVisible(prev => new Set(prev).add(idx));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach(el => { if (el) observer.observe(el); });

    return () => observer.disconnect();
  }, [slides]);

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

      <div style={{ position: "relative" }}>
        {/* Vertical center line — desktop */}
        <div
          className="hidden md:block"
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            background: LINE,
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        />

        {/* Vertical left line — mobile */}
        <div
          className="md:hidden"
          style={{
            position: "absolute",
            left: 20,
            top: 0,
            bottom: 0,
            width: 2,
            background: LINE,
            zIndex: 0,
          }}
        />

        {slides.map((slide, i) => {
          const isLeft = i % 2 === 0;
          const isVis  = visible.has(i);

          return (
            <div
              key={slide.id}
              ref={el => { cardRefs.current[i] = el; }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: 64,
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* ── Desktop: left card or spacer ── */}
              <div
                className="hidden md:flex"
                style={{ flex: 1, justifyContent: "flex-end", paddingRight: 40 }}
              >
                {isLeft && <Card slide={slide} isVis={isVis} onImg={setLightbox} dir={-1} />}
              </div>

              {/* ── Desktop: center dot + date ── */}
              <div
                className="hidden md:flex"
                style={{
                  width: 160,
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  paddingTop: 4,
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: isVis ? TERRA : LINE,
                  border: `2px solid ${isVis ? TERRA : LINE}`,
                  transition: "background 0.4s, border-color 0.4s",
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: GM,
                  fontSize: 9,
                  letterSpacing: 3,
                  color: TERRA,
                  textTransform: "uppercase" as const,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}>
                  {slide.date}
                </span>
              </div>

              {/* ── Desktop: right card or spacer ── */}
              <div
                className="hidden md:flex"
                style={{ flex: 1, justifyContent: "flex-start", paddingLeft: 40 }}
              >
                {!isLeft && <Card slide={slide} isVis={isVis} onImg={setLightbox} dir={1} />}
              </div>

              {/* ── Mobile: left dot + card ── */}
              <div className="md:hidden" style={{ paddingLeft: 48, width: "100%" }}>
                <div style={{
                  position: "absolute",
                  left: 14,
                  top: 6,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: isVis ? TERRA : LINE,
                  border: `2px solid ${isVis ? TERRA : LINE}`,
                  transition: "background 0.4s, border-color 0.4s",
                }} />
                <Card slide={slide} isVis={isVis} onImg={setLightbox} dir={0} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
