# Historia Wrapped — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un overlay fullscreen tipo "Wrapped" a `/historia` con slides navegables hardcodeados (tipos: text, arch, fullbleed) y eliminar la timeline de scroll con los 4 eventos placeholder.

**Architecture:** Nuevo `HistoriaWrapped.tsx` autocontenido con `createPortal` sobre `document.body`. `HistoriaTimeline.tsx` se simplifica: se eliminan el array `EVENTS`, la función `ArchPhoto` y la sección `TIMELINE`; se agrega un botón "▶ MODO WRAPPED" en el hero y el montaje condicional del overlay.

**Tech Stack:** Next.js 14, React (`createPortal`, `useState`, `useEffect`, `useRef`), TypeScript, inline styles (patrón existente del proyecto — sin clases Tailwind en los nuevos componentes).

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `src/components/HistoriaWrapped.tsx` | Crear | Tipos, MOMENTS array, tres renderers, navegación completa, overlay portal |
| `src/components/HistoriaTimeline.tsx` | Modificar | Eliminar EVENTS/timeline, agregar botón + estado + import |

---

## Task 1: Scaffold `HistoriaWrapped.tsx` — tipos, tokens, MOMENTS

**Files:**
- Create: `src/components/HistoriaWrapped.tsx`

- [ ] **Paso 1: Crear el archivo con tipos, tokens y array MOMENTS**

Crear `src/components/HistoriaWrapped.tsx` con este contenido exacto:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ─── Types ───────────────────────────────────────────────────────────── */
type SlideType = "text" | "arch" | "fullbleed";

type Momento = {
  num: string;
  date: string;
  title: string;
  desc: string;
  type: SlideType;
  img?: string;
  emoji?: string;
};

/* ─── Tokens (mismos que HistoriaTimeline) ────────────────────────────── */
const PF    = "'Playfair Display', Georgia, serif";
const GM    = "var(--font-geist-mono), 'Courier New', monospace";
const GS    = "var(--font-geist-sans), sans-serif";
const TERRA = "#D4916E";
const MUTED = "#C5BEB6";
const CREAM = "#F3EBE2";
const DARK  = "#1A1A1A";
const MID   = "#3D3D3D";

/* ─── Momentos (reemplazar con datos reales) ──────────────────────────── */
const MOMENTS: Momento[] = [
  {
    num: "01.",
    date: "15 MAR 2020",
    title: "El Día que\nNos Conocimos",
    desc: "Una cafetería, dos desconocidas, y una conversación que nunca terminó. El universo conspiró para que nuestros caminos se cruzaran ese día.",
    type: "text",
  },
  {
    num: "02.",
    date: "28 ABR 2020",
    title: "Primera\nCita Oficial",
    desc: "Una cena que se convirtió en un paseo bajo las estrellas. Esa noche supimos que esto era más que una simple coincidencia.",
    type: "arch",
    emoji: "🌟",
  },
  {
    num: "03.",
    date: "12 DIC 2020",
    title: "Primer Viaje\nJuntos",
    desc: "Las maletas, la carretera y miles de risas. Descubrimos que viajar juntas era nuestra forma favorita de ser felices.",
    type: "fullbleed",
    emoji: "✈️",
  },
  {
    num: "04.",
    date: "15 MAR 2021",
    title: "Un Año\nde Nosotras",
    desc: "365 días de aprender a amarnos mejor. Celebramos con la promesa de que esto apenas comenzaba.",
    type: "text",
  },
  {
    num: "05.",
    date: "20 JUN 2021",
    title: "El Verano\nMás Lindo",
    desc: "Días largos, risas interminables y la certeza de que cada momento a tu lado vale la pena.",
    type: "arch",
    emoji: "☀️",
  },
  {
    num: "06.",
    date: "25 DIC 2021",
    title: "Navidad\nJuntas",
    desc: "La primera de muchas. Luces, regalos y la calidez de saber que ya tenía a la persona más especial.",
    type: "fullbleed",
    emoji: "🎄",
  },
];

/* ─── Componente principal (se completa en tareas siguientes) ─────────── */
export default function HistoriaWrapped({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 16, left: 16, zIndex: 10, background: "none", border: "none", cursor: "pointer", fontSize: 22, color: DARK, lineHeight: 1, padding: 4 }}
        aria-label="Cerrar"
      >
        ✕
      </button>
      <p style={{ fontFamily: GM, color: MUTED, fontSize: 12, letterSpacing: 3 }}>HISTORIA WRAPPED — WIP</p>
    </div>,
    document.body
  );
}
```

- [ ] **Paso 2: Verificar que TypeScript no reporta errores**

```bash
cd C:/Users/Datasys2/Documents/web-jime
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores relacionados a `HistoriaWrapped.tsx`.

- [ ] **Paso 3: Commit**

```bash
git add src/components/HistoriaWrapped.tsx
git commit -m "feat: scaffold HistoriaWrapped — types, tokens, MOMENTS array"
```

---

## Task 2: Agregar los tres slide renderers

**Files:**
- Modify: `src/components/HistoriaWrapped.tsx`

- [ ] **Paso 1: Agregar las tres funciones renderer antes del export default**

Insertar estas tres funciones entre el bloque de `MOMENTS` y el `export default`:

```tsx
/* ─── Slide renderers ─────────────────────────────────────────────────── */

function SlideText({ m }: { m: Momento }) {
  return (
    <div style={{
      background: CREAM, width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "80px clamp(32px, 8vw, 120px)", gap: 12, textAlign: "center",
    }}>
      <span style={{ fontFamily: PF, fontSize: "clamp(56px,10vh,80px)", fontStyle: "italic", color: TERRA, lineHeight: 1 }}>
        {m.num}
      </span>
      <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 5, color: MUTED, textTransform: "uppercase" }}>
        {m.date}
      </span>
      <div style={{ width: 32, height: 1, background: TERRA }} />
      <h2 style={{ fontFamily: PF, fontSize: "clamp(26px,4.5vw,42px)", fontStyle: "italic", color: DARK, lineHeight: 1.2, margin: 0, whiteSpace: "pre-line" }}>
        {m.title}
      </h2>
      <p style={{ fontFamily: GS, fontSize: "clamp(13px,1.5vw,16px)", color: MID, lineHeight: 1.7, margin: 0, maxWidth: 440 }}>
        {m.desc}
      </p>
    </div>
  );
}

function SlideArch({ m }: { m: Momento }) {
  return (
    <div style={{
      background: CREAM, width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "80px clamp(32px, 8vw, 120px)", gap: 10, textAlign: "center",
    }}>
      {/* Visual element: foto arco > emoji > placeholder */}
      {m.img ? (
        <div style={{ width: 110, height: 145, borderRadius: "55px 55px 0 0", overflow: "hidden", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : m.emoji ? (
        <div style={{ fontSize: 52, lineHeight: 1, flexShrink: 0 }}>{m.emoji}</div>
      ) : (
        <div style={{ width: 110, height: 145, borderRadius: "55px 55px 0 0", background: "#E8DDD5", border: "1px dashed #D4916E", flexShrink: 0 }} />
      )}

      <span style={{ fontFamily: PF, fontSize: "clamp(48px,8vh,64px)", fontStyle: "italic", color: TERRA, lineHeight: 1 }}>
        {m.num}
      </span>
      <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 5, color: MUTED, textTransform: "uppercase" }}>
        {m.date}
      </span>
      <div style={{ width: 32, height: 1, background: TERRA }} />
      <h2 style={{ fontFamily: PF, fontSize: "clamp(22px,3.5vw,36px)", fontStyle: "italic", color: DARK, lineHeight: 1.2, margin: 0, whiteSpace: "pre-line" }}>
        {m.title}
      </h2>
      <p style={{ fontFamily: GS, fontSize: "clamp(13px,1.5vw,15px)", color: MID, lineHeight: 1.7, margin: 0, maxWidth: 400 }}>
        {m.desc}
      </p>
    </div>
  );
}

function SlideFullbleed({ m }: { m: Momento }) {
  const hasBg = !!m.img;
  return (
    <div style={{
      width: "100%", height: "100%", position: "relative",
      ...(hasBg
        ? { backgroundImage: `url(${m.img})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { background: "linear-gradient(160deg, #3a2a20 0%, #6b4a35 50%, #8D7B71 100%)" }),
    }}>
      {/* Emoji decorativo cuando no hay foto */}
      {!hasBg && m.emoji && (
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          fontSize: "clamp(64px,14vw,120px)", lineHeight: 1, opacity: 0.3, pointerEvents: "none",
        }}>
          {m.emoji}
        </div>
      )}

      {/* Overlay gradiente */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(26,26,26,0.92) 0%, rgba(26,26,26,0.35) 55%, transparent 100%)",
      }} />

      {/* Texto alineado abajo-izquierda */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        padding: "0 clamp(28px, 7vw, 100px)", zIndex: 1,
      }}>
        <span style={{ fontFamily: PF, fontSize: "clamp(48px,8vh,64px)", fontStyle: "italic", color: TERRA, lineHeight: 1, display: "block" }}>
          {m.num}
        </span>
        <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 5, color: "rgba(197,190,182,0.7)", textTransform: "uppercase", display: "block", marginTop: 8 }}>
          {m.date}
        </span>
        <div style={{ width: 32, height: 1, background: TERRA, margin: "14px 0" }} />
        <h2 style={{ fontFamily: PF, fontSize: "clamp(26px,4.5vw,44px)", fontStyle: "italic", color: "#fff", lineHeight: 1.2, margin: "0 0 14px", whiteSpace: "pre-line" }}>
          {m.title}
        </h2>
        <p style={{ fontFamily: GS, fontSize: "clamp(13px,1.5vw,16px)", color: "rgba(197,190,182,0.85)", lineHeight: 1.7, margin: 0, maxWidth: 500 }}>
          {m.desc}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Paso 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Paso 3: Commit**

```bash
git add src/components/HistoriaWrapped.tsx
git commit -m "feat: add SlideText, SlideArch, SlideFullbleed renderers"
```

---

## Task 3: Navegación completa + chrome del overlay

**Files:**
- Modify: `src/components/HistoriaWrapped.tsx` (reemplazar el `export default` completo)

- [ ] **Paso 1: Reemplazar el `export default` con la versión completa**

Reemplazar todo desde `/* ─── Componente principal` hasta el final del archivo con:

```tsx
/* ─── Componente principal ────────────────────────────────────────────── */
export default function HistoriaWrapped({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [idx, setIdx]         = useState(0);
  const [fading, setFading]   = useState(false);
  const touchStartX           = useRef<number | null>(null);
  const idxRef                = useRef(0);
  const total                 = MOMENTS.length;

  /* Sync ref para evitar stale closures en el handler de teclado */
  useEffect(() => { idxRef.current = idx; }, [idx]);

  /* Montar (necesario para createPortal en SSR) */
  useEffect(() => { setMounted(true); }, []);

  /* Bloquear scroll del body */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* Navegación con fade */
  function navigate(dir: 1 | -1) {
    const next = idxRef.current + dir;
    if (next < 0 || next >= total) return;
    setFading(true);
    setTimeout(() => {
      setIdx(next);
      setFading(false);
    }, 220);
  }

  /* Teclado */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigate(1);
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Touch swipe */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -40) navigate(1);
    else if (dx > 40) navigate(-1);
  };

  if (!mounted) return null;

  const m = MOMENTS[idx];
  const progress = ((idx + 1) / total) * 100;
  const counter  = `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, fontFamily: GS }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Progress bar ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(197,190,182,0.4)", zIndex: 20, pointerEvents: "none" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: TERRA, transition: "width 0.3s ease" }} />
      </div>

      {/* ── Botón cerrar ── */}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute", top: 16, left: 16, zIndex: 30,
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
          border: "1px solid rgba(197,190,182,0.4)", borderRadius: "50%",
          width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: DARK, lineHeight: 1,
        }}
      >
        ✕
      </button>

      {/* ── Contador ── */}
      <span style={{
        position: "absolute", top: 20, right: 20, zIndex: 30,
        fontFamily: GM, fontSize: 9, letterSpacing: 4, color: MUTED,
      }}>
        {counter}
      </span>

      {/* ── Slide con fade ── */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.22s ease",
      }}>
        {m.type === "text"      && <SlideText      m={m} />}
        {m.type === "arch"      && <SlideArch      m={m} />}
        {m.type === "fullbleed" && <SlideFullbleed m={m} />}
      </div>

      {/* ── Zonas de clic (izq = anterior, der = siguiente) ── */}
      <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 10, pointerEvents: "none" }}>
        <div
          style={{ flex: 1, height: "100%", cursor: idx > 0 ? "pointer" : "default", pointerEvents: "auto" }}
          onClick={() => navigate(-1)}
        />
        <div
          style={{ flex: 1, height: "100%", cursor: idx < total - 1 ? "pointer" : "default", pointerEvents: "auto" }}
          onClick={() => navigate(1)}
        />
      </div>

      {/* ── Flechas visibles ── */}
      {idx > 0 && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Anterior"
          style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            zIndex: 20, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(197,190,182,0.5)", borderRadius: "50%",
            width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: DARK,
          }}
        >
          ←
        </button>
      )}
      {idx < total - 1 && (
        <button
          onClick={() => navigate(1)}
          aria-label="Siguiente"
          style={{
            position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
            zIndex: 20, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(197,190,182,0.5)", borderRadius: "50%",
            width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: DARK,
          }}
        >
          →
        </button>
      )}

      {/* ── Dots ── */}
      <div style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, zIndex: 20, pointerEvents: "none",
      }}>
        {MOMENTS.map((_, i) => (
          <div key={i} style={{
            height: 6, borderRadius: 3,
            width: i === idx ? 18 : 6,
            background: i === idx ? TERRA : MUTED,
            transition: "all 0.25s ease",
          }} />
        ))}
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Paso 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Paso 3: Commit**

```bash
git add src/components/HistoriaWrapped.tsx
git commit -m "feat: complete HistoriaWrapped overlay — navigation, chrome, fade transition"
```

---

## Task 4: Modificar `HistoriaTimeline.tsx`

**Files:**
- Modify: `src/components/HistoriaTimeline.tsx`

- [ ] **Paso 1: Agregar el import de `HistoriaWrapped` y el estado `wrappedOpen`**

Al principio del archivo, después de los imports existentes (`Link`, `useState`), agregar:

```tsx
import HistoriaWrapped from "./HistoriaWrapped";
```

En el cuerpo del componente `HistoriaTimeline`, después de `const [menuOpen, setMenuOpen] = useState(false);`, agregar:

```tsx
const [wrappedOpen, setWrappedOpen] = useState(false);
```

- [ ] **Paso 2: Eliminar `EVENTS`, las constantes `EV*_IMG` y la función `ArchPhoto`**

Borrar exactamente estos tres bloques del archivo:

**Bloque 1** — las cuatro constantes de imagen de Unsplash usadas solo por EVENTS (líneas ~21-27):
```tsx
const EV1_IMG = "https://images.unsplash.com/...";
const EV2_IMG = "https://images.unsplash.com/...";
const EV3_IMG = "https://images.unsplash.com/...";
const EV4_IMG = "https://images.unsplash.com/...";
```

**Bloque 2** — el array EVENTS completo (líneas ~50-83):
```tsx
/* ─── Timeline events ─────────────────────────────────────────────────── */
const EVENTS = [ ... ];
```

**Bloque 3** — la función ArchPhoto (líneas ~89-104). El comentario eslint-disable y el helper `Img` en línea 86-87 se **mantienen** — son usados por el hero, photo grid y footer:
```tsx
/* ─── Arched photo ────────────────────────────────────────────────────── */
function ArchPhoto(...) { ... }  // ← solo borrar ArchPhoto, NO borrar Img
```

Quedan intactos: NAV_LINKS, los tokens (PF, GM, GS, TERRA, MUTED, CREAM, DARK, MID), `Img`, HERO_BG, GRID_IMGS, FOOTER_IMG.

- [ ] **Paso 3: Eliminar la sección TIMELINE completa**

Borrar el bloque `{/* ══ TIMELINE ══ */}` completo (desde `<section style={{ background: "#FAFAF8"...` hasta el cierre `</section>` de esa sección, incluyendo la lógica de desktop e mobile de la timeline).

La página queda: Nav → Hero → Quote → Photo Grid → Footer oscuro.

- [ ] **Paso 4: Reemplazar `"Scroll →"` en el hero por el botón Wrapped**

Encontrar esta línea en el hero:

```tsx
<span style={{ fontFamily: GM, fontSize: 10, letterSpacing: 3, color: TERRA }}>Scroll →</span>
```

Reemplazarla por:

```tsx
<button
  onClick={() => setWrappedOpen(true)}
  style={{
    background: "none", border: "none", cursor: "pointer", padding: 0,
    fontFamily: GM, fontSize: 10, letterSpacing: 3, color: TERRA,
    display: "inline-flex", alignItems: "center", gap: 8,
    transition: "opacity 0.2s",
  }}
  onMouseEnter={e => (e.currentTarget.style.opacity = "0.65")}
  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
>
  ▶ MODO WRAPPED
</button>
```

- [ ] **Paso 5: Montar el overlay condicionalmente**

Antes del `return` del componente, o directamente dentro del JSX al final (antes del `</div>` de cierre), agregar:

```tsx
{wrappedOpen && <HistoriaWrapped onClose={() => setWrappedOpen(false)} />}
```

- [ ] **Paso 6: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores. Si hay errores por `Img` o `ArchPhoto` que quedaron referenciados en algún lugar, eliminar esas referencias.

- [ ] **Paso 7: Commit**

```bash
git add src/components/HistoriaTimeline.tsx
git commit -m "feat: integrate HistoriaWrapped overlay into /historia page"
```

---

## Task 5: Verificación visual

- [ ] **Paso 1: Levantar el servidor de desarrollo**

```bash
cd C:/Users/Datasys2/Documents/web-jime
npm run dev
```

Abrir `http://localhost:3000/historia`.

- [ ] **Paso 2: Verificar la página /historia sin el overlay**

Comprobar:
- El hero se ve correctamente con el botón "▶ MODO WRAPPED"
- La sección de timeline ya no aparece (no hay fotos de Unsplash alternadas)
- La quote, photo grid y footer siguen presentes

- [ ] **Paso 3: Abrir el overlay y verificar los slides**

Hacer clic en "▶ MODO WRAPPED". Verificar:
- El overlay cubre toda la pantalla
- La progress bar superior se actualiza al navegar
- El contador `01 / 06` aparece top-right
- Los dots se mueven con el slide activo
- Slide 1 (type: `text`) muestra solo tipografía sobre fondo crema
- Slide 2 (type: `arch`) muestra el emoji 🌟 encima del número
- Slide 3 (type: `fullbleed`) muestra fondo oscuro con gradiente y emoji 🌅 decorativo
- Botón ✕ cierra el overlay

- [ ] **Paso 4: Verificar todos los métodos de navegación**

- Clic en flecha `→` avanza
- Clic en flecha `←` retrocede
- Clic en mitad derecha del slide avanza
- Clic en mitad izquierda retrocede
- `ArrowRight` / `ArrowLeft` en teclado navegan
- `Escape` cierra el overlay
- Swipe en mobile (o DevTools touch simulation) funciona
- El body no tiene scroll mientras el overlay está abierto

- [ ] **Paso 5: Verificar mobile**

Abrir DevTools → modo responsive (375px). Verificar:
- El texto escala bien con `clamp()`
- Las flechas no se solapan con el contenido
- Los dots son visibles en el bottom

- [ ] **Paso 6: Commit final**

```bash
git add -A
git commit -m "feat: Historia Wrapped completo — overlay con 3 tipos de slide y navegación full"
```
