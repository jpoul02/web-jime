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

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

/* ─── Tokens (mismos que HistoriaTimeline) ────────────────────────────── */
const PF    = "'Playfair Display', Georgia, serif";
const GM    = "var(--font-geist-mono), 'Courier New', monospace";
const GS    = "var(--font-geist-sans), sans-serif";
const TERRA = "#D4916E";
const MUTED = "#C5BEB6";
const CREAM = "#F3EBE2";
const DARK  = "#1A1A1A";
const MID   = "#3D3D3D";


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

/* ─── Helper render ──────────────────────────────────────────────────── */
function renderSlide(m: Momento | undefined) {
  if (!m) return null;
  if (m.type === "text") return <SlideText m={m} />;
  if (m.type === "arch") return <SlideArch m={m} />;
  return <SlideFullbleed m={m} />;
}

/* ─── Componente principal ────────────────────────────────────────────── */
export default function HistoriaWrapped({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted]       = useState(false);
  const [idx, setIdx]               = useState(0);
  const [prevIdx, setPrevIdx]       = useState<number | null>(null);
  const [direction, setDirection]   = useState<1 | -1>(1);
  const [transitioning, setTrans]   = useState(false);
  const [moments, setMoments]       = useState<Momento[]>([]);
  const [loading, setLoading]       = useState(true);
  const touchStartX                 = useRef<number | null>(null);
  const idxRef                      = useRef(0);
  const total                       = moments.length;
  const DUR                         = 300;

  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch(`${API}/historia/slides`)
      .then(r => r.json())
      .then((data: Array<{ id: number; date: string; title: string; desc: string; type: string; img_url: string | null; emoji?: string | null; order: number }>) => {
        setMoments(data.map((s, i) => ({
          num: String(i + 1).padStart(2, "0") + ".",
          date: s.date,
          title: s.title,
          desc: s.desc,
          type: s.type as "text" | "arch" | "fullbleed",
          img: s.img_url ?? undefined,
          emoji: s.emoji ?? undefined,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* Bloquear scroll del body */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* Inyectar keyframes de transición horizontal una sola vez */
  useEffect(() => {
    const id = "hw-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes hw-in-right  { from { transform:translateX(100%);  } to { transform:translateX(0); } }
        @keyframes hw-in-left   { from { transform:translateX(-100%); } to { transform:translateX(0); } }
        @keyframes hw-out-left  { from { transform:translateX(0); } to { transform:translateX(-100%);  } }
        @keyframes hw-out-right { from { transform:translateX(0); } to { transform:translateX(100%);   } }
      `;
      document.head.appendChild(s);
    }
    return () => { document.getElementById("hw-kf")?.remove(); };
  }, []);

  function navigate(dir: 1 | -1) {
    const next = idxRef.current + dir;
    if (next < 0 || next >= total || transitioning) return;
    setDirection(dir);
    setPrevIdx(idxRef.current);
    setTrans(true);
    setIdx(next);
    setTimeout(() => { setPrevIdx(null); setTrans(false); }, DUR);
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
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -40) navigate(1);
    else if (dx > 40) navigate(-1);
  };

  if (!mounted) return null;

  const easing = `${DUR}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, fontFamily: GS, overflow: "hidden" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Barras de progreso estilo Spotify (una por slide) ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
        display: "flex", gap: 3, padding: "10px 12px 0",
        pointerEvents: "none",
      }}>
        {moments.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2, borderRadius: 2,
            background: i <= idx ? TERRA : "rgba(197,190,182,0.35)",
          }} />
        ))}
      </div>

      {/* ── Botón cerrar ── */}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute", top: 20, left: 12, zIndex: 30,
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
          border: "1px solid rgba(197,190,182,0.4)", borderRadius: "50%",
          width: 34, height: 34, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: DARK, lineHeight: 1,
        }}
      >
        ✕
      </button>

      {/* ── Contador ── */}
      <span style={{
        position: "absolute", top: 24, right: 16, zIndex: 30,
        fontFamily: GM, fontSize: 9, letterSpacing: 4, color: MUTED,
        pointerEvents: "none",
      }}>
        {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>

      {/* ── Slides con transición horizontal ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        {(loading || moments.length === 0) && (
          <div style={{
            position: "absolute", inset: 0, background: CREAM,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 12, zIndex: 5,
          }}>
            <span style={{ fontFamily: PF, fontSize: 48, fontStyle: "italic", color: TERRA }}>
              {loading ? "..." : "♥"}
            </span>
            <p style={{ fontFamily: GS, fontSize: 14, color: MUTED, margin: 0 }}>
              {loading ? "Cargando nuestra historia..." : "No hay momentos todavía."}
            </p>
          </div>
        )}
        {/* Slide saliente */}
        {prevIdx !== null && (
          <div style={{
            position: "absolute", inset: 0,
            animation: `hw-out-${direction === 1 ? "left" : "right"} ${easing}`,
          }}>
            {renderSlide(moments[prevIdx])}
          </div>
        )}
        {/* Slide entrante */}
        <div style={{
          position: "absolute", inset: 0,
          animation: transitioning
            ? `hw-in-${direction === 1 ? "right" : "left"} ${easing}`
            : "none",
        }}>
          {renderSlide(moments[idx])}
        </div>
      </div>

      {/* ── Zonas de clic (izq = anterior, der = siguiente) ── */}
      <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 10 }}>
        <div
          style={{ flex: 1, height: "100%", cursor: idx > 0 ? "pointer" : "default" }}
          onClick={() => navigate(-1)}
        />
        <div
          style={{ flex: 1, height: "100%", cursor: idx < total - 1 ? "pointer" : "default" }}
          onClick={() => navigate(1)}
        />
      </div>
    </div>,
    document.body
  );
}
