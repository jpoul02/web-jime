# Historia Cloudinary + Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded Historia Wrapped slides and photo grid with a database/Cloudinary system managed through a new jime-postales admin panel.

**Architecture:** Three-repo change — jime-api adds `HistoriaSlide` and `MomentoFavorito` models with a `/historia` router; jime-postales gets a `HistoriaAdmin` component with two tabs (slides + momentos) following the same inline-style pattern as `MusicAdmin`; web-jime fetches both lists from jime-api at runtime instead of hardcoded arrays. The `num` field ("01.", "02.") is NOT stored — it is computed from the array index in the frontend.

**Tech Stack:** FastAPI + SQLAlchemy async (jime-api), Next.js 14 "use client" + inline styles (jime-postales, web-jime), Cloudinary for image storage via existing `app/storage.py:maybe_upload`

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
| jime-api | Create | `app/routers/historia.py` |
| jime-api | Modify | `app/main.py` |
| jime-api | Create | `tests/test_historia.py` |
| jime-postales | Create | `src/types/historia.ts` |
| jime-postales | Create | `src/components/HistoriaAdmin.tsx` |
| jime-postales | Create | `src/app/admin/historia/page.tsx` |
| jime-postales | Modify | `src/app/admin/page.tsx` |
| web-jime | Modify | `src/components/HistoriaWrapped.tsx` |
| web-jime | Modify | `src/components/HistoriaTimeline.tsx` |

---

## Task 1: jime-api — Models

**Files:**
- Modify: `app/models.py` (append two new classes)

- [ ] **Step 1: Add the two new model classes**

Open `app/models.py`. The file already imports `Integer, String, ForeignKey, DateTime, func` from sqlalchemy and `datetime` from datetime. No new imports needed. Append after the last class (`AlbumTrack`):

```python
class HistoriaSlide(Base):
    __tablename__ = "historia_slides"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[str] = mapped_column(String(80), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    desc: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)   # "text" | "arch" | "fullbleed"
    img_url: Mapped[str | None] = mapped_column(String, nullable=True)
    emoji: Mapped[str | None] = mapped_column(String(20), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class MomentoFavorito(Base):
    __tablename__ = "momentos_favoritos"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    photo_url: Mapped[str] = mapped_column(String, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\Datasys2\Documents\jime-api
git add app/models.py
git commit -m "feat: add HistoriaSlide and MomentoFavorito models"
```

---

## Task 2: jime-api — Schemas

**Files:**
- Modify: `app/schemas.py` (append two new schema classes)

- [ ] **Step 1: Add schemas at the end of app/schemas.py**

```python
# ── Historia ─────────────────────────────────────────────────────────────────

class HistoriaSlideOut(BaseModel):
    id: int
    date: str
    title: str
    desc: str
    type: str
    img_url: str | None = None
    emoji: str | None = None
    order: int
    model_config = {"from_attributes": True}

class MomentoFavoritoOut(BaseModel):
    id: int
    photo_url: str
    order: int
    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Commit**

```bash
git add app/schemas.py
git commit -m "feat: add HistoriaSlideOut and MomentoFavoritoOut schemas"
```

---

## Task 3: jime-api — CRUD functions

**Files:**
- Modify: `app/crud.py` (append new functions at end of file)

- [ ] **Step 1: Add the import line at the top of crud.py**

The existing import line is:
```python
from app.models import Question, Postal, Answer, Photo, PopularSong, Album, AlbumTrack
```

Replace it with:
```python
from app.models import Question, Postal, Answer, Photo, PopularSong, Album, AlbumTrack, HistoriaSlide, MomentoFavorito
```

- [ ] **Step 2: Append CRUD functions at end of app/crud.py**

```python
# ── Historia Slides ───────────────────────────────────────────────────────────

async def get_historia_slides(db: AsyncSession) -> list[HistoriaSlide]:
    result = await db.execute(select(HistoriaSlide).order_by(HistoriaSlide.order))
    return result.scalars().all()

async def create_historia_slide(
    db: AsyncSession,
    date: str,
    title: str,
    desc: str,
    type_: str,
    img_url: str | None,
    emoji: str | None,
) -> HistoriaSlide:
    slides = await get_historia_slides(db)
    slide = HistoriaSlide(
        date=date, title=title, desc=desc, type=type_,
        img_url=img_url, emoji=emoji, order=len(slides),
    )
    db.add(slide)
    await db.commit()
    await db.refresh(slide)
    return slide

async def update_historia_slide(
    db: AsyncSession,
    slide_id: int,
    date: str | None,
    title: str | None,
    desc: str | None,
    type_: str | None,
    img_url: str | None,
    emoji: str | None,
) -> HistoriaSlide | None:
    slide = await db.get(HistoriaSlide, slide_id)
    if not slide:
        return None
    if date is not None:
        slide.date = date
    if title is not None:
        slide.title = title
    if desc is not None:
        slide.desc = desc
    if type_ is not None:
        slide.type = type_
    if img_url is not None:
        slide.img_url = img_url
    if emoji is not None:
        slide.emoji = emoji
    await db.commit()
    await db.refresh(slide)
    return slide

async def delete_historia_slide(db: AsyncSession, slide_id: int) -> bool:
    slide = await db.get(HistoriaSlide, slide_id)
    if not slide:
        return False
    await db.delete(slide)
    await db.commit()
    return True

async def reorder_historia_slides(db: AsyncSession, ids: list[int]) -> list[HistoriaSlide]:
    for i, sid in enumerate(ids):
        slide = await db.get(HistoriaSlide, sid)
        if slide:
            slide.order = i
    await db.commit()
    return await get_historia_slides(db)

# ── Momentos Favoritos ────────────────────────────────────────────────────────

async def get_momentos_favoritos(db: AsyncSession) -> list[MomentoFavorito]:
    result = await db.execute(select(MomentoFavorito).order_by(MomentoFavorito.order))
    return result.scalars().all()

async def create_momento_favorito(db: AsyncSession, photo_url: str) -> MomentoFavorito:
    momentos = await get_momentos_favoritos(db)
    m = MomentoFavorito(photo_url=photo_url, order=len(momentos))
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return m

async def delete_momento_favorito(db: AsyncSession, momento_id: int) -> bool:
    m = await db.get(MomentoFavorito, momento_id)
    if not m:
        return False
    await db.delete(m)
    await db.commit()
    return True

async def reorder_momentos_favoritos(db: AsyncSession, ids: list[int]) -> list[MomentoFavorito]:
    for i, mid in enumerate(ids):
        m = await db.get(MomentoFavorito, mid)
        if m:
            m.order = i
    await db.commit()
    return await get_momentos_favoritos(db)
```

- [ ] **Step 3: Commit**

```bash
git add app/crud.py
git commit -m "feat: add historia slides and momentos CRUD functions"
```

---

## Task 4: jime-api — Historia router

**Files:**
- Create: `app/routers/historia.py`
- Modify: `app/main.py`

Note: Define `/slides/reorder` BEFORE `/slides/{slide_id}` so FastAPI matches the exact path first.

- [ ] **Step 1: Create app/routers/historia.py**

```python
# app/routers/historia.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app import crud
from app.schemas import HistoriaSlideOut, MomentoFavoritoOut
from app.storage import maybe_upload

router = APIRouter(prefix="/historia", tags=["historia"])

# ── Slides ─────────────────────────────────────────────────────────────────────

@router.get("/slides", response_model=list[HistoriaSlideOut])
async def list_slides(db: AsyncSession = Depends(get_db)):
    return await crud.get_historia_slides(db)

@router.post("/slides/reorder")
async def reorder_slides(ids: list[int], db: AsyncSession = Depends(get_db)):
    return await crud.reorder_historia_slides(db, ids)

@router.post("/slides", response_model=HistoriaSlideOut, status_code=201)
async def create_slide(
    date: str = Form(...),
    title: str = Form(...),
    desc: str = Form(...),
    type: str = Form(...),
    emoji: str | None = Form(None),
    photo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    img_url = await maybe_upload(photo, "historia/slides") if photo else None
    return await crud.create_historia_slide(db, date, title, desc, type, img_url, emoji)

@router.patch("/slides/{slide_id}", response_model=HistoriaSlideOut)
async def update_slide(
    slide_id: int,
    date: str | None = Form(None),
    title: str | None = Form(None),
    desc: str | None = Form(None),
    type: str | None = Form(None),
    emoji: str | None = Form(None),
    photo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    img_url = await maybe_upload(photo, "historia/slides") if photo else None
    slide = await crud.update_historia_slide(db, slide_id, date, title, desc, type, img_url, emoji)
    if not slide:
        raise HTTPException(404, "Slide no encontrado")
    return slide

@router.delete("/slides/{slide_id}")
async def delete_slide(slide_id: int, db: AsyncSession = Depends(get_db)):
    ok = await crud.delete_historia_slide(db, slide_id)
    if not ok:
        raise HTTPException(404, "Slide no encontrado")
    return {"ok": True}

# ── Momentos Favoritos ─────────────────────────────────────────────────────────

@router.get("/momentos", response_model=list[MomentoFavoritoOut])
async def list_momentos(db: AsyncSession = Depends(get_db)):
    return await crud.get_momentos_favoritos(db)

@router.post("/momentos/reorder")
async def reorder_momentos(ids: list[int], db: AsyncSession = Depends(get_db)):
    return await crud.reorder_momentos_favoritos(db, ids)

@router.post("/momentos", response_model=MomentoFavoritoOut, status_code=201)
async def create_momento(
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    photo_url = await maybe_upload(photo, "historia/momentos")
    if not photo_url:
        raise HTTPException(400, "Se requiere una foto")
    return await crud.create_momento_favorito(db, photo_url)

@router.delete("/momentos/{momento_id}")
async def delete_momento(momento_id: int, db: AsyncSession = Depends(get_db)):
    ok = await crud.delete_momento_favorito(db, momento_id)
    if not ok:
        raise HTTPException(404, "Momento no encontrado")
    return {"ok": True}
```

- [ ] **Step 2: Register router in app/main.py**

In `app/main.py`, the existing imports line is:
```python
from app.routers import questions, postales, musica
```

Replace with:
```python
from app.routers import questions, postales, musica, historia
```

And after the existing `app.include_router(musica.router)` line, add:
```python
app.include_router(historia.router)
```

- [ ] **Step 3: Commit**

```bash
git add app/routers/historia.py app/main.py
git commit -m "feat: add /historia router with slides and momentos endpoints"
```

---

## Task 5: jime-api — Tests

**Files:**
- Create: `tests/test_historia.py`

The test pattern (from `tests/conftest.py`): uses `httpx.AsyncClient` with `ASGITransport`, SQLite in-memory test DB. Cloudinary uploads are patched with `unittest.mock.patch`.

- [ ] **Step 1: Write the tests**

```python
# tests/test_historia.py
import pytest
from unittest.mock import patch, AsyncMock

MOCK_URL = "https://res.cloudinary.com/test/image/upload/test.jpg"


# ── Slides ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_slides_empty(client):
    resp = await client.get("/historia/slides")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_slide_text_type(client):
    resp = await client.post(
        "/historia/slides",
        data={
            "date": "FINALES DE 2022",
            "title": "El Coro",
            "desc": "Nos conocimos en el coro.",
            "type": "text",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["date"] == "FINALES DE 2022"
    assert data["title"] == "El Coro"
    assert data["type"] == "text"
    assert data["img_url"] is None
    assert data["order"] == 0


@pytest.mark.asyncio
async def test_create_slide_with_photo(client):
    with patch("app.routers.historia.maybe_upload", return_value=MOCK_URL):
        resp = await client.post(
            "/historia/slides",
            data={"date": "2023", "title": "Foto", "desc": "desc", "type": "fullbleed"},
            files={"photo": ("test.jpg", b"fake", "image/jpeg")},
        )
    assert resp.status_code == 201
    assert resp.json()["img_url"] == MOCK_URL


@pytest.mark.asyncio
async def test_create_slide_order_increments(client):
    for i in range(3):
        resp = await client.post(
            "/historia/slides",
            data={"date": f"DATE {i}", "title": f"Title {i}", "desc": "d", "type": "text"},
        )
        assert resp.json()["order"] == i


@pytest.mark.asyncio
async def test_list_slides_ordered(client):
    for i in range(3):
        await client.post(
            "/historia/slides",
            data={"date": f"DATE {i}", "title": f"Title {i}", "desc": "d", "type": "text"},
        )
    resp = await client.get("/historia/slides")
    data = resp.json()
    assert len(data) == 3
    assert [s["order"] for s in data] == [0, 1, 2]


@pytest.mark.asyncio
async def test_update_slide(client):
    create_resp = await client.post(
        "/historia/slides",
        data={"date": "2022", "title": "Old", "desc": "d", "type": "text"},
    )
    slide_id = create_resp.json()["id"]
    resp = await client.patch(f"/historia/slides/{slide_id}", data={"title": "New"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "New"
    assert resp.json()["date"] == "2022"   # unchanged


@pytest.mark.asyncio
async def test_update_slide_not_found(client):
    resp = await client.patch("/historia/slides/9999", data={"title": "x"})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_slide(client):
    create_resp = await client.post(
        "/historia/slides",
        data={"date": "2022", "title": "T", "desc": "d", "type": "text"},
    )
    slide_id = create_resp.json()["id"]
    del_resp = await client.delete(f"/historia/slides/{slide_id}")
    assert del_resp.status_code == 200
    assert del_resp.json() == {"ok": True}
    list_resp = await client.get("/historia/slides")
    assert list_resp.json() == []


@pytest.mark.asyncio
async def test_delete_slide_not_found(client):
    resp = await client.delete("/historia/slides/9999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_reorder_slides(client):
    ids = []
    for i in range(3):
        r = await client.post(
            "/historia/slides",
            data={"date": f"D {i}", "title": f"T {i}", "desc": "d", "type": "text"},
        )
        ids.append(r.json()["id"])
    # Reverse order
    reversed_ids = list(reversed(ids))
    resp = await client.post(
        "/historia/slides/reorder",
        json=reversed_ids,
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert [s["id"] for s in data] == reversed_ids


# ── Momentos Favoritos ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_momentos_empty(client):
    resp = await client.get("/historia/momentos")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_momento(client):
    with patch("app.routers.historia.maybe_upload", return_value=MOCK_URL):
        resp = await client.post(
            "/historia/momentos",
            files={"photo": ("photo.jpg", b"fake", "image/jpeg")},
        )
    assert resp.status_code == 201
    data = resp.json()
    assert data["photo_url"] == MOCK_URL
    assert data["order"] == 0


@pytest.mark.asyncio
async def test_create_momento_order_increments(client):
    with patch("app.routers.historia.maybe_upload", return_value=MOCK_URL):
        for i in range(3):
            resp = await client.post(
                "/historia/momentos",
                files={"photo": ("p.jpg", b"x", "image/jpeg")},
            )
            assert resp.json()["order"] == i


@pytest.mark.asyncio
async def test_delete_momento(client):
    with patch("app.routers.historia.maybe_upload", return_value=MOCK_URL):
        create_resp = await client.post(
            "/historia/momentos",
            files={"photo": ("p.jpg", b"x", "image/jpeg")},
        )
    mid = create_resp.json()["id"]
    del_resp = await client.delete(f"/historia/momentos/{mid}")
    assert del_resp.status_code == 200
    assert del_resp.json() == {"ok": True}
    assert await client.get("/historia/momentos") and (await client.get("/historia/momentos")).json() == []


@pytest.mark.asyncio
async def test_delete_momento_not_found(client):
    resp = await client.delete("/historia/momentos/9999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_reorder_momentos(client):
    ids = []
    with patch("app.routers.historia.maybe_upload", return_value=MOCK_URL):
        for i in range(3):
            r = await client.post(
                "/historia/momentos",
                files={"photo": ("p.jpg", b"x", "image/jpeg")},
            )
            ids.append(r.json()["id"])
    reversed_ids = list(reversed(ids))
    resp = await client.post(
        "/historia/momentos/reorder",
        json=reversed_ids,
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert [m["id"] for m in data] == reversed_ids
```

- [ ] **Step 2: Run tests**

```bash
cd C:\Users\Datasys2\Documents\jime-api
python -m pytest tests/test_historia.py -v
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/test_historia.py
git commit -m "test: add historia slides and momentos tests"
```

---

## Task 6: jime-postales — Types + Admin link

**Files:**
- Create: `src/types/historia.ts`
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Create src/types/historia.ts**

```typescript
export interface HistoriaSlide {
  id: number;
  date: string;
  title: string;
  desc: string;
  type: "text" | "arch" | "fullbleed";
  img_url: string | null;
  emoji: string | null;
  order: number;
}

export interface MomentoFavorito {
  id: number;
  photo_url: string;
  order: number;
}
```

- [ ] **Step 2: Add link to historia admin in src/app/admin/page.tsx**

The current `page.tsx` has a `div` with `className="flex flex-col gap-4"` containing two `Link` elements (galeria and musica). Add a third link after the musica one:

```tsx
<Link
  href="/admin/historia"
  className="block bg-gradient-to-r from-cp-dark-blue to-cp-blue rounded-xl border-[2px] border-cp-blue shadow-cp p-5 hover:-translate-y-0.5 transition-all"
>
  <p className="font-pixel text-[9px] text-blue-300 mb-1">historia</p>
  <p className="font-vt text-2xl text-white">📖 Gestionar historia</p>
</Link>
```

- [ ] **Step 3: Commit**

```bash
cd C:\Users\Datasys2\Documents\jime-postales
git add src/types/historia.ts src/app/admin/page.tsx
git commit -m "feat: add historia types and admin link"
```

---

## Task 7: jime-postales — HistoriaAdmin component

**Files:**
- Create: `src/components/HistoriaAdmin.tsx`
- Create: `src/app/admin/historia/page.tsx`

The component follows the exact same inline-style pattern as `src/components/MusicAdmin.tsx`. Dark blue palette (`#060f24`, `#0a1930`, `#1a3a6e`), same `cardStyle`, `inputStyle`, `btnPrimary`, `btnSecondary`, `iconBtn` style objects, same `font-family: var(--font-nunito)`.

- [ ] **Step 1: Create src/components/HistoriaAdmin.tsx**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { HistoriaSlide, MomentoFavorito } from "@/types/historia";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Slide thumbnail ────────────────────────────────────────────────────────────

function SlideThumb({ slide }: { slide: HistoriaSlide }) {
  const typeLabel = { text: "TEXTO", arch: "ARCO", fullbleed: "FULL" }[slide.type] ?? slide.type;
  return (
    <div style={{ width: 48, height: 64, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#0a1930", border: "1px solid #1a3a6e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {slide.img_url
        ? <img src={slide.img_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : slide.emoji
          ? <span style={{ fontSize: 22 }}>{slide.emoji}</span>
          : <span style={{ fontSize: 9, color: "#556", fontFamily: "monospace", textAlign: "center", lineHeight: 1.3 }}>{typeLabel}</span>
      }
    </div>
  );
}

// ── Slide form ─────────────────────────────────────────────────────────────────

interface SlideFormProps {
  initial?: HistoriaSlide;
  onSave: (fd: FormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function SlideForm({ initial, onSave, onCancel, saving }: SlideFormProps) {
  const [date, setDate] = useState(initial?.date ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [type, setType] = useState<"text" | "arch" | "fullbleed">(initial?.type ?? "text");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "");
  const photoRef = useRef<HTMLInputElement>(null);

  async function handle() {
    const fd = new FormData();
    if (initial) {
      if (date !== initial.date) fd.append("date", date);
      if (title !== initial.title) fd.append("title", title);
      if (desc !== initial.desc) fd.append("desc", desc);
      if (type !== initial.type) fd.append("type", type);
      if (emoji !== (initial.emoji ?? "")) fd.append("emoji", emoji);
    } else {
      fd.append("date", date);
      fd.append("title", title);
      fd.append("desc", desc);
      fd.append("type", type);
      if (emoji.trim()) fd.append("emoji", emoji.trim());
    }
    if (photoRef.current?.files?.[0]) fd.append("photo", photoRef.current.files[0]);
    await onSave(fd);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label style={labelStyle}>
        Fecha (texto libre, ej: "FINALES DE 2022")
        <input style={inputStyle} value={date} onChange={e => setDate(e.target.value)} placeholder="FINALES DE 2022" />
      </label>
      <label style={labelStyle}>
        Título (usá \n para salto de línea)
        <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="El Coro" />
      </label>
      <label style={labelStyle}>
        Descripción
        <textarea
          style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Nos conocimos en el coro..."
        />
      </label>
      <label style={labelStyle}>
        Tipo de slide
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={type}
          onChange={e => setType(e.target.value as "text" | "arch" | "fullbleed")}
        >
          <option value="text">texto — solo tipografía, fondo crema</option>
          <option value="arch">arco — foto/emoji en arco + texto</option>
          <option value="fullbleed">fullbleed — foto a pantalla completa</option>
        </select>
      </label>
      {(type === "arch") && (
        <label style={labelStyle}>
          Emoji (opcional, se muestra si no hay foto)
          <input style={inputStyle} value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🎵" maxLength={4} />
        </label>
      )}
      <label style={labelStyle}>
        Foto {initial?.img_url ? "(opcional — reemplaza la actual)" : "(opcional)"}
        {initial?.img_url && (
          <div style={{ marginTop: 4 }}>
            <img src={initial.img_url} alt="" style={{ height: 60, borderRadius: 6, objectFit: "cover" }} />
          </div>
        )}
        <input ref={photoRef} type="file" accept="image/*" style={fileInputStyle} />
      </label>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button style={btnPrimary} onClick={handle} disabled={saving || !date.trim() || !title.trim() || !desc.trim()}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button style={btnSecondary} onClick={onCancel} disabled={saving}>Cancelar</button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function HistoriaAdmin() {
  const [tab, setTab] = useState<"slides" | "momentos">("slides");
  const [slides, setSlides] = useState<HistoriaSlide[]>([]);
  const [momentos, setMomentos] = useState<MomentoFavorito[]>([]);

  const [showAddSlide, setShowAddSlide] = useState(false);
  const [editSlideId, setEditSlideId] = useState<number | null>(null);
  const [savingSlide, setSavingSlide] = useState(false);

  const [uploadingMomento, setUploadingMomento] = useState(false);
  const momentoRef = useRef<HTMLInputElement>(null);

  async function loadSlides() {
    const r = await fetch(`${API}/historia/slides`);
    if (r.ok) setSlides(await r.json());
  }

  async function loadMomentos() {
    const r = await fetch(`${API}/historia/momentos`);
    if (r.ok) setMomentos(await r.json());
  }

  useEffect(() => { loadSlides(); loadMomentos(); }, []);

  // ── Slide handlers ────────────────────────────────────────────────────────────

  async function handleAddSlide(fd: FormData) {
    setSavingSlide(true);
    await fetch(`${API}/historia/slides`, { method: "POST", body: fd });
    setSavingSlide(false);
    setShowAddSlide(false);
    loadSlides();
  }

  async function handleEditSlide(id: number, fd: FormData) {
    setSavingSlide(true);
    await fetch(`${API}/historia/slides/${id}`, { method: "PATCH", body: fd });
    setSavingSlide(false);
    setEditSlideId(null);
    loadSlides();
  }

  async function handleDeleteSlide(id: number) {
    if (!confirm("¿Eliminar este slide?")) return;
    await fetch(`${API}/historia/slides/${id}`, { method: "DELETE" });
    loadSlides();
  }

  async function moveSlide(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[target]] = [newSlides[target], newSlides[index]];
    setSlides(newSlides);
    await fetch(`${API}/historia/slides/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSlides.map(s => s.id)),
    });
    loadSlides();
  }

  // ── Momento handlers ──────────────────────────────────────────────────────────

  async function handleUploadMomento() {
    const file = momentoRef.current?.files?.[0];
    if (!file) return;
    setUploadingMomento(true);
    const fd = new FormData();
    fd.append("photo", file);
    await fetch(`${API}/historia/momentos`, { method: "POST", body: fd });
    setUploadingMomento(false);
    if (momentoRef.current) momentoRef.current.value = "";
    loadMomentos();
  }

  async function handleDeleteMomento(id: number) {
    if (!confirm("¿Eliminar esta foto?")) return;
    await fetch(`${API}/historia/momentos/${id}`, { method: "DELETE" });
    loadMomentos();
  }

  async function moveMomento(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= momentos.length) return;
    const newMomentos = [...momentos];
    [newMomentos[index], newMomentos[target]] = [newMomentos[target], newMomentos[index]];
    setMomentos(newMomentos);
    await fetch(`${API}/historia/momentos/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMomentos.map(m => m.id)),
    });
    loadMomentos();
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "var(--font-nunito)", color: "#cde" }}>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderRadius: 12, overflow: "hidden", border: "2px solid #1a3a6e" }}>
        {(["slides", "momentos"] as const).map(t => (
          <button
            key={t}
            style={{
              flex: 1, padding: "12px 0", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
              fontFamily: "var(--font-nunito)",
              background: tab === t ? "linear-gradient(to right, #0d2a5e, #15306a)" : "#060f24",
              color: tab === t ? "#1DB954" : "#88a",
              borderBottom: tab === t ? "2px solid #1DB954" : "2px solid transparent",
            }}
            onClick={() => setTab(t)}
          >
            {t === "slides" ? "📖 Slides" : "🖼️ Momentos Favoritos"}
          </button>
        ))}
      </div>

      {/* ── Slides tab ─────────────────────────────────────────────────────────── */}
      {tab === "slides" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ margin: 0, color: "#88a", fontSize: 13 }}>{slides.length} slide{slides.length !== 1 ? "s" : ""}</p>
            {!showAddSlide && (
              <button style={btnPrimary} onClick={() => setShowAddSlide(true)}>+ Agregar slide</button>
            )}
          </div>

          {showAddSlide && (
            <div style={cardStyle}>
              <p style={sectionTitle}>Nuevo slide</p>
              <SlideForm onSave={handleAddSlide} onCancel={() => setShowAddSlide(false)} saving={savingSlide} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {slides.map((slide, i) => (
              <div key={slide.id}>
                {editSlideId === slide.id ? (
                  <div style={cardStyle}>
                    <p style={sectionTitle}>Editar — {slide.title}</p>
                    <SlideForm
                      initial={slide}
                      onSave={(fd) => handleEditSlide(slide.id, fd)}
                      onCancel={() => setEditSlideId(null)}
                      saving={savingSlide}
                    />
                  </div>
                ) : (
                  <div style={{ ...cardStyle, flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#556", fontSize: 12, minWidth: 24, textAlign: "center", fontFamily: "monospace" }}>
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <SlideThumb slide={slide} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {slide.title.replace(/\\n/g, " / ")}
                      </p>
                      <p style={{ margin: "2px 0 0", color: "#88a", fontSize: 11, fontFamily: "monospace" }}>
                        {slide.date} · {slide.type}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button style={iconBtn} onClick={() => moveSlide(i, -1)} disabled={i === 0} title="Subir">↑</button>
                      <button style={iconBtn} onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} title="Bajar">↓</button>
                      <button style={iconBtn} onClick={() => setEditSlideId(slide.id)} title="Editar">✏</button>
                      <button style={{ ...iconBtn, color: "#e55" }} onClick={() => handleDeleteSlide(slide.id)} title="Eliminar">✕</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {slides.length === 0 && !showAddSlide && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#556" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
              <p style={{ margin: 0, fontSize: 14 }}>No hay slides todavía</p>
            </div>
          )}
        </div>
      )}

      {/* ── Momentos tab ──────────────────────────────────────────────────────── */}
      {tab === "momentos" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ margin: 0, color: "#88a", fontSize: 13 }}>{momentos.length} foto{momentos.length !== 1 ? "s" : ""}</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                ref={momentoRef}
                type="file"
                accept="image/*"
                style={fileInputStyle}
                onChange={handleUploadMomento}
                disabled={uploadingMomento}
              />
              {uploadingMomento && <span style={{ fontSize: 12, color: "#88a" }}>Subiendo...</span>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {momentos.map((m, i) => (
              <div key={m.id} style={{ ...cardStyle, flexDirection: "row", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#556", fontSize: 12, minWidth: 20, textAlign: "center", fontFamily: "monospace" }}>{i + 1}</span>
                <div style={{ width: 72, height: 52, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#0a1930" }}>
                  <img src={m.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#556", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.photo_url.split("/").pop()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button style={iconBtn} onClick={() => moveMomento(i, -1)} disabled={i === 0} title="Subir">↑</button>
                  <button style={iconBtn} onClick={() => moveMomento(i, 1)} disabled={i === momentos.length - 1} title="Bajar">↓</button>
                  <button style={{ ...iconBtn, color: "#e55" }} onClick={() => handleDeleteMomento(m.id)} title="Eliminar">✕</button>
                </div>
              </div>
            ))}
          </div>

          {momentos.length === 0 && !uploadingMomento && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#556" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🖼️</div>
              <p style={{ margin: 0, fontSize: 14 }}>No hay fotos todavía. Subí una con el selector de arriba.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "#060f24",
  border: "2px solid #1a3a6e",
  borderRadius: 12,
  padding: "14px 16px",
  display: "flex",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#88bbee",
};

const labelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#88a",
};

const inputStyle: React.CSSProperties = {
  background: "#0a1930", border: "2px solid #1a3a6e", borderRadius: 8,
  padding: "8px 12px", color: "#cde", fontSize: 14, outline: "none",
};

const fileInputStyle: React.CSSProperties = {
  background: "#0a1930", border: "2px solid #1a3a6e", borderRadius: 8,
  padding: "6px 12px", color: "#88a", fontSize: 12,
};

const btnPrimary: React.CSSProperties = {
  background: "linear-gradient(to right,#0d2a5e,#15306a)",
  border: "2px solid #1DB954", borderRadius: 10,
  color: "#1DB954", fontWeight: 700, fontSize: 13,
  padding: "8px 20px", cursor: "pointer",
  fontFamily: "var(--font-nunito)",
};

const btnSecondary: React.CSSProperties = {
  background: "transparent", border: "2px solid #1a3a6e",
  borderRadius: 10, color: "#88a",
  fontWeight: 600, fontSize: 13,
  padding: "8px 16px", cursor: "pointer",
  fontFamily: "var(--font-nunito)",
};

const iconBtn: React.CSSProperties = {
  background: "#0a1930", border: "1px solid #1a3a6e",
  borderRadius: 6, color: "#88bbee",
  width: 30, height: 30, cursor: "pointer",
  fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
};
```

- [ ] **Step 2: Create src/app/admin/historia/page.tsx**

```tsx
import Link from "next/link";
import HistoriaAdmin from "@/components/HistoriaAdmin";

export default function AdminHistoriaPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-cp-dark-blue to-cp-blue rounded-2xl border-[3px] border-cp-blue shadow-cp p-5 text-center mb-8">
          <p className="font-pixel text-[9px] text-white leading-loose">admin · historia ★</p>
          <p className="font-vt text-xl text-blue-200">gestionar slides & momentos 📖</p>
        </div>

        <HistoriaAdmin />

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

- [ ] **Step 3: Commit**

```bash
cd C:\Users\Datasys2\Documents\jime-postales
git add src/components/HistoriaAdmin.tsx src/app/admin/historia/page.tsx
git commit -m "feat: add HistoriaAdmin component and page"
```

---

## Task 8: web-jime — Make HistoriaWrapped data-driven

**Files:**
- Modify: `src/components/HistoriaWrapped.tsx`

The current component has a hardcoded `MOMENTS` constant. Replace it with a state that fetches from jime-api. The API returns `HistoriaSlideOut` which has `img_url` instead of `img` — map it when loading.

The existing `Momento` type stays the same. The `num` field is computed from array index.

- [ ] **Step 1: Add API_URL constant and fetch state to HistoriaWrapped.tsx**

At the top of the file, after the imports line, add:
```tsx
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";
```

Remove the entire `MOMENTS` constant (lines 30-47 in the current file):
```tsx
/* ─── Momentos (reemplazar con datos reales) ──────────────────────────── */
const MOMENTS: Momento[] = [
  ...
];
```

- [ ] **Step 2: Update the component state and add fetch logic**

In `HistoriaWrapped`, change the component body. The existing state is:
```tsx
const [mounted, setMounted]       = useState(false);
const [idx, setIdx]               = useState(0);
const [prevIdx, setPrevIdx]       = useState<number | null>(null);
const [direction, setDirection]   = useState<1 | -1>(1);
const [transitioning, setTrans]   = useState(false);
```

Add two new state variables after `mounted`:
```tsx
const [moments, setMoments]       = useState<Momento[]>([]);
const [loading, setLoading]       = useState(true);
```

Add this useEffect after the existing `useEffect(() => { setMounted(true); }, [])`:
```tsx
useEffect(() => {
  fetch(`${API}/historia/slides`)
    .then(r => r.json())
    .then((data: Array<{ id: number; date: string; title: string; desc: string; type: string; img_url: string | null; emoji?: string | null; order: number }>) => {
      setMoments(data.map((s, i) => ({
        num: String(i + 1).padStart(2, "0") + ".",
        date: s.date,
        title: s.title,
        desc: s.desc,
        type: s.type as "text" | "arch" | "fullbleed",
        img: s.img_url ?? undefined,
        emoji: s.emoji ?? undefined,
      })));
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);
```

Replace every reference to `MOMENTS` in the component with `moments`:
- `const total = MOMENTS.length;` → `const total = moments.length;`
- `{MOMENTS.map((_, i) => (` → `{moments.map((_, i) => (`
- `{renderSlide(MOMENTS[prevIdx])}` → `{renderSlide(moments[prevIdx])}`
- `{renderSlide(MOMENTS[idx])}` → `{renderSlide(moments[idx])}`

- [ ] **Step 3: Add loading/empty state**

The existing early return is `if (!mounted) return null;`. Expand this section:
```tsx
if (!mounted) return null;
```

The loading/empty state renders inside the portal. After the `if (!mounted) return null;` check, add logic to show loading inside the existing portal structure. Replace the early return and find the line that starts the portal return. Modify the slide content area to show loading when needed:

In the portal's slides div (currently `<div style={{ position: "absolute", inset: 0 }}>...`), add a loading overlay that shows when `loading || moments.length === 0`:

```tsx
{/* ── Loading / empty state ── */}
{(loading || moments.length === 0) && (
  <div style={{
    position: "absolute", inset: 0, background: CREAM,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 12,
  }}>
    <span style={{ fontFamily: PF, fontSize: 48, fontStyle: "italic", color: TERRA }}>
      {loading ? "..." : "♥"}
    </span>
    <p style={{ fontFamily: GS, fontSize: 14, color: MUTED, margin: 0 }}>
      {loading ? "Cargando nuestra historia..." : "No hay momentos todavía."}
    </p>
  </div>
)}
```

Place this inside the `<div style={{ position: "absolute", inset: 0 }}>` block, before the `{prevIdx !== null && ...}` block.

- [ ] **Step 4: Guard navigate() calls against empty moments**

In the `navigate` function, the existing check is:
```tsx
if (next < 0 || next >= total || transitioning) return;
```

Since `total = moments.length`, when moments is empty `total` is 0 and `next >= 0` will always be true — navigation won't fire. No change needed.

- [ ] **Step 5: Run dev server and verify**

```bash
cd C:\Users\Datasys2\Documents\web-jime
npm run dev
```

Open `/historia`, click "Ver nuestra historia ▶". Should show loading state, then slides from API (or empty state if no slides in DB yet).

- [ ] **Step 6: Commit**

```bash
git add src/components/HistoriaWrapped.tsx
git commit -m "feat: make HistoriaWrapped fetch slides from jime-api"
```

---

## Task 9: web-jime — Make photo grid data-driven

**Files:**
- Modify: `src/components/HistoriaTimeline.tsx`

The current component has `const GRID_IMGS = [...]` with 6 Unsplash URLs. Replace with a state fetched from jime-api. Show the Unsplash placeholders while loading so the layout doesn't jump.

- [ ] **Step 1: Add API_URL and grid state**

After `"use client";` import section, add:
```tsx
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api-web-jime-production.up.railway.app";
```

Remove the entire `GRID_IMGS` constant (the array of 6 Unsplash URLs).

- [ ] **Step 2: Add state in the component**

In `HistoriaTimeline`, add these state and effect after the existing `const [wrappedOpen, setWrappedOpen] = useState(false);`:

```tsx
const [gridImgs, setGridImgs] = useState<string[]>([]);

useEffect(() => {
  fetch(`${API}/historia/momentos`)
    .then(r => r.json())
    .then((data: Array<{ id: number; photo_url: string; order: number }>) => {
      setGridImgs(data.map(m => m.photo_url));
    })
    .catch(() => {});
}, []);
```

- [ ] **Step 3: Update photo grid render**

In the photo grid section, the current code maps over `GRID_IMGS.slice(0, 3)` and `GRID_IMGS.slice(3, 6)`. The grid layout uses CSS grid with `gridTemplateColumns` overrides via className. Keep the existing grid structure but replace the data source.

When `gridImgs` has fewer than 6 photos, show placeholder divs for the missing slots. Replace both `GRID_IMGS.slice(0, 3)` and `GRID_IMGS.slice(3, 6)` references with `gridImgs` padded to 6 items:

Before the grid section, compute:
```tsx
const paddedGrid = [...gridImgs, ...Array(Math.max(0, 6 - gridImgs.length)).fill("")];
```

Then change `GRID_IMGS.slice(0, 3)` to `paddedGrid.slice(0, 3)` and `GRID_IMGS.slice(3, 6)` to `paddedGrid.slice(3, 6)`.

In the map render, handle empty string as a placeholder:
```tsx
{paddedGrid.slice(0, 3).map((src, i) => (
  <div key={i} style={{ height: 250, overflow: "hidden", background: "#e0d5cc" }}>
    {src ? (
      <Img
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      />
    ) : (
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #e8ddd5, #d4c8bc)" }} />
    )}
  </div>
))}
```

Apply the same pattern for `paddedGrid.slice(3, 6)`.

- [ ] **Step 4: Commit**

```bash
git add src/components/HistoriaTimeline.tsx
git commit -m "feat: make photo grid fetch momentos from jime-api"
```

---

## Self-Review

**Spec coverage:**
- ✅ Admin panel in jime-postales: Task 6 + 7
- ✅ Create/edit slides with photo upload: Task 7 (SlideForm with all fields)
- ✅ Slide ordering/reordering: Task 7 (↑/↓ buttons + reorder endpoint)
- ✅ Momentos favoritos management (upload/reorder/delete): Task 7 (momentos tab)
- ✅ API endpoints: Task 4 (all CRUD + reorder for both)
- ✅ HistoriaWrapped data-driven: Task 8
- ✅ Photo grid data-driven: Task 9
- ✅ Cloudinary upload via existing `maybe_upload`: Task 4
- ✅ Tests: Task 5

**Placeholder scan:** None found.

**Type consistency:**
- `HistoriaSlide.type` is `"text" | "arch" | "fullbleed"` in TypeScript (Task 6) and `String(20)` in Python model (Task 1) — consistent.
- `img_url` (API) → `img` (Momento type in HistoriaWrapped) mapping is done in Task 8's fetch.
- `num` is computed from index in both HistoriaAdmin (display) and HistoriaWrapped (Momento type) — consistent.
- `maybe_upload` import path in `historia.py` matches `app/storage.py` — consistent.
