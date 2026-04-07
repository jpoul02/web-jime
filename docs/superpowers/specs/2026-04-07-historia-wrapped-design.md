# Historia Wrapped — Spec de Diseño

**Fecha:** 2026-04-07  
**Proyecto:** web-jime  
**Ruta afectada:** `/historia`

---

## Resumen

Convertir la sección Historia en una experiencia tipo "Wrapped": un overlay fullscreen con slides que el usuario navega uno a uno, mostrando los momentos más importantes de la historia de Jime. La página `/historia` existente se simplifica (se elimina la timeline de scroll con los 4 eventos de Unsplash) y gana un botón "Modo Wrapped" que abre el overlay.

---

## Arquitectura

### Archivos modificados
- `src/components/HistoriaTimeline.tsx` — se elimina la sección `TIMELINE` (los 4 eventos + lógica de scroll). Se agrega estado `wrappedOpen` y botón "▶ MODO WRAPPED" en la zona del hero. Se importa `HistoriaWrapped`.
- `src/components/HistoriaWrapped.tsx` — **nuevo**. Componente autocontenido con el array `MOMENTS`, toda la lógica de navegación, y el overlay renderizado con `createPortal`.

### Página `/historia` resultante
1. **Nav** — sin cambios
2. **Hero** — sin cambios visuales; se agrega botón "▶ MODO WRAPPED" sobre el texto del hero
3. ~~**Timeline de scroll**~~ — **eliminada**
4. **Quote** — sin cambios (`"Dicen que una foto vale más..."`)
5. **Photo grid** — sin cambios (6 fotos Unsplash decorativas)
6. **Footer oscuro** — sin cambios

---

## Modelo de datos

```ts
type Momento = {
  num: string;     // "01."
  date: string;    // "15 MAR 2020"
  title: string;   // puede incluir \n para saltos de línea
  desc: string;
  type: "text" | "arch" | "fullbleed";
  img?: string;    // URL de foto (opcional en todos los tipos)
  emoji?: string;  // fallback visual si no hay img (principalmente para "arch")
};
```

El array `MOMENTS` comienza con placeholders de emoji que el usuario reemplaza con datos reales. Se define en `HistoriaWrapped.tsx`.

**Reglas por tipo:**
- `"text"` — solo tipografía, ignora `img` y `emoji`
- `"arch"` — muestra `img` en arco si existe; si no, muestra `emoji`; si no hay ninguno, placeholder crema
- `"fullbleed"` — usa `img` como fondo full-bleed; si no hay `img`, usa gradiente crema-terracota oscuro

---

## Overlay

- Renderizado con `createPortal` sobre `document.body`
- `position: fixed; inset: 0; z-index: 9999`
- `document.body` recibe `overflow: hidden` mientras el overlay está abierto (se restaura al cerrar)
- Transición entre slides: fade suave (opacity 0→1, 250ms)

### Layout del overlay
```
┌────────────────────────────────────────────┐
│ ████████░░░░░░░░░░░░░░░  ← progress bar (2px, top)
│  ✕                   03 / 12  ← contador   │
│                                            │
│          [contenido del slide]             │
│                                            │
│  ←  [zona clic izq]  [zona clic der]  →   │
│             • • ● • •  ← dots             │
└────────────────────────────────────────────┘
```

---

## Navegación

Todos los métodos activos simultáneamente:

| Método | Acción |
|--------|--------|
| Botón `←` visible (borde izq) | Slide anterior |
| Botón `→` visible (borde der) | Slide siguiente |
| Clic mitad izquierda del slide | Slide anterior |
| Clic mitad derecha del slide | Slide siguiente |
| Swipe izquierda (touch) | Slide siguiente |
| Swipe derecha (touch) | Slide anterior |
| `ArrowLeft` | Slide anterior |
| `ArrowRight` | Slide siguiente |
| `Escape` | Cerrar overlay |
| Botón `✕` | Cerrar overlay |

En el primer slide, el botón `←` y el clic en mitad izquierda no hacen nada (sin wrap-around). Igual para el último slide con `→`.

---

## Tres renderers de slide

### `SlideText` — `type: "text"`
- Fondo: `#F3EBE2` (crema)
- Centrado vertical
- Estructura: `número (64px italic terracota)` → `fecha (9px monospace muted)` → `línea 32px terracota` → `título (Playfair Display italic 26px)` → `descripción (13px muted)`

### `SlideArch` — `type: "arch"`
- Igual que `SlideText` pero con elemento visual encima del número:
  - Si `img`: foto en arco (110×145px, `border-radius: 55px 55px 0 0`, `object-fit: cover`)
  - Si `emoji`: emoji en 48px
  - Si ninguno: div placeholder crema con borde punteado terracota
- El número se reduce a 52px para dar espacio al arco

### `SlideFullbleed` — `type: "fullbleed"`
- Si `img`: background-image cover, `objectPosition: center`
- Si no `img`: gradiente `linear-gradient(160deg, #3a2a20, #8D7B71)`
- Overlay: `linear-gradient(to top, rgba(26,26,26,0.92) 0%, rgba(26,26,26,0.35) 55%, transparent 100%)`
- Texto alineado abajo-izquierda con padding `24px 28px`
- Colores: número terracota, fecha `rgba(197,190,182,0.7)`, título blanco, descripción `rgba(197,190,182,0.8)`

### Elementos compartidos (todos los tipos)
- **Progress bar** — top, 2px, fondo `#D4C8BC`, fill `#D4916E`, ancho = `(índice+1)/total * 100%`
- **Contador** — top-right, `"03 / 12"`, 9px monospace muted
- **Botón cerrar `✕`** — top-left, 32×32px
- **Dots** — bottom-center, dot activo se alarga a 14px (pill shape), terracota
- **Zonas de clic** — dos divs absolutos `width: 50%; height: 100%; cursor: pointer`, z-index sobre el contenido pero debajo de los botones

---

## Tokens visuales (consistentes con Historia actual)

```ts
const PF    = "'Playfair Display', Georgia, serif";
const GM    = "var(--font-geist-mono), 'Courier New', monospace";
const GS    = "var(--font-geist-sans), sans-serif";
const TERRA = "#D4916E";
const MUTED = "#C5BEB6";
const CREAM = "#F3EBE2";
const DARK  = "#1A1A1A";
const MID   = "#3D3D3D";
```

---

## Comportamiento del botón de apertura

En el hero de `HistoriaTimeline`, sobre el texto "Scroll →", se reemplaza o se agrega:

```
▶ MODO WRAPPED
```

Estilo: `font-family: GM`, `font-size: 11px`, `letter-spacing: 3px`, `color: TERRA`, cursor pointer, sin subrayado. Al hacer clic establece `wrappedOpen = true`.

---

## Fuera de scope

- Persistencia del índice (siempre empieza en slide 1)
- Compartir slides individuales
- Animaciones de entrada por elemento (solo fade del slide completo)
- Carga de momentos desde API
