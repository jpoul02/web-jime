# Historia Scroll Timeline — Design Spec

## Goal

Add a scroll-driven animated timeline section to the `/historia` page in web-jime. The section lives between the existing quote block and the photo collage, showing all moments stored in `historia_slides` as alternating cards that animate in as the user scrolls. Tapping a photo opens a fullscreen lightbox.

## Architecture

**No backend changes.** The timeline consumes the existing `GET /historia/slides` endpoint — the same one `HistoriaWrapped` uses. No new DB table, no new API endpoint.

**Files:**
- Create: `src/components/HistoriaScrollTimeline.tsx`
- Modify: `src/components/HistoriaTimeline.tsx` — import and render `<HistoriaScrollTimeline />` between the quote section and the photo collage section

## Component: HistoriaScrollTimeline

`"use client"` component. Fetches `/historia/slides` on mount, renders a vertical timeline.

### Data

Uses the existing `Momento` shape (same as `HistoriaWrapped`):

```ts
type Momento = {
  id: number;
  date: string;
  title: string;
  desc: string;
  type: "text" | "arch" | "fullbleed";
  img?: string;
  emoji?: string;
};
```

Fetch maps the API response identically to how `HistoriaWrapped` does it — `img_url → img`, `emoji → emoji`. The `num` field is NOT stored in the component; it is not needed for the timeline.

### Layout — Desktop (≥ 768px)

A centered container with a vertical line running down the middle (2px, color `#D4C5B8`). Events alternate left and right of the line.

```
       [card left]  ●──── date    
                    |
       date ────●  [card right]
                    |
       [card left]  ●──── date
```

Each "row" is a flex row: left card area (flex 1) + center column (dot + date, fixed width ~160px) + right card area (flex 1). Odd-indexed events place the card on the left, even-indexed on the right. The opposite side is an empty spacer.

### Layout — Mobile (< 768px)

The vertical line moves to the left edge (left: 20px, position absolute). All cards render to the right of the line with a left margin. The center column collapses — dates render above each card title instead of on the line. All animations come from the left only.

### Card contents

Each card is a `div` with:
- Background: `#FFFFFF`
- Border: `1px solid #EDE5DC`
- Border-radius: 12px
- Box-shadow: `0 4px 20px rgba(0,0,0,0.08)`
- Padding: `clamp(20px, 3vw, 28px)`
- Max-width: 420px

Inside the card, top to bottom:
1. **Date** — Geist Mono, 9px, letterSpacing 4, `#D4916E`, uppercase
2. **Thin divider** — 24px wide, 1px tall, `#D4916E`, margin 10px 0
3. **Title** — Playfair Display italic, clamp(20px, 2.5vw, 26px), `#1A1A1A`
4. **Description** — Geist Sans, 14px, lineHeight 1.75, `#3D3D3D`, margin-top 8px
5. **Image** (if present) — full card width, max-height 220px, objectFit cover, border-radius 8px, margin-top 14px, cursor pointer → opens lightbox
6. **Emoji** (if no image, and emoji present) — 48px, centered, margin-top 14px, as a decorative block

### The dot + date column (desktop)

Fixed-width center column (~160px). Contains:
- A 10px × 10px circle, `border-radius: 50%`, `background: #D4916E`
- The date text next to it (alternates left/right depending on which side the card is on)
- The vertical line passes behind this column via the parent's `::before`-equivalent (implemented as an absolutely positioned `div` spanning the full section height, `zIndex: 0`)

### Scroll animations

On mount, an `IntersectionObserver` (threshold: 0.15) watches each card wrapper `div`. Before intersection: `opacity: 0`, `transform: translateX(±50px)` (left cards use -50px, right cards +50px; mobile all use -30px). On intersection: `opacity: 1`, `transform: translateX(0)`, `transition: opacity 500ms ease-out, transform 500ms ease-out`. The observer disconnects the entry after it fires (animate once, never reverse).

State: `const [visible, setVisible] = useState<Set<number>>(new Set())` — tracks which indices have been seen.

Refs: one `ref` per card wrapper, stored as `cardRefs.current[i] = el`.

### Lightbox

Internal to `HistoriaScrollTimeline`. State: `lightboxSrc: string | null` (null = closed).

When open, renders via `createPortal` to `document.body`:
- Backdrop: `position: fixed, inset: 0, zIndex: 9990, background: rgba(0,0,0,0.9)`, click backdrop → close
- Image: centered, `max-width: 90vw`, `max-height: 85svh`, `objectFit: contain`, `border-radius: 4px`
- Close button: `position: absolute, top: 20px, right: 20px`, ✕, white, 24px
- Escape key → close (window keydown listener, cleaned up on unmount / when lightbox closes)
- Body scroll locked while open (`document.body.style.overflow = "hidden"`)

`zIndex: 9990` (below `CartaOverlay` at 9999, above everything else).

### Loading / empty states

- **Loading:** Section renders a centered `...` in Playfair italic, TERRA color
- **Empty (0 slides):** Section does not render (returns `null`)
- **Fetch error:** Section does not render (catches error, sets slides to `[]`)

### Section wrapper in HistoriaTimeline

```tsx
{/* ══ SCROLL TIMELINE ══════════════════════════════════════════════════ */}
<HistoriaScrollTimeline />
```

Inserted after the QUOTE section (`</section>`) and before the PHOTO COLLAGE section. The component manages its own background (`CREAM`) and padding (`clamp(60px, 8vw, 100px) clamp(24px, 6.9vw, 100px)`).

## Color + Font tokens

Same tokens as the rest of the page — no new values:

```
TERRA = "#D4916E"
CREAM = "#F3EBE2"
DARK  = "#1A1A1A"
MID   = "#3D3D3D"
MUTED = "#C5BEB6"
PF    = "'Playfair Display', Georgia, serif"
GM    = "var(--font-geist-mono), 'Courier New', monospace"
GS    = "var(--font-geist-sans), sans-serif"
LINE  = "#D4C5B8"   ← new, used only for the timeline line and dot border
```

## What this does NOT include

- No new backend endpoint or DB model
- No new font (Playfair already loaded via Google Fonts on the page)
- No external animation library
- No changes to `HistoriaWrapped` or the existing slideshow
- No admin changes
