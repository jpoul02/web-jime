"use client";

import { Snowflake } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Snowfall from "./Snowfall";

const navLinks = [
  { label: "Sobre Mi", href: "#" },
  { label: "Amigos",   href: "/amigos" },
  { label: "Historia", href: "#" },
  { label: "Juegos",   href: "#" },
  { label: "Skype",    href: "/skype" },
  { label: "Ask.fm",   href: "/ask" },
  { label: "Música 🎵", href: "/musica" },
];

export default function ClubPenguinHome() {
  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)", background: "#091A3A" }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        className="w-full shrink-0 flex items-center justify-between py-2 px-10"
        style={{
          background: "linear-gradient(to bottom, #0B1D42, #15306A)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <Image src="/jime-penguin-logo.png" alt="" width={130} height={100} quality={100} />

        </div>

        {/* Nav */}
        <nav className="flex items-center" style={{ gap: 36 }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 600 }}
              className="hover:opacity-75 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="relative overflow-hidden grid grid-cols-1 md:grid-cols-2 flex-1 items-center justify-center">
        {/* Fondo */}
        <Image
          src="/cp-bg.png"
          alt=""
          width={1790}
          height={2390}
          quality={100}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          aria-hidden
        />

        <Snowfall />

        <div className="relative z-10 flex-1 flex items-end justify-center">
          <Image
            src="/jime-penguin.png"
            alt="Jime Penguin"
            width={1792}
            height={2390}
            quality={100}
            className="w-full h-full object-contain object-bottom"
            style={{ maxHeight: "calc(100vh - 60px)" }}
          />
        </div>

        {/* Columna derecha — Panel info */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-12">
          <div
            className="flex flex-col w-full"
            style={{
              maxWidth: 560,
              background: "#0B1E44DD",
              borderRadius: 24,
              padding: "40px 48px",
              gap: 24,
              boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            }}
          >
            {/* Hola */}
            <p style={{ color: "#88BBEE", fontSize: 16, margin: 0 }}>
              Hola! Soy
            </p>

            {/* Nombre */}
            <h1
              style={{
                color: "#FFD700",
                fontSize: 56,
                fontWeight: 900,
                letterSpacing: 3,
                margin: 0,
                lineHeight: 1,
              }}
            >
              Jime
            </h1>

            {/* Divisor degradado */}
            <div
              style={{
                height: 4,
                width: 400,
                borderRadius: 2,
                background: "linear-gradient(to right, #00DDFF, #FFD700)",
              }}
            />

            {/* Descripción */}
            <p
              style={{
                color: "#CCDDEE",
                fontSize: 15,
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {`Bienvenido a mi igloo! Soy una pingüina que ama la moda, los puffles y pasar el rato con amigos en la isla. Si me buscas, probablemente estoy en la Disco o armando outfits en mi igloo.\n\nMarketing Lead & creative penguin since 2002.`}
            </p>

            {/* Botón CTA */}
            <button
              className="flex items-center justify-center self-start hover:opacity-90 active:opacity-75 transition-opacity"
              style={{
                background: "linear-gradient(to bottom, #00DDFF, #0099DD)",
                borderRadius: 16,
                padding: "14px 32px",
                gap: 8,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
              }}
            >
              <Snowflake size={18} color="#FFFFFF" strokeWidth={2.5} />
              <span style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700 }}>
                Quieres saber sobre mi?
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
