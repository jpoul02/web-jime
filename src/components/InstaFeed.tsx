"use client";

import type { InstaPost } from "@/types/feed";
import { Compass, Heart, Home, PlusSquare, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import InstaLogo from "./InstaLogo";
import InstaPostCard from "./InstaPost";

const LIMIT = 10;
// Nota: El feed inicial se carga desde el servidor en page.tsx para mejorar SEO y evitar un flash de contenido vacío.
export default function InstaFeed({ initialPosts }: { initialPosts: InstaPost[] }) {
  const [posts, setPosts] = useState<InstaPost[]>(initialPosts);
  const [skip, setSkip] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(initialPosts.length === LIMIT);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?skip=${skip}&limit=${LIMIT}`);
      const data: InstaPost[] = await res.json();
      if (data.length < LIMIT) setHasMore(false);
      if (data.length > 0) {
        setPosts((prev) => [...prev, ...data]);
        setSkip((prev) => prev + data.length);
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
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        width: "100%", height: 60,
        background: "#FFFFFF",
        borderBottom: "1px solid #DBDBDB",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
      }}>
        <InstaLogo />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" aria-label="Inicio" style={{ display: "flex", color: "inherit" }}>
            <Home size={24} color="#262626" />
          </Link>
          <Send size={24} color="#262626" style={{ opacity: 0.35, cursor: "default" }} />
          <PlusSquare size={24} color="#262626" style={{ opacity: 0.35, cursor: "default" }} />
          <Compass size={24} color="#262626" style={{ opacity: 0.35, cursor: "default" }} />
          <Heart size={24} color="#262626" style={{ opacity: 0.35, cursor: "default" }} />
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "linear-gradient(45deg,#FCAF45,#E1306C,#833AB4)",
          }} />
        </div>
      </header>

      {/* ── Feed column ─────────────────────────────────────────── */}
      <main style={{
        maxWidth: 614, margin: "0 auto",
        background: "#FFFFFF",
        border: "1px solid #DBDBDB",
        minHeight: "calc(100vh - 60px)",
      }}>
        {posts.length === 0 && !loading ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 12, padding: "80px 20px",
            color: "#8E8E8E", textAlign: "center",
          }}>
            <span style={{ fontSize: 48 }}>📸</span>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#262626" }}>
              Todavía no hay fotos
            </p>
            <p style={{ margin: 0, fontSize: 14 }}>
              Cuando los amigos suban postales con fotos aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <div key={post.id}>
                <InstaPostCard post={post} />
                {i < posts.length - 1 && (
                  <div style={{ height: 1, background: "#EFEFEF" }} />
                )}
              </div>
            ))}

            {/* Sentinel for IntersectionObserver */}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {loading && (
              <div style={{
                display: "flex", justifyContent: "center",
                padding: "24px 0", color: "#8E8E8E", fontSize: 13,
              }}>
                Cargando más...
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div style={{
                textAlign: "center", padding: "32px 20px",
                color: "#8E8E8E", fontSize: 13,
              }}>
                Ya viste todas las postales ✨
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
