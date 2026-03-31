import Image from "next/image";
import Link from "next/link";
import { Home, Send, PlusSquare, Compass, Heart } from "lucide-react";
import type { InstaPost } from "@/types/feed";
import InstaPostCard from "./InstaPost";

export default function InstaFeed({ posts }: { posts: InstaPost[] }) {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* ── Top bar (fiel al diseño Pencil) ─────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        width: "100%", height: 60,
        background: "#FFFFFF",
        borderBottom: "1px solid #DBDBDB",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
      }}>
        {/* Logo — añade /instagram-logo.png a /public para mostrarlo */}
        <div style={{ position: "relative", width: 96, height: 32 }}>
          <Image
            src="/instagram-logo.png"
            alt="Instagram"
            fill
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
        </div>

        {/* Nav icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" aria-label="Inicio" style={{ display: "flex", color: "inherit" }}>
            <Home size={24} color="#262626" />
          </Link>
          <Send size={24} color="#262626" style={{ opacity: 0.35, cursor: "default" }} />
          <PlusSquare size={24} color="#262626" style={{ opacity: 0.35, cursor: "default" }} />
          <Compass size={24} color="#262626" style={{ opacity: 0.35, cursor: "default" }} />
          <Heart size={24} color="#262626" style={{ opacity: 0.35, cursor: "default" }} />
          {/* Profile circle */}
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "linear-gradient(45deg,#FCAF45,#E1306C,#833AB4)",
          }} />
        </div>
      </header>

      {/* ── Feed column ──────────────────────────────────────────── */}
      <main style={{
        maxWidth: 614, margin: "0 auto",
        background: "#FFFFFF",
        border: "1px solid #DBDBDB",
        minHeight: "calc(100vh - 60px)",
      }}>
        {posts.length === 0 ? (
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
          posts.map((post, i) => (
            <div key={post.id}>
              <InstaPostCard post={post} />
              {i < posts.length - 1 && (
                <div style={{ height: 1, background: "#EFEFEF" }} />
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
