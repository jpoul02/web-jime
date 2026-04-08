# Carta Easter Egg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hidden letter (carta) that appears via two secret triggers — tapping the top-left logo area 5 times quickly, or typing "jime" on a keyboard — with the letter text managed from the jime-postales admin panel.

**Architecture:** jime-api stores the carta text in a single-row DB table with GET/PUT endpoints; jime-postales adds a simple textarea admin page; web-jime adds a `CartaOverlay` client component rendered globally from `layout.tsx` that listens for both triggers and fetches the text on demand. The overlay injects Caveat (Google Fonts handwriting font) via a `<link>` tag on mount.

**Tech Stack:** FastAPI + SQLAlchemy async (jime-api), Next.js 14 "use client" + inline styles (jime-postales, web-jime), Caveat font from Google Fonts

---

## Repos and base paths

- **jime-api:** `C:\Users\Datasys2\Documents\jime-api`
- **jime-postales:** `C:\Users\Datasys2\Documents\jime-postales`
- **web-jime:** `C:\Users\Datasys2\Documents\web-jime`

---

## File Map

| Repo | Action | Path |
|------|--------|------|
| jime-api | Modify | `app/models.py` |
| jime-api | Modify | `app/schemas.py` |
| jime-api | Modify | `app/crud.py` |
| jime-api | Create | `app/routers/carta.py` |
| jime-api | Modify | `app/main.py` |
| jime-api | Create | `tests/test_carta.py` |
| jime-postales | Create | `src/components/CartaAdmin.tsx` |
| jime-postales | Create | `src/app/admin/carta/page.tsx` |
| jime-postales | Modify | `src/app/admin/page.tsx` |
| web-jime | Create | `src/components/CartaOverlay.tsx` |
| web-jime | Modify | `src/app/layout.tsx` |

---

## Task 1: jime-api — Carta model

**Files:**
- Modify: `app/models.py`

- [ ] **Step 1: Append `Carta` model at end of `app/models.py`**

The table always has one row (id=1). No relationships.

```python
class Carta(Base):
    __tablename__ = "carta"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    texto: Mapped[str | None] = mapped_column(String, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\Datasys2\Documents\jime-api
git add app/models.py
git commit -m "feat: add Carta model"
```

---

## Task 2: jime-api — Schema + CRUD + Router + Tests

**Files:**
- Modify: `app/schemas.py`
- Modify: `app/crud.py`
- Create: `app/routers/carta.py`
- Modify: `app/main.py`
- Create: `tests/test_carta.py`

- [ ] **Step 1: Add schema to `app/schemas.py`** (append at end)

```python
# ── Carta ────────────────────────────────────────────────────────────────────

class CartaIn(BaseModel):
    texto: str

class CartaOut(BaseModel):
    texto: str | None = None
    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Add CRUD functions to `app/crud.py`**

First update the import line at the top. Current:
```python
from app.models import Question, Postal, Answer, Photo, PopularSong, Album, AlbumTrack, HistoriaSlide, MomentoFavorito
```
Replace with:
```python
from app.models import Question, Postal, Answer, Photo, PopularSong, Album, AlbumTrack, HistoriaSlide, MomentoFavorito, Carta
```

Then append at the end of `app/crud.py`:

```python
# ── Carta ─────────────────────────────────────────────────────────────────────

async def get_carta(db: AsyncSession) -> Carta | None:
    return await db.get(Carta, 1)

async def upsert_carta(db: AsyncSession, texto: str) -> Carta:
    carta = await db.get(Carta, 1)
    if carta:
        carta.texto = texto
    else:
        carta = Carta(id=1, texto=texto)
        db.add(carta)
    await db.commit()
    await db.refresh(carta)
    return carta
```

- [ ] **Step 3: Create `app/routers/carta.py`**

```python
# app/routers/carta.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app import crud
from app.schemas import CartaIn, CartaOut

router = APIRouter(prefix="/carta", tags=["carta"])

@router.get("", response_model=CartaOut)
async def get_carta(db: AsyncSession = Depends(get_db)):
    carta = await crud.get_carta(db)
    return CartaOut(texto=carta.texto if carta else None)

@router.put("", response_model=CartaOut)
async def update_carta(body: CartaIn, db: AsyncSession = Depends(get_db)):
    carta = await crud.upsert_carta(db, body.texto)
    return CartaOut(texto=carta.texto)
```

- [ ] **Step 4: Register router in `app/main.py`**

Update import line:
```python
from app.routers import questions, postales, musica, historia, carta
```

Add after `app.include_router(historia.router)`:
```python
app.include_router(carta.router)
```

- [ ] **Step 5: Write tests in `tests/test_carta.py`**

```python
# tests/test_carta.py
import pytest

@pytest.mark.asyncio
async def test_get_carta_empty(client):
    resp = await client.get("/carta")
    assert resp.status_code == 200
    assert resp.json() == {"texto": None}

@pytest.mark.asyncio
async def test_put_carta(client):
    resp = await client.put(
        "/carta",
        json={"texto": "Querida Jimena, esta es mi carta para vos."},
    )
    assert resp.status_code == 200
    assert resp.json()["texto"] == "Querida Jimena, esta es mi carta para vos."

@pytest.mark.asyncio
async def test_get_carta_after_put(client):
    await client.put("/carta", json={"texto": "Primera versión"})
    resp = await client.get("/carta")
    assert resp.json()["texto"] == "Primera versión"

@pytest.mark.asyncio
async def test_put_carta_updates_existing(client):
    await client.put("/carta", json={"texto": "Versión 1"})
    await client.put("/carta", json={"texto": "Versión 2"})
    resp = await client.get("/carta")
    assert resp.json()["texto"] == "Versión 2"
```

- [ ] **Step 6: Run tests**

```bash
cd C:\Users\Datasys2\Documents\jime-api
python -m pytest tests/test_carta.py -v
```

Expected: 4/4 PASS.

- [ ] **Step 7: Commit everything**

```bash
git add app/schemas.py app/crud.py app/routers/carta.py app/main.py tests/test_carta.py
git commit -m "feat: add /carta endpoint with GET and PUT"
```

- [ ] **Step 8: Push to deploy**

```bash
git push origin main
```

---

## Task 3: jime-postales — CartaAdmin component + page

**Files:**
- Create: `src/components/CartaAdmin.tsx`
- Create: `src/app/admin/carta/page.tsx`
- Modify: `src/app/admin/page.tsx`

Follow the exact same inline-style dark blue pattern as `MusicAdmin.tsx`.

- [ ] **Step 1: Create `src/components/CartaAdmin.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function CartaAdmin() {
  const [texto, setTexto] = useState("");
  const [original, setOriginal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/carta`)
      .then(r => r.json())
      .then(data => {
        const t = data.texto ?? "";
        setTexto(t);
        setOriginal(t);
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch(`${API}/carta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });
    setSaving(false);
    setSaved(true);
    setOriginal(texto);
    setTimeout(() => setSaved(false), 2500);
  }

  const isDirty = texto !== original;

  return (
    <div style={{ fontFamily: "var(--font-nunito)", color: "#cde", display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, color: "#88a", fontSize: 13, lineHeight: 1.6 }}>
        Esta carta aparece como sorpresa secreta. Se activa tocando el logo 5 veces o escribiendo <code style={{ background: "#0a1930", padding: "2px 6px", borderRadius: 4, color: "#1DB954", fontSize: 12 }}>jime</code> en el teclado.
      </p>

      <textarea
        style={{
          background: "#0a1930",
          border: `2px solid ${isDirty ? "#1DB954" : "#1a3a6e"}`,
          borderRadius: 12,
          padding: "16px",
          color: "#cde",
          fontSize: 15,
          lineHeight: 1.8,
          outline: "none",
          resize: "vertical",
          minHeight: 320,
          fontFamily: "var(--font-nunito)",
          transition: "border-color 0.2s",
        }}
        value={texto}
        onChange={e => { setTexto(e.target.value); setSaved(false); }}
        placeholder={"Querida Jimena,\n\n..."}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          style={{
            background: "linear-gradient(to right,#0d2a5e,#15306a)",
            border: "2px solid #1DB954",
            borderRadius: 10,
            color: "#1DB954",
            fontWeight: 700,
            fontSize: 13,
            padding: "10px 28px",
            cursor: isDirty ? "pointer" : "default",
            opacity: isDirty ? 1 : 0.5,
            fontFamily: "var(--font-nunito)",
          }}
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          {saving ? "Guardando..." : "Guardar carta"}
        </button>

        {saved && (
          <span style={{ fontSize: 13, color: "#1DB954" }}>✓ Guardada</span>
        )}

        {isDirty && !saving && (
          <span style={{ fontSize: 12, color: "#88a" }}>Tenés cambios sin guardar</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/carta/page.tsx`**

```tsx
import Link from "next/link";
import CartaAdmin from "@/components/CartaAdmin";

export default function AdminCartaPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-cp-dark-blue to-cp-blue rounded-2xl border-[3px] border-cp-blue shadow-cp p-5 text-center mb-8">
          <p className="font-pixel text-[9px] text-white leading-loose">admin · carta secreta ★</p>
          <p className="font-vt text-xl text-blue-200">escribir carta para Jime 💌</p>
        </div>

        <CartaAdmin />

        <div className="mt-8 text-center">
          <Link href="/admin" className="font-vt text-base text-blue-400 hover:text-blue-200 transition-colors">
            ← volver al admin
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add link in `src/app/admin/page.tsx`**

After the existing historia link, add:

```tsx
<Link
  href="/admin/carta"
  className="block bg-gradient-to-r from-cp-dark-blue to-cp-blue rounded-xl border-[2px] border-cp-blue shadow-cp p-5 hover:-translate-y-0.5 transition-all"
>
  <p className="font-pixel text-[9px] text-blue-300 mb-1">carta secreta</p>
  <p className="font-vt text-2xl text-white">💌 Escribir carta</p>
</Link>
```

- [ ] **Step 4: Commit**

```bash
cd C:\Users\Datasys2\Documents\jime-postales
git add src/components/CartaAdmin.tsx src/app/admin/carta/page.tsx src/app/admin/page.tsx
git commit -m "feat: add CartaAdmin component and page"
```

---

## Task 4: web-jime — CartaOverlay component

**Files:**
- Create: `src/components/CartaOverlay.tsx`
- Modify: `src/app/layout.tsx`

The component renders via `createPortal` (same pattern as `HistoriaWrapped`). Two triggers handled inside the component:
1. **Logo tap ×5:** A fixed invisible `<div>` (120×60px, top-left) counts clicks. 5 clicks within 2 seconds = open.
2. **Type "jime":** A `keydown` window listener tracks last 4 characters typed.

Font: inject `<link>` tag for Google Fonts Caveat on mount (same pattern as HistoriaWrapped injects keyframes).

The overlay shows centered on a dark background. The carta "paper" is a warm cream card with the text in Caveat font.

- [ ] **Step 1: Create `src/components/CartaOverlay.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";

const TERRA = "#D4916E";
const CREAM = "#FAF3E0";
const DARK  = "#1A1A1A";
const INK   = "#2C1A10";

export default function CartaOverlay() {
  const [mounted, setMounted]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [texto, setTexto]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  // Logo tap counter
  const tapCount  = useRef(0);
  const tapTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "jime" keyboard sequence
  const keyBuffer = useRef("");

  useEffect(() => { setMounted(true); }, []);

  // Inject Caveat font once
  useEffect(() => {
    const id = "caveat-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap";
      document.head.appendChild(link);
    }
    return () => { document.getElementById("caveat-font")?.remove(); };
  }, []);

  const openCarta = useCallback(async () => {
    if (open) return;
    setOpen(true);
    if (texto !== null) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/carta`);
      const data = await r.json();
      setTexto(data.texto ?? "");
    } catch {
      setTexto("");
    } finally {
      setLoading(false);
    }
  }, [open, texto]);

  const closeCarta = useCallback(() => setOpen(false), []);

  // Logo area tap trigger (fixed invisible zone top-left)
  function handleLogoTap() {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      openCarta();
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
  }

  // "jime" keyboard trigger
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      keyBuffer.current = (keyBuffer.current + e.key.toLowerCase()).slice(-4);
      if (keyBuffer.current === "jime") {
        keyBuffer.current = "";
        openCarta();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCarta]);

  // Block body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape key to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCarta();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeCarta]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Invisible logo tap zone — fixed top-left, matches nav logo position */}
      <div
        onClick={handleLogoTap}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 120, height: 60,
          zIndex: 9998, cursor: "default",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-hidden="true"
      />

      {/* Overlay */}
      {open && (
        <div
          onClick={closeCarta}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10, 8, 6, 0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "clamp(16px, 4vw, 40px)",
            backdropFilter: "blur(3px)",
            animation: "carta-fade-in 0.35s ease forwards",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: CREAM,
              borderRadius: 4,
              width: "100%",
              maxWidth: 580,
              maxHeight: "85svh",
              overflowY: "auto",
              padding: "clamp(28px, 6vw, 52px) clamp(24px, 5vw, 48px)",
              position: "relative",
              boxShadow: "0 8px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(212,145,110,0.15)",
            }}
          >
            {/* Close */}
            <button
              onClick={closeCarta}
              aria-label="Cerrar"
              style={{
                position: "absolute", top: 16, right: 16,
                background: "none", border: "none",
                cursor: "pointer", fontSize: 18,
                color: "#9c8070", lineHeight: 1,
                padding: 4,
              }}
            >✕</button>

            {/* Decorative top line */}
            <div style={{ width: 40, height: 2, background: TERRA, marginBottom: 24 }} />

            {/* Content */}
            {loading ? (
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "#9c8070", margin: 0 }}>
                ...
              </p>
            ) : texto ? (
              <p style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(18px, 2.5vw, 22px)",
                color: INK,
                lineHeight: 1.85,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}>
                {texto}
              </p>
            ) : (
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: "#9c8070", margin: 0 }}>
                Todavía no hay carta...
              </p>
            )}

            {/* Decorative bottom */}
            <div style={{ marginTop: 32, textAlign: "right" }}>
              <span style={{ color: TERRA, fontSize: 22 }}>♥</span>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
```

- [ ] **Step 2: Inject `carta-fade-in` keyframe**

In `CartaOverlay.tsx`, add a second `useEffect` for the animation keyframe (after the Caveat font injection effect):

```tsx
useEffect(() => {
  const id = "carta-kf";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `@keyframes carta-fade-in { from { opacity:0; } to { opacity:1; } }`;
    document.head.appendChild(s);
  }
  return () => { document.getElementById("carta-kf")?.remove(); };
}, []);
```

Add this effect inside the component body, after the Caveat font effect.

- [ ] **Step 3: Add `CartaOverlay` to `src/app/layout.tsx`**

Current layout body:
```tsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  {children}
</body>
```

Change to:
```tsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  {children}
  <CartaOverlay />
</body>
```

And add the import at the top of the file:
```tsx
import CartaOverlay from "@/components/CartaOverlay";
```

- [ ] **Step 4: Commit**

```bash
cd C:\Users\Datasys2\Documents\web-jime
git add src/components/CartaOverlay.tsx src/app/layout.tsx
git commit -m "feat: add CartaOverlay easter egg with logo tap and jime keyboard triggers"
```

---

## Self-Review

**Spec coverage:**
- ✅ Logo ×5 trigger: Task 4 — invisible fixed div top-left, 2s reset window
- ✅ Type "jime" trigger: Task 4 — window keydown listener, 4-char rolling buffer
- ✅ Carta text from admin: Task 3 — textarea with save button, dirty state indicator
- ✅ Carta text in DB: Task 2 — Carta model, GET/PUT /carta
- ✅ Handwriting font: Task 4 — Caveat injected via `<link>` tag
- ✅ Close on ✕ / Escape / outside click: Task 4
- ✅ Body scroll lock when open: Task 4
- ✅ Tests: Task 2 — 4 tests covering empty state, create, read-after-write, update

**Placeholder scan:** None found.

**Type consistency:**
- `CartaOut.texto: str | None` matches `get_carta` return → `CartaOut(texto=carta.texto if carta else None)` ✓
- `upsert_carta` returns `Carta`, router wraps in `CartaOut` ✓
- `texto` state in `CartaAdmin` starts as `""`, textarea uses it directly ✓
- `CartaOverlay` fetches on first open only (guards with `if (texto !== null) return`) ✓
