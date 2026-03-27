# Diseño — Jime Cumpleaños (Postales + API)

**Fecha:** 2026-03-26
**Ocasión:** Cumpleaños de Jimena
**Estilo visual:** Club Penguin + Instagram + Polaroid scrapbook 2000s

---

## 1. Estructura de proyectos

Tres carpetas separadas, cada una con su propio repo/deploy:

```
web-jime/        ← web existente (Next.js 14) — solo se añade link a jime-postales
jime-postales/   ← nuevo frontend del formulario y galería (Next.js 14)
jime-api/        ← backend (FastAPI + PostgreSQL en Railway)
```

---

## 2. jime-postales — Frontend

### Tecnologías
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Fuentes: Press Start 2P, VT323, Nunito, Caveat (Google Fonts)
- Deploy: Railway (o Vercel)

### Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Bienvenida con botón "Dejar mi tributo" |
| `/form` | Formulario multi-paso (4 pasos) |
| `/galeria` | Pared de polaroids — todos los tributos |
| `/galeria/[id]` | Tarjeta completa de un tributo |

### Formulario `/form` — 4 pasos

**Paso 1 — Perfil**
- Upload foto de perfil (preview circular con ring degradado Instagram)
- Input nombre / nickname

**Paso 2 — Preguntas**
- Se muestran 5 preguntas aleatorias de las 15 definidas
- Botón "Llenar otra pregunta" → aparece una pregunta nueva (no mostrada antes) debajo de las actuales, sin reemplazar las anteriores
- Las respuestas ya escritas se conservan al pedir nuevas preguntas
- Cada pregunta: burbuja azul CP con el texto, textarea de respuesta abajo (estilo Ask.fm)
- El usuario puede seguir pidiendo preguntas hasta agotar las 15; el botón desaparece cuando no hay más

**Paso 3 — Video**
- Upload de video (MP4/MOV, máx 90 segundos / 1:30)
- Preview del video antes de enviar

**Paso 4 — Fotos**
- Grid 3×3 estilo Instagram
- Hasta 6 fotos adicionales
- Botón "+" para añadir más

**Confirmación**
- Animación de pingüino Club Penguin
- Mensaje de éxito con confeti/nieve

### Galería `/galeria`

- **Vista principal:** pared de polaroids (fotos inclinadas con ángulos alternados, nombre en fuente Caveat manuscrita)
- **Al hacer click en un polaroid:** navega a `/galeria/[id]`

### Tarjeta completa `/galeria/[id]`

- Avatar circular con ring degradado Instagram
- Nombre/nickname
- Respuestas a preguntas (formato Ask.fm: burbuja de pregunta + respuesta)
- Tira de fotos estilo Instagram (grid 3×3)
- Reproductor de video embebido

### Estilo visual

- **Fondo:** degradado cielo Club Penguin (`#c8eeff → #e8f7ff`)
- **Cards:** fondo blanco, borde `#2896e0`, sombra sólida `0 4px 0 #0d4a8a`
- **Header:** azul CP con texto Press Start 2P y pingüino decorativo
- **Preguntas:** burbuja azul oscuro (estilo ask.fm), textarea sin borde visible
- **Fotos:** grid Instagram con slots `aspect-ratio: 1`
- **Polaroids:** fondo blanco, padding inferior grande, rotación alternada, sombra suave, nombre en Caveat

---

## 3. jime-api — Backend

### Tecnologías
- Python 3.12, FastAPI, SQLAlchemy (async), Alembic
- PostgreSQL en Railway
- Archivos (fotos/video) → **Cloudflare R2** (S3-compatible, gratis hasta 10 GB/mes)
- Deploy: Railway

### Modelos de base de datos

```sql
Question     (id, text)
Postal      (id, name, profile_photo_url, video_url, created_at)
Answer       (id, postal_id FK, question_id FK, answer_text)
Photo        (id, postal_id FK, photo_url, order)
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/questions/random?count=5&exclude=1,3,7` | Preguntas aleatorias excluyendo IDs |
| POST | `/postales` | Crear tributo completo (multipart/form-data) |
| GET | `/postales` | Listar todos los tributos (para galería) |
| GET | `/postales/{id}` | Detalle de un tributo |

**`POST /postales` recibe:**
- `name` (str)
- `profile_photo` (file)
- `video` (file, opcional)
- `photos[]` (files, hasta 6)
- `answers[]` (JSON: [{question_id, answer_text}])

**Flujo de archivos:**
1. API recibe el archivo
2. Lo sube a Cloudflare R2
3. Guarda la URL pública en PostgreSQL
4. Devuelve el tributo creado con todas las URLs

### CORS
Permitir origen de `jime-postales` en producción y `localhost:3000` en desarrollo.

---

## 4. Preguntas definidas (15 fijas)

1. ¿Cuál es tu recuerdo favorito con Jime?
2. ¿Cómo fue que se conocieron?
3. ¿Qué canción o película te recuerda a ella?
4. Del 1 al 10, ¿qué tan random es Jimena? (y justificá tu respuesta)
5. ¿Qué cosa rara o peculiar solo Jime haría?
6. ¿Qué es lo que más admiras de Jime?
7. ¿Qué superpoder crees que tiene Jime en la vida real?
8. Si Jime fuera un personaje de videojuego/película, ¿quién sería y por qué?
9. ¿En qué es Jime mejor que nadie que conozcas?
10. ¿Qué le deseas a Jime para este año?
11. ¿Qué aventura te gustaría vivir con ella que todavía no han hecho?
12. ¿Qué consejo le darías a Jime para esta nueva vuelta al sol?
13. Del 1 al 10, ¿qué tan buena amiga es Jime? ¿Por qué?
14. Del 1 al 10, ¿qué tan dramática es Jime? Danos los detalles.
15. ¿Cuál es el meme que más la representa?

---

## 5. Cambios a web-jime

- Añadir un botón/link en el menú principal que apunte a la URL de `jime-postales`
- Sin cambios estructurales al proyecto existente

---

## 6. Variables de entorno necesarias

**jime-api:**
```
DATABASE_URL=postgresql+asyncpg://...
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
CORS_ORIGINS=https://jime-postales.up.railway.app
```

**jime-postales:**
```
NEXT_PUBLIC_API_URL=https://jime-api.up.railway.app
```
