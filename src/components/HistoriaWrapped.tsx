"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ─── Types ───────────────────────────────────────────────────────────── */
type SlideType = "text" | "arch" | "fullbleed";

type Momento = {
  num: string;
  date: string;
  title: string;
  desc: string;
  type: SlideType;
  img?: string;
  emoji?: string;
};

/* ─── Tokens (mismos que HistoriaTimeline) ────────────────────────────── */
const PF    = "'Playfair Display', Georgia, serif";
const GM    = "var(--font-geist-mono), 'Courier New', monospace";
const GS    = "var(--font-geist-sans), sans-serif";
const TERRA = "#D4916E";
const MUTED = "#C5BEB6";
const CREAM = "#F3EBE2";
const DARK  = "#1A1A1A";
const MID   = "#3D3D3D";

/* ─── Momentos (reemplazar con datos reales) ──────────────────────────── */
const MOMENTS: Momento[] = [
  {
    num: "01.",
    date: "15 MAR 2020",
    title: "El Día que\nNos Conocimos",
    desc: "Una cafetería, dos desconocidas, y una conversación que nunca terminó. El universo conspiró para que nuestros caminos se cruzaran ese día.",
    type: "text",
  },
  {
    num: "02.",
    date: "28 ABR 2020",
    title: "Primera\nCita Oficial",
    desc: "Una cena que se convirtió en un paseo bajo las estrellas. Esa noche supimos que esto era más que una simple coincidencia.",
    type: "arch",
    emoji: "🌟",
  },
  {
    num: "03.",
    date: "12 DIC 2020",
    title: "Primer Viaje\nJuntos",
    desc: "Las maletas, la carretera y miles de risas. Descubrimos que viajar juntas era nuestra forma favorita de ser felices.",
    type: "fullbleed",
    emoji: "✈️",
  },
  {
    num: "04.",
    date: "15 MAR 2021",
    title: "Un Año\nde Nosotras",
    desc: "365 días de aprender a amarnos mejor. Celebramos con la promesa de que esto apenas comenzaba.",
    type: "text",
  },
  {
    num: "05.",
    date: "20 JUN 2021",
    title: "El Verano\nMás Lindo",
    desc: "Días largos, risas interminables y la certeza de que cada momento a tu lado vale la pena.",
    type: "arch",
    emoji: "☀️",
  },
  {
    num: "06.",
    date: "25 DIC 2021",
    title: "Navidad\nJuntas",
    desc: "La primera de muchas. Luces, regalos y la calidez de saber que ya tenía a la persona más especial.",
    type: "fullbleed",
    emoji: "🎄",
  },
];

/* ─── Slide renderers ─────────────────────────────────────────────────── */

function SlideText({ m }: { m: Momento }) {
  return (
    <div style={{
      background: CREAM, width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "80px clamp(32px, 8vw, 120px)", gap: 12, textAlign: "center",
    }}>
      <span style={{ fontFamily: PF, fontSize: "clamp(56px,10vh,80px)", fontStyle: "italic", color: TERRA, lineHeight: 1 }}>
        {m.num}
      </span>
      <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 5, color: MUTED, textTransform: "uppercase" }}>
        {m.date}
      </span>
      <div style={{ width: 32, height: 1, background: TERRA }} />
      <h2 style={{ fontFamily: PF, fontSize: "clamp(26px,4.5vw,42px)", fontStyle: "italic", color: DARK, lineHeight: 1.2, margin: 0, whiteSpace: "pre-line" }}>
        {m.title}
      </h2>
      <p style={{ fontFamily: GS, fontSize: "clamp(13px,1.5vw,16px)", color: MID, lineHeight: 1.7, margin: 0, maxWidth: 440 }}>
        {m.desc}
      </p>
    </div>
  );
}

function SlideArch({ m }: { m: Momento }) {
  return (
    <div style={{
      background: CREAM, width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "80px clamp(32px, 8vw, 120px)", gap: 10, textAlign: "center",
    }}>
      {/* Visual element: foto arco > emoji > placeholder */}
      {m.img ? (
        <div style={{ width: 110, height: 145, borderRadius: "55px 55px 0 0", overflow: "hidden", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : m.emoji ? (
        <div style={{ fontSize: 52, lineHeight: 1, flexShrink: 0 }}>{m.emoji}</div>
      ) : (
        <div style={{ width: 110, height: 145, borderRadius: "55px 55px 0 0", background: "#E8DDD5", border: "1px dashed #D4916E", flexShrink: 0 }} />
      )}

      <span style={{ fontFamily: PF, fontSize: "clamp(48px,8vh,64px)", fontStyle: "italic", color: TERRA, lineHeight: 1 }}>
        {m.num}
      </span>
      <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 5, color: MUTED, textTransform: "uppercase" }}>
        {m.date}
      </span>
      <div style={{ width: 32, height: 1, background: TERRA }} />
      <h2 style={{ fontFamily: PF, fontSize: "clamp(22px,3.5vw,36px)", fontStyle: "italic", color: DARK, lineHeight: 1.2, margin: 0, whiteSpace: "pre-line" }}>
        {m.title}
      </h2>
      <p style={{ fontFamily: GS, fontSize: "clamp(13px,1.5vw,15px)", color: MID, lineHeight: 1.7, margin: 0, maxWidth: 400 }}>
        {m.desc}
      </p>
    </div>
  );
}

function SlideFullbleed({ m }: { m: Momento }) {
  const hasBg = !!m.img;
  return (
    <div style={{
      width: "100%", height: "100%", position: "relative",
      ...(hasBg
        ? { backgroundImage: `url(${m.img})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { background: "linear-gradient(160deg, #3a2a20 0%, #6b4a35 50%, #8D7B71 100%)" }),
    }}>
      {/* Emoji decorativo cuando no hay foto */}
      {!hasBg && m.emoji && (
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          fontSize: "clamp(64px,14vw,120px)", lineHeight: 1, opacity: 0.3, pointerEvents: "none",
        }}>
          {m.emoji}
        </div>
      )}

      {/* Overlay gradiente */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(26,26,26,0.92) 0%, rgba(26,26,26,0.35) 55%, transparent 100%)",
      }} />

      {/* Texto alineado abajo-izquierda */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        padding: "0 clamp(28px, 7vw, 100px)", zIndex: 1,
      }}>
        <span style={{ fontFamily: PF, fontSize: "clamp(48px,8vh,64px)", fontStyle: "italic", color: TERRA, lineHeight: 1, display: "block" }}>
          {m.num}
        </span>
        <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 5, color: "rgba(197,190,182,0.7)", textTransform: "uppercase", display: "block", marginTop: 8 }}>
          {m.date}
        </span>
        <div style={{ width: 32, height: 1, background: TERRA, margin: "14px 0" }} />
        <h2 style={{ fontFamily: PF, fontSize: "clamp(26px,4.5vw,44px)", fontStyle: "italic", color: "#fff", lineHeight: 1.2, margin: "0 0 14px", whiteSpace: "pre-line" }}>
          {m.title}
        </h2>
        <p style={{ fontFamily: GS, fontSize: "clamp(13px,1.5vw,16px)", color: "rgba(197,190,182,0.85)", lineHeight: 1.7, margin: 0, maxWidth: 500 }}>
          {m.desc}
        </p>
      </div>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────── */
export default function HistoriaWrapped({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [idx, setIdx]         = useState(0);
  const [fading, setFading]   = useState(false);
  const touchStartX           = useRef<number | null>(null);
  const idxRef                = useRef(0);
  const total                 = MOMENTS.length;

  /* Sync ref para evitar stale closures en el handler de teclado */
  useEffect(() => { idxRef.current = idx; }, [idx]);

  /* Montar (necesario para createPortal en SSR) */
  useEffect(() => { setMounted(true); }, []);

  /* Bloquear scroll del body */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* Navegación con fade */
  function navigate(dir: 1 | -1) {
    const next = idxRef.current + dir;
    if (next < 0 || next >= total) return;
    setFading(true);
    setTimeout(() => {
      setIdx(next);
      setFading(false);
    }, 220);
  }

  /* Teclado */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigate(1);
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Touch swipe */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -40) navigate(1);
    else if (dx > 40) navigate(-1);
  };

  if (!mounted) return null;

  const m = MOMENTS[idx];
  const progress = ((idx + 1) / total) * 100;
  const counter  = `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, fontFamily: GS }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Progress bar ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(197,190,182,0.4)", zIndex: 20, pointerEvents: "none" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: TERRA, transition: "width 0.3s ease" }} />
      </div>

      {/* ── Botón cerrar ── */}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute", top: 16, left: 16, zIndex: 30,
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
          border: "1px solid rgba(197,190,182,0.4)", borderRadius: "50%",
          width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: DARK, lineHeight: 1,
        }}
      >
        ✕
      </button>

      {/* ── Contador ── */}
      <span style={{
        position: "absolute", top: 20, right: 20, zIndex: 30,
        fontFamily: GM, fontSize: 9, letterSpacing: 4, color: MUTED,
      }}>
        {counter}
      </span>

      {/* ── Slide con fade ── */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.22s ease",
      }}>
        {m.type === "text"      && <SlideText      m={m} />}
        {m.type === "arch"      && <SlideArch      m={m} />}
        {m.type === "fullbleed" && <SlideFullbleed m={m} />}
      </div>

      {/* ── Zonas de clic (izq = anterior, der = siguiente) ── */}
      <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 10, pointerEvents: "none" }}>
        <div
          style={{ flex: 1, height: "100%", cursor: idx > 0 ? "pointer" : "default", pointerEvents: "auto" }}
          onClick={() => navigate(-1)}
        />
        <div
          style={{ flex: 1, height: "100%", cursor: idx < total - 1 ? "pointer" : "default", pointerEvents: "auto" }}
          onClick={() => navigate(1)}
        />
      </div>

      {/* ── Flechas visibles ── */}
      {idx > 0 && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Anterior"
          style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            zIndex: 20, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(197,190,182,0.5)", borderRadius: "50%",
            width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: DARK,
          }}
        >
          ←
        </button>
      )}
      {idx < total - 1 && (
        <button
          onClick={() => navigate(1)}
          aria-label="Siguiente"
          style={{
            position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
            zIndex: 20, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(197,190,182,0.5)", borderRadius: "50%",
            width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: DARK,
          }}
        >
          →
        </button>
      )}

      {/* ── Dots ── */}
      <div style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, zIndex: 20, pointerEvents: "none",
      }}>
        {MOMENTS.map((_, i) => (
          <div key={i} style={{
            height: 6, borderRadius: 3,
            width: i === idx ? 18 : 6,
            background: i === idx ? TERRA : MUTED,
            transition: "all 0.25s ease",
          }} />
        ))}
      </div>
    </div>,
    document.body
  );
}
