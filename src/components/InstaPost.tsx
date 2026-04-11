"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import type { InstaPost, InstaPhoto } from "@/types/feed";

const BIRTHDAY_CARDS = [
  // 0 — Clásico Instagram (púrpura → rosa → naranja)
  {
    background: "linear-gradient(135deg, #833AB4 0%, #E1306C 45%, #FCAF45 100%)",
    render: (name: string) => (
      <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 32, userSelect: "none" }}>
        <div style={{ fontSize: 52, lineHeight: 1, textAlign: "center" }}>🎉🎂🥳</div>
        <p style={{ margin: 0, fontFamily: "'Georgia',serif", fontSize: "clamp(24px,5vw,36px)", fontWeight: 700, color: "#fff", textAlign: "center", textShadow: "0 2px 16px rgba(0,0,0,0.3)", lineHeight: 1.2 }}>¡Felicidades Jime!</p>
        <div style={{ fontSize: 38, lineHeight: 1, textAlign: "center" }}>🎊✨🎈</div>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)", letterSpacing: 2, textTransform: "uppercase" }}>{name}</p>
      </div>
    ),
  },
  // 1 — Minimalista oscuro (azul marino → violeta)
  {
    background: "linear-gradient(160deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
    render: (name: string) => (
      <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end", padding: 32, gap: 8, userSelect: "none", position: "relative" }}>
        <div style={{ position: "absolute", top: 28, right: 28, fontSize: 64, opacity: 0.18, lineHeight: 1 }}>🎂</div>
        <div style={{ fontSize: 40, lineHeight: 1 }}>✨🌟✨</div>
        <p style={{ margin: 0, fontFamily: "monospace", fontSize: "clamp(11px,2.5vw,14px)", color: "rgba(255,255,255,0.5)", letterSpacing: 4, textTransform: "uppercase" }}>de parte de</p>
        <p style={{ margin: 0, fontFamily: "'Georgia',serif", fontSize: "clamp(26px,5.5vw,38px)", fontWeight: 700, color: "#fff", lineHeight: 1.1, textShadow: "0 0 40px rgba(180,120,255,0.6)" }}>{name}</p>
        <p style={{ margin: "4px 0 0", fontFamily: "'Georgia',serif", fontSize: "clamp(18px,4vw,26px)", fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>para ti, Jime 🤍</p>
      </div>
    ),
  },
  // 2 — Cálido floral (coral → durazno → amarillo)
  {
    background: "linear-gradient(145deg, #F857A6 0%, #FF5858 35%, #FFBE3D 100%)",
    render: (name: string) => (
      <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "36px 28px", userSelect: "none" }}>
        <div style={{ fontSize: 36, letterSpacing: 6 }}>🌸🌺🌸</div>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, fontFamily: "'Georgia',serif", fontStyle: "italic", fontSize: "clamp(15px,3.5vw,20px)", color: "rgba(255,255,255,0.9)", letterSpacing: 1 }}>con mucho cariño</p>
          <p style={{ margin: 0, fontFamily: "'Georgia',serif", fontSize: "clamp(28px,6vw,42px)", fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 3px 20px rgba(0,0,0,0.2)" }}>¡Feliz Cumple!</p>
          <p style={{ margin: 0, fontSize: "clamp(18px,4vw,26px)", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>🎀 Jime 🎀</p>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)", letterSpacing: 3, textTransform: "uppercase" }}>{name}</p>
      </div>
    ),
  },
  // 3 — Neón festivo (verde → cian → azul eléctrico)
  {
    background: "linear-gradient(135deg, #11998E 0%, #38EF7D 50%, #00C6FF 100%)",
    render: (name: string) => (
      <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, userSelect: "none", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 200, opacity: 0.07, pointerEvents: "none", lineHeight: 1 }}>🎊</div>
        <p style={{ margin: 0, fontFamily: "monospace", fontSize: "clamp(10px,2vw,12px)", color: "rgba(0,0,0,0.45)", letterSpacing: 5, textTransform: "uppercase", marginBottom: 12 }}>JIME</p>
        <div style={{ fontSize: "clamp(48px,10vw,72px)", lineHeight: 1, marginBottom: 12 }}>🥳</div>
        <p style={{ margin: 0, fontFamily: "'Georgia',serif", fontSize: "clamp(22px,5vw,34px)", fontWeight: 800, color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.25)", textAlign: "center", lineHeight: 1.2, padding: "0 20px" }}>¡Muchas Felicidades!</p>
        <p style={{ margin: "14px 0 0", fontSize: 13, color: "rgba(0,0,0,0.4)", letterSpacing: 2 }}>— {name}</p>
      </div>
    ),
  },
  // 4 — Galaxia (índigo → fucsia → rosa)
  {
    background: "linear-gradient(150deg, #1A1A2E 0%, #6A0572 45%, #FF6B9D 100%)",
    render: (name: string) => (
      <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 28, userSelect: "none" }}>
        <div style={{ fontSize: 28, letterSpacing: 8, lineHeight: 1 }}>⭐🌙⭐</div>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontFamily: "'Georgia',serif", fontStyle: "italic", fontSize: "clamp(13px,3vw,17px)", color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>un abrazo virtual de</p>
          <p style={{ margin: 0, fontFamily: "'Georgia',serif", fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 600, color: "rgba(255,200,255,0.9)" }}>{name}</p>
        </div>
        <p style={{ margin: 0, fontFamily: "'Georgia',serif", fontSize: "clamp(26px,5.5vw,40px)", fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.15, textShadow: "0 0 30px rgba(255,107,157,0.7)" }}>¡Felicidades,{"\n"}Jime! 🎂</p>
        <div style={{ fontSize: 26, letterSpacing: 6 }}>✨💜✨</div>
      </div>
    ),
  },
] as const;

function BirthdayCard({ postId, name }: { postId: number; name: string }) {
  const card = BIRTHDAY_CARDS[postId % BIRTHDAY_CARDS.length];
  return (
    <div style={{ background: card.background, width: "100%", aspectRatio: "1/1" }}>
      {card.render(name)}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "HACE UN MOMENTO";
  if (h < 24) return `HACE ${h} ${h === 1 ? "HORA" : "HORAS"}`;
  const d = Math.floor(h / 24);
  if (d < 7) return `HACE ${d} ${d === 1 ? "DÍA" : "DÍAS"}`;
  const w = Math.floor(d / 7);
  return `HACE ${w} ${w === 1 ? "SEMANA" : "SEMANAS"}`;
}

export default function InstaPostCard({ post }: { post: InstaPost }) {
  const [idx, setIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  // Per-photo aspect ratios for carousel — each slot updates when its image loads
  const [photoRatios, setPhotoRatios] = useState<number[]>(() => post.photos.map(() => 1));

  function handlePhotoLoad(e: React.SyntheticEvent<HTMLImageElement>, i: number) {
    if (i === 0) setImgLoaded(true);
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (!w || !h) return;
    const ratio = Math.max(0.5, Math.min(2.5, w / h));
    setPhotoRatios(prev => { const next = [...prev]; next[i] = ratio; return next; });
  }

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swiping = useRef(false);

  const multi = post.photos.length > 1;
  const initial = post.name.trim().charAt(0).toUpperCase();

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(post.photos.length - 1, i + 1));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swiping.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // If horizontal movement dominates, prevent vertical scroll
    if (!swiping.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      swiping.current = true;
    }
    if (swiping.current) e.preventDefault();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (!swiping.current) return;
    swiping.current = false;
    if (dx < -40) next();
    else if (dx > 40) prev();
  };

  return (
    <article style={{ background: "#FFFFFF" }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        height: 56, padding: "0 14px",
      }}>
        <div style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: "50%", padding: 2,
          background: "linear-gradient(45deg,#FCAF45,#E1306C,#833AB4)",
        }}>
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            border: "2px solid #fff", overflow: "hidden", position: "relative",
            background: post.profile_photo_url ? "transparent" : "#C13584",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {post.profile_photo_url ? (
              <Image
                src={post.profile_photo_url}
                alt=""
                fill
                unoptimized
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: 1 }}>{initial}</span>
            )}
          </div>
        </div>

        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#262626" }}>{post.name}</span>
        <MoreHorizontal size={20} color="#262626" />
      </div>

      {/* ── Carousel or Birthday card ── */}
      {post.photos.length === 0 ? (
        <BirthdayCard postId={post.id} name={post.name} />
      ) : !multi ? (
        /* ── Single photo — natural dimensions via CSS, no JS needed ── */
        <div style={{
          overflow: "hidden", lineHeight: 0,
          background: "linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)",
          backgroundSize: "200% 100%",
          animation: imgLoaded ? "none" : "shimmer 1.4s linear infinite",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.photos[0].photo_url}
            alt={`Foto de ${post.name}`}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 600,
              objectFit: "cover",
              display: "block",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      ) : (
        /* ── Multi-photo carousel — ratio per slide, transitions on swipe ── */
        <div
          style={{
            position: "relative", width: "100%",
            aspectRatio: String(photoRatios[idx]),
            overflow: "hidden", background: "#F0F0F0",
            touchAction: "pan-y",
            transition: "aspect-ratio 0.3s ease",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Sliding strip — all photos rendered side by side */}
          <div style={{
            display: "flex",
            width: `${post.photos.length * 100}%`,
            height: "100%",
            transform: `translateX(${(-idx * 100) / post.photos.length}%)`,
            transition: "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
            willChange: "transform",
          }}>
            {post.photos.map((photo: InstaPhoto, i: number) => (
              <div key={photo.id} style={{
                position: "relative",
                width: `${100 / post.photos.length}%`,
                flexShrink: 0,
                height: "100%",
              }}>
                {photo.photo_url ? (
                  <Image
                    src={photo.photo_url}
                    alt={`Foto ${i + 1} de ${post.name}`}
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                    priority={i === 0}
                    onLoad={(e) => handlePhotoLoad(e, i)}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#8E8E8E", fontSize: 14 }}>
                    Imagen no disponible
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Prev / Next buttons */}
          {multi && (
            <>
              {idx > 0 && (
                <button onClick={prev} aria-label="anterior" style={{
                  position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%",
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }}>
                  <ChevronLeft size={18} color="#262626" />
                </button>
              )}
              {idx < post.photos.length - 1 && (
                <button onClick={next} aria-label="siguiente" style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%",
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }}>
                  <ChevronRight size={18} color="#262626" />
                </button>
              )}

              {/* Dots */}
              <div style={{
                position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: 4,
              }}>
                {post.photos.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} aria-label={`foto ${i + 1}`} style={{
                    width: i === idx ? 8 : 6, height: i === idx ? 8 : 6,
                    borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
                    background: i === idx ? "#0095F6" : "rgba(255,255,255,0.65)",
                    transition: "all 0.15s",
                  }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 46, padding: "0 12px",
      }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={() => setLiked(l => !l)} aria-label="like" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <Heart size={24} color={liked ? "#E1306C" : "#262626"} fill={liked ? "#E1306C" : "none"}
              style={{ transition: "transform 0.1s", transform: liked ? "scale(1.2)" : "scale(1)" }} />
          </button>
          <MessageCircle size={24} color="#262626" style={{ cursor: "default" }} />
          <Send size={24} color="#262626" style={{ cursor: "default" }} />
        </div>
        <button onClick={() => setSaved(s => !s)} aria-label="guardar" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
          <Bookmark size={24} color="#262626" fill={saved ? "#262626" : "none"} />
        </button>
      </div>

      {/* ── Caption + time ── */}
      <div style={{ padding: "2px 14px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {post.dedicatoria && (
          <p style={{ margin: 0, fontSize: 14, color: "#262626", lineHeight: 1.4 }}>
            <span style={{ fontWeight: 600 }}>{post.name}</span>{" "}
            {post.dedicatoria}
          </p>
        )}
        <span style={{ fontSize: 10, color: "#8E8E8E", letterSpacing: 0.5 }}>
          {timeAgo(post.created_at)}
        </span>
      </div>
    </article>
  );
}
