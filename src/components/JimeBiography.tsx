"use client";

import Link from "next/link";
import { useState } from "react";

/* ── Images ──────────────────────────────────────────────────────────────── */
const HERO_IMG =
  "https://images.unsplash.com/photo-1652119248337-a14f90b35b63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const BIO_IMG_1 =
  "https://images.unsplash.com/photo-1586447824866-3dbe5c051fcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800";
const BIO_IMG_2 =
  "https://images.unsplash.com/photo-1766404176475-3a2b6e1db351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600";

const CARDS = [
  {
    img: "https://images.unsplash.com/photo-1643651577068-57d08a386760?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    cat: "CORTOMETRAJE",
    title: "Ecos del Silencio",
    year: "2023",
  },
  {
    img: "https://images.unsplash.com/photo-1615932093813-bd5be5f40038?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    cat: "ÁLBUM",
    title: "Corazón de Hielo",
    year: "2023",
  },
  {
    img: "https://images.unsplash.com/photo-1672827924243-6133677b44b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    cat: "SERIE WEB",
    title: "Generación Digital",
    year: "2024",
  },
  {
    img: "https://images.unsplash.com/photo-1730411152319-d74da7634ff0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    cat: "SENCILLO",
    title: "Pingüina Loca",
    year: "2021",
  },
  {
    img: "https://images.unsplash.com/photo-1529071753386-dfb44ff59f69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    cat: "MARKETING",
    title: "Branding Personal",
    year: "2024",
  },
];

const PF = "'Playfair Display', Georgia, serif";
const GM = "var(--font-geist-mono), 'Courier New', monospace";
const GS = "var(--font-geist-sans), sans-serif";

/* ── img helper ──────────────────────────────────────────────────────────── */
// eslint-disable-next-line @next/next/no-img-element
const Img = (p: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...p} alt={p.alt ?? ""} />;

const NAV_LINKS = [
  { label: "Inicio",   href: "/" },
  { label: "Sobre Mi", href: "/sobre-mi" },
  { label: "Amigos",   href: "/amigos" },
  { label: "Historia", href: "/historia" },
  { label: "Skype",    href: "/skype" },
  { label: "Ask.fm",   href: "/ask" },
  { label: "Música",   href: "/musica" },
];

export default function JimeBiography() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: GS, background: "#0D0D0D", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          Layout: full-viewport dark section. Photo covers right ~65%.
          Big "JIMENA" bleeds slightly left at the bottom.
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", background: "#0D0D0D", height: "100svh", minHeight: 600, overflow: "hidden" }}>

        {/* ── Hero photo (right portion) ── */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "65%", height: "100%", zIndex: 1 }}>
          <Img src={HERO_IMG} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.85 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0D0D0D 0%, rgba(13,13,13,0.55) 30%, rgba(13,13,13,0) 65%)" }} />
        </div>

        {/* ── Nav ── */}
        <nav style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px" }}>
          <Link href="/" style={{ fontFamily: GM, fontSize: 12, fontWeight: 700, letterSpacing: 4, color: "#fff", textDecoration: "none" }}>JIME</Link>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 28 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} style={{ fontFamily: GM, fontSize: 10, letterSpacing: 2, color: href === "/sobre-mi" ? "#fff" : "#666", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = href === "/sobre-mi" ? "#fff" : "#666")}>
                {label.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setMenuOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 22, lineHeight: 1, padding: 0 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden" style={{ position: "absolute", top: 60, left: 0, right: 0, zIndex: 20, background: "#111", borderBottom: "1px solid #333" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                style={{ display: "block", fontFamily: GM, fontSize: 13, letterSpacing: 2, color: "#ccc", padding: "12px 24px", textDecoration: "none" }}>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* ── Vertical side label ── */}
        {/* translate(-50%,-50%) moves the element so its CENTER lands at (left, top),
            then rotate(-90deg) turns it sideways — this is the correct centering pattern */}
        <div className="hidden lg:block" style={{ position: "absolute", left: 28, top: "50%", transform: "translate(-50%, -50%) rotate(-90deg)", zIndex: 5, fontFamily: GM, fontSize: 10, color: "#666", letterSpacing: 4, whiteSpace: "nowrap" }}>
          CANTANTE · ACTRIZ · MERCADÓLOGA
        </div>

        {/* ── Cross marks ── */}
        <span className="hidden lg:block" style={{ position: "absolute", left: "32%", top: "30%", fontFamily: GS, fontSize: 18, color: "#333", zIndex: 5 }}>+</span>
        <span className="hidden lg:block" style={{ position: "absolute", right: "6%", bottom: "28%", fontFamily: GS, fontSize: 18, color: "#333", zIndex: 5 }}>+</span>

        {/* ── Counter ── */}
        <span style={{ position: "absolute", top: 40, right: 48, fontFamily: GM, fontSize: 11, letterSpacing: 3, color: "#444", zIndex: 5 }}>001</span>

        {/* ── Bottom-left content: subtitle + JIMENA + line + scroll ── */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5, padding: "0 0 60px 60px" }}>
          {/* Subtitle */}
          <p style={{ fontFamily: GS, fontSize: "clamp(12px, 1.4vw, 15px)", color: "#999", lineHeight: 1.7, marginBottom: 20, maxWidth: 280 }}>
            Cantante, actriz, mercadóloga<br />y creadora. Una historia entre<br />escenarios, pantallas y marcas.
          </p>

          {/* JIMENA — bleeds slightly left at full size */}
          <h1 style={{ fontFamily: PF, fontSize: "clamp(72px, 15vw, 220px)", fontWeight: 700, color: "#fff", lineHeight: 0.9, letterSpacing: -5, margin: "0 0 28px -8px" }}>
            JIMENA
          </h1>

          {/* Accent line */}
          <div style={{ width: 120, height: 1, background: "#fff", marginBottom: 10 }} />

          {/* Scroll tag */}
          <span style={{ fontFamily: GM, fontSize: 10, letterSpacing: 2, color: "#666" }}>Scroll para descubrir →</span>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — BIO  (white)
          Desktop: fixed-height container, photos absolutely positioned right.
            • Quote top-left  x≈80  y≈120
            • Photo 1         x≈860 y≈100  280×360
            • Photo 2         x≈1160 y≈180  200×260  (overlaps photo 1 right edge)
            • Text cols       y≈420  two 380px columns
          Mobile: stacked flow.
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#fff" }}>

        {/* ── Desktop layout (lg+) ── */}
        <div className="hidden lg:block" style={{ position: "relative", width: "100%", height: 700 }}>

          {/* ABOUT label */}
          <span style={{ position: "absolute", left: 80, top: 60, fontFamily: GM, fontSize: 10, letterSpacing: 4, color: "#999" }}>ABOUT</span>
          {/* 002 counter */}
          <span style={{ position: "absolute", right: 80, top: 60, fontFamily: GM, fontSize: 10, letterSpacing: 3, color: "#ccc" }}>002</span>

          {/* Quote */}
          <h2 style={{ position: "absolute", left: 80, top: 120, width: 700, fontFamily: PF, fontSize: 56, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.2, margin: 0 }}>
            &ldquo;No soy solo una cosa.<br />Soy todo lo que siento.&rdquo;
          </h2>

          {/* Photo 1 — grayscale portrait */}
          <div style={{ position: "absolute", left: 860, top: 100, width: 280, height: 360, overflow: "hidden" }}>
            <Img src={BIO_IMG_1} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Photo 2 — color, offset right and slightly down */}
          <div style={{ position: "absolute", left: 1160, top: 180, width: 200, height: 260, overflow: "hidden", boxShadow: "-2px 2px 20px rgba(0,0,0,0.12)" }}>
            <Img src={BIO_IMG_2} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Bio text — left column */}
          <p style={{ position: "absolute", left: 80, top: 420, width: 380, fontFamily: GS, fontSize: 14, color: "#444", lineHeight: 1.8, margin: 0 }}>
            Jimena nació con la música en la sangre y la actuación en el corazón. Desde pequeña, sus días se dividían entre ensayos de canto y funciones escolares donde siempre tenía el papel principal. A los 17 años grabó su primera canción en un estudio casero, y a los 19 ya pisaba escenarios profesionales.
          </p>

          {/* Bio text — right column */}
          <p style={{ position: "absolute", left: 540, top: 420, width: 380, fontFamily: GS, fontSize: 14, color: "#444", lineHeight: 1.8, margin: 0 }}>
            Su doble faceta como cantante y actriz la convierte en una artista única. En la música, fusiona pop latino con sonidos electrónicos y letras profundamente personales. En la pantalla, ha participado en cortometrajes independientes y series web que exploran temas de identidad, nostalgia y la vida digital de su generación. Como mercadóloga, entiende el poder de las narrativas visuales y la construcción de marca.
          </p>
        </div>

        {/* ── Mobile layout (< lg) ── */}
        <div className="lg:hidden" style={{ padding: "48px 24px 56px" }}>
          {/* Label row */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
            <span style={{ fontFamily: GM, fontSize: 10, letterSpacing: 4, color: "#999" }}>ABOUT</span>
            <span style={{ fontFamily: GM, fontSize: 10, letterSpacing: 3, color: "#ccc" }}>002</span>
          </div>

          {/* Quote */}
          <h2 style={{ fontFamily: PF, fontSize: "clamp(26px, 7vw, 40px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.2, margin: "0 0 32px" }}>
            &ldquo;No soy solo una cosa.<br />Soy todo lo que siento.&rdquo;
          </h2>

          {/* Photos — side by side */}
          <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
            <div style={{ flex: "0 0 58%", height: 280, overflow: "hidden" }}>
              <Img src={BIO_IMG_1} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: "0 0 37%", height: 220, overflow: "hidden", alignSelf: "flex-end" }}>
              <Img src={BIO_IMG_2} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>

          {/* Bio texts stacked */}
          <p style={{ fontFamily: GS, fontSize: 14, color: "#444", lineHeight: 1.8, margin: "0 0 20px" }}>
            Jimena nació con la música en la sangre y la actuación en el corazón. Desde pequeña, sus días se dividían entre ensayos de canto y funciones escolares donde siempre tenía el papel principal. A los 17 años grabó su primera canción en un estudio casero, y a los 19 ya pisaba escenarios profesionales.
          </p>
          <p style={{ fontFamily: GS, fontSize: 14, color: "#444", lineHeight: 1.8, margin: 0 }}>
            Su doble faceta como cantante y actriz la convierte en una artista única. En la música, fusiona pop latino con sonidos electrónicos y letras profundamente personales. En la pantalla, ha participado en cortometrajes independientes y series web que exploran temas de identidad, nostalgia y la vida digital de su generación.
          </p>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — STATEMENT  (dark)
          Design: 1440×500px. Big text at x=-30,y=80. Caption at x=900,y=260.
          Caption is ALONGSIDE the text on the right, not below it.
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Desktop */}
      <section className="hidden md:block" style={{ position: "relative", background: "#0D0D0D", overflow: "hidden", minHeight: 500 }}>
        {/* Counter */}
        <span style={{ position: "absolute", top: 40, right: 48, fontFamily: GM, fontSize: 10, letterSpacing: 3, color: "#444", zIndex: 2 }}>003</span>

        {/* Cross */}
        <span style={{ position: "absolute", left: "59%", top: "44%", fontFamily: GS, fontSize: 18, color: "#333", zIndex: 2 }}>+</span>

        {/* Big type — starts 80px from top, bleeds ~2% left */}
        <h2 style={{
          position: "absolute", top: 80, left: "-0.6%",
          fontFamily: PF, fontSize: "clamp(72px, 8.4vw, 120px)",
          fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: -3, margin: 0,
          whiteSpace: "nowrap",
        }}>
          CANTANTE<br />ACTRIZ &amp;<br />MERCADÓLOGA
        </h2>

        {/* Caption — at x≈62%, y=260 in 1440px design = 62.5% from left, 52% from top */}
        <p style={{
          position: "absolute", top: 260, right: "clamp(48px, 6.6vw, 96px)", width: 320,
          fontFamily: GS, fontSize: 15, color: "#888", lineHeight: 1.7, margin: 0,
        }}>
          Tres mundos. Una misma voz.<br />
          Jimena vive entre melodías,<br />
          guiones y estrategias de marca.<br />
          Donde otros ven límites,<br />
          ella ve conexiones.
        </p>
      </section>

      {/* Mobile */}
      <section className="md:hidden" style={{ background: "#0D0D0D", padding: "60px 24px 48px", overflow: "hidden" }}>
        <h2 style={{ fontFamily: PF, fontSize: "clamp(44px, 11vw, 72px)", fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: -2, margin: "0 0 32px" }}>
          CANTANTE<br />ACTRIZ &amp;<br />MERCADÓLOGA
        </h2>
        <p style={{ fontFamily: GS, fontSize: 14, color: "#888", lineHeight: 1.7, margin: 0 }}>
          Tres mundos. Una misma voz. Jimena vive entre melodías, guiones y estrategias de marca. Donde otros ven límites, ella ve conexiones.
        </p>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — MARKETING STRIP  (dark, compact)
          Height ~150px. Horizontal line, then 3-item row.
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#111", padding: "30px clamp(24px, 5.5vw, 80px) 40px" }}>
        {/* Line */}
        <div style={{ height: 1, background: "#222", marginBottom: 24 }} />

        {/* Row */}
        <div className="flex flex-col gap-5 md:flex-row md:items-start" style={{ gap: undefined }}>
          <span style={{ fontFamily: GM, fontSize: 10, letterSpacing: 4, color: "#666", flexShrink: 0, paddingTop: 2 }}>MARKETING</span>

          <p className="md:ml-16" style={{ fontFamily: GS, fontSize: 14, color: "#888", lineHeight: 1.7, margin: 0, maxWidth: 500, flex: 1 }}>
            Con visión estratégica y ojo creativo, Jimena aplica su formación en mercadotecnia para construir narrativas de marca auténticas. Desde campañas digitales hasta branding personal, transforma ideas en experiencias visuales que conectan.
          </p>

          <blockquote className="md:ml-auto" style={{ fontFamily: PF, fontSize: "clamp(18px, 2.2vw, 24px)", fontWeight: 700, color: "#fff", lineHeight: 1.3, margin: 0, maxWidth: 260, flexShrink: 0 }}>
            &ldquo;El marketing es<br />el arte de contar<br />historias que<br />importan.&rdquo;
          </blockquote>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — ROLES GRID  (dark)
          5 equal columns on desktop. Tall images (180px).
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#0D0D0D", padding: "60px clamp(24px, 5.5vw, 80px) 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <span style={{ fontFamily: GM, fontSize: 10, letterSpacing: 4, color: "#666" }}>FILMOGRAFÍA · MÚSICA · MARKETING</span>
          <span style={{ fontFamily: GM, fontSize: 10, letterSpacing: 3, color: "#444" }}>004</span>
        </div>

        {/* 5 equal columns on desktop, 2 on tablet, 1 on mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }} className="!grid-cols-2 sm:!grid-cols-3 lg:![grid-template-columns:repeat(5,1fr)]">
          {CARDS.map(card => (
            <div key={card.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Image */}
              <div style={{ height: 180, overflow: "hidden", background: "#1a1a1a" }}>
                <Img
                  src={card.img}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
              {/* Category */}
              <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 3, color: "#666" }}>{card.cat}</span>
              {/* Title */}
              <span style={{ fontFamily: PF, fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{card.title}</span>
              {/* Year */}
              <span style={{ fontFamily: GM, fontSize: 10, color: "#444" }}>{card.year}</span>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div style={{ marginTop: 72, paddingTop: 32, borderTop: "1px solid #1e1e1e" }}>
          <Link
            href="/"
            style={{ fontFamily: GM, fontSize: 11, letterSpacing: 3, color: "#666", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "color 0.2s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#666")}
          >
            ← VOLVER AL INICIO
          </Link>
        </div>
      </section>

    </div>
  );
}
