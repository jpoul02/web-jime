"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SpotifyWrapped from "./SpotifyWrapped";

const HERO_IMAGE = "/hero-jime.jpg";

/* ── Palette ──────────────────────────────────────────────── */
const G = "#1DB954";          // Spotify green
const BG = "#121212";
const SBG = "#000000";        // sidebar black
const CARD = "#181818";
const HOVER = "#282828";
const MUT = "#B3B3B3";

/* ── Data ─────────────────────────────────────────────────── */
const TRACKS = [
  { num: 1,  title: "Corazón de Hielo",   album: "Club Penguin Nights", plays: "1.706.273.461", dur: "3:57",  color: "#2D4A6B", emoji: "❄️" },
  { num: 2,  title: "Noches de Verano",   album: "Un Verano Sin Ti",    plays: "1.388.577.304", dur: "6:07",  color: "#8B5E1A", emoji: "🌙" },
  { num: 3,  title: "Pingüina Loca",      album: "Pingüina Loca",       plays: "1.150.518.059", dur: "3:03",  color: "#1A6B5E", emoji: "🐧" },
  { num: 4,  title: "Club Penguin Nights",album: "Club Penguin Nights", plays: "1.010.522.775", dur: "3:24",  color: "#1A1A4A", emoji: "🌃" },
  { num: 5,  title: "Tití Me Preguntó",   album: "Un Verano Sin Ti",    plays: "2.114.738.352", dur: "4:03",  color: "#7A1A4A", emoji: "🦜" },
];

const DISCO = [
  { title: "Corazón de Hielo",   year: "2022",  type: "Álbum",  color: "#2D4A6B", emoji: "❄️" },
  { title: "Noches de Verano",   year: "2021",  type: "Álbum",  color: "#8B5E1A", emoji: "🌙" },
  { title: "Pingüina Loca",      year: "2023",  type: "Single", color: "#1A6B5E", emoji: "🐧" },
  { title: "Club Penguin Nights",year: "2024",  type: "EP",     color: "#1A1A4A", emoji: "🌃" },
  { title: "Tití Me Preguntó",   year: "2022",  type: "Single", color: "#7A1A4A", emoji: "🦜" },
];

const BANDS = [
  { name: "Voz de Ángeles Coro",              role: "Soprano",       years: "2018–2022"    },
  { name: "Todos mis amigos se llaman Javier",role: "Voz principal", years: "2021–presente"},
  { name: "Coro Universitario",               role: "Contralto",     years: "2023–presente"},
];

/* ── SpotifyLogo SVG ──────────────────────────────────────── */
function SpotifyLogo({ size = 24, color = G }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

/* ── Play icon SVG ────────────────────────────────────────── */
function PlayIcon({ size = 18, color = "#000" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function SpotifyArtistPage() {
  const [showWrapped, setShowWrapped] = useState(false);
  const [discFilter, setDiscFilter] = useState<"popular" | "albums" | "singles">("popular");
  const [liked, setLiked] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

  if (showWrapped) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
        <SpotifyWrapped />
        <button
          onClick={() => setShowWrapped(false)}
          style={{
            position: "fixed", top: 16, left: 16, zIndex: 10000,
            background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 24, padding: "8px 18px",
            color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", backdropFilter: "blur(8px)",
            fontFamily: "var(--font-spotify), sans-serif",
          }}
        >
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: BG, fontFamily: "var(--font-spotify), -apple-system, sans-serif",
      color: "#fff",
    }}>

      {/* ═══ SIDEBAR ═══════════════════════════════════════════ */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: SBG,
        display: "flex", flexDirection: "column",
        padding: "16px 12px", gap: 20,
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "8px 12px" }}>
          <SpotifyLogo size={32} />
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "10px 12px", borderRadius: 4,
            color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 700,
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="#fff">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="#fff" strokeWidth="2"/>
            </svg>
            Inicio
          </Link>
          <button style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "10px 12px", borderRadius: 4,
            color: MUT, background: "none", border: "none",
            fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left",
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={MUT} strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Buscar
          </button>
        </nav>

        {/* Library */}
        <div style={{ background: "#121212", borderRadius: 8, padding: "16px 12px", flexGrow: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: MUT, fontWeight: 700, fontSize: 15 }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={MUT} strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Tu biblioteca
            </div>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={MUT} strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          {/* Playlist entries */}
          {["Liked Songs", "Jime Mix 2025", "K-Pop Vibes", "Club Penguin OST"].map((pl) => (
            <div key={pl} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 4px", borderRadius: 4, cursor: "pointer",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 4, flexShrink: 0,
                background: `linear-gradient(135deg, ${G}44, ${G}88)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>🎵</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{pl}</div>
                <div style={{ fontSize: 12, color: MUT }}>Lista de reproducción</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ════════════════════════════════════════ */}
      <main style={{
        flex: 1, overflowY: "auto",
        background: BG,
        scrollbarWidth: "thin",
        scrollbarColor: "#333 transparent",
      }}>

        {/* ── Top bar ────────────────────────────────────────── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: 64,
          background: "rgba(18,18,18,0.85)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {[
              <svg key="b" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>,
              <svg key="f" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>,
            ].map((icon, i) => (
              <button key={i} style={{
                background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%",
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>{icon}</button>
            ))}
            {/* Search bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", borderRadius: 24, padding: "8px 16px",
              width: 340,
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span style={{ fontSize: 13, color: "#7A7A7A" }}>¿Qué quieres escuchar?</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {["Premium", "Asistencia", "Descargar"].map((t) => (
              <button key={t} style={{ background: "none", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{t}</button>
            ))}
            <button style={{
              background: "#fff", border: "none", borderRadius: 24,
              padding: "10px 32px", fontSize: 14, fontWeight: 700,
              cursor: "pointer", color: "#000",
            }}>Iniciar sesión</button>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section style={{
          position: "relative", height: 340, overflow: "hidden",
          background: "linear-gradient(to bottom, #1A3A5C 0%, #0A1628 100%)",
        }}>
          {/* Background photo — pon /public/hero-jime.jpg para activarla */}
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            unoptimized
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />

          {/* Scrim sobre la foto para legibilidad del texto */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, #121212 100%)",
          }}/>

          {/* Ambient orbs (visible solo cuando no hay foto) */}
          <div style={{
            position: "absolute", top: -60, right: -60, width: 320, height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(29,185,84,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}/>
          <div style={{
            position: "absolute", bottom: -80, left: 100, width: 400, height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(131,58,180,0.3) 0%, transparent 70%)",
            pointerEvents: "none",
          }}/>

          {/* Artist info */}
          <div style={{ position: "absolute", bottom: 32, left: 40, right: 40, zIndex: 10 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill={G}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Artista verificado
            </div>
            <h1 style={{
              fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 900,
              lineHeight: 1, letterSpacing: -3, color: "#fff", margin: "0 0 16px",
            }}>
              Jimena Sings
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", fontWeight: 400, margin: 0 }}>
              2.450.320 oyentes mensuales
            </p>
          </div>
        </section>

        {/* ── Artist controls ────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 24,
          padding: "24px 32px",
          background: "linear-gradient(to bottom, rgba(10,22,40,0.8) 0%, transparent 100%)",
        }}>
          <button style={{
            width: 56, height: 56, borderRadius: "50%",
            background: G, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 8px 24px ${G}55`,
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <PlayIcon size={22} color="#000" />
          </button>
          <button
            onClick={() => setLiked(l => !l)}
            style={{
              background: "none", border: `1px solid ${liked ? G : "rgba(255,255,255,0.4)"}`,
              borderRadius: 20, padding: "8px 24px", cursor: "pointer",
              color: liked ? G : "#fff", fontSize: 14, fontWeight: 700,
              transition: "all 0.15s",
            }}
          >
            {liked ? "Siguiendo" : "Seguir"}
          </button>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            color: MUT, padding: 4,
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill={MUT}>
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
        </div>

        {/* ── Populares ──────────────────────────────────────── */}
        <section style={{ padding: "0 32px 32px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "#fff" }}>Populares</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {TRACKS.map((t) => (
              <div
                key={t.num}
                onMouseEnter={() => setHoveredTrack(t.num)}
                onMouseLeave={() => setHoveredTrack(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "8px 16px", borderRadius: 6,
                  background: hoveredTrack === t.num ? HOVER : "transparent",
                  cursor: "pointer", transition: "background 0.1s",
                  height: 56,
                }}
              >
                {/* Number / play icon */}
                <div style={{ width: 20, textAlign: "right", flexShrink: 0 }}>
                  {hoveredTrack === t.num
                    ? <PlayIcon size={16} color="#fff" />
                    : <span style={{ fontSize: 16, color: MUT }}>{t.num}</span>
                  }
                </div>

                {/* Cover */}
                <div style={{
                  width: 40, height: 40, borderRadius: 4, flexShrink: 0,
                  background: t.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>{t.emoji}</div>

                {/* Title + album */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: MUT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.album}</div>
                </div>

                {/* Plays */}
                <div style={{ fontSize: 14, color: MUT, flexShrink: 0 }}>{t.plays}</div>

                {/* Duration */}
                <div style={{ fontSize: 14, color: MUT, flexShrink: 0, width: 40, textAlign: "right" }}>{t.dur}</div>
              </div>
            ))}
          </div>
          <button style={{
            background: "none", border: "none", color: MUT,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            padding: "12px 16px", letterSpacing: 0.5,
          }}>Ver más</button>
        </section>

        {/* ── Discografía ────────────────────────────────────── */}
        <section style={{ padding: "0 32px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>Discografía</h2>
            <button style={{ background: "none", border: "none", color: MUT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Mostrar todo</button>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {(["popular", "albums", "singles"] as const).map((f) => {
              const labels = { popular: "Títulos populares", albums: "Álbumes", singles: "Sencillos y EP" };
              return (
                <button
                  key={f}
                  onClick={() => setDiscFilter(f)}
                  style={{
                    padding: "8px 16px", borderRadius: 20, border: "none",
                    background: discFilter === f ? "#fff" : "#2A2A2A",
                    color: discFilter === f ? "#000" : "#fff",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>

          {/* Album grid */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {DISCO.filter(d => {
              if (discFilter === "albums") return d.type === "Álbum";
              if (discFilter === "singles") return d.type !== "Álbum";
              return true;
            }).map((d) => (
              <div
                key={d.title}
                style={{
                  width: 180, cursor: "pointer",
                  padding: "16px 16px 24px", borderRadius: 8,
                  background: "transparent", transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = HOVER)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: "100%", aspectRatio: "1/1", borderRadius: 8,
                  background: d.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 48, marginBottom: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}>{d.emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</div>
                <div style={{ fontSize: 13, color: MUT }}>{d.year} · {d.type}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Información ────────────────────────────────────── */}
        <section style={{ padding: "0 32px 48px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Información</h2>

          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {/* Artist photo + bio */}
            <div style={{ flex: "1 1 420px", minWidth: 320 }}>
              <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                <div style={{
                  width: 200, height: 200, flexShrink: 0, borderRadius: 8,
                  background: "linear-gradient(135deg, #1A3A5C, #833AB4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 72, overflow: "hidden",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                }}>🐧</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Jimena<br/>Sings</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2A2A2A", borderRadius: 20, padding: "6px 14px", alignSelf: "flex-start" }}>
                    <span style={{ fontSize: 13, color: MUT, fontWeight: 600 }}>🌍 Ríos de Mundo</span>
                  </div>
                  <div style={{ fontSize: 14, color: MUT, lineHeight: 1.5, marginTop: 4 }}>
                    2.450.320 oyentes mensuales
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, margin: "0 0 20px" }}>
                Cantante, compositora y alma musical nacida para el escenario. Con una voz que va del pop al K-Pop y del reggaetón al R&amp;B, Jimena construyó su sonido entre coros universitarios y tardes de Club Penguin.
              </p>

              {/* Bands */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Proyectos musicales</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {BANDS.map((b) => (
                    <div key={b.name} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", background: CARD, borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{b.name}</div>
                        <div style={{ fontSize: 13, color: MUT }}>{b.role}</div>
                      </div>
                      <div style={{ fontSize: 12, color: MUT, background: "#2A2A2A", padding: "4px 10px", borderRadius: 12 }}>{b.years}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Wrapped 2025 card */}
            <div style={{ flex: "0 0 340px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Tu año en música</div>
              <div
                onClick={() => setShowWrapped(true)}
                style={{
                  borderRadius: 16, overflow: "hidden", cursor: "pointer",
                  background: "linear-gradient(145deg, #F0EBE1 0%, #DDD5C8 100%)",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.6)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
                }}
              >
                {/* Card header */}
                <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <SpotifyLogo size={22} color="#000" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#000", letterSpacing: 2, textTransform: "uppercase" }}>2025</span>
                </div>

                {/* Decorative rings */}
                <div style={{
                  position: "relative", height: 180,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {[120, 90, 64, 44].map((s, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      width: s, height: s, borderRadius: "50%",
                      border: `${1.5 - i * 0.2}px solid rgba(26,26,26,${0.12 - i * 0.02})`,
                    }}/>
                  ))}
                  <div style={{ fontSize: 52, position: "relative", zIndex: 2, animation: "none" }}>🎵</div>
                </div>

                {/* Card body */}
                <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: -0.5 }}>Tu Wrapped</div>
                    <div style={{ fontSize: 14, color: "#555", marginTop: 2 }}>2025 · El año de Jime</div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["K-Pop", "R&B", "Latin Pop", "Reggaetón"].map(g => (
                      <span key={g} style={{
                        fontSize: 11, fontWeight: 700, background: "rgba(26,26,26,0.12)",
                        padding: "3px 10px", borderRadius: 12, color: "#1a1a1a",
                      }}>{g}</span>
                    ))}
                  </div>
                  <button style={{
                    background: "#1a1a1a", border: "none", borderRadius: 24,
                    padding: "12px 0", width: "100%",
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <PlayIcon size={14} color="#fff" />
                    Ver Wrapped 2025
                  </button>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                {[
                  { label: "minutos", value: "43.247" },
                  { label: "artistas", value: "642" },
                  { label: "géneros", value: "38" },
                  { label: "hora pico", value: "11PM" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: CARD, borderRadius: 10, padding: "14px 16px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: MUT, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer style={{
          padding: "24px 32px 48px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: MUT, fontSize: 12,
          display: "flex", gap: 24, flexWrap: "wrap",
        }}>
          {["Legal", "Centro de seguridad", "Política de privacidad", "Cookies", "Acerca de Anuncios"].map(l => (
            <span key={l} style={{ cursor: "pointer" }}>{l}</span>
          ))}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <SpotifyLogo size={16} />
            Spotify AB
          </span>
        </footer>
      </main>
    </div>
  );
}
