"use client";
import Image from "next/image";
import { useState } from "react";

export default function InstaLogo() {
  const [error, setError] = useState(false);

  if (error) {
    // Fallback: Instagram wordmark en texto
    return (
      <span style={{
        fontFamily: "'Billabong','Dancing Script',cursive",
        fontSize: 28,
        color: "#262626",
        letterSpacing: -0.5,
        lineHeight: 1,
      }}>
        Instagram
      </span>
    );
  }

  return (
    // Coloca /public/instagram-logo.png para mostrar el logo oficial
    <div style={{ position: "relative", width: 96, height: 32 }}>
      <Image
        src="/instagram-logo.png"
        alt="Instagram"
        fill
        sizes="96px"
        style={{ objectFit: "contain", objectPosition: "left center" }}
        onError={() => setError(true)}
      />
    </div>
  );
}
