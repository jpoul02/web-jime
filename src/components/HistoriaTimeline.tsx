"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Nav links ───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Inicio",   href: "/" },
  { label: "Sobre Mi", href: "/sobre-mi" },
  { label: "Amigos",   href: "/amigos" },
  { label: "Historia", href: "/historia" },
  { label: "Skype",    href: "/skype" },
  { label: "Ask.fm",   href: "/ask" },
  { label: "Música",   href: "/musica" },
];

/* ─── Images ──────────────────────────────────────────────────────────── */
const HERO_BG =
  "https://images.unsplash.com/photo-1773845597388-f89489cb82f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440";
const EV1_IMG =
  "https://images.unsplash.com/photo-1753351050724-511764d227e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600";
const EV2_IMG =
  "https://images.unsplash.com/photo-1772868357377-e468349c66fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600";
const EV3_IMG =
  "https://images.unsplash.com/photo-1764267703921-94e44d9e905b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600";
const EV4_IMG =
  "https://images.unsplash.com/photo-1768899818349-33f81e1555d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600";
const GRID_IMGS = [
  "https://images.unsplash.com/photo-1763328709918-d18a45bd562f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  "https://images.unsplash.com/photo-1766043373216-eca380b43a79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  "https://images.unsplash.com/photo-1773845596855-ede4d0499206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  "https://images.unsplash.com/photo-1643982061521-f00d2f4f7d1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  "https://images.unsplash.com/photo-1758523420267-d3bb03af8087?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  "https://images.unsplash.com/photo-1657305724733-51479a7309cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
];
const FOOTER_IMG =
  "https://images.unsplash.com/photo-1768193515652-82a7a5dcbe6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800";

/* ─── Tokens ──────────────────────────────────────────────────────────── */
const PF   = "'Playfair Display', Georgia, serif";
const GM   = "var(--font-geist-mono), 'Courier New', monospace";
const GS   = "var(--font-geist-sans), sans-serif";
const TERRA = "#D4916E";
const MUTED = "#C5BEB6";
const CREAM = "#F3EBE2";
const DARK  = "#1A1A1A";
const MID   = "#3D3D3D";

/* ─── Timeline events ─────────────────────────────────────────────────── */
const EVENTS = [
  {
    num: "01.",
    date: "15 MAR 2020",
    title: "El Día que\nNos Conocimos",
    desc: "Una cafetería, dos desconocidos, y una conversación que nunca terminó. El universo conspiró para que nuestros caminos se cruzaran ese día.",
    img: EV1_IMG,
    side: "left" as const,
  },
  {
    num: "02.",
    date: "28 ABR 2020",
    title: "Primera\nCita Oficial",
    desc: "Una cena que se convirtió en un paseo bajo las estrellas. Esa noche supimos que esto era más que una simple coincidencia.",
    img: EV2_IMG,
    side: "right" as const,
  },
  {
    num: "03.",
    date: "12 DIC 2020",
    title: "Primer Viaje\nJuntos",
    desc: "Las maletas, la carretera y miles de risas. Descubrimos que viajar juntos era nuestra forma favorita de ser felices.",
    img: EV3_IMG,
    side: "left" as const,
  },
  {
    num: "04.",
    date: "15 MAR 2021",
    title: "Un Año\nde Nosotros",
    desc: "365 días de aprender a amarnos mejor. Celebramos con la promesa de que esto apenas comenzaba.",
    img: EV4_IMG,
    side: "right" as const,
  },
];

/* ─── Helper ──────────────────────────────────────────────────────────── */
// eslint-disable-next-line @next/next/no-img-element
const Img = (p: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...p} alt={p.alt ?? ""} />;

/* ─── Arched photo ────────────────────────────────────────────────────── */
function ArchPhoto({ src, width = 200, height = 280 }: { src: string; width?: number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: `${width / 2}px ${width / 2}px 0 0`,
      }}
    >
      <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function HistoriaTimeline() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: GS, background: CREAM, overflowX: "hidden" }}>

      {/* ══ NAV ═══════════════════════════════════════════════════════════ */}
      <nav
        style={{
          background: "#FAFAF8",
          borderBottom: "1px solid #E8DDD5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 60px",
          height: 60,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/" style={{ fontFamily: PF, fontSize: 20, fontWeight: 700, color: DARK, textDecoration: "none" }}>
          J &amp; J
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ gap: 28, alignItems: "center" }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href}
              style={{ fontFamily: GM, fontSize: 10, letterSpacing: 2, color: href === "/historia" ? DARK : MID, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = DARK)}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = href === "/historia" ? DARK : MID)}>
              {label.toUpperCase()}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: DARK, padding: 0, lineHeight: 1 }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden" style={{ background: "#FAFAF8", borderBottom: `1px solid #E8DDD5`, position: "sticky", top: 60, zIndex: 49 }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ display: "block", fontFamily: GM, fontSize: 12, letterSpacing: 2, color: MID, padding: "12px 24px", borderBottom: "1px solid #f0e8e0", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", height: "min(700px, 85svh)", minHeight: 400, overflow: "hidden" }}>
        {/* BG photo */}
        <Img src={HERO_BG} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />

        {/* Dark overlay — fades from transparent top to solid bottom */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${DARK}00 0%, ${DARK}CC 50%, ${DARK} 100%)` }} />

        {/* Content */}
        <div style={{ position: "absolute", bottom: 0, left: 0, padding: "0 clamp(24px, 8.3vw, 120px) clamp(48px, 6vw, 80px)" }}>
          {/* Supertitle */}
          <p style={{ fontFamily: GM, fontSize: 11, letterSpacing: 6, color: TERRA, margin: "0 0 16px" }}>NUESTRA HISTORIA</p>

          {/* Main title */}
          <h1 style={{ fontFamily: PF, fontSize: "clamp(56px, 8.5vw, 120px)", fontStyle: "italic", color: "#fff", lineHeight: 1.05, margin: "0 0 clamp(24px, 3vw, 40px)" }}>
            Save<br />The Dates
          </h1>

          {/* Description */}
          <p style={{ fontFamily: GS, fontSize: "clamp(14px, 1.4vw, 16px)", color: MUTED, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 420 }}>
            Cada capítulo de nuestra historia merece<br className="hidden md:block" />
            ser recordado. Esta es la nuestra.
          </p>

          <span style={{ fontFamily: GM, fontSize: 10, letterSpacing: 3, color: TERRA }}>Scroll →</span>
        </div>

        {/* EST. year — bottom right */}
        <span style={{ position: "absolute", bottom: "clamp(48px, 6vw, 80px)", right: "clamp(24px, 8.3vw, 120px)", fontFamily: GM, fontSize: 10, letterSpacing: 3, color: "#666" }}>
          EST. 2020
        </span>
      </section>

      {/* ══ TIMELINE ══════════════════════════════════════════════════════ */}
      <section style={{ background: "#FAFAF8", padding: "80px 0 100px", position: "relative" }}>
        {/* Section label */}
        <p style={{ fontFamily: GM, fontSize: 10, letterSpacing: 5, color: MUTED, margin: "0 0 60px clamp(24px, 6.9vw, 100px)" }}>
          LÍNEA DEL TIEMPO
        </p>

        {/* ── Desktop timeline (md+) ─────────────────────────────────────
            ONE center line. Each event occupies the full row width.
            Left events fill the left half; right events fill the right half.
            No 2-col grid — prevents the "two parallel tracks" illusion.
        ── */}
        <div className="hidden md:block" style={{ position: "relative" }}>

          {/* THE single center line */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            background: MUTED,
            transform: "translateX(-50%)",
            zIndex: 0,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
            {EVENTS.map((ev) => (
              <div
                key={ev.num}
                style={{
                  /* Full width row; content placed on the correct half */
                  display: "flex",
                  width: "100%",
                  justifyContent: ev.side === "left" ? "flex-start" : "flex-end",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Dot on the center line */}
                <div style={{
                  position: "absolute",
                  left: "50%",
                  top: 24,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: TERRA,
                  transform: "translate(-50%, 0)",
                  zIndex: 2,
                }} />

                {/* Event card — takes up ~46% of the width, leaves room for center line */}
                <div
                  style={{
                    width: "46%",
                    display: "flex",
                    flexDirection: ev.side === "left" ? "row" : "row-reverse",
                    alignItems: "flex-start",
                    gap: 24,
                    paddingLeft: ev.side === "left" ? "clamp(24px, 6.9vw, 100px)" : 48,
                    paddingRight: ev.side === "right" ? "clamp(24px, 6.9vw, 100px)" : 48,
                  }}
                >
                  <ArchPhoto src={ev.img} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontFamily: PF, fontSize: 64, fontStyle: "italic", color: TERRA, lineHeight: 1 }}>{ev.num}</span>
                    <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 3, color: MUTED }}>{ev.date}</span>
                    <h3 style={{ fontFamily: PF, fontSize: 28, fontStyle: "italic", color: DARK, lineHeight: 1.2, margin: 0, whiteSpace: "pre-line" }}>{ev.title}</h3>
                    <p style={{ fontFamily: GS, fontSize: 13, color: MID, lineHeight: 1.7, margin: 0, maxWidth: 280 }}>{ev.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile: single column ── */}
        {/* Wrapper sin display inline para que md:hidden pueda sobreescribir */}
        <div className="md:hidden">
        <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 56, position: "relative" }}>
          {/* Single left line */}
          <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, width: 1, background: MUTED }} />

          {EVENTS.map((ev) => (
            <div key={ev.num} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              {/* Dot on the line */}
              <div style={{ flexShrink: 0, width: 40, display: "flex", justifyContent: "center", paddingTop: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: TERRA, flexShrink: 0 }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <ArchPhoto src={ev.img} width={140} height={190} />
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontFamily: PF, fontSize: 44, fontStyle: "italic", color: TERRA, lineHeight: 1 }}>{ev.num}</span>
                  <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 3, color: MUTED }}>{ev.date}</span>
                  <h3 style={{ fontFamily: PF, fontSize: 22, fontStyle: "italic", color: DARK, lineHeight: 1.25, margin: 0, whiteSpace: "pre-line" }}>{ev.title}</h3>
                  <p style={{ fontFamily: GS, fontSize: 13, color: MID, lineHeight: 1.7, margin: 0 }}>{ev.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>{/* end md:hidden wrapper */}
      </section>

      {/* ══ QUOTE ═════════════════════════════════════════════════════════ */}
      <section style={{ background: CREAM, padding: "clamp(48px, 6vw, 80px) clamp(24px, 11vw, 160px)" }}>
        {/* Terracotta divider — centered */}
        <div style={{ width: 80, height: 1, background: TERRA, margin: "0 auto 40px" }} />

        {/* Big quote */}
        <blockquote style={{ fontFamily: PF, fontSize: "clamp(24px, 3.5vw, 48px)", fontStyle: "italic", color: DARK, lineHeight: 1.25, margin: "0 0 24px" }}>
          &ldquo;Dicen que una foto vale más<br />
          que mil palabras. Las nuestras<br />
          cuentan nuestra historia.&rdquo;
        </blockquote>

        <p style={{ fontFamily: GM, fontSize: 10, letterSpacing: 4, color: TERRA, margin: 0 }}>— J &amp; J</p>
      </section>

      {/* ══ PHOTO GRID ════════════════════════════════════════════════════ */}
      <section style={{ background: CREAM, padding: "0 clamp(24px, 6.9vw, 100px) 80px" }}>
        <p style={{ fontFamily: GM, fontSize: 10, letterSpacing: 5, color: MUTED, margin: "0 0 24px" }}>
          NUESTROS MOMENTOS FAVORITOS
        </p>

        {/* Row 1: fill + fixed + fixed */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, marginBottom: 16 }} className="!grid-cols-1 sm:!grid-cols-2 lg:![grid-template-columns:1fr_300px_300px]">
          {GRID_IMGS.slice(0, 3).map((src, i) => (
            <div key={i} style={{ height: 250, overflow: "hidden", background: "#e0d5cc" }}>
              <Img
                src={src}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>

        {/* Row 2: fixed + fixed + fill */}
        <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 16 }} className="!grid-cols-1 sm:!grid-cols-2 lg:![grid-template-columns:300px_300px_1fr]">
          {GRID_IMGS.slice(3, 6).map((src, i) => (
            <div key={i} style={{ height: 250, overflow: "hidden", background: "#e0d5cc" }}>
              <Img
                src={src}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER DARK ═══════════════════════════════════════════════════ */}
      <section style={{ background: DARK, position: "relative", overflow: "hidden", minHeight: 580, padding: "60px clamp(24px, 6.9vw, 100px) 60px" }}>
        {/* Top line */}
        <div style={{ height: 1, background: "#333", marginBottom: 32 }} />

        {/* Label */}
        <p style={{ fontFamily: GM, fontSize: 10, letterSpacing: 5, color: TERRA, margin: "0 0 40px" }}>PRÓXIMO CAPÍTULO</p>

        {/* Big italic title */}
        <h2 style={{ fontFamily: PF, fontSize: "clamp(40px, 5.5vw, 80px)", fontStyle: "italic", color: "#fff", lineHeight: 1.1, margin: "0 0 48px", maxWidth: 700 }}>
          Y esto apenas<br />es el comienzo...
        </h2>

        {/* Description */}
        <p style={{ fontFamily: GS, fontSize: "clamp(13px, 1.4vw, 15px)", color: "#666", lineHeight: 1.8, margin: "0 0 48px", maxWidth: 540 }}>
          Seguimos escribiendo nuestra historia, un día a la vez.<br />
          Cada momento juntos es un nuevo recuerdo que atesorar.<br />
          Gracias por ser parte de este viaje.
        </p>

        {/* Year + heart row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "calc(100% - 480px)" }} className="md:max-w-[calc(100%-520px)] max-w-full">
          <span style={{ fontFamily: PF, fontSize: "clamp(22px, 2.5vw, 32px)", fontStyle: "italic", color: TERRA }}>2020 — 2026</span>
          <span style={{ fontSize: 28, color: TERRA }}>♥</span>
        </div>

        {/* Arched photo — right side, desktop only */}
        <div
          className="hidden lg:block"
          style={{
            position: "absolute",
            right: "clamp(60px, 6.9vw, 100px)",
            top: 100,
            width: 440,
            height: 420,
            overflow: "hidden",
            borderRadius: "220px 220px 0 0",
          }}
        >
          <Img src={FOOTER_IMG} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Back link */}
        <div style={{ marginTop: 60, paddingTop: 32, borderTop: "1px solid #2a2a2a" }}>
          <Link
            href="/"
            style={{ fontFamily: GM, fontSize: 11, letterSpacing: 3, color: "#555", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "color 0.2s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#555")}
          >
            ← VOLVER AL INICIO
          </Link>
        </div>
      </section>

    </div>
  );
}
