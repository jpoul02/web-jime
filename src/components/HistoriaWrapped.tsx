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

/* ─── Componente principal (se completa en tareas siguientes) ─────────── */
export default function HistoriaWrapped({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 16, left: 16, zIndex: 10, background: "none", border: "none", cursor: "pointer", fontSize: 22, color: DARK, lineHeight: 1, padding: 4 }}
        aria-label="Cerrar"
      >
        ✕
      </button>
      <p style={{ fontFamily: GM, color: MUTED, fontSize: 12, letterSpacing: 3 }}>HISTORIA WRAPPED — WIP</p>
    </div>,
    document.body
  );
}
