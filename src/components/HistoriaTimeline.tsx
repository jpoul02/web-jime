"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import HistoriaWrapped from "./HistoriaWrapped";
import HistoriaScrollTimeline from "./HistoriaScrollTimeline";
import MobileNav from "./MobileNav";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

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
const HERO_BG = "/nuestra-historia.jpg";
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

/* ─── Helper ──────────────────────────────────────────────────────────── */
// eslint-disable-next-line @next/next/no-img-element
const Img = (p: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...p} alt={p.alt ?? ""} />;

/* ═══════════════════════════════════════════════════════════════════════ */
export default function HistoriaTimeline() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wrappedOpen, setWrappedOpen] = useState(false);
  const [gridImgs, setGridImgs] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API}/historia/momentos`)
      .then(r => r.json())
      .then((data: Array<{ id: number; photo_url: string; order: number }>) => {
        setGridImgs(data.map(m => m.photo_url));
      })
      .catch(() => {});
  }, []);

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

          <button
            onClick={() => document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              marginTop: 8,
              background: TERRA,
              border: "none",
              borderRadius: 40,
              padding: "clamp(12px,1.5vw,16px) clamp(24px,3vw,40px)",
              color: "#fff",
              fontFamily: PF,
              fontSize: "clamp(15px,1.6vw,19px)",
              fontStyle: "italic",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 4px 24px rgba(212,145,110,0.45)",
              transition: "transform 0.15s, filter 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.filter = "brightness(1)"; }}
          >
            Ver nuestra historia ▶
          </button>
        </div>

        {/* EST. year — bottom right */}
        <span style={{ position: "absolute", bottom: "clamp(48px, 6vw, 80px)", right: "clamp(24px, 8.3vw, 120px)", fontFamily: GM, fontSize: 10, letterSpacing: 3, color: "#666" }}>
          EST. 2020
        </span>
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

      {/* ══ SCROLL TIMELINE ══════════════════════════════════════════════════ */}
      <div id="timeline"><HistoriaScrollTimeline /></div>

      {/* ══ PHOTO COLLAGE ═════════════════════════════════════════════════ */}
      {gridImgs.length > 0 && (
        <section style={{ background: CREAM, padding: "0 clamp(24px, 6.9vw, 100px) 80px" }}>
          <p style={{ fontFamily: GM, fontSize: 10, letterSpacing: 5, color: MUTED, margin: "0 0 24px" }}>
            NUESTROS MOMENTOS FAVORITOS
          </p>

          {/* CSS columns masonry — todas las fotos, aspect ratio natural */}
          <div style={{
            columns: "3 280px",
            columnGap: 12,
          }}>
            {gridImgs.map((src, i) => (
              <div key={i} style={{
                breakInside: "avoid",
                marginBottom: 12,
                overflow: "hidden",
                background: "#e0d5cc",
              }}>
                <Img
                  src={src}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    transition: "transform 0.5s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
            ))}
          </div>
        </section>
      )}

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
          <span style={{ fontFamily: PF, fontSize: "clamp(22px, 2.5vw, 32px)", fontStyle: "italic", color: TERRA }}>2025 — 2026</span>
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

      {wrappedOpen && <HistoriaWrapped onClose={() => setWrappedOpen(false)} />}
      <MobileNav />
    </div>
  );
}
