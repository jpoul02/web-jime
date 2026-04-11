"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SpotifyWrapped from "./SpotifyWrapped";

const HERO_IMAGE = "/verified_artist.webp";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Palette ──────────────────────────────────────────────── */
const G = "#1DB954";
const BG = "#121212";
const SBG = "#000000";
const CARD = "#181818";
const HOVER = "#282828";
const MUT = "#B3B3B3";

/* ── useIsMobile hook ─────────────────────────────────────── */
function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setM(mq.matches);
    const h = (e: MediaQueryListEvent) => setM(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return m;
}

/* ── Types ────────────────────────────────────────────────── */
interface Song {
  id: number;
  title: string;
  cover_url: string | null;
  audio_url: string | null;
  order: number;
}

interface AlbumTrack {
  id: number;
  title: string;
  audio_url: string | null;
  order: number;
}

interface Album {
  id: number;
  title: string;
  cover_url: string | null;
  year: number | null;
  order: number;
  tracks: AlbumTrack[];
}

interface QueueItem {
  title: string;
  audio_url: string | null;
  cover_url: string | null;
}

interface NowPlaying {
  title: string;
  audio_url: string;
  cover_url: string | null;
  album_title?: string;
  queue?: QueueItem[];
  queueIndex?: number;
  onPlayQueueItem?: (i: number) => void;
}

/* ── Static data ──────────────────────────────────────────── */
const BANDS = [
  { name: "Todos mis amigos se llaman Javier", role: "Voz principal", years: "2025–presente" },
  { name: "Coro Nacional",                     role: "Soprano",       years: "2025–presente" },
  { name: "Banda Pop",                         role: "Voz",           years: "2025–presente" },
  { name: "Coro Universitario",                role: "Soprano",     years: "2022–presente" },
  { name: "Coro Esperanza Azteca",             role: "Soprano",       years: "2015–2017"     },
  { name: "Coro Alianza Francesa",             role: "Soprano",       years: "2026"          },
];

/* ── SVG helpers ──────────────────────────────────────────── */
function SpotifyLogo({ size = 24, color = G }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function PlayIcon({ size = 18, color = "#000" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon({ size = 18, color = "#000" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
  );
}

function CoverThumb({ src, size = 40, emoji = "🎵" }: { src: string | null; size?: number; emoji?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 4, flexShrink: 0, overflow: "hidden",
      background: "linear-gradient(135deg,#1a3a5c,#2d1a4a)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45,
    }}>
      {src
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : emoji}
    </div>
  );
}

/* ── Bottom Player ────────────────────────────────────────── */
function BottomPlayer({
  now, onClose, onPrev, onNext, hasPrev, hasNext, isMobile,
}: {
  now: NowPlaying;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isMobile: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showQueue, setShowQueue] = useState(false);

  // auto-play when track changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.play().then(() => setPlaying(true)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now.audio_url]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
  }, [volume]);
  //forcing redeploy
  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  }

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={now.audio_url}
        onTimeUpdate={() => { const a = audioRef.current; if (a) setProgress(a.currentTime); }}
        onLoadedMetadata={() => { const a = audioRef.current; if (a) setDuration(a.duration); }}
        onEnded={() => { setPlaying(false); if (hasNext) onNext(); }}
      />

      {/* Queue panel */}
      {showQueue && (
        <div style={{
          position: "fixed", bottom: isMobile ? 72 : 90, right: 0,
          width: isMobile ? "100%" : 340,
          maxHeight: 380,
          background: "#282828",
          borderTop: "1px solid #383838",
          borderLeft: isMobile ? "none" : "1px solid #383838",
          zIndex: 199,
          overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}>
        
          <div style={{ padding: "14px 16px 10px", fontSize: 13, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 1.2, borderBottom: "1px solid #383838", flexShrink: 0 }}>
            Cola de reproducción
          </div>
          {now.queue && now.queue.map((item, i) => (
            <div
              key={(item.audio_url ?? "") + i}
              onClick={() => item.audio_url && now.onPlayQueueItem?.(i)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px",
                background: item.audio_url === now.audio_url ? "rgba(255,255,255,0.08)" : "transparent",
                cursor: item.audio_url ? "pointer" : "default",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (item.audio_url) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = item.audio_url === now.audio_url ? "rgba(255,255,255,0.08)" : "transparent"; }}
            >
              <CoverThumb src={item.cover_url ?? null} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: item.audio_url === now.audio_url ? G : "#fff",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{item.title}</div>
                <div style={{ fontSize: 11, color: MUT }}>Jimena Sings</div>
              </div>
              {item.audio_url === now.audio_url && (
                <span style={{ fontSize: 11, color: G }}>▶</span>
              )}
              {!item.audio_url && <span style={{ fontSize: 11, color: "#555" }}>sin audio</span>}
            </div>
          ))}
        </div>
      )}

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        height: isMobile ? 72 : 90,
        background: "#181818",
        borderTop: "1px solid #282828",
        display: "flex", alignItems: "center",
        padding: isMobile ? "0 12px" : "0 16px",
        gap: isMobile ? 10 : 16,
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}>
        {/* Mobile progress bar — top of player */}
        {isMobile && (
          <div
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#535353", cursor: "pointer" }}
            onClick={seek}
          >
            <div style={{ width: `${pct}%`, height: "100%", background: G, transition: "width 0.1s" }} />
          </div>
        )}
        {/* Left: cover + info */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, minWidth: 0, flex: isMobile ? "1 1 0" : "0 0 280px" }}>
          <CoverThumb src={now.cover_url} size={isMobile ? 44 : 56} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{now.title}</div>
            {now.album_title && !isMobile && <div style={{ fontSize: 11, color: MUT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Jimena Sings · {now.album_title}</div>}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: MUT, cursor: "pointer", fontSize: 18, flexShrink: 0, marginLeft: 8 }}
            title="Cerrar"
          >✕</button>
        </div>

        {/* Center: controls + progress */}
        <div style={{ flex: isMobile ? "0 0 auto" : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 24 }}>
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              style={{ ...ctrlBtn, opacity: hasPrev ? 1 : 0.3 }}
              title="Anterior"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill={MUT}>
                <polygon points="19,20 9,12 19,4"/><line x1="5" y1="4" x2="5" y2="20" stroke={MUT} strokeWidth="2"/>
              </svg>
            </button>
            <button
              onClick={togglePlay}
              style={{
                width: 40, height: 40, borderRadius: "50%", background: "#fff",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {playing ? <PauseIcon size={18} color="#000" /> : <PlayIcon size={18} color="#000" />}
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              style={{ ...ctrlBtn, opacity: hasNext ? 1 : 0.3 }}
              title="Siguiente"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill={MUT}>
                <polygon points="5,4 15,12 5,20"/><line x1="19" y1="4" x2="19" y2="20" stroke={MUT} strokeWidth="2"/>
              </svg>
            </button>
          </div>
            {/* Progress bar */}
          {!isMobile && (
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: MUT, minWidth: 36, textAlign: "right", fontFamily: "monospace" }}>{fmt(progress)}</span>
              <div
                style={{ flex: 1, height: 4, background: "#535353", borderRadius: 2, cursor: "pointer", position: "relative" }}
                onClick={seek}
              >
                <div style={{
                  width: `${pct}%`, height: "100%", background: "#fff", borderRadius: 2,
                  transition: "width 0.1s",
                }} />
              </div>
              <span style={{ fontSize: 11, color: MUT, minWidth: 36, fontFamily: "monospace" }}>{fmt(duration)}</span>
            </div>
          )}
        </div>

        {/* Right: volume + queue toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: isMobile ? "0 0 auto" : "0 0 180px", justifyContent: "flex-end" }}>
          {/* Queue button */}
          <button
            onClick={() => setShowQueue(q => !q)}
            style={{
              ...ctrlBtn,
              opacity: showQueue ? 1 : 0.6,
              color: showQueue ? G : MUT,
            }}
            title="Cola"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={showQueue ? G : MUT} strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          {/* Volume — desktop only */}
          {!isMobile && (
            <>
              <svg width={16} height={16} viewBox="0 0 24 24" fill={MUT}>
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke={MUT} strokeWidth="2" fill="none"/>}
                {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke={MUT} strokeWidth="2" fill="none"/>}
              </svg>
              <input
                type="range" min={0} max={1} step={0.02} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                style={{ width: 80, accentColor: G, cursor: "pointer" }}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

const ctrlBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 4,
};

/* ── Album detail modal ───────────────────────────────────── */
function AlbumModal({
  album, onClose, onPlay,
}: {
  album: Album;
  onClose: () => void;
  onPlay: (t: NowPlaying, tracks: AlbumTrack[]) => void;
}) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(to bottom,#1a2a4a,#121212)",
          borderRadius: 16, padding: "32px",
          maxWidth: 680, width: "100%",
          display: "flex", gap: 32, flexWrap: "wrap",
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left: cover */}
        <div style={{ flexShrink: 0 }}>
          <CoverThumb src={album.cover_url} size={200} />
          <p style={{ margin: "12px 0 4px 0", fontSize: 22, fontWeight: 800, color: "#fff" }}>{album.title}</p>
          {album.year && <p style={{ margin: 0, fontSize: 13, color: MUT }}>Álbum · {album.year}</p>}
        </div>

        {/* Right: tracklist */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 0, marginBottom: 12 }}>
            Canciones
          </p>
          {album.tracks.length === 0 && (
            <p style={{ color: MUT, fontSize: 14 }}>Sin tracks todavía</p>
          )}
          {album.tracks.map((t, i) => (
            <div
              key={t.id}
              onMouseEnter={() => setHoveredTrack(t.id)}
              onMouseLeave={() => setHoveredTrack(null)}
              onClick={() => t.audio_url && onPlay({ title: t.title, audio_url: t.audio_url, cover_url: album.cover_url, album_title: album.title }, album.tracks)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "8px 12px", borderRadius: 6,
                background: hoveredTrack === t.id ? HOVER : "transparent",
                cursor: t.audio_url ? "pointer" : "default",
                transition: "background 0.1s",
              }}
            >
              <div style={{ width: 20, textAlign: "center", flexShrink: 0 }}>
                {hoveredTrack === t.id && t.audio_url
                  ? <PlayIcon size={14} color="#fff" />
                  : <span style={{ fontSize: 14, color: MUT }}>{i + 1}</span>}
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#fff" }}>{t.title}</span>
              {!t.audio_url && <span style={{ fontSize: 11, color: "#555" }}>sin audio</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function SpotifyArtistPage() {
  const isMobile = useIsMobile();
  const [showWrapped, setShowWrapped] = useState(false);
  const [discFilter, setDiscFilter] = useState<"popular" | "albums" | "singles">("popular");
  const [liked, setLiked] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

  // API data
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // Player
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  // Album modal
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/musica/popular`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/musica/albums`).then(r => r.ok ? r.json() : []),
    ]).then(([s, a]) => {
      setSongs(s);
      setAlbums(a);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function buildNowPlaying(item: QueueItem, idx: number, q: QueueItem[]): NowPlaying | null {
    if (!item.audio_url) return null;
    return {
      title: item.title,
      audio_url: item.audio_url,
      cover_url: item.cover_url,
      queue: q,
      queueIndex: idx,
      onPlayQueueItem: (i: number) => playFromQueue(q, i),
    };
  }

  function playFromQueue(q: QueueItem[], idx: number) {
    const item = q[idx];
    if (!item?.audio_url) return;
    setQueue(q);
    setQueueIndex(idx);
    setNowPlaying(buildNowPlaying(item, idx, q)!);
  }

  function playSong(song: Song) {
    if (!song.audio_url) return;
    const q: QueueItem[] = songs.map(s => ({ title: s.title, audio_url: s.audio_url, cover_url: s.cover_url }));
    const idx = songs.findIndex(s => s.id === song.id);
    playFromQueue(q, idx >= 0 ? idx : 0);
  }

  function handlePrev() {
    if (queueIndex > 0) playFromQueue(queue, queueIndex - 1);
  }

  function handleNext() {
    if (queueIndex < queue.length - 1) playFromQueue(queue, queueIndex + 1);
  }

  if (showWrapped) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
        <SpotifyWrapped onClose={() => setShowWrapped(false)} />
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

  const contentPadding = isMobile ? 16 : 32;

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: BG, fontFamily: "var(--font-spotify), -apple-system, sans-serif",
      color: "#fff",
    }}>
      {selectedAlbum && (
        <AlbumModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          onPlay={(t, albumTracks) => {
            const q: QueueItem[] = albumTracks.map(tr => ({ title: tr.title, audio_url: tr.audio_url, cover_url: selectedAlbum.cover_url }));
            const idx = albumTracks.findIndex(tr => tr.audio_url === t.audio_url);
            playFromQueue(q, idx >= 0 ? idx : 0);
            setSelectedAlbum(null);
          }}
        />
      )}

      {/* ═══ SIDEBAR — hidden on mobile ═════════════════════════════ */}
      {!isMobile && (
        <aside style={{
          width: 240, flexShrink: 0, background: SBG,
          display: "flex", flexDirection: "column",
          padding: "16px 12px", gap: 20, overflowY: "auto",
        }}>
          <div style={{ padding: "8px 12px" }}>
            <SpotifyLogo size={32} />
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { href: "/",          label: "Inicio",   icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="#fff"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="#fff" strokeWidth="2"/></svg> },
              { href: "/amigos",    label: "Amigos",   icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
              { href: "/historia",  label: "Historia", icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
              { href: "/skype",     label: "Skype",    icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
              { href: "/ask",       label: "Ask.fm",   icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "10px 12px", borderRadius: 4,
                color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600,
                opacity: 0.85,
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>
          <div style={{ background: "#121212", borderRadius: 8, padding: "16px 12px", flexGrow: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: MUT, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={MUT} strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Tu biblioteca
            </div>
            {albums.slice(0, 5).map((album) => (
              <div
                key={album.id}
                onClick={() => setSelectedAlbum(album)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 4px", borderRadius: 4, cursor: "pointer",
                }}
              >
                <CoverThumb src={album.cover_url} size={40} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{album.title}</div>
                  <div style={{ fontSize: 12, color: MUT }}>Álbum{album.year ? ` · ${album.year}` : ""}</div>
                </div>
              </div>
            ))}
            {albums.length === 0 && !loading && (
              <div style={{ fontSize: 13, color: MUT }}>Sin álbumes todavía</div>
            )}
          </div>
        </aside>
      )}

      {/* ═══ MAIN CONTENT ════════════════════════════════════════ */}
      <main style={{
        flex: 1, overflowY: "auto",
        background: BG,
        scrollbarWidth: "thin", scrollbarColor: "#333 transparent",
        paddingBottom: nowPlaying ? (isMobile ? 72 : 90) : (isMobile ? 64 : 0),
      }}>
        {/* ── Top bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `0 ${contentPadding}px`, height: 64,
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
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button style={{ background: "#fff", border: "none", borderRadius: 24, padding: "10px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#000" }}>
              Seguir
            </button>
          </div>
        </header>

        {/* ── Hero */}
        <section style={{ position: "relative", height: isMobile ? 260 : 420, overflow: "hidden", background: "#0A1628" }}>
          {isMobile ? (
            /* Mobile: full-bleed, objectPosition top para mostrar cara */
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_IMAGE} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.05) 40%,#121212 100%)" }}/>
            </>
          ) : (
            /* Desktop: foto portrait en lado derecho, gradiente tapa el borde izquierdo */
            <>
              <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"45%", overflow:"hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={HERO_IMAGE} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                {/* fade hacia la izquierda */}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,#0A1628 0%,transparent 40%)" }}/>
              </div>
              {/* gradiente bottom para fundir con el contenido */}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 50%,#121212 100%)" }}/>
              <div style={{ position:"absolute", top:-60, left:-60, width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(29,185,84,0.15) 0%,transparent 70%)", pointerEvents:"none" }}/>
            </>
          )}

          <div style={{ position: "absolute", inset: 0, bottom: 32, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: `0 ${contentPadding}px 24px`, zIndex: 10 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill={G}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Artista verificada
            </div>
            <h1 style={{ fontSize: isMobile ? "clamp(32px,10vw,52px)" : "clamp(48px,7vw,96px)", fontWeight: 900, lineHeight: 1, letterSpacing: isMobile ? -1 : -3, color: "#fff", margin: "0 0 12px" }}>
              Jimena Sings
            </h1>
            <p style={{ fontSize: isMobile ? 13 : 16, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              {songs.length > 0 ? `${songs.length} canciones populares` : "2.450.320 oyentes mensuales"}
            </p>
          </div>
        </section>

        {/* ── Artist controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: `24px ${contentPadding}px` }}>
          <button
            onClick={() => songs[0]?.audio_url && playSong(songs[0])}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: G, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 8px 24px ${G}55`,
            }}
          >
            <PlayIcon size={22} color="#000" />
          </button>
          <button
            onClick={() => setLiked(l => !l)}
            style={{
              background: "none", border: `1px solid ${liked ? G : "rgba(255,255,255,0.4)"}`,
              borderRadius: 20, padding: "8px 24px", cursor: "pointer",
              color: liked ? G : "#fff", fontSize: 14, fontWeight: 700,
            }}
          >
            {liked ? "Siguiendo" : "Seguir"}
          </button>
        </div>

        {/* ── Populares */}
        <section style={{ padding: `0 ${contentPadding}px 32px` }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: "#fff" }}>Populares</h2>
          {loading && <p style={{ color: MUT, fontSize: 14 }}>Cargando...</p>}
          {!loading && songs.length === 0 && (
            <p style={{ color: MUT, fontSize: 14 }}>Todavía no hay canciones populares.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {songs.map((song, i) => {
              const isPlaying = nowPlaying?.audio_url === song.audio_url;
              return (
                <div
                  key={song.id}
                  onMouseEnter={() => setHoveredTrack(song.id)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  onClick={() => playSong(song)}
                  style={{
                    display: "flex", alignItems: "center", gap: isMobile ? 10 : 16,
                    padding: isMobile ? "8px 8px" : "8px 16px", borderRadius: 6,
                    background: hoveredTrack === song.id ? HOVER : "transparent",
                    cursor: song.audio_url ? "pointer" : "default",
                    transition: "background 0.1s", height: 56,
                  }}
                >
                  {/* Number / play */}
                  <div style={{ width: 20, textAlign: "right", flexShrink: 0 }}>
                    {hoveredTrack === song.id && song.audio_url
                      ? <PlayIcon size={16} color="#fff" />
                      : isPlaying
                        ? <span style={{ fontSize: 14, color: G }}>▶</span>
                        : <span style={{ fontSize: 16, color: MUT }}>{i + 1}</span>}
                  </div>
                  {/* Cover */}
                  <CoverThumb src={song.cover_url} size={40} />
                  {/* Title */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: isPlaying ? G : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
                    {!isMobile && <div style={{ fontSize: 13, color: MUT }}>Jimena Sings</div>}
                  </div>
                  {!song.audio_url && <span style={{ fontSize: 12, color: "#444" }}>sin audio</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Discografía */}
        <section style={{ padding: `0 ${contentPadding}px 32px` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>Discografía</h2>
          </div>
          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {(["popular", "albums", "singles"] as const).map((f) => {
              const labels = { popular: "Todo", albums: "Álbumes", singles: "Sencillos y EP" };
              return (
                <button key={f} onClick={() => setDiscFilter(f)} style={{
                  padding: "8px 16px", borderRadius: 20, border: "none",
                  background: discFilter === f ? "#fff" : "#2A2A2A",
                  color: discFilter === f ? "#000" : "#fff",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-spotify), sans-serif",
                }}>{labels[f]}</button>
              );
            })}
          </div>
          {loading && <p style={{ color: MUT, fontSize: 14 }}>Cargando...</p>}
          {!loading && albums.length === 0 && (
            <p style={{ color: MUT, fontSize: 14 }}>Todavía no hay álbumes.</p>
          )}
          <div style={{ display: "flex", gap: isMobile ? 12 : 24, flexWrap: "wrap" }}>
            {albums.map((album) => {
              const cardWidth = isMobile ? 140 : 180;
              const thumbSize = isMobile ? 108 : 148;
              return (
                <div
                  key={album.id}
                  onClick={() => setSelectedAlbum(album)}
                  style={{
                    width: cardWidth, cursor: "pointer",
                    padding: "16px 16px 24px", borderRadius: 8,
                    background: "transparent", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = HOVER)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <CoverThumb src={album.cover_url} size={thumbSize} emoji="💿" />
                  <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#fff", marginTop: 12, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{album.title}</div>
                  <div style={{ fontSize: 13, color: MUT }}>{album.year ?? "—"} · Álbum</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Información */}
        <section style={{ padding: `0 ${contentPadding}px 48px` }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Información</h2>
          <div style={{ display: "flex", gap: 32, flexDirection: isMobile ? "column" : "row", flexWrap: "wrap" }}>
            {/* Bio */}
            <div style={{ flex: "1 1 420px", minWidth: isMobile ? "unset" : 320 }}>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, margin: "0 0 20px" }}>
                Cantante y alma musical nacida para el escenario. Con una voz que va del pop latino al rock y del trap al vallenato, Jimena construyó su sonido entre coros universitarios y tardes de Club Penguin.
              </p>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Proyectos musicales</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {BANDS.map(b => (
                    <div key={b.name} style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 6 : 0, padding: "12px 16px", background: CARD, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{b.name}</div>
                        <div style={{ fontSize: 13, color: MUT }}>{b.role}</div>
                      </div>
                      <div style={{ fontSize: 12, color: MUT, background: "#2A2A2A", padding: "4px 10px", borderRadius: 12, alignSelf: isMobile ? "flex-start" : "auto" }}>{b.years}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Wrapped card */}
            <div style={{ flex: isMobile ? "1 1 auto" : "0 0 340px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Tu año en música</div>
              <div
                onClick={() => setShowWrapped(true)}
                style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", background: "linear-gradient(145deg,#F0EBE1,#DDD5C8)", position: "relative", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
              >
                <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <SpotifyLogo size={22} color="#000" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#000", letterSpacing: 2, textTransform: "uppercase" }}>2002 – 2026</span>
                </div>
                <div style={{ position: "relative", height: 180, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {[120, 90, 64, 44].map((s, i) => (
                    <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: `${1.5 - i * 0.2}px solid rgba(26,26,26,${0.12 - i * 0.02})` }}/>
                  ))}
                  <div style={{ fontSize: 52, position: "relative", zIndex: 2 }}>🎵</div>
                </div>
                <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a" }}>Tu Wrapped</div>
                    <div style={{ fontSize: 14, color: "#555", marginTop: 2 }}>2002 – 2026 · 24 años de Jime</div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["Pop Latino", "Rock", "Trap Latino", "Vallenato"].map(g => (
                      <span key={g} style={{ fontSize: 11, fontWeight: 700, background: "rgba(26,26,26,0.12)", padding: "3px 10px", borderRadius: 12, color: "#1a1a1a" }}>{g}</span>
                    ))}
                  </div>
                  <button style={{ background: "#1a1a1a", border: "none", borderRadius: 24, padding: "12px 0", width: "100%", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-spotify), sans-serif" }}>
                    <PlayIcon size={14} color="#fff" />
                    Ver Wrapped 2002 – 2026
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: `24px ${contentPadding}px 48px`, borderTop: "1px solid rgba(255,255,255,0.08)", color: MUT, fontSize: 12, display: "flex", gap: 24, flexWrap: "wrap" }}>
          {["Legal", "Privacidad", "Cookies"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <SpotifyLogo size={16} /> Jimena Sings
          </span>
        </footer>
      </main>

      {/* ── Mobile bottom nav */}
      {isMobile && !nowPlaying && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          height: 64, background: "#000000",
          borderTop: "1px solid #282828",
          display: "flex", alignItems: "stretch",
        }}>
          {[
            { href: "/",          label: "Inicio",   icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="#fff" strokeWidth="2"/></svg> },
            { href: "/amigos",    label: "Amigos",   icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
            { href: "/historia",  label: "Historia", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
            { href: "/skype",     label: "Skype",    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
            { href: "/ask",       label: "Ask.fm",   icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 4,
                textDecoration: "none", color: "#fff",
                opacity: 0.7,
              }}
            >
              {icon}
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>{label}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* ── Bottom player */}
      {nowPlaying && (
        <BottomPlayer
          now={nowPlaying}
          onClose={() => setNowPlaying(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={queueIndex > 0}
          hasNext={queueIndex < queue.length - 1}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
