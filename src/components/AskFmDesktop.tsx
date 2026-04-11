"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Home, Bell, Mail, Search, MessageCircle, Heart, Share2, User, Users, BookOpen, Gamepad2, Video, Music } from "lucide-react";

interface AnswerMedia {
  id: number;
  media_url: string;
  media_type: "image" | "video";
  order: number;
}

interface AnswerCard {
  id: number;
  question_text: string;
  answer_text: string;
  name: string;
  profile_photo_url: string | null;
  created_at: string;
  media: AnswerMedia[];
}

interface Stats {
  total_postales: number;
  total_answers: number;
}

const LIMIT = 20;

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function AskFmDesktop({ initialAnswers, initialStats }: { initialAnswers: AnswerCard[]; initialStats: Stats | null }) {
  const [answers, setAnswers] = useState<AnswerCard[]>(initialAnswers);
  const [stats] = useState<Stats | null>(initialStats);
  const [skip, setSkip] = useState(initialAnswers.length);
  const [hasMore, setHasMore] = useState(initialAnswers.length === LIMIT);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/answers?skip=${skip}&limit=${LIMIT}`);
      if (!res.ok) { setHasMore(false); return; }
      const data: { answers: AnswerCard[] } = await res.json();
      const newAnswers = data.answers;
      if (newAnswers.length < LIMIT) setHasMore(false);
      if (newAnswers.length > 0) {
        setAnswers((prev) => [...prev, ...newAnswers]);
        setSkip((prev) => prev + newAnswers.length);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, skip]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EAEDF2] font-[family-name:var(--font-geist-sans)]">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="w-full shrink-0 h-14 flex items-center justify-between px-4 md:px-6 bg-[#3B5998]">
        <Image src="/ask-jime-logo.webp" quality={100} alt="Ask.fm Jime" width={120} height={40} className="object-contain" />

        {/* Nav icons — mobile: only Home, Bell, Mail; desktop: full set */}
        <nav className="flex items-center gap-4 md:gap-5">
          <Link href="/"          title="Inicio"   className="opacity-80 hover:opacity-100 transition-opacity"><Home     size={20} color="#FFFFFF" /></Link>
          <Link href="/amigos"    title="Amigos"   className="opacity-80 hover:opacity-100 transition-opacity hidden md:inline-flex"><Users    size={20} color="#FFFFFF" /></Link>
          <Link href="/historia"  title="Historia" className="opacity-80 hover:opacity-100 transition-opacity hidden md:inline-flex"><BookOpen size={20} color="#FFFFFF" /></Link>
          <Link href="#"          title="Juegos"   className="opacity-80 hover:opacity-100 transition-opacity hidden md:inline-flex"><Gamepad2 size={20} color="#FFFFFF" /></Link>
          <Link href="/skype"     title="Skype"    className="opacity-80 hover:opacity-100 transition-opacity hidden md:inline-flex"><Video    size={20} color="#FFFFFF" /></Link>
          <Link href="/musica"    title="Música"   className="opacity-80 hover:opacity-100 transition-opacity hidden md:inline-flex"><Music    size={20} color="#FFFFFF" /></Link>
          <div className="w-px h-5 bg-white/30 mx-1 hidden md:block" />
          <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"><Bell size={20} color="#FFFFFF" /></button>
          <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"><Mail size={20} color="#FFFFFF" /></button>
        </nav>

        {/* Search bar — hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 w-[280px] h-[34px] rounded-[17px] bg-[#2E4A80] px-[14px]">
          <Search size={16} color="#8899BB" />
          <span className="text-[#8899BB] text-[13px]">Buscar personas...</span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#6B8CC7]" />
          <span className="text-white text-[13px] font-semibold">xidoo</span>
        </div>
      </header>

      {/* Mobile nav strip */}
      <div
        className="md:hidden"
        style={{
          background: "#3B5998", borderBottom: "1px solid #2d4a80",
          display: "flex", gap: 6, padding: "8px 12px",
          overflowX: "auto", scrollbarWidth: "none",
        }}
      >
        {[
          { href: "/",          label: "Inicio"   },
          { href: "/amigos",    label: "Amigos"   },
          { href: "/historia",  label: "Historia" },
          { href: "/skype",     label: "Skype"    },
          { href: "/ask",       label: "Ask.fm"   },
          { href: "/musica",    label: "Música"   },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex", alignItems: "center",
              padding: "6px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.18)",
              color: "#fff", textDecoration: "none",
              fontSize: 12, fontWeight: 600,
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex justify-center gap-6 py-6 px-4 md:px-20">

        {/* ── Feed ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 w-full md:w-[580px]">

          {/* Ask box (decorative) */}
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A76A8] shrink-0" />
            <div className="flex-1 h-[38px] rounded-[19px] bg-[#F0F2F5] flex items-center px-4">
              <span className="text-[#999999] text-sm">Hazme una pregunta...</span>
            </div>
            <button className="h-9 rounded-[18px] bg-[#3B5998] px-5 flex items-center justify-center shrink-0 hover:bg-[#2d4a80] transition-colors">
              <span className="text-white text-[13px] font-semibold">Preguntar</span>
            </button>
          </div>

          {/* Empty state */}
          {answers.length === 0 && (
            <div className="bg-white rounded-lg p-10 flex flex-col items-center gap-3 text-center">
              <MessageCircle size={40} color="#CCCCCC" />
              <p className="text-[#333333] font-semibold">Todavía no hay respuestas</p>
              <p className="text-[#999999] text-sm">Cuando los amigos dejen postales con preguntas, aparecerán acá</p>
            </div>
          )}

          {/* QA Cards */}
          {answers.map((card) => (
            <div key={card.id} className="bg-white rounded-lg flex flex-col">
              {/* Question */}
              <div className="flex items-start gap-[10px] px-4 py-3">
                <MessageCircle size={18} color="#3B5998" className="shrink-0 mt-0.5" />
                <span className="text-[#333333] text-sm font-semibold leading-snug">{card.question_text}</span>
              </div>

              {/* Answer */}
              <div className="flex gap-3 px-4 pb-3">
                <div className="w-9 h-9 rounded-full bg-[#4A76A8] shrink-0 overflow-hidden">
                  {card.profile_photo_url
                    ? <img src={card.profile_photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div className="w-full h-full flex items-center justify-center"><User size={18} color="#fff" /></div>
                  }
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <span className="text-[#3B5998] text-[13px] font-bold">{card.name}</span>
                  <span className="text-[#333333] text-sm leading-relaxed">{card.answer_text}</span>
                  {card.media?.length > 0 && (
                    <div className={`mt-2 flex gap-1.5 flex-wrap`}>
                      {card.media.map((m) =>
                        m.media_type === "video" ? (
                          <video
                            key={m.id}
                            src={m.media_url}
                            controls
                            className="rounded-lg max-w-full border border-[#E4E6EA]"
                            style={{ maxHeight: 240 }}
                          />
                        ) : (
                          <img
                            key={m.id}
                            src={m.media_url}
                            alt=""
                            className="rounded-lg object-cover border border-[#E4E6EA]"
                            style={{
                              width: card.media.length === 1 ? "100%" : "calc(50% - 3px)",
                              maxHeight: 240,
                              objectFit: "cover",
                            }}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 px-4 pb-3 border-t border-[#F0F2F5]">
                <span className="text-[#999999] text-[11px]">{timeAgo(card.created_at)}</span>
                <div className="flex items-center gap-4">
                  <button className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                    <Heart size={15} color="#CC4455" />
                  </button>
                  <button className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                    <Share2 size={15} color="#999999" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {loading && (
            <div className="text-center py-6 text-[#999999] text-sm">
              Cargando más...
            </div>
          )}

          {!hasMore && answers.length > 0 && (
            <div className="text-center py-8 text-[#999999] text-sm">
              Ya leíste todas las respuestas ✨
            </div>
          )}
        </div>

        {/* ── Sidebar — hidden on mobile ──────────────────────────── */}
        <div className="hidden md:flex flex-col gap-4 w-[340px]">

          {/* Profile card */}
          <div className="bg-white rounded-lg flex flex-col items-center gap-3 py-5 px-4">
            <div className="w-20 h-20 rounded-full bg-[#4A76A8] flex items-center justify-center overflow-hidden">
              <User size={40} color="#FFFFFF" />
            </div>
            <span className="text-[#333333] text-lg font-bold">xidoo</span>
            <span className="text-[#777777] text-[13px] text-center">
              Pingüino gamer, fan de Club Penguin y la nostalgia 2000s
            </span>
            <div className="flex w-full justify-around pt-2">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[#3B5998] text-base font-bold">{stats?.total_answers ?? "—"}</span>
                <span className="text-[#999999] text-[11px]">Respuestas</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[#3B5998] text-base font-bold">{stats?.total_postales ?? "—"}</span>
                <span className="text-[#999999] text-[11px]">Postales</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
