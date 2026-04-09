# Historia Scroll Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scroll-driven animated timeline section to `/historia` that shows all `historia_slides` as alternating cards animating in on scroll, with a photo lightbox.

**Architecture:** A single new `"use client"` component `HistoriaScrollTimeline` fetches `/historia/slides`, renders alternating left/right cards along a vertical center line using `IntersectionObserver` for scroll-triggered entry animations, and includes an internal lightbox via `createPortal`. It is inserted between the quote and photo collage sections in `HistoriaTimeline.tsx`.

**Tech Stack:** Next.js 14, React (useEffect, useRef, useState, createPortal), IntersectionObserver API, inline styles only.

---

## Repo and base path

- **web-jime:** `C:\Users\Datasys2\Documents\web-jime`

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/components/HistoriaScrollTimeline.tsx` |
| Modify | `src/components/HistoriaTimeline.tsx` |

---

## Task 1: HistoriaScrollTimeline — skeleton + data fetch

**Files:**
- Create: `src/components/HistoriaScrollTimeline.tsx`

- [ ] **Step 1: Create the component file with types, tokens, and fetch logic**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

/* ─── Tokens ──────────────────────────────────────────────────────────────── */
const PF    = "'Playfair Display', Georgia, serif";
const GM    = "var(--font-geist-mono), 'Courier New', monospace";
const GS    = "var(--font-geist-sans), sans-serif";
const TERRA = "#D4916E";
const CREAM = "#F3EBE2";
const DARK  = "#1A1A1A";
const MID   = "#3D3D3D";
const LINE  = "#D4C5B8";

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Slide = {
  id: number;
  date: string;
  title: string;
  desc: string;
  img?: string;
  emoji?: string;
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function HistoriaScrollTimeline() {
  const [slides, setSlides]         = useState<Slide[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lightboxSrc, setLightbox]  = useState<string | null>(null);
  const [visible, setVisible]       = useState<Set<number>>(new Set());
  const cardRefs                    = useRef<(HTMLDivElement | null)[]>([]);

  /* Fetch slides */
  useEffect(() => {
    fetch(`${API}/historia/slides`)
      .then(r => r.json())
      .then((data: Array<{ id: number; date: string; title: string; desc: string; img_url: string | null; emoji?: string | null }>) => {
        setSlides(data.map(s => ({
          id: s.id,
          date: s.date,
          title: s.title,
          desc: s.desc,
          img: s.img_url ?? undefined,
          emoji: s.emoji ?? undefined,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ background: CREAM, padding: "80px clamp(24px, 6.9vw, 100px)", textAlign: "center" }}>
        <span style={{ fontFamily: PF, fontSize: 36, fontStyle: "italic", color: TERRA }}>...</span>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section style={{ background: CREAM, padding: "clamp(60px, 8vw, 100px) clamp(24px, 6.9vw, 100px)" }}>
      <p style={{ fontFamily: GM, fontSize: 10, letterSpacing: 5, color: LINE, margin: "0 0 60px" }}>
        NUESTRA LÍNEA DEL TIEMPO
      </p>

      {/* Timeline body — placeholder, built in Task 2 */}
      <div style={{ position: "relative" }}>
        {slides.map((slide, i) => (
          <div key={slide.id} ref={el => { cardRefs.current[i] = el; }}>
            <p>{slide.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the component renders without errors**

In `src/components/HistoriaTimeline.tsx`, temporarily add the import and render the component after the QUOTE section:

```tsx
import HistoriaScrollTimeline from "./HistoriaScrollTimeline";
```

And inside the JSX, after the closing `</section>` of the QUOTE block:

```tsx
<HistoriaScrollTimeline />
```

Run the dev server and open `/historia`. The section should appear showing slide titles in a plain list. No crash = success.

```bash
cd C:\Users\Datasys2\Documents\web-jime
npm run dev
```

Expected: page loads, titles appear in plain text under the quote.

- [ ] **Step 3: Commit**

```bash
cd C:\Users\Datasys2\Documents\web-jime
git add src/components/HistoriaScrollTimeline.tsx src/components/HistoriaTimeline.tsx
git commit -m "feat: scaffold HistoriaScrollTimeline with data fetch"
```

---

## Task 2: Timeline layout — vertical line + alternating cards

**Files:**
- Modify: `src/components/HistoriaScrollTimeline.tsx`

Replace the placeholder `<div>` inside the `<section>` timeline body with the full layout. The component already has all state and refs from Task 1.

- [ ] **Step 1: Replace the timeline body div with the full layout**

Replace the entire `{/* Timeline body */}` div (the one with the placeholder `<p>{slide.title}</p>`) with this:

```tsx
      {/* Vertical center line */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: 0,
        bottom: 0,
        width: 2,
        background: LINE,
        transform: "translateX(-50%)",
        zIndex: 0,
      }} className="hidden md:block" />

      {/* Mobile line — left edge */}
      <div style={{
        position: "absolute",
        left: 20,
        top: 0,
        bottom: 0,
        width: 2,
        background: LINE,
        zIndex: 0,
      }} className="md:hidden" />

      {slides.map((slide, i) => {
        const isLeft = i % 2 === 0;
        const isVis  = visible.has(i);

        return (
          <div
            key={slide.id}
            ref={el => { cardRefs.current[i] = el; }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 64,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* ── Desktop layout ── */}

            {/* Left spacer or card */}
            <div className="hidden md:flex" style={{ flex: 1, justifyContent: "flex-end", paddingRight: 40 }}>
              {isLeft && <Card slide={slide} isVis={isVis} onImg={setLightbox} />}
            </div>

            {/* Center dot + date */}
            <div className="hidden md:flex" style={{
              width: 160,
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              paddingTop: 4,
              flexShrink: 0,
            }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: isVis ? TERRA : LINE,
                border: `2px solid ${isVis ? TERRA : LINE}`,
                transition: "background 0.4s, border-color 0.4s",
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: GM,
                fontSize: 9,
                letterSpacing: 3,
                color: TERRA,
                textTransform: "uppercase",
                textAlign: "center",
                lineHeight: 1.4,
              }}>
                {slide.date}
              </span>
            </div>

            {/* Right spacer or card */}
            <div className="hidden md:flex" style={{ flex: 1, justifyContent: "flex-start", paddingLeft: 40 }}>
              {!isLeft && <Card slide={slide} isVis={isVis} onImg={setLightbox} />}
            </div>

            {/* ── Mobile layout ── */}
            <div className="md:hidden" style={{ paddingLeft: 48, width: "100%" }}>
              {/* Dot */}
              <div style={{
                position: "absolute",
                left: 14,
                top: 6,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: isVis ? TERRA : LINE,
                border: `2px solid ${isVis ? TERRA : LINE}`,
                transition: "background 0.4s, border-color 0.4s",
              }} />
              <Card slide={slide} isVis={isVis} onImg={setLightbox} mobile />
            </div>
          </div>
        );
      })}
```

- [ ] **Step 2: Add the `Card` sub-component above the main export**

Add this before `export default function HistoriaScrollTimeline()`:

```tsx
/* ─── Card sub-component ──────────────────────────────────────────────────── */
function Card({
  slide,
  isVis,
  onImg,
  mobile = false,
}: {
  slide: Slide;
  isVis: boolean;
  onImg: (src: string) => void;
  mobile?: boolean;
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #EDE5DC",
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      padding: "clamp(18px, 2.5vw, 26px)",
      maxWidth: 420,
      width: "100%",
      opacity: isVis ? 1 : 0,
      transform: isVis ? "translateX(0)" : `translateX(${mobile ? "-30px" : "0"})`,
      transition: "opacity 500ms ease-out, transform 500ms ease-out",
    }}>
      {/* Date — mobile only (desktop date is on the center column) */}
      {mobile && (
        <span style={{ fontFamily: GM, fontSize: 9, letterSpacing: 3, color: TERRA, textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>
          {slide.date}
        </span>
      )}

      {/* Divider */}
      <div style={{ width: 24, height: 1, background: TERRA, marginBottom: 10 }} />

      {/* Title */}
      <h3 style={{ fontFamily: PF, fontSize: "clamp(18px, 2.2vw, 24px)", fontStyle: "italic", color: DARK, margin: "0 0 8px", lineHeight: 1.25 }}>
        {slide.title}
      </h3>

      {/* Description */}
      <p style={{ fontFamily: GS, fontSize: 14, color: MID, lineHeight: 1.75, margin: 0 }}>
        {slide.desc}
      </p>

      {/* Image */}
      {slide.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.img}
          alt=""
          onClick={() => onImg(slide.img!)}
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 8,
            marginTop: 14,
            cursor: "pointer",
            display: "block",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        />
      )}

      {/* Emoji (only if no image) */}
      {!slide.img && slide.emoji && (
        <div style={{ fontSize: 48, textAlign: "center", marginTop: 14, lineHeight: 1 }}>
          {slide.emoji}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire up the desktop slide-in transform**

The `Card` currently uses `translateX(0)` for desktop. The desktop animation direction depends on which side the card is on. The `Card` component needs to know direction. Update the `Card` props to accept `dir`:

Change the Card props interface to:

```tsx
function Card({
  slide,
  isVis,
  onImg,
  dir = 0,
}: {
  slide: Slide;
  isVis: boolean;
  onImg: (src: string) => void;
  dir?: -1 | 0 | 1;   // -1 = from left, 1 = from right, 0 = mobile (from left, smaller)
})
```

Change the `transform` line in the Card's style to:

```tsx
transform: isVis
  ? "translateX(0)"
  : dir === 0
    ? "translateX(-30px)"
    : `translateX(${dir === -1 ? "-50px" : "50px"})`,
```

Remove the `mobile` prop entirely. Update every `<Card>` call:
- Left desktop card (isLeft): `dir={-1}`
- Right desktop card (!isLeft): `dir={1}`
- Mobile card: `dir={0}`

Updated Card calls in the map:

```tsx
{/* Left card */}
<div className="hidden md:flex" style={{ flex: 1, justifyContent: "flex-end", paddingRight: 40 }}>
  {isLeft && <Card slide={slide} isVis={isVis} onImg={setLightbox} dir={-1} />}
</div>

{/* Right card */}
<div className="hidden md:flex" style={{ flex: 1, justifyContent: "flex-start", paddingLeft: 40 }}>
  {!isLeft && <Card slide={slide} isVis={isVis} onImg={setLightbox} dir={1} />}
</div>

{/* Mobile card */}
<div className="md:hidden" style={{ paddingLeft: 48, width: "100%" }}>
  <div style={{ position: "absolute", left: 14, top: 6, width: 12, height: 12, borderRadius: "50%", background: isVis ? TERRA : LINE, border: `2px solid ${isVis ? TERRA : LINE}`, transition: "background 0.4s, border-color 0.4s" }} />
  <Card slide={slide} isVis={isVis} onImg={setLightbox} dir={0} />
</div>
```

- [ ] **Step 4: Verify layout in browser**

Run `npm run dev`, open `/historia`. You should see:
- Desktop: alternating left/right cards with a dot in the center, vertical line behind them
- Mobile (resize browser < 768px): all cards on right with left-edge line
- Cards are invisible (opacity 0) since `visible` set is empty — this is correct

- [ ] **Step 5: Commit**

```bash
cd C:\Users\Datasys2\Documents\web-jime
git add src/components/HistoriaScrollTimeline.tsx
git commit -m "feat: add timeline card layout with alternating left/right and mobile fallback"
```

---

## Task 3: IntersectionObserver — scroll animations

**Files:**
- Modify: `src/components/HistoriaScrollTimeline.tsx`

- [ ] **Step 1: Add the IntersectionObserver useEffect**

Add this `useEffect` inside `HistoriaScrollTimeline`, after the fetch effect and before the `if (loading)` return:

```tsx
  /* IntersectionObserver — animate cards on scroll */
  useEffect(() => {
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              setVisible(prev => new Set(prev).add(idx));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach(el => { if (el) observer.observe(el); });

    return () => observer.disconnect();
  }, [slides]);
```

- [ ] **Step 2: Verify animations in browser**

Run `npm run dev`, open `/historia`, scroll down to the timeline section. Each card should:
- Start invisible (opacity 0, shifted)
- Fade + slide in as it enters the viewport
- Stay visible once shown (never reverses)

Check both desktop and mobile widths.

- [ ] **Step 3: Commit**

```bash
cd C:\Users\Datasys2\Documents\web-jime
git add src/components/HistoriaScrollTimeline.tsx
git commit -m "feat: add IntersectionObserver scroll-triggered card animations"
```

---

## Task 4: Lightbox

**Files:**
- Modify: `src/components/HistoriaScrollTimeline.tsx`

- [ ] **Step 1: Add the `mounted` state and Escape key + scroll lock effects**

Add `const [mounted, setMounted] = useState(false);` to the existing state declarations.

Add these two effects after the IntersectionObserver effect:

```tsx
  useEffect(() => { setMounted(true); }, []);

  /* Lightbox: lock scroll + Escape to close */
  useEffect(() => {
    if (!lightboxSrc) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setLightbox(null); }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxSrc]);
```

- [ ] **Step 2: Add the lightbox portal at the bottom of the component return**

At the very end of the component's `return`, after the closing `</section>`, add:

```tsx
      {/* Lightbox */}
      {mounted && lightboxSrc && createPortal(
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9990,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "85svh",
              objectFit: "contain",
              borderRadius: 4,
              boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
            }}
          />
          <button
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
            style={{
              position: "absolute", top: 20, right: 20,
              background: "none", border: "none",
              cursor: "pointer", fontSize: 22,
              color: "#fff", lineHeight: 1, padding: 4,
            }}
          >✕</button>
        </div>,
        document.body
      )}
```

The full return now looks like:

```tsx
  return (
    <>
      <section style={{ ... }}>
        ...
      </section>

      {mounted && lightboxSrc && createPortal(..., document.body)}
    </>
  );
```

- [ ] **Step 3: Verify lightbox in browser**

Run `npm run dev`, open `/historia`, scroll to a slide with an image, click it. The lightbox should:
- Open with dark background
- Show the image centered
- Close on ✕ click
- Close on clicking outside the image
- Close on Escape key

- [ ] **Step 4: Commit**

```bash
cd C:\Users\Datasys2\Documents\web-jime
git add src/components/HistoriaScrollTimeline.tsx
git commit -m "feat: add photo lightbox with Escape-to-close and scroll lock"
```

---

## Task 5: Final integration + push

**Files:**
- Verify: `src/components/HistoriaTimeline.tsx` (import and placement already added in Task 1 — confirm it's correct)

- [ ] **Step 1: Confirm the placement in HistoriaTimeline.tsx**

Open `src/components/HistoriaTimeline.tsx`. Verify:

1. Import exists near top of file:
   ```tsx
   import HistoriaScrollTimeline from "./HistoriaScrollTimeline";
   ```

2. The component is rendered between the QUOTE section and the PHOTO COLLAGE section:
   ```tsx
   {/* ══ QUOTE ═══════════════ */}
   <section ...>...</section>

   {/* ══ SCROLL TIMELINE ════ */}
   <HistoriaScrollTimeline />

   {/* ══ PHOTO COLLAGE ══════ */}
   {gridImgs.length > 0 && (
   ```

If either is missing, add it now.

- [ ] **Step 2: Full visual check**

Run `npm run dev`, open `/historia`, verify:

- [ ] Section header "NUESTRA LÍNEA DEL TIEMPO" appears
- [ ] Vertical center line visible on desktop
- [ ] Cards alternate left/right on desktop
- [ ] Cards animate in on scroll (fade + slide)
- [ ] Dot on line fills TERRA color when card animates in
- [ ] Mobile: single column, line on left, cards animate from left
- [ ] Image click opens lightbox
- [ ] Lightbox closes on ✕, outside click, and Escape
- [ ] Section is absent if no slides in DB (empty array)
- [ ] Loading state shows `...` in Playfair italic

- [ ] **Step 3: Push to deploy**

```bash
cd C:\Users\Datasys2\Documents\web-jime
git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ Section inserted between quote and photo collage
- ✅ Fetches `/historia/slides` — same endpoint, no backend changes
- ✅ Alternating left/right cards on desktop
- ✅ Mobile: single column with left-edge line
- ✅ IntersectionObserver triggers animation on scroll, once only
- ✅ Card: date, divider, title, desc, image (click → lightbox), emoji fallback
- ✅ Dot on line fills TERRA on card entry
- ✅ Lightbox: dark bg, image centered, ✕ + outside click + Escape to close, scroll lock
- ✅ `zIndex: 9990` (below CartaOverlay at 9999)
- ✅ Loading state, empty state (returns null)
- ✅ Tokens match rest of page (CREAM, TERRA, DARK, MID, LINE)

**Placeholder scan:** None.

**Type consistency:**
- `Slide` type defined in Task 1, used in Card (Task 2) — consistent
- `dir: -1 | 0 | 1` defined and used consistently
- `setLightbox` typed as `(src: string) => void` — matches `lightboxSrc: string | null`
