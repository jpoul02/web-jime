"use client";

import { Snowflake, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Snowfall from "./Snowfall";

const navLinks = [
  { label: "Sobre Mi", href: "/sobre-mi" },
  { label: "Amigos",   href: "/amigos" },
  { label: "Historia", href: "/historia" },
  { label: "Skype",    href: "/skype" },
  { label: "Ask.fm",   href: "/ask" },
  { label: "Música 🎵", href: "/musica" },
];

export default function ClubPenguinHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ fontFamily: "var(--font-geist-sans)", background: "#091A3A" }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        className="w-full shrink-0 flex items-center justify-between py-2 px-4 md:px-10 relative"
        style={{
          background: "linear-gradient(to bottom, #0B1D42, #15306A)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <Image src="/jime-penguin-logo.webp" alt="" width={130} height={100} quality={100} />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center" style={{ gap: 36 }}>
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

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {menuOpen
            ? <X size={24} color="#FFFFFF" />
            : <Menu size={24} color="#FFFFFF" />}
        </button>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 z-50 flex flex-col py-2"
            style={{ background: "#0B1D42", borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 600 }}
                className="px-6 py-3 hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="relative overflow-hidden grid grid-cols-1 md:grid-cols-2 flex-1 items-center justify-center">
        {/* Fondo */}
        <Image
          src="/cp-bg.webp"
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
            src="/jime-penguin.webp"
            alt="Jime Penguin"
            width={1792}
            height={2390}
            quality={100}
            className="w-full h-full object-contain object-bottom"
            style={{ maxHeight: "calc(100vh - 60px)" }}
          />
        </div>

        {/* Columna derecha — Panel info */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 md:px-8 md:py-12">
          <div
            className="flex flex-col w-full"
            style={{
              maxWidth: 560,
              background: "#0B1E44DD",
              borderRadius: 24,
              padding: "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 48px)",
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
                fontSize: "clamp(36px, 8vw, 56px)",
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
              className="w-full md:w-[400px]"
              style={{
                height: 4,
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
              {`Bienvenido a mi igloo! Soy Jime, una pingüina que vive entre outfits, canciones y el escenario. Si no estoy armando looks en mi igloo, estoy ensayando algo o en el teatro de la isla.\n\nMarketing Lead, actriz amateur y fashionista de tiempo completo desde 2002.`}
            </p>

            {/* Botón CTA */}
            <Link
              href="/sobre-mi"
              className="flex items-center justify-center w-full md:w-auto md:self-start hover:opacity-90 active:opacity-75 transition-opacity"
              style={{
                background: "linear-gradient(to bottom, #00DDFF, #0099DD)",
                borderRadius: 16,
                padding: "14px 32px",
                gap: 8,
                boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Snowflake size={18} color="#FFFFFF" strokeWidth={2.5} />
              <span style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700 }}>
                Quieres saber sobre mi?
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
