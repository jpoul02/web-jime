"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Search, Grid3x3, Plus, Monitor,
  ChevronDown, Mic, Video, MessageSquare, PhoneOff,
  Maximize2, Ellipsis, Users, HelpCircle, Clock,
  Music, Instagram, User, MicOff, VideoOff,
} from "lucide-react";
import MobileNav from "./MobileNav";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

interface VideoPostal {
  id: number;
  name: string;
  profile_photo_url: string | null;
  video_url: string;
}

const callControls = [
  { icon: <Mic size={22} color="#FFFFFF" />,          bg: "#444444" },
  { icon: <Video size={22} color="#FFFFFF" />,         bg: "#444444" },
  { icon: <Monitor size={22} color="#FFFFFF" />,       bg: "#444444" },
  { icon: <MessageSquare size={22} color="#FFFFFF" />, bg: "#444444" },
  { icon: <Plus size={22} color="#FFFFFF" />,          bg: "#444444" },
  { icon: <PhoneOff size={22} color="#FFFFFF" />,      bg: "#E81123", wide: true },
];

function Avatar({ postal, size = 36 }: { postal: VideoPostal; size?: number }) {
  if (postal.profile_photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={postal.profile_photo_url}
        alt={postal.name}
        style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  const initials = postal.name.slice(0, 2).toUpperCase();
  const colors = ["#4A76A8", "#00AFF0", "#2D5E1E", "#E81123", "#FFB800", "#833AB4"];
  const bg = colors[postal.id % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#fff", fontSize: size * 0.35, fontWeight: 700 }}>{initials}</span>
    </div>
  );
}

function WindowsClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })), 10000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-white text-xs font-semibold tabular-nums">{time}</span>;
}

const TASKBAR_LINKS = [
  { label: "Amigos",  href: "/amigos",  icon: <Instagram size={14} color="#FFFFFF" /> },
  { label: "Ask.fm",  href: "/ask",     icon: <HelpCircle size={14} color="#FFFFFF" /> },
  { label: "Música",  href: "/musica",  icon: <Music size={14} color="#FFFFFF" /> },
];

export default function SkypeDesktop() {
  const router = useRouter();
  const [contacts, setContacts] = useState<VideoPostal[]>([]);
  const [selected, setSelected] = useState<VideoPostal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPortrait, setIsPortrait] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`${API}/postales/videos`)
      .then(r => r.ok ? r.json() : [])
      .then((data: VideoPostal[]) => {
        setContacts(data);
        if (data.length > 0) setSelected(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setIsPortrait(false); // reset while loading new video
    [videoRef, bgVideoRef].forEach(ref => {
      if (ref.current) {
        ref.current.load();
        ref.current.play().catch(() => {});
      }
    });
  }, [selected?.id]);

  function handleMetadata() {
    const v = videoRef.current;
    if (v) setIsPortrait(v.videoHeight > v.videoWidth);
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-white font-[family-name:var(--font-geist-sans)]">

      {/* ── Main Body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar — hidden on mobile ───────────────────────────── */}
        <div className="hidden md:flex flex-col shrink-0 overflow-hidden border-r border-[#E0E0E0]" style={{ width: 340 }}>

          {/* Profile */}
          <div className="flex items-center gap-3 px-4" style={{ height: 70 }}>
            <Image src="/skype-avatar-jime.webp" alt="Jime" width={44} height={44}
              style={{ borderRadius: 22, objectFit: "cover" }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-[#333333] text-sm font-semibold">Jime</span>
              <span className="text-[#888888] text-[11px]">😊 waddle on!</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 h-9 bg-[#F5F5F5] px-4">
            <Search size={14} color="#AAAAAA" />
            <span className="text-[#AAAAAA] text-xs">Buscar...</span>
          </div>

          {/* Nav Icons */}
          <div className="flex items-center justify-around h-11 bg-[#FAFAFA] border-t border-b border-[#EEEEEE]">
            {[MessageSquare, Grid3x3, Plus, Monitor].map((Icon, i) => (
              <Icon key={i} size={20} color="#666666" />
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 h-8 px-4">
            <span className="text-[#00AFF0] text-[11px] font-bold">VIDEOS</span>
            <div className="flex items-center gap-1">
              <span className="text-[#888888] text-[11px]">Todos</span>
              <ChevronDown size={10} color="#888888" />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center h-20 text-[#AAAAAA] text-xs">Cargando...</div>
            )}
            {!loading && contacts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-center px-6">
                <User size={32} color="#CCCCCC" />
                <p className="text-[#AAAAAA] text-xs">Todavía nadie subió un video</p>
              </div>
            )}
            {contacts.map((c) => {
              const isSelected = selected?.id === c.id;
              return (
                <button key={c.id} onClick={() => setSelected(c)}
                  className="w-full flex items-center gap-3 text-left transition-colors border-none cursor-pointer"
                  style={{ height: 56, padding: "8px 16px", background: isSelected ? "#D4EAFC" : "transparent" }}>
                  <Avatar postal={c} size={36} />
                  <span style={{ color: "#333333", fontSize: 13, fontWeight: isSelected ? 600 : 500 }}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Video Area ──────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden bg-[#1A1A1A] flex flex-col">

          {/* Mobile contacts strip */}
          <div
            className="md:hidden w-full flex-shrink-0 flex items-center gap-4 px-4 py-3 overflow-x-auto"
            style={{ scrollbarWidth: "none", background: "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.4))", backdropFilter: "blur(8px)" }}
          >
            {contacts.length === 0 && !loading && (
              <span className="text-white/50 text-sm px-2">Sin videos todavía 🐧</span>
            )}
            {loading && <span className="text-white/40 text-sm px-2">Cargando...</span>}
            {contacts.map((c) => {
              const isSelected = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="flex flex-col items-center gap-1.5 shrink-0 border-none bg-transparent cursor-pointer"
                >
                  <div style={{
                    borderRadius: "50%",
                    padding: 2,
                    background: isSelected ? "linear-gradient(135deg,#00AFF0,#0078D4)" : "transparent",
                    border: isSelected ? "none" : "2px solid rgba(255,255,255,0.2)",
                  }}>
                    <div style={{ borderRadius: "50%", overflow: "hidden", border: "2px solid #1A1A1A" }}>
                      <Avatar postal={c} size={44} />
                    </div>
                  </div>
                  <span style={{
                    color: isSelected ? "#00AFF0" : "rgba(255,255,255,0.7)",
                    fontSize: 10, fontWeight: isSelected ? 700 : 400,
                    whiteSpace: "nowrap", maxWidth: 56,
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Video background */}
          <div className="relative flex-1 overflow-hidden">
            {selected ? (
              <>
                {/* Blurred background — always rendered, visible only for portrait */}
                <video
                  key={`bg-${selected.id}`}
                  ref={bgVideoRef}
                  autoPlay loop playsInline muted
                  aria-hidden
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    filter: "blur(24px) brightness(0.45) saturate(1.4)",
                    transform: "scale(1.08)",
                    opacity: isPortrait ? 1 : 0,
                    transition: "opacity 0.3s",
                    pointerEvents: "none",
                  }}
                >
                  <source src={selected.video_url} type="video/mp4" />
                </video>

                {/* Main video */}
                <video
                  key={selected.id}
                  ref={videoRef}
                  autoPlay loop playsInline
                  onLoadedMetadata={handleMetadata}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: isPortrait ? "contain" : "cover",
                    transition: "object-fit 0s",
                  }}
                >
                  <source src={selected.video_url} type="video/mp4" />
                </video>
              </>
            ) : (
              <div className="absolute inset-0 bg-[#1A1A1A] flex items-center justify-center">
                <p className="text-white/30 text-sm">
                  {loading ? "Cargando videos..." : "Nadie ha subido video todavía 🐧"}
                </p>
              </div>
            )}

            {/* Top bar */}
            {selected && (
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between"
                style={{ height: 60, padding: "0 24px", background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }}>
                <div className="flex items-center gap-3">
                  <Avatar postal={selected} size={36} />
                  <span className="text-white text-base font-semibold">{selected.name}</span>
                  <span className="text-[#AAAAAA] text-sm hidden md:inline">video</span>
                </div>
                <div className="flex items-center gap-3">
                  <Maximize2 size={18} color="#FFFFFF" className="cursor-pointer hidden md:block" />
                  <Ellipsis size={18} color="#FFFFFF" className="cursor-pointer" />
                </div>
              </div>
            )}

            {/* Call Controls — mobile floating */}
            {selected && (
              <div className="md:hidden absolute left-0 right-0 flex justify-center"
                style={{ bottom: 76 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: "rgba(0,0,0,0.72)", borderRadius: 40,
                  padding: "10px 24px", backdropFilter: "blur(12px)",
                }}>
                  <button
                    onClick={() => setMicOn(v => !v)}
                    style={{ width: 48, height: 48, borderRadius: 24, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: micOn ? "#333" : "#E81123" }}
                  >
                    {micOn ? <Mic size={20} color="#fff" /> : <MicOff size={20} color="#fff" />}
                  </button>
                  <button
                    onClick={() => setCamOn(v => !v)}
                    style={{ width: 48, height: 48, borderRadius: 24, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: camOn ? "#333" : "#E81123" }}
                  >
                    {camOn ? <Video size={20} color="#fff" /> : <VideoOff size={20} color="#fff" />}
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    style={{ width: 56, height: 48, borderRadius: 24, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "#E81123" }}
                  >
                    <PhoneOff size={22} color="#fff" />
                  </button>
                </div>
              </div>
            )}

            {/* Call Controls — desktop only */}
            <div className="hidden md:flex absolute items-center justify-center"
              style={{ left: "50%", transform: "translateX(-50%)", bottom: 72, background: "rgba(0,0,0,0.67)", borderRadius: 30, padding: "0 16px", height: 60, gap: 20 }}>
              {callControls.map((ctrl, i) => (
                <button key={i} className="flex items-center justify-center"
                  style={{ width: (ctrl as { wide?: boolean }).wide ? 56 : 48, height: 48, borderRadius: 24, background: ctrl.bg, border: "none", cursor: "pointer" }}>
                  {ctrl.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav ───────────────────────────────────────── */}
      <MobileNav />

      {/* ── Windows Taskbar — desktop only ──────────────────────────── */}
      <footer
        className="hidden md:flex w-full shrink-0 items-center justify-between px-2"
        style={{ height: 48, background: "linear-gradient(to bottom, #1F5BB5, #163D8F)", borderTop: "1px solid #4A7FCC" }}
      >
        {/* Start button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-3 h-8 rounded cursor-pointer hover:brightness-110 transition-all"
          style={{ background: "linear-gradient(to bottom, #5CB85C, #3D8B3D)", border: "1px solid #2D6A2D", minWidth: 80 }}
        >
          <Image src="/jime-penguin-logo.webp" alt="" width={20} height={20} className="object-contain" />
          <span className="text-white text-[11px] font-bold">Inicio</span>
        </button>

        <div className="w-px h-8 bg-white/20 mx-2" />

        {/* App buttons */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {/* Skype — activo */}
          <div className="flex items-center gap-2 px-3 h-8 rounded"
            style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}>
            <div className="w-4 h-4 rounded-full bg-[#00AFF0] flex items-center justify-center">
              <Video size={9} color="#FFFFFF" />
            </div>
            <span className="text-white text-[11px] font-semibold">Skype</span>
          </div>
          {/* Other pages */}
          {TASKBAR_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-2 px-3 h-8 rounded transition-all hover:bg-white/10"
              style={{ border: "1px solid transparent" }}>
              {l.icon}
              <span className="text-white text-[11px]">{l.label}</span>
            </Link>
          ))}
        </div>

        {/* System tray */}
        <div className="flex items-center gap-3 pl-3 pr-1 h-8 rounded ml-auto"
          style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Users size={13} color="#AACCFF" className="hidden md:block" />
          <Clock size={13} color="#AACCFF" className="hidden md:block" />
          <WindowsClock />
        </div>
      </footer>
    </div>
  );
}
