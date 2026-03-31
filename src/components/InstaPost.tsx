"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import type { InstaPost, InstaPhoto } from "@/types/feed";

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
                sizes="36px"
                quality={100}
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

      {/* ── Carousel ── */}
      <div
        style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden", background: "#EFEFEF", touchAction: "pan-y" }}
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
                  sizes="(max-width:614px) 100vw, 614px"
                  quality={100}
                  style={{ objectFit: "cover" }}
                  priority={i === 0}
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
