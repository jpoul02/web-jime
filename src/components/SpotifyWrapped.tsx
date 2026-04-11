"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────── */
const SLIDE_DURATION = 9000; // ms per slide (más largo para leer textos)
const TOTAL_SLIDES = 16;

/* ─────────────────────────────────────────────────────────────
   API
───────────────────────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

interface WrappedSong  { id: number; title: string; cover_url: string | null; audio_url: string | null; }
interface WrappedAlbum { id: number; title: string; cover_url: string | null; year: number | null; }

const ALBUM_COLORS = ["#C9853A","#B5547A","#7BA67E","#3A5FA6","#8B6914"];
const ALBUM_EMOJIS = ["💿","🎵","🎶","🎸","🎤"];
const FAKE_PLAYS   = [312, 287, 254, 231, 198];

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const topGenres = [
  { name: "Pop Latino",  pct: 89 },
  { name: "Rock",        pct: 71 },
  { name: "Trap Latino", pct: 58 },
  { name: "Vallenato",   pct: 43 },
  { name: "R&B / Funk",  pct: 36 },
];

const topSongs = [
  { title: "Amigos Con Derecho",  artist: "Joaquina",    plays: 2847 },
  { title: "How to Save a Life",  artist: "The Fray",    plays: 2631 },
  { title: "Riri",                artist: "Young Miko",  plays: 2418 },
  { title: "Nena Trampa",         artist: "PXNDX",       plays: 2204 },
  { title: "Africa",              artist: "Toto",        plays: 1987 },
];

const topAlbums = [
  { title: "Joaquina",               artist: "Joaquina",    color: "#9B4E97", emoji: "🎤" },
  { title: "Para Ti Con Desprecio",  artist: "PXNDX",       color: "#E8143F", emoji: "🎸" },
  { title: "How to Save a Life",     artist: "The Fray",    color: "#3A5FA6", emoji: "🎹" },
  { title: "Más + Corazón Profundo", artist: "Carlos Vives",color: "#C9853A", emoji: "🪗" },
  { title: "24K Magic",              artist: "Bruno Mars",  color: "#8B6914", emoji: "✨" },
];

const funStats = [
  { label: "Hora pico de escucha",        value: "11PM",    icon: "🌙" },
  { label: "Día más musical",             value: "Lunes",   icon: "📅" },
  { label: "De tu vida con música",       value: "87%",     icon: "🎵" },
  { label: "Géneros distintos",           value: "38",      icon: "🎨" },
  { label: "Artistas únicos",             value: "642",     icon: "⭐" },
  { label: "Podcasts ignorados",          value: "∞",       icon: "😅" },
];

const bands = [
  { name: "Todos mis amigos se llaman Javier", role: "Voz principal", years: "2025–presente", color: "#E8143F" },
  { name: "Coro Nacional",                     role: "Soprano",       years: "2025–presente", color: "#7C6FCD" },
  { name: "Banda Pop",                         role: "Voz",           years: "2025–presente", color: "#1DB954" },
  { name: "Coro Universitario",                role: "Soprano",     years: "2022–presente", color: "#FFD600" },
  { name: "Coro Esperanza Azteca",             role: "Soprano",       years: "2015–2017",     color: "#C9853A" },
  { name: "Coro Alianza Francesa",             role: "Soprano",       years: "2026",          color: "#3A5FA6" },
];

/* ─────────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────── */
function SpotifyLogo({ size = 30, dark = false }: { size?: number; dark?: boolean }) {
  const c = dark ? "#121212" : "#FFFFFF";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={c}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function ConcentricRings({ count = 7, color = "#FFD600", opacity = 0.7, gap = 40, strokeWidth = 2, animate = true }:
  { count?: number; color?: string; opacity?: number; gap?: number; strokeWidth?: number; animate?: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const baseOpacity = opacity - i * (opacity / (count + 1));
        const rotDur = 20 + i * 4;
        const breatheDur = 3.2 + i * 0.7;
        const shimmerDur = 2.8 + i * 0.5;
        const breatheDelay = i * 0.4;
        const shimmerDelay = i * 0.35;
        // Alternating rings expand outward as ghost layers
        const expandDur = 5 + i * 0.9;
        const expandDelay = i * 0.6;
        const dir = i % 2 === 0 ? "" : "reverse";
        return (
          <div key={i} style={{ position:"absolute", width:(i+1)*gap*2, height:(i+1)*gap*2 }}>
            {/* Main rotating ring */}
            <div style={{
              position:"absolute", inset:0,
              borderRadius:"50%",
              border:`${strokeWidth}px solid ${color}`,
              ["--ro" as string]: baseOpacity,
              opacity: baseOpacity,
              animation: animate
                ? `rotateSlow ${rotDur}s linear infinite ${dir}, ringBreathe ${breatheDur}s ease-in-out ${breatheDelay}s infinite, ringShimmer ${shimmerDur}s ease-in-out ${shimmerDelay}s infinite`
                : "none",
            }}/>
            {/* Ghost expansion ring — appears every 2nd ring for depth */}
            {animate && i % 2 === 0 && (
              <div style={{
                position:"absolute", inset:0,
                borderRadius:"50%",
                border:`${strokeWidth * 0.6}px solid ${color}`,
                ["--ro" as string]: baseOpacity * 0.6,
                opacity: 0,
                animation:`ringExpand ${expandDur}s ease-out ${expandDelay}s infinite`,
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 0 — WELCOME  (cream · "2002 – 2026")
───────────────────────────────────────────────────────────── */
function SlideWelcome() {
  return (
    <div className="ws" style={{ background: "#F0EBE1" }}>
      {/* Checkerboard top-right */}
      <div style={{
        position:"absolute", right:-80, top:-80,
        width:420, height:420,
        backgroundImage:"repeating-conic-gradient(#1a1a1a 0% 25%, transparent 0% 50%)",
        backgroundSize:"26px 26px",
        borderRadius:"50%",
        transform:"rotate(-15deg) scaleX(1.3)",
        animation:"rotateSlow 60s linear infinite",
        opacity:0.85,
      }}/>
      {/* Concentric rings bottom-left */}
      <div style={{ position:"absolute", left:-100, bottom:-100 }}>
        <ConcentricRings count={8} color="#1a1a1a" opacity={0.12} gap={36} strokeWidth={1.5}/>
      </div>
      {/* Floating music notes */}
      {["♩","♪","♫","♬"].map((n,i) => (
        <div key={i} style={{
          position:"absolute",
          fontSize: 28 + i * 8,
          color:"rgba(124,111,205,0.35)",
          top:`${15 + i * 18}%`,
          left:`${5 + i * 4}%`,
          animation:`float ${3 + i * 0.7}s ease-in-out infinite`,
          animationDelay:`${i * 0.4}s`,
        }}>{n}</div>
      ))}
      {/* Scribble SVG */}
      <svg style={{position:"absolute",top:80,right:120,opacity:0.5,animation:"float 5s ease-in-out infinite"}} width="160" height="90" viewBox="0 0 160 90" fill="none">
        <path d="M0,70 Q40,10 80,50 Q120,90 160,30" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
        <path d="M10,40 Q50,0 90,35 Q130,65 155,15" stroke="#7C6FCD" strokeWidth="1.5" fill="none"/>
      </svg>

      {/* Logo */}
      <div className="logo-tl"><SpotifyLogo dark size={26}/></div>

      {/* Central content */}
      <div className="sc" style={{textAlign:"center",padding:"0 24px",position:"relative",zIndex:2}}>
        {/* Year span */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,lineHeight:1,marginBottom:-8}}>
          <span style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(52px,13vw,110px)",fontWeight:900,fontStyle:"italic",color:"rgba(124,111,205,0.4)",animation:"pulse 4s ease-in-out infinite"}}>2002</span>
          <span style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(28px,6vw,52px)",fontWeight:900,color:"#1a1a1a",padding:"0 12px"}}>—</span>
          <span style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(52px,13vw,110px)",fontWeight:900,fontStyle:"italic",color:"#7C6FCD",animation:"pulse 4s ease-in-out infinite 0.5s"}}>2026</span>
        </div>

        {/* WRAPPED bar */}
        <div style={{position:"relative",display:"inline-block",margin:"4px 0"}}>
          <div style={{background:"#1a1a1a",padding:"8px 20px",display:"inline-block"}}>
            <span style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(22px,5.5vw,48px)",fontWeight:900,color:"#fff",letterSpacing:3,display:"block"}}>Wrapped</span>
          </div>
        </div>

        <p style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(32px,8vw,68px)",fontWeight:900,fontStyle:"italic",color:"#1a1a1a",margin:"4px 0 0",lineHeight:1,animation:"slideInLeft 0.7s 0.5s both"}}>
          Jime
        </p>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:12,color:"#999",marginTop:20,letterSpacing:2,textTransform:"uppercase",animation:"fadeUp 1s 1.2s both"}}>
          tu vida en música · scroll o tap →
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 1 — TU UNIVERSO (dark · 24 años)
───────────────────────────────────────────────────────────── */
function SlideUniverso() {
  return (
    <div className="ws" style={{background:"#0D0D0D"}}>
      {/* Star field */}
      {Array.from({length:40}).map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          width: i % 5 === 0 ? 3 : 2,
          height: i % 5 === 0 ? 3 : 2,
          borderRadius:"50%",
          background:"#fff",
          top:`${Math.sin(i * 1.7) * 45 + 50}%`,
          left:`${(i / 40) * 100}%`,
          opacity: 0.2 + (i % 7) * 0.08,
          animation:`pulse ${2 + (i % 4)}s ease-in-out infinite`,
          animationDelay:`${(i % 6) * 0.4}s`,
        }}/>
      ))}
      {/* Planet / glowing orb */}
      <div style={{
        position:"absolute", right:-60, top:"20%",
        width:220, height:220, borderRadius:"50%",
        background:"radial-gradient(circle at 35% 35%, #3A2D6E, #1a1260, #050510)",
        boxShadow:"0 0 60px rgba(124,111,205,0.4)",
        animation:"pulse 6s ease-in-out infinite",
      }}/>
      {/* Ring around planet */}
      <div style={{
        position:"absolute", right:-120, top:"calc(20% + 80px)",
        width:340, height:60,
        border:"2px solid rgba(124,111,205,0.4)",
        borderRadius:"50%",
        transform:"rotateX(70deg)",
        animation:"rotateSlow 15s linear infinite",
      }}/>

      <div className="sc" style={{padding:"0 40px",position:"relative",zIndex:2}}>
        <p className="sc-label">Tu universo musical</p>
        <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(60px,16vw,130px)",fontWeight:900,color:"#fff",lineHeight:0.9,animation:"slideInLeft 0.6s 0.3s both"}}>
          24
        </div>
        <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(18px,4.5vw,36px)",fontWeight:800,color:"#7C6FCD",marginTop:8,animation:"slideInLeft 0.6s 0.45s both"}}>
          años escuchando
        </div>
        <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(18px,4.5vw,36px)",fontWeight:800,color:"#fff",animation:"slideInLeft 0.6s 0.55s both"}}>
          música sin parar
        </div>
        <div style={{marginTop:32,display:"flex",gap:20,flexWrap:"wrap",animation:"fadeUp 0.6s 0.75s both"}}>
          {[["🎵","642 artistas"],["🌍","24 géneros"],["📅","desde 2002"]].map(([ico,lbl],i)=>(
            <div key={i} style={{background:"rgba(124,111,205,0.15)",border:"1px solid rgba(124,111,205,0.3)",borderRadius:40,padding:"8px 18px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{ico}</span>
              <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:700,color:"#ccc"}}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 2 — MINUTOS  (dark · big purple number)
───────────────────────────────────────────────────────────── */
function SlideMinutos() {
  return (
    <div className="ws" style={{background:"#121212"}}>
      {/* Waveform bg */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"35%",display:"flex",alignItems:"flex-end",gap:3,padding:"0 12px",opacity:0.12}}>
        {Array.from({length:60}).map((_,i)=>(
          <div key={i} style={{
            flex:1, borderRadius:"2px 2px 0 0",
            background:"#7C6FCD",
            height:`${30 + Math.sin(i * 0.4) * 25 + Math.cos(i * 0.7) * 20}%`,
            animation:`wave ${1.2 + (i % 5) * 0.3}s ease-in-out infinite alternate`,
            animationDelay:`${(i % 7) * 0.1}s`,
          }}/>
        ))}
      </div>
      {/* Swirl decoration */}
      <svg style={{position:"absolute",top:-10,right:-20,opacity:0.2,animation:"rotateSlow 30s linear infinite"}} width="320" height="320" viewBox="0 0 320 320" fill="none">
        {[40,80,120,160,200,240].map((r,i)=>(
          <circle key={i} cx={160} cy={160} r={r} stroke="white" strokeWidth="1" fill="none"/>
        ))}
      </svg>

      <div className="sc" style={{padding:"0 36px",position:"relative",zIndex:2,textAlign:"center"}}>
        <p className="sc-label" style={{color:"#666",marginBottom:16}}>En 24 años escuchaste</p>
        <div style={{
          fontFamily:"'SM','Montserrat',sans-serif",
          fontSize:"clamp(48px,14vw,120px)",
          fontWeight:900,
          color:"#7C6FCD",
          lineHeight:1,
          letterSpacing:-3,
          animation:"slideInLeft 0.5s 0.2s both",
          textShadow:"0 0 80px rgba(124,111,205,0.4)",
        }}>12.623.040</div>
        <p style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(20px,4vw,30px)",fontWeight:800,color:"#fff",marginTop:4,animation:"fadeUp 0.5s 0.4s both"}}>
          minutos de música
        </p>
        <div style={{marginTop:24,display:"flex",justifyContent:"center",gap:28,animation:"fadeUp 0.5s 0.6s both"}}>
          {[["8.766","días"],["210.384","horas"],["12.623.040","minutos"]].map(([val,unit],i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(18px,4vw,32px)",fontWeight:900,color:i===2?"#7C6FCD":"#fff"}}>{val}</div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:11,color:"#666",textTransform:"uppercase",letterSpacing:1}}>{unit}</div>
            </div>
          ))}
        </div>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:14,color:"#888",marginTop:28,lineHeight:1.6,animation:"fadeUp 0.5s 0.8s both"}}>
          Eso equivale a pasar <strong style={{color:"#fff"}}>4 años enteros</strong> sin dormir, solo escuchando.<br/>Imparable, Jime.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 3 — GÉNEROS  (cream · animated bars)
───────────────────────────────────────────────────────────── */
function SlideGeneros() {
  return (
    <div className="ws" style={{background:"#F0EBE1"}}>
      {/* Red dots */}
      {[[88,12],[91,28],[93,46],[89,64],[85,80]].map(([x,y],i)=>(
        <div key={i} style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:12,height:12,borderRadius:"50%",background:"#E8143F",animation:`float ${2.5+i*0.5}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
      ))}
      {/* Scribble bottom */}
      <svg style={{position:"absolute",bottom:50,left:20,opacity:0.35}} width="180" height="90" viewBox="0 0 180 90" fill="none">
        <path d="M10,60 Q50,10 90,50 Q130,85 170,30" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
        <path d="M0,40 Q40,0 80,32 Q120,60 170,15" stroke="#7C6FCD" strokeWidth="1" fill="none"/>
      </svg>
      <div className="logo-tr"><SpotifyLogo dark size={24}/></div>

      <div className="sc" style={{width:"100%",maxWidth:520,padding:"0 28px",position:"relative",zIndex:2}}>
        <p className="sc-label" style={{color:"#888"}}>Tus géneros</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
          {topGenres.map((g,i)=>(
            <div key={i} style={{animation:`fadeUp 0.5s ${0.25+i*0.12}s both`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{
                  fontFamily:"'SM','Montserrat',sans-serif",
                  fontSize:`clamp(${18+i*4}px,${4.5+i}vw,${26+i*8}px)`,
                  fontWeight:900,
                  color:"#1a1a1a",
                }}>
                  <span style={{color:"#999",fontSize:"0.55em",marginRight:8}}>{i+1}</span>
                  {g.name}
                </span>
                <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:12,fontWeight:700,color:"#888"}}>{g.pct}%</span>
              </div>
              <div style={{height:6,background:"rgba(0,0,0,0.08)",borderRadius:3,overflow:"hidden"}}>
                <div style={{
                  height:"100%",
                  width:`${g.pct}%`,
                  background:["#7C6FCD","#E8143F","#1DB954","#FFD600","#FF7C4C"][i],
                  borderRadius:3,
                  animation:`barGrow 1.2s ${0.4+i*0.12}s cubic-bezier(0.32,0.72,0,1) both`,
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 4 — TOP ARTIST  (dark · rotating rings)
───────────────────────────────────────────────────────────── */
function SlideArtista() {
  return (
    <div className="ws" style={{background:"#1a1a1a",overflow:"hidden"}}>
      <ConcentricRings count={8} color="#FFD600" opacity={0.55} gap={42} strokeWidth={1.5}/>
      {/* Pulsing glow center */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle, rgba(255,214,0,0.07) 0%, rgba(26,18,96,0.45) 35%, transparent 70%)",pointerEvents:"none",animation:"ringBreathe 4s ease-in-out infinite"}}/>
      {/* Outer aura shimmer */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%, transparent 40%, rgba(255,214,0,0.04) 70%, transparent 100%)",pointerEvents:"none",animation:"ringBreathe 6s ease-in-out 1.2s infinite"}} />
      <svg style={{position:"absolute",top:60,left:20,opacity:0.25,animation:"float 7s ease-in-out infinite"}} width="200" height="100" viewBox="0 0 200 100" fill="none">
        <path d="M10,60 Q60,10 100,55 Q140,95 185,35" stroke="white" strokeWidth="1.5" fill="none"/>
      </svg>
      <div className="logo-tr"><SpotifyLogo size={24}/></div>

      <div className="sc" style={{padding:"0 36px",position:"relative",zIndex:2,textAlign:"center"}}>
        <p className="sc-label" style={{color:"#888"}}>Tu artista #1 — 24 años</p>
        <div style={{
          fontFamily:"'SM','Montserrat',sans-serif",
          fontSize:"clamp(44px,13vw,105px)",
          fontWeight:900,
          fontStyle:"italic",
          color:"#FFFFFF",
          lineHeight:0.88,
          animation:"slideInLeft 0.6s 0.3s both",
          textShadow:"0 0 40px rgba(255,255,255,0.1)",
        }}>
          JOA-<br/>QUINA
        </div>
        <div style={{marginTop:24,display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap",animation:"fadeUp 0.5s 0.55s both"}}>
          <div style={{background:"rgba(255,214,0,0.15)",border:"1px solid rgba(255,214,0,0.4)",borderRadius:40,padding:"8px 20px"}}>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:700,color:"#FFD600"}}>Top 2% fan</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:40,padding:"8px 20px"}}>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:700,color:"#ccc"}}>2.847 minutos</span>
          </div>
        </div>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:14,color:"#888",marginTop:20,lineHeight:1.6,animation:"fadeUp 0.5s 0.7s both"}}>
          Su voz te llegó directo al pecho — y no salió más.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 5 — ARTIST DEEP DIVE  (photo full-bleed · Jime + Joaquina)
───────────────────────────────────────────────────────────── */
function SlideArtistaDive() {
  return (
    <div className="ws" style={{background:"#0a0a0a",overflow:"hidden"}}>
      {/* ── PHOTO — ocupa toda la mitad izquierda ── */}
      <div style={{
        position:"absolute", left:0, top:0, bottom:0,
        width:"clamp(50%,58%,62%)",
        overflow:"hidden",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/jime-joaquina.webp" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}} alt="Jime + Joaquina"/>
        {/* Scan lines grunge */}
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.18) 3px,rgba(0,0,0,0.18) 4px)",pointerEvents:"none"}}/>
        {/* Gradient fade to right */}
        <div style={{position:"absolute",top:0,right:0,bottom:0,width:"40%",background:"linear-gradient(to right,transparent,#0a0a0a)",pointerEvents:"none"}}/>
      </div>

      {/* ── Concentric rings decorativas (detrás del texto) ── */}
      <div style={{position:"absolute",right:-120,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
        {[50,90,130,170].map((r,i)=>(
          <div key={i} style={{
            position:"absolute",width:r*2,height:r*2,borderRadius:"50%",
            border:`1px solid rgba(155,78,151,${0.35-i*0.07})`,
            top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            animation:`rotateSlow ${18+i*6}s linear infinite ${i%2===0?"":"reverse"}`,
          }}/>
        ))}
      </div>

      {/* ── Texto lado derecho ── */}
      <div style={{
        position:"absolute",right:0,top:0,bottom:0,
        width:"clamp(42%,48%,52%)",
        display:"flex",flexDirection:"column",justifyContent:"center",
        padding:"40px clamp(16px,4vw,36px) 40px 20px",
        zIndex:5,
      }}>
        {/* Badge */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:6,
          background:"rgba(155,78,151,0.2)",border:"1px solid rgba(155,78,151,0.5)",
          borderRadius:40,padding:"5px 14px",marginBottom:16,alignSelf:"flex-start",
          animation:"fadeUp 0.4s 0.15s both",
        }}>
          <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:700,color:"#C97FCA",letterSpacing:2,textTransform:"uppercase"}}>Tu artista #1</span>
        </div>

        {/* Nombre artista — grande */}
        <div style={{
          fontFamily:"'SM','Montserrat',sans-serif",
          fontSize:"clamp(36px,8vw,72px)",
          fontWeight:900,fontStyle:"italic",
          color:"#fff",lineHeight:0.92,
          animation:"slideInLeft 0.6s 0.3s both",
        }}>
          Joa-<br/>quina
        </div>

        {/* Sub */}
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:"clamp(11px,2vw,14px)",color:"#999",marginTop:12,lineHeight:1.5,animation:"fadeUp 0.5s 0.45s both"}}>
          Ella y Jime coincidieron en algo:<br/>la música lo es todo.
        </p>

        {/* Stats pills */}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:18,animation:"fadeUp 0.5s 0.55s both"}}>
          {[
            {label:"Minutos juntas",  val:"312",   color:"#9B4E97"},
            {label:"Canciones",       val:"23",    color:"#E8143F"},
            {label:"Fan ranking",     val:"Top 2%",color:"#FFD600"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:3,height:32,background:s.color,borderRadius:2,flexShrink:0}}/>
              <div>
                <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(18px,3.5vw,28px)",fontWeight:900,color:"#fff",lineHeight:1}}>{s.val}</div>
                <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{
          marginTop:20,
          borderLeft:"2px solid #9B4E97",
          paddingLeft:12,
          animation:"fadeUp 0.5s 0.7s both",
        }}>
          <p style={{fontFamily:"'Montserrat',sans-serif",fontStyle:"italic",fontSize:"clamp(11px,1.8vw,13px)",color:"#777",lineHeight:1.6,margin:0}}>
            &ldquo;Su voz te llega directo al pecho.&rdquo;
          </p>
        </div>
      </div>

      {/* ── Nombre grande cruzando la foto ── */}
      <div style={{
        position:"absolute",
        bottom:"clamp(30px,8%,60px)",
        left:0,right:0,
        zIndex:6,
        overflow:"hidden",
        pointerEvents:"none",
      }}>
        <div style={{
          fontFamily:"'SM','Montserrat',sans-serif",
          fontSize:"clamp(50px,14vw,120px)",
          fontWeight:900,fontStyle:"italic",
          color:"rgba(255,255,255,0.04)",
          letterSpacing:-2,
          lineHeight:1,
          whiteSpace:"nowrap",
          paddingLeft:"5%",
          animation:"slideInLeft 0.8s 0.1s both",
        }}>JOAQUINA</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 6 — TOP SONGS  (dark moody · indigo accent)
───────────────────────────────────────────────────────────── */
function SlideCanciones({ apiSongs }: { apiSongs?: WrappedSong[] }) {
  const songs = apiSongs && apiSongs.length > 0
    ? apiSongs.slice(0, 5).map((s, i) => ({ title: s.title, artist: "Jimena Sings", plays: FAKE_PLAYS[i] ?? 150 - i * 15 }))
    : topSongs;
  return (
    <div className="ws" style={{background:"#0E0B2A"}}>
      {/* Vinyl record bg */}
      <div style={{
        position:"absolute", right:-80, top:"50%", transform:"translateY(-50%)",
        width:340, height:340, borderRadius:"50%",
        background:"radial-gradient(circle, #1a1a2e 30%, #2d2a4a 50%, #1a1a2e 52%, #2d2a4a 55%, #1a1a2e 57%, #2d2a4a 70%, #1a1a2e 100%)",
        border:"3px solid rgba(255,255,255,0.08)",
        animation:"rotateSlow 12s linear infinite",
        opacity:0.5,
      }}/>
      {/* Center hole */}
      <div style={{
        position:"absolute", right:"-80px", top:"50%", transform:"translate(148px,-50%)",
        width:44, height:44, borderRadius:"50%",
        background:"#7C6FCD",
        boxShadow:"0 0 20px rgba(124,111,205,0.5)",
        zIndex:2,
      }}/>

      <div className="sc" style={{width:"100%",maxWidth:500,padding:"0 28px",position:"relative",zIndex:3}}>
        <p className="sc-label" style={{color:"#7C6FCD"}}>Tus canciones favoritas</p>
        {songs.map((s,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",
            padding:"12px 0",
            borderBottom:i<4?"1px solid rgba(255,255,255,0.07)":"none",
            gap:14,
            animation:`slideInLeft 0.5s ${0.2+i*0.1}s both`,
          }}>
            <span style={{
              fontFamily:"'SM','Montserrat',sans-serif",
              fontSize:i===0?"38px":"24px",
              fontWeight:900,
              color:i===0?"#7C6FCD":"rgba(255,255,255,0.2)",
              minWidth:32,lineHeight:1,
            }}>{i+1}</span>
            <div style={{flex:1}}>
              <p style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:i===0?"clamp(16px,3.5vw,20px)":"clamp(13px,3vw,16px)",fontWeight:i===0?800:600,color:"#fff",margin:"0 0 2px",lineHeight:1.2}}>{s.title}</p>
              <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:11,color:"#666",margin:0}}>{s.artist}</p>
            </div>
            <div style={{
              background:i===0?"rgba(124,111,205,0.2)":"rgba(255,255,255,0.04)",
              border:`1px solid ${i===0?"rgba(124,111,205,0.4)":"rgba(255,255,255,0.07)"}`,
              borderRadius:40,padding:"3px 10px",
            }}>
              <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:700,color:i===0?"#7C6FCD":"#555"}}>{s.plays}×</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 7 — LA CANCIÓN DEL AÑO  (dark red · #1 song special)
───────────────────────────────────────────────────────────── */
function SlideCancionDelAnio({ firstSong }: { firstSong?: WrappedSong }) {
  // const title  = firstSong ? firstSong.title : "Amigos Con Derecho";
  const title  = "Rabia - Joaquina"
  const artist = firstSong ? "Jimena Sings"  : "Joaquina";
  return (
    <div className="ws" style={{background:"#1A0A0A"}}>
      {/* Pulsing ring */}
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{
            position:"absolute",
            width:`${i*15}vmax`,height:`${i*15}vmax`,
            borderRadius:"50%",
            border:`1px solid rgba(232,20,63,${0.4-i*0.08})`,
            animation:`pulse ${2+i*0.5}s ease-in-out infinite`,
          }}/>
        ))}
      </div>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%, rgba(232,20,63,0.2) 0%, transparent 60%)",pointerEvents:"none"}}/>

      <div className="sc" style={{padding:"0 36px",position:"relative",zIndex:2,textAlign:"center"}}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,
          background:"rgba(232,20,63,0.15)",border:"1px solid rgba(232,20,63,0.4)",
          borderRadius:40,padding:"6px 16px",marginBottom:20,
          animation:"pulse 3s ease-in-out infinite",
        }}>
          <span style={{fontSize:14}}>🔥</span>
          <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:11,fontWeight:700,color:"#E8143F",letterSpacing:2,textTransform:"uppercase"}}>La canción de tu vida</span>
        </div>
        <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(28px,7vw,58px)",fontWeight:900,color:"#fff",lineHeight:1.1,animation:"slideInLeft 0.6s 0.25s both"}}>
          {title}
        </div>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:16,color:"#aaa",marginTop:6,animation:"fadeUp 0.5s 0.4s both"}}>
          {artist}
        </div>
        <div style={{
          marginTop:28,
          display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,
          maxWidth:340,margin:"28px auto 0",
          animation:"fadeUp 0.5s 0.55s both",
        }}>
          {[["2.847","reproducciones"],["3:48","duración media"],["#1","en 24 años"],["❤️","tu canción"]].map(([val,lbl],i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"14px"}}>
              <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:24,fontWeight:900,color:"#fff",lineHeight:1}}>{val}</div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 8 — TOP ALBUMS  (dark · featured #1 + grid)
───────────────────────────────────────────────────────────── */
function SlideAlbumes({ apiAlbums }: { apiAlbums?: WrappedAlbum[] }) {
  const displayAlbums = apiAlbums && apiAlbums.length > 0
    ? apiAlbums.slice(0, 5).map((a, i) => ({
        title: a.title,
        artist: "Jimena Sings",
        color: ALBUM_COLORS[i % ALBUM_COLORS.length],
        emoji: ALBUM_EMOJIS[i % ALBUM_EMOJIS.length],
        cover_url: a.cover_url,
        year: a.year,
      }))
    : topAlbums.map(a => ({ ...a, cover_url: null as string | null, year: null as number | null }));
  const [featured, ...rest] = displayAlbums;
  return (
    <div className="ws" style={{background:"#0D0D0D",overflow:"hidden"}}>
      {/* ── Gradient accent bottom ── */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"linear-gradient(to right,#1DB954,#7C6FCD,#E8143F)"}}/>
      {/* ── BG dots ── */}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)",backgroundSize:"28px 28px",pointerEvents:"none"}}/>
      {/* ── Glow top-right ── */}
      <div style={{position:"absolute",top:-80,right:-80,width:280,height:280,borderRadius:"50%",background:`radial-gradient(circle,${featured.color}40,transparent 70%)`,pointerEvents:"none"}}/>
      <div className="logo-tr"><SpotifyLogo size={24}/></div>

      <div style={{
        position:"relative",zIndex:2,
        width:"100%",maxWidth:760,
        padding:"clamp(52px,8%,70px) clamp(16px,4vw,32px) clamp(20px,4%,36px)",
        display:"flex",flexDirection:"column",gap:0,
        height:"100%",justifyContent:"center",
      }}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"clamp(14px,3%,22px)",animation:"slideInLeft 0.4s 0.1s both"}}>
          <div style={{background:"#FFD600",padding:"4px 14px"}}>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#121212"}}>Tus álbumes top</span>
          </div>
        </div>

        {/* ── Featured #1 album ── */}
        <div style={{
          display:"flex",gap:"clamp(12px,3vw,24px)",alignItems:"center",
          padding:"clamp(10px,2%,16px)",
          background:"rgba(255,255,255,0.04)",
          border:`1px solid ${featured.color}50`,
          borderRadius:12,
          marginBottom:"clamp(10px,2.5%,18px)",
          animation:"slideInLeft 0.5s 0.2s both",
        }}>
          {/* Cover */}
          <div style={{
            width:"clamp(60px,12vw,100px)",height:"clamp(60px,12vw,100px)",
            background:featured.color,
            borderRadius:8,flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:"clamp(24px,5vw,40px)",
            boxShadow:`0 8px 30px ${featured.color}60`,
            animation:"float 5s ease-in-out infinite",
            overflow:"hidden",
          }}>
            {featured.cover_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={featured.cover_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : featured.emoji}
          </div>
          {/* Info */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <span style={{
                background:"#FFD600",color:"#121212",
                fontFamily:"'SM','Montserrat',sans-serif",
                fontSize:10,fontWeight:900,padding:"2px 8px",borderRadius:2,
              }}>#1</span>
              <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:1}}>Álbum del año</span>
            </div>
            <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(16px,3.5vw,26px)",fontWeight:900,color:"#fff",lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {featured.title}
            </div>
            <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"clamp(11px,2vw,13px)",color:"#888",marginTop:3}}>{featured.artist}{featured.year ? ` · ${featured.year}` : ""}</div>
          </div>
          {/* Big rank */}
          <div style={{
            fontFamily:"'SM','Montserrat',sans-serif",
            fontSize:"clamp(40px,9vw,80px)",fontWeight:900,
            color:`${featured.color}20`,lineHeight:1,flexShrink:0,
          }}>1</div>
        </div>

        {/* ── Rest of albums grid ── */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(clamp(90px,18vw,140px),1fr))",
          gap:"clamp(8px,2vw,14px)",
        }}>
          {rest.map((a,i)=>(
            <div key={i} style={{
              display:"flex",flexDirection:"column",
              animation:`fadeUp 0.5s ${0.35+i*0.08}s both`,
            }}>
              <div style={{
                width:"100%",aspectRatio:"1",background:a.color,
                borderRadius:6,marginBottom:6,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"clamp(18px,4vw,30px)",
                boxShadow:"0 6px 16px rgba(0,0,0,0.4)",
                transition:"transform 0.2s ease",
                cursor:"default",
                position:"relative",overflow:"hidden",
              }}
              onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.06) rotate(-2deg)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="")}>
                {a.cover_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={a.cover_url} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
                  : a.emoji}
                {/* Rank badge */}
                <div style={{
                  position:"absolute",top:4,left:4,
                  background:"rgba(0,0,0,0.65)",
                  borderRadius:4,padding:"1px 6px",
                }}>
                  <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:9,fontWeight:800,color:"#fff"}}>#{i+2}</span>
                </div>
              </div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"clamp(10px,2vw,12px)",fontWeight:700,color:"#fff",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"clamp(9px,1.5vw,11px)",color:"#555",marginTop:2}}>{a.artist}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 9 — JIME: LA ARTISTA  (cream · personal)
───────────────────────────────────────────────────────────── */
function SlideJimeArtista() {
  return (
    <div className="ws" style={{background:"#F0EBE1"}}>
      {/* Checkerboard strip */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:8,
        backgroundImage:"repeating-conic-gradient(#1a1a1a 0% 25%, transparent 0% 50%)",
        backgroundSize:"8px 8px"}}/>
      {/* Floating notes */}
      {["🎤","🎶","🎵","🎼","🎸"].map((n,i)=>(
        <div key={i} style={{
          position:"absolute",fontSize:22+(i%3)*8,
          top:`${10+i*16}%`,right:`${4+i*3}%`,
          animation:`float ${3+i*0.6}s ease-in-out infinite`,
          animationDelay:`${i*0.35}s`,opacity:0.55,
        }}>{n}</div>
      ))}
      <div style={{position:"absolute",bottom:8,left:0,right:0,height:8,
        backgroundImage:"repeating-conic-gradient(#1a1a1a 0% 25%, transparent 0% 50%)",
        backgroundSize:"8px 8px"}}/>

      <div className="sc" style={{padding:"0 32px",width:"100%",maxWidth:540,position:"relative",zIndex:2}}>
        <div style={{
          display:"inline-block",background:"#E8143F",padding:"5px 16px",marginBottom:16,
          animation:"slideInLeft 0.5s 0.1s both",
        }}>
          <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#fff"}}>Pero vos también hacés música</span>
        </div>
        <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(36px,9vw,72px)",fontWeight:900,fontStyle:"italic",color:"#1a1a1a",lineHeight:0.95,animation:"slideInLeft 0.6s 0.25s both"}}>
          Jime,<br/>
          <span style={{color:"#7C6FCD"}}>La Artista</span>
        </div>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:14,color:"#666",lineHeight:1.7,marginTop:16,animation:"fadeUp 0.5s 0.45s both"}}>
          Soprano, voz principal, alma del escenario. Más que oyente — sos creadora.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:20,animation:"fadeUp 0.5s 0.6s both"}}>
          {bands.map((b,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"center",
              background:"rgba(0,0,0,0.04)",
              border:"1px solid rgba(0,0,0,0.08)",
              borderLeft:`3px solid ${b.color}`,
              borderRadius:4,padding:"10px 14px",gap:12,
            }}>
              <div style={{flex:1}}>
                <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:800,color:"#1a1a1a",margin:0}}>{b.name}</p>
                <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:11,color:"#888",margin:"2px 0 0"}}>{b.role} · {b.years}</p>
              </div>
              <span style={{fontSize:18}}>🎵</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 10 — TU BANDA: TODOS MIS AMIGOS SE LLAMAN JAVIER
   Full-width · texto largo · grunge total
───────────────────────────────────────────────────────────── */
function SlideEnEscena() {
  return (
    <div className="ws" style={{background:"#080808",overflow:"hidden"}}>

      {/* ── BG: ruido de checkerboard muy sutil ── */}
      <div style={{position:"absolute",inset:0,backgroundImage:"repeating-conic-gradient(#131313 0% 25%, #080808 0% 50%)",backgroundSize:"14px 14px",opacity:0.9}}/>
      {/* Glow rojo lateral */}
      <div style={{position:"absolute",left:-100,top:"50%",transform:"translateY(-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle, rgba(232,20,63,0.18) 0%, transparent 70%)",pointerEvents:"none"}}/>
      {/* Scribble top-right */}
      <svg style={{position:"absolute",top:30,right:30,opacity:0.3,animation:"float 6s ease-in-out infinite"}} width="160" height="90" viewBox="0 0 160 90" fill="none">
        <path d="M5,65 Q40,5 80,45 Q120,80 155,20" stroke="#E8143F" strokeWidth="2.5" fill="none"/>
        <path d="M10,35 Q45,0 85,28 Q125,55 155,8" stroke="#E8143F" strokeWidth="1.2" fill="none"/>
      </svg>
      {/* Puntos decorativos */}
      {[["8%","20%"],["12%","75%"],["88%","30%"],["92%","68%"]].map(([l,t],i)=>(
        <div key={i} style={{position:"absolute",left:l,top:t,width:10,height:10,borderRadius:"50%",background:"#E8143F",opacity:0.5,animation:`pulse ${2+i*0.5}s ease-in-out infinite`}}/>
      ))}

      {/* ── CONTENIDO FULL-WIDTH centrado ── */}
      <div style={{
        position:"relative",zIndex:5,
        width:"100%",maxWidth:900,
        padding:"clamp(60px,9%,90px) clamp(28px,7vw,80px) clamp(50px,7%,80px)",
        display:"flex",flexDirection:"column",
      }}>

        {/* Sticker año */}
        <div style={{display:"flex",gap:8,marginBottom:14,animation:"slideInLeft 0.4s 0.1s both"}}>
          <div style={{background:"#E8143F",padding:"5px 14px",transform:"rotate(-1deg)"}}>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#fff"}}>Tu banda</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",padding:"5px 14px",display:"flex",alignItems:"center"}}>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:700,color:"#888",letterSpacing:1}}>2025 – presente</span>
          </div>
        </div>

        {/* Nombre brutal full-width */}
        <div style={{animation:"slideInLeft 0.55s 0.22s both"}}>
          <div style={{
            fontFamily:"'SM','Montserrat',sans-serif",
            fontWeight:900,lineHeight:0.85,
            letterSpacing:"-clamp(1px,0.3vw,3px)",
          }}>
            <div style={{fontSize:"clamp(28px,6.5vw,68px)",color:"#fff"}}>TODOS MIS AMIGOS</div>
            <div style={{fontSize:"clamp(28px,6.5vw,68px)",color:"#fff"}}>SE LLAMAN</div>
            <div style={{
              fontSize:"clamp(42px,10vw,105px)",
              color:"#E8143F",
              WebkitTextStroke:"clamp(0px,0.05vw,1px) rgba(255,0,0,0.3)",
              textShadow:"0 0 60px rgba(232,20,63,0.35)",
            }}>JAVIER</div>
          </div>
        </div>

        {/* Descripción larga */}
        <p style={{
          fontFamily:"'Montserrat',sans-serif",
          fontSize:"clamp(13px,1.8vw,16px)",
          color:"#aaa",
          lineHeight:1.75,
          marginTop:20,
          maxWidth:680,
          animation:"fadeUp 0.5s 0.42s both",
        }}>
          Empezamos a tocar casi sin querer, juntándonos entre semana para
          pasar el rato y terminar haciendo música en el ccu.
          Lo que arrancó como una joda entre amigos se convirtió en algo
          real: escenarios, gente cantando con nosotros, canciones que son
          nuestras de verdad. Todos mis amigos se llaman Javier es la banda
          más honesta que tuve — la que me enseñó que no necesitás un estudio
          ni un sello, solo ganas y las personas correctas.
        </p>

        {/* Info row */}
        <div style={{display:"flex",flexWrap:"wrap",gap:"clamp(6px,1.5vw,12px)",marginTop:20,animation:"fadeUp 0.5s 0.58s both"}}>
          {[["🎤","Voz principal"],["🎸","Tocamos de todo"],["📅","2 años juntos"],["🎵","Covers + originales"],["🏟️","Shows en vivo"]].map(([ico,txt],i)=>(
            <div key={i} style={{
              background:"rgba(255,255,255,0.05)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:4,padding:"6px 12px",
              display:"flex",alignItems:"center",gap:6,
            }}>
              <span style={{fontSize:12}}>{ico}</span>
              <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:11,fontWeight:600,color:"#ccc"}}>{txt}</span>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{
          marginTop:22,
          borderLeft:"3px solid #E8143F",
          paddingLeft:16,
          animation:"fadeUp 0.5s 0.72s both",
        }}>
          <p style={{fontFamily:"'Montserrat',sans-serif",fontStyle:"italic",fontSize:"clamp(12px,1.6vw,14px)",color:"#666",lineHeight:1.7,margin:0}}>
            &ldquo;La música no es solo lo que escuchás — es lo que vos creás con las personas que amás.&rdquo;
          </p>
        </div>
      </div>

      {/* Texto fantasma detrás */}
      <div style={{
        position:"absolute",bottom:-20,left:0,right:0,
        fontFamily:"'SM','Montserrat',sans-serif",
        fontSize:"clamp(70px,20vw,200px)",
        fontWeight:900,color:"rgba(232,20,63,0.04)",
        whiteSpace:"nowrap",letterSpacing:-6,lineHeight:1,
        pointerEvents:"none",animation:"slideInLeft 1.2s 0.05s both",
      }}>JAVIER</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 11 — FOTO EN VIVO: Jime cantando
   Full-bleed photo · texto overlay bottom
───────────────────────────────────────────────────────────── */
function SlidePhotoCantando() {
  return (
    <div className="ws" style={{background:"#0a0a0a",overflow:"hidden"}}>

      {/* ── FOTO lado izquierdo ── */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"clamp(42%,50%,55%)",overflow:"hidden"}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/jime-cantando.webp" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}} alt="Jime cantando"/>
        {/* Scan lines */}
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.12) 3px,rgba(0,0,0,0.12) 4px)",pointerEvents:"none"}}/>
        {/* Fade to right */}
        <div style={{position:"absolute",top:0,right:0,bottom:0,width:"45%",background:"linear-gradient(to right,transparent,#0a0a0a)",pointerEvents:"none"}}/>
      </div>

      {/* ── Anillos decorativos (detrás del texto) ── */}
      <div style={{position:"absolute",left:-80,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
        {[50,90,130,170].map((r,i)=>(
          <div key={i} style={{
            position:"absolute",width:r*2,height:r*2,borderRadius:"50%",
            border:`1px solid rgba(124,111,205,${0.3-i*0.06})`,
            top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            animation:`rotateSlow ${18+i*6}s linear infinite ${i%2===0?"":"reverse"}`,
          }}/>
        ))}
      </div>

      {/* Logo */}
      <div style={{position:"absolute",top:28,right:28,zIndex:10}}>
        <SpotifyLogo size={22}/>
      </div>

      {/* ── TEXTO lado derecho ── */}
      <div style={{
        position:"absolute",right:0,top:0,bottom:0,
        width:"clamp(46%,52%,58%)",
        display:"flex",flexDirection:"column",justifyContent:"center",
        padding:"40px clamp(20px,4vw,48px) 40px 16px",
        zIndex:5,
      }}>
        <div style={{
          display:"inline-block",background:"#7C6FCD",padding:"4px 14px",marginBottom:18,alignSelf:"flex-start",
          animation:"fadeUp 0.4s 0.2s both",
        }}>
          <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:9,fontWeight:800,letterSpacing:3,textTransform:"uppercase",color:"#fff"}}>En escena</span>
        </div>

        <div style={{
          fontFamily:"'SM','Montserrat',sans-serif",
          fontSize:"clamp(28px,5vw,62px)",
          fontWeight:900,color:"#fff",lineHeight:0.92,
          animation:"slideInLeft 0.55s 0.3s both",
          textShadow:"0 2px 20px rgba(0,0,0,0.6)",
        }}>
          Cuando<br/>
          <span style={{color:"#7C6FCD"}}>Jime canta</span>,<br/>
          todo para.
        </div>

        <p style={{
          fontFamily:"'Montserrat',sans-serif",
          fontSize:"clamp(12px,1.5vw,14px)",
          color:"rgba(255,255,255,0.7)",
          lineHeight:1.7,marginTop:18,
          animation:"fadeUp 0.5s 0.48s both",
        }}>
          Hay algo que pasa cuando Jime toma el micrófono: la sala cambia.
          No importa si es un show enorme o una juntada de veinte personas —
          su voz tiene esa rara capacidad de hacer que todos dejen de hablar
          y simplemente escuchen. Años de corales y ensayos forjaron algo
          que no se aprende: presencia.
        </p>

        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18,animation:"fadeUp 0.5s 0.62s both"}}>
          {["Soprano","Voz en vivo","Coros","Shows"].map((t,i)=>(
            <span key={i} style={{
              fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:700,
              color:"rgba(255,255,255,0.5)",
              border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:40,padding:"3px 10px",
            }}>#{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 12 — FOTO HACIENDO MÚSICA JUNTAS
   Full-bleed photo · momento especial con amiga
───────────────────────────────────────────────────────────── */
function SlidePhotoMusica() {
  return (
    <div className="ws" style={{background:"#0a0805",overflow:"hidden"}}>

      {/* ── FOTO lado derecho ── */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:"clamp(42%,50%,55%)",overflow:"hidden"}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/haciendo-juntos.webp" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}} alt="Haciendo música juntas"/>
        {/* Scan lines */}
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.1) 3px,rgba(0,0,0,0.1) 4px)",pointerEvents:"none"}}/>
        {/* Fade to left */}
        <div style={{position:"absolute",top:0,left:0,bottom:0,width:"45%",background:"linear-gradient(to left,transparent,#0a0805)",pointerEvents:"none"}}/>
      </div>

      {/* ── Anillos decorativos ── */}
      <div style={{position:"absolute",right:-80,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
        {[50,90,130,170].map((r,i)=>(
          <div key={i} style={{
            position:"absolute",width:r*2,height:r*2,borderRadius:"50%",
            border:`1px solid rgba(201,133,58,${0.3-i*0.06})`,
            top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            animation:`rotateSlow ${20+i*5}s linear infinite ${i%2===0?"":"reverse"}`,
          }}/>
        ))}
      </div>

      {/* Logo */}
      <div style={{position:"absolute",top:28,left:28,zIndex:10}}>
        <SpotifyLogo size={22}/>
      </div>

      {/* ── TEXTO lado izquierdo ── */}
      <div style={{
        position:"absolute",left:0,top:0,bottom:0,
        width:"clamp(46%,52%,58%)",
        display:"flex",flexDirection:"column",justifyContent:"center",
        padding:"40px 16px 40px clamp(20px,4vw,48px)",
        zIndex:5,
      }}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:6,
          background:"rgba(201,133,58,0.2)",border:"1px solid rgba(201,133,58,0.4)",
          borderRadius:40,padding:"5px 14px",marginBottom:18,alignSelf:"flex-start",
          animation:"fadeUp 0.4s 0.2s both",
        }}>
          <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:9,fontWeight:800,color:"#C9853A",letterSpacing:2,textTransform:"uppercase"}}>Haciendo música juntos</span>
        </div>

        <div style={{
          fontFamily:"'SM','Montserrat',sans-serif",
          fontSize:"clamp(28px,5vw,62px)",
          fontWeight:900,color:"#fff",lineHeight:0.92,
          animation:"slideInLeft 0.55s 0.3s both",
          textShadow:"0 2px 20px rgba(0,0,0,0.6)",
        }}>
          Dos voces,<br/>
          <span style={{color:"#C9853A"}}>una canción.</span>
        </div>

        <p style={{
          fontFamily:"'Montserrat',sans-serif",
          fontSize:"clamp(12px,1.5vw,14px)",
          color:"rgba(255,255,255,0.7)",
          lineHeight:1.7,marginTop:18,
          animation:"fadeUp 0.5s 0.48s both",
        }}>
          Hay momentos que no se planean: te sentás con alguien,
          uno empieza a tocar un acorde, la otra tararea algo,
          y de repente hay una canción que no existía antes.
          No es un ensayo — es una conversación en el idioma
          que más nos gusta.
        </p>

        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18,animation:"fadeUp 0.5s 0.62s both"}}>
          {["Sesión de música","Composición","Improvisación","Amistad","Canciones nuevas"].map((t,i)=>(
            <span key={i} style={{
              fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:700,
              color:"rgba(255,255,255,0.45)",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:40,padding:"3px 10px",
            }}>#{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 11 — FUN STATS  (cream · data cards)
───────────────────────────────────────────────────────────── */
function SlideFunStats() {
  return (
    <div className="ws" style={{background:"#F5F1E8"}}>
      {/* Polka dots bg */}
      {Array.from({length:24}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          width:8,height:8,borderRadius:"50%",
          background:"rgba(124,111,205,0.2)",
          top:`${(Math.floor(i/6)*25)+12}%`,
          left:`${(i%6)*18+4}%`,
          animation:`pulse ${2+i%4}s ease-in-out infinite`,
          animationDelay:`${i*0.15}s`,
        }}/>
      ))}
      <div className="logo-tl"><SpotifyLogo dark size={24}/></div>

      <div className="sc" style={{width:"100%",maxWidth:600,padding:"0 20px",position:"relative",zIndex:2}}>
        <p className="sc-label" style={{color:"#888"}}>¿Sabías que...?</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginTop:12}}>
          {funStats.map((s,i)=>(
            <div key={i} style={{
              background:"#fff",
              border:"1px solid rgba(0,0,0,0.07)",
              borderRadius:12,
              padding:"16px 14px",
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
              animation:`fadeUp 0.5s ${0.15+i*0.1}s both`,
            }}>
              <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
              <div style={{fontFamily:"'SM','Montserrat',sans-serif",fontSize:"clamp(20px,4vw,28px)",fontWeight:900,color:"#1a1a1a",lineHeight:1}}>{s.value}</div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,color:"#999",marginTop:4,lineHeight:1.3,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 12 — AWARD  (dark red · better design)
───────────────────────────────────────────────────────────── */
function SlideAward() {
  return (
    <div className="ws" style={{background:"#120608"}}>
      {/* Concentric rings in red */}
      <ConcentricRings count={7} color="#E8143F" opacity={0.3} gap={50} strokeWidth={1}/>
      {/* Checkerboard corners */}
      <div style={{position:"absolute",top:0,left:0,width:100,height:100,
        backgroundImage:"repeating-conic-gradient(#E8143F 0% 25%, transparent 0% 50%)",
        backgroundSize:"16px 16px",opacity:0.4}}/>
      <div style={{position:"absolute",bottom:0,right:0,width:100,height:100,
        backgroundImage:"repeating-conic-gradient(#E8143F 0% 25%, transparent 0% 50%)",
        backgroundSize:"16px 16px",opacity:0.4}}/>
      {/* Red glow */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%, rgba(232,20,63,0.25) 0%, transparent 65%)",pointerEvents:"none"}}/>

      <div className="sc" style={{padding:"0 32px",position:"relative",zIndex:2,textAlign:"center"}}>
        <div style={{
          display:"inline-block",background:"#E8143F",padding:"5px 16px",marginBottom:20,
          animation:"pulse 3s ease-in-out infinite",
        }}>
          <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:800,letterSpacing:3,textTransform:"uppercase",color:"#fff"}}>Wrapped Party Awards</span>
        </div>
        <div style={{
          fontFamily:"'SM','Montserrat',sans-serif",
          fontSize:"clamp(42px,11vw,88px)",
          fontWeight:900,
          fontStyle:"italic",
          color:"#E8143F",
          lineHeight:0.9,
          animation:"slideInLeft 0.6s 0.3s both",
          textShadow:"0 0 40px rgba(232,20,63,0.5)",
        }}>
          The<br/>Absolute<br/>Music<br/>Addict
        </div>
        <div style={{
          background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:8,
          padding:"14px 20px",
          maxWidth:340,
          margin:"20px auto 0",
          animation:"fadeUp 0.5s 0.6s both",
        }}>
          <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:13,color:"#ddd",lineHeight:1.6,margin:0}}>
            Dada a quien hace de la música su idioma principal. La que canta, la que escucha, la que vive a ritmo.
          </p>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:20,animation:"fadeUp 0.5s 0.75s both"}}>
          {["🏆","🎤","🎵","⭐"].map((e,i)=>(
            <div key={i} style={{fontSize:24,animation:`float ${2+i*0.5}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}>{e}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 13 — FIN  (dark · ending)
───────────────────────────────────────────────────────────── */
function SlideFin({ onClose }: { onClose?: () => void }) {
  return (
    <div className="ws" style={{background:"#0D0D0D"}}>
      {/* Checkerboard halftone fade */}
      <div style={{
        position:"absolute",inset:0,
        backgroundImage:"repeating-conic-gradient(#1DB954 0% 25%, transparent 0% 50%)",
        backgroundSize:"22px 22px",
        opacity:0.06,
      }}/>
      {/* Green gradient glow */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 50% 60%, rgba(29,185,84,0.18) 0%, transparent 70%)",pointerEvents:"none"}}/>
      {/* Floating confetti dots */}
      {["#1DB954","#7C6FCD","#E8143F","#FFD600","#fff"].map((c,i)=>(
        Array.from({length:4}).map((_,j)=>(
          <div key={`${i}-${j}`} style={{
            position:"absolute",
            width:j%2===0?8:5,height:j%2===0?8:5,
            borderRadius:"50%",background:c,
            top:`${10+i*16+j*4}%`,
            left:`${5+i*18+j*3}%`,
            animation:`float ${3+i*0.5+j*0.3}s ease-in-out infinite`,
            animationDelay:`${(i+j)*0.2}s`,
            opacity:0.6,
          }}/>
        ))
      ))}

      <div className="sc" style={{padding:"0 36px",position:"relative",zIndex:2,textAlign:"center"}}>
        {/* Big logo */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:28,animation:"pulse 3s ease-in-out infinite"}}>
          <div style={{background:"#1DB954",borderRadius:"50%",width:72,height:72,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px rgba(29,185,84,0.4)"}}>
            <SpotifyLogo size={44}/>
          </div>
        </div>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:12,fontWeight:600,letterSpacing:3,textTransform:"uppercase",color:"#555",animation:"fadeUp 0.5s 0.15s both"}}>
          Eso fue tu
        </p>
        <div style={{
          fontFamily:"'SM','Montserrat',sans-serif",
          fontSize:"clamp(52px,15vw,115px)",
          fontWeight:900,color:"#fff",
          lineHeight:0.88,
          animation:"slideInLeft 0.6s 0.3s both",
        }}>
          2002 – 2026<br/>
          <span style={{color:"#1DB954",fontStyle:"italic"}}>en música</span>
        </div>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:15,color:"#888",marginTop:20,lineHeight:1.7,animation:"fadeUp 0.5s 0.55s both"}}>
          Gracias por escuchar, crear y sentir.<br/>
          <strong style={{color:"#fff"}}>24 años de música, Jime ♪</strong>
        </p>
        {onClose ? (
          <button onClick={onClose} style={{
            display:"inline-block",marginTop:32,
            background:"#1DB954",borderRadius:40,
            color:"#fff",fontFamily:"'Montserrat',sans-serif",
            fontWeight:700,fontSize:13,padding:"13px 34px",
            border:"none",cursor:"pointer",letterSpacing:1,
            boxShadow:"0 4px 20px rgba(29,185,84,0.4)",
            animation:"fadeUp 0.5s 0.75s both",
          }}>
            Volver a Spotify
          </button>
        ) : (
          <Link href="/" style={{
            display:"inline-block",marginTop:32,
            background:"#1DB954",borderRadius:40,
            color:"#fff",fontFamily:"'Montserrat',sans-serif",
            fontWeight:700,fontSize:13,padding:"13px 34px",
            textDecoration:"none",letterSpacing:1,
            boxShadow:"0 4px 20px rgba(29,185,84,0.4)",
            animation:"fadeUp 0.5s 0.75s both",
          }}>
            Volver al inicio
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MINI AUDIO PLAYER
───────────────────────────────────────────────────────────── */
function WrappedPlayer({ audio_url, isPaused }: { audio_url: string; isPaused: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const readyRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    readyRef.current = false;
    a.src = audio_url;
    a.load();
  }, [audio_url]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isPaused) {
      a.pause();
    } else if (readyRef.current) {
      a.play().catch(() => {});
    }
  }, [isPaused]);

  // Resume after tab switch: browser pauses audio when tab hidden
  useEffect(() => {
    function onVisibility() {
      const a = audioRef.current;
      if (!a || !readyRef.current) return;
      if (!document.hidden && !isPausedRef.current && a.paused) {
        a.play().catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function handleMetadata() {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = Math.random() * a.duration;
    readyRef.current = true;
    if (!isPausedRef.current) {
      a.play().catch(() => {});
    }
  }

  return <audio ref={audioRef} onLoadedMetadata={handleMetadata} />;
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function SpotifyWrapped({ onClose }: { onClose?: () => void } = {}) {
  const [current, setCurrent]     = useState(0);
  const [direction, setDirection] = useState<"next"|"prev">("next");
  const [slideKey, setSlideKey]   = useState(0);
  const [isPaused, setIsPaused]   = useState(false);
  const [progress, setProgress]   = useState(0);

  const [songs,  setSongs]  = useState<WrappedSong[]>([]);
  const [albums, setAlbums] = useState<WrappedAlbum[]>([]);
  const [nowPlaying, setNowPlaying] = useState<{ title: string; audio_url: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/musica/popular`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/musica/albums`).then(r => r.ok ? r.json() : []),
    ]).then(([s, a]) => {
      setSongs(s);
      setAlbums(a);
    }).catch(() => {});
  }, []);

  // Auto-play: una canción distinta por cada slide (cicla por la lista)
  useEffect(() => {
    if (songs.length === 0) return;
    const playable = songs.filter(s => s.audio_url);
    if (playable.length === 0) return;
    const song = playable[current % playable.length];
    setNowPlaying({ title: song.title, audio_url: song.audio_url! });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, songs.length]);

  const currentRef   = useRef(current);
  const isPausedRef  = useRef(isPaused);
  const touchStartX  = useRef<number|null>(null);
  const lastWheelRef = useRef(0);

  useEffect(() => { currentRef.current  = current;  }, [current]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  /* ── Navigation ── */
  const goTo = useCallback((idx: number, dir: "next"|"prev") => {
    if (idx < 0 || idx >= TOTAL_SLIDES) return;
    setDirection(dir);
    setSlideKey(k => k + 1);
    setCurrent(idx);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => goTo(currentRef.current + 1, "next"), [goTo]);
  const goPrev = useCallback(() => goTo(currentRef.current - 1, "prev"), [goTo]);

  /* ── Auto-play ── */
  useEffect(() => {
    setProgress(0);
    if (isPaused) return;

    const startTime = Date.now();
    const iv = setInterval(() => {
      if (isPausedRef.current) return;
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
      setProgress(p);
      if (elapsed >= SLIDE_DURATION) {
        clearInterval(iv);
        const c = currentRef.current;
        if (c < TOTAL_SLIDES - 1) goTo(c + 1, "next");
      }
    }, 80);

    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isPaused]);

  /* ── Keyboard ── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); goPrev(); }
      if (e.key === "p" || e.key === "P") setIsPaused(p => !p);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [goNext, goPrev]);

  /* ── Scroll wheel ── */
  useEffect(() => {
    const fn = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelRef.current < 900) return;
      lastWheelRef.current = now;
      if (e.deltaY > 0 || e.deltaX > 0) goNext();
      else goPrev();
    };
    window.addEventListener("wheel", fn, { passive: false });
    return () => window.removeEventListener("wheel", fn);
  }, [goNext, goPrev]);

  /* ── Touch ── */
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
    touchStartX.current = null;
  };

  const slides = [
    <SlideWelcome key="welcome"/>,           // 0
    <SlideUniverso key="universo"/>,         // 1
    <SlideMinutos key="minutos"/>,           // 2
    <SlideGeneros key="generos"/>,           // 3
    <SlideArtista key="artista"/>,           // 4
    <SlideArtistaDive key="artista-dive"/>,  // 5  ← Joaquina
    <SlideCanciones key="canciones" apiSongs={songs}/>,        // 6
    <SlideCancionDelAnio key="cancion-anio" firstSong={songs[0]}/>, // 7
    <SlideAlbumes key="albumes" apiAlbums={albums}/>,         // 8
    <SlideJimeArtista key="jime-artista"/>,  // 9  ← Jime La Artista
    <SlideEnEscena key="en-escena"/>,        // 10 ← Banda (full-width)
    <SlidePhotoCantando key="foto-cantando"/>,// 11 ← Foto Jime cantando
    <SlidePhotoMusica key="foto-musica"/>,   // 12 ← Foto haciendo música juntas
    <SlideFunStats key="fun-stats"/>,        // 13
    <SlideAward key="award"/>,               // 14
    // índice 15 → SlideFin (rendered separately below)
  ];

  const slideAnim = direction === "next" ? "swEnterRight" : "swEnterLeft";

  return (
    <div
      style={{ position:"fixed", inset:0, overflow:"hidden", background:"#000", userSelect:"none" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Fonts + Global CSS ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Bebas+Neue&display=swap');

        @font-face {
          font-family: 'SM';
          src: local('Montserrat ExtraBold Italic'), local('Montserrat-ExtraBoldItalic');
          font-weight: 900;
          font-style: italic;
          font-display: swap;
        }

        /* ── Slide shell ── */
        .ws {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden;
        }

        /* ── Slide content wrapper (stagger children) ── */
        .sc { display: flex; flex-direction: column; }
        .sc > * { animation: fadeUp 0.55s ease both; }
        .sc > *:nth-child(1) { animation-delay: 0.20s; }
        .sc > *:nth-child(2) { animation-delay: 0.33s; }
        .sc > *:nth-child(3) { animation-delay: 0.46s; }
        .sc > *:nth-child(4) { animation-delay: 0.59s; }
        .sc > *:nth-child(5) { animation-delay: 0.72s; }
        .sc > *:nth-child(6) { animation-delay: 0.85s; }

        /* ── Label util ── */
        .sc-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          color: #888; margin-bottom: 8px;
        }

        /* ── Logo positions ── */
        .logo-tl { position: absolute; top: 52px; left: 24px; z-index: 10; }
        .logo-tr { position: absolute; top: 52px; right: 24px; z-index: 10; }

        /* ── Slide transitions ── */
        .swEnterRight { animation: swEnterRight 0.62s cubic-bezier(0.32,0.72,0,1) both; }
        .swEnterLeft  { animation: swEnterLeft  0.62s cubic-bezier(0.32,0.72,0,1) both; }

        @keyframes swEnterRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes swEnterLeft  { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        /* ── Element animations ── */
        @keyframes fadeUp    { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes float     { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-14px); } }
        @keyframes pulse     { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.06); opacity:0.85; } }
        @keyframes rotateSlow { to { transform:rotate(360deg); } }
        @keyframes wave      { from { height:var(--h-from,20%); } to { height:var(--h-to,80%); } }
        @keyframes barGrow   { from { width:0; } to { width:100%; } }
        @keyframes ringBreathe { 0%,100% { transform:scale(1); opacity:var(--ro,0.5); } 50% { transform:scale(1.08); opacity:calc(var(--ro,0.5)*1.5); } }
        @keyframes ringExpand  { 0%   { transform:scale(0.88); opacity:0; } 40%  { opacity:var(--ro,0.5); } 100% { transform:scale(1.14); opacity:0; } }
        @keyframes ringShimmer { 0%   { box-shadow:0 0 0px 0px transparent; } 50% { box-shadow:0 0 18px 4px rgba(255,214,0,0.35); } 100% { box-shadow:0 0 0px 0px transparent; } }

        /* ── Progress bar active fill ── */
        .prog-active-fill {
          height: 100%;
          background: rgba(255,255,255,0.92);
          border-radius: 2px;
          transition: width 80ms linear;
        }
      `}</style>

      {/* ── Story progress bar ──────────────────────────────────── */}
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:200,
        display:"flex", gap:3, padding:"12px 14px 0" }}>
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div key={i} style={{
            flex:1, height:3, borderRadius:2,
            background: i < current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
            overflow:"hidden",
            cursor:"pointer",
          }} onClick={() => goTo(i, i > current ? "next" : "prev")}>
            {i === current && (
              <div className="prog-active-fill" style={{ width:`${progress}%` }}/>
            )}
          </div>
        ))}
      </div>

      {/* ── Top controls ─────────────────────────────────────────── */}
      <div style={{ position:"absolute", top:18, right:50, zIndex:200, display:"flex", gap:8, alignItems:"center" }}>
        {/* Pause/play */}
        <button
          onClick={() => setIsPaused(p => !p)}
          style={{
            background:"rgba(0,0,0,0.5)", border:"none", borderRadius:"50%",
            width:28, height:28, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontSize:12,
          }}
          title={isPaused ? "Reproducir" : "Pausar"}
        >
          {isPaused ? "▶" : "⏸"}
        </button>
      </div>

      {/* ── Close ────────────────────────────────────────────────── */}
      {onClose ? (
        <button onClick={onClose} style={{
          position:"absolute", top:18, right:14, zIndex:200,
          color:"#fff", background:"rgba(0,0,0,0.5)", border:"none",
          borderRadius:"50%", width:28, height:28,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, fontWeight:700, cursor:"pointer",
        }}>✕</button>
      ) : (
        <Link href="/" style={{
          position:"absolute", top:18, right:14, zIndex:200,
          color:"#fff", textDecoration:"none",
          width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(0,0,0,0.5)", borderRadius:"50%",
          fontSize:14, fontWeight:700,
        }}>✕</Link>
      )}

      {/* ── Active slide ─────────────────────────────────────────── */}
      <div key={slideKey} className={slideAnim} style={{ position:"absolute", inset:0 }}>
        {current < TOTAL_SLIDES - 1 ? slides[current] : <SlideFin key="fin" onClose={onClose}/>}
      </div>

      {/* ── Click navigation zones ───────────────────────────────── */}
      <div style={{ position:"absolute", inset:0, display:"flex", zIndex:100 }}>
        <div style={{ flex:1, cursor: current > 0 ? "w-resize" : "default" }} onClick={goPrev}/>
        <div style={{ flex:1, cursor: current < TOTAL_SLIDES - 1 ? "e-resize" : "default" }} onClick={goNext}/>
      </div>

      {/* ── Dot nav (bottom) ─────────────────────────────────────── */}
      <div style={{
        position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)",
        zIndex:200, display:"flex", gap:5, alignItems:"center",
      }}>
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div key={i}
            onClick={(e) => { e.stopPropagation(); goTo(i, i > current ? "next" : "prev"); }}
            style={{
              width: i === current ? 18 : 6, height:6,
              borderRadius:3,
              background: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
              cursor:"pointer",
              transition:"all 0.3s ease",
              zIndex:200,
            }}
          />
        ))}
      </div>

      {/* ── Invisible audio player ───────────────────────────────── */}
      {nowPlaying && <WrappedPlayer audio_url={nowPlaying.audio_url} isPaused={isPaused} />}
    </div>
  );
}
