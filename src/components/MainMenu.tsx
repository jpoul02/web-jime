"use client";

const POSTALES_URL = process.env.NEXT_PUBLIC_POSTALES_URL ?? "http://localhost:3001";

// Imágenes de Figma — expiran en 7 días, reemplazá con assets locales
const tiles = [
  "https://www.figma.com/api/mcp/asset/3b2896ca-1c26-4632-85e8-a647024e8f16",
  "https://www.figma.com/api/mcp/asset/68d8a21c-b903-48ca-b7c6-f6e340ebad8e",
  "https://www.figma.com/api/mcp/asset/1db3ec20-6d1f-438c-bd56-be59bf49289a",
  "https://www.figma.com/api/mcp/asset/8e7dc107-19ab-4665-86e8-5ef6d120f0aa",
  "https://www.figma.com/api/mcp/asset/634581db-334f-4145-8d18-9108f902ed2a",
  "https://www.figma.com/api/mcp/asset/efc3fa72-c23c-4ee8-a672-4fcce2315dd2",
  "https://www.figma.com/api/mcp/asset/4d0114e6-1c53-468b-b927-7afbf290b761",
  "https://www.figma.com/api/mcp/asset/f1e1b230-12cd-4892-8713-7b4344deba0e",
  "https://www.figma.com/api/mcp/asset/83035796-f8cc-4dff-8fc2-9ffa743c8e5c",
];

const toolbarIcons = [
  "https://www.figma.com/api/mcp/asset/22256754-f597-4d98-860a-1a9e3f2fc7e0",
  "https://www.figma.com/api/mcp/asset/888a5e97-279d-48a7-a8f5-db339860934f",
  "https://www.figma.com/api/mcp/asset/26fa2cfa-5b6a-41fa-b447-8e38304a23af",
  "https://www.figma.com/api/mcp/asset/7b0527c6-0aae-40f9-911a-8bca912998d1",
];

const toolbarIconsRight = [
  "https://www.figma.com/api/mcp/asset/76b3da0b-0acf-427e-af28-26ea7a743670",
  "https://www.figma.com/api/mcp/asset/2f364c55-e808-4a65-a857-95540b941365",
  "https://www.figma.com/api/mcp/asset/5aa9d8f3-a1d2-4826-bcad-f152dff35cb2",
];

const navIconLeft  = "https://www.figma.com/api/mcp/asset/089533c1-09ac-4714-a34f-2ced636e3295";
const navIconRight = "https://www.figma.com/api/mcp/asset/53817265-a535-4dce-bc8a-8644f6255ac8";

export default function MainMenu({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed inset-0 bg-[#c8c4bc] flex flex-col transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div
        className="w-full h-[41px] flex items-center px-4 gap-2 shrink-0 border-b border-black/[0.18] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.12)]"
        style={{ background: "linear-gradient(to bottom, #bab6ae, #a8a49c)" }}
      >
        {/* Botones izquierda */}
        <div className="flex gap-2">
          {toolbarIcons.map((src, i) => (
            <button
              key={i}
              className="relative w-[34px] h-[28px] bg-[#d4d0c8] border border-black/[0.12] rounded-[7px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden"
            >
              <img src={src} alt="" className="w-[14px] h-[14px] object-contain" />
              <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.4)] pointer-events-none" />
            </button>
          ))}
        </div>

        {/* Espaciador */}
        <div className="flex-1" />

        {/* Botones derecha */}
        <div className="flex gap-2">
          {toolbarIconsRight.map((src, i) => (
            <button
              key={i}
              className="relative w-[34px] h-[28px] bg-[#d4d0c8] border border-black/[0.12] rounded-[7px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden"
            >
              <img src={src} alt="" className="w-[18px] h-[18px] object-contain" />
              <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.4)] pointer-events-none" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido central ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">

        <div className="flex items-center gap-4 w-full max-w-3xl">
          {/* Flecha izquierda */}
          <button className="w-[34px] h-[34px] bg-black/[0.04] border border-black/[0.12] rounded-[17px] flex items-center justify-center opacity-30 shrink-0">
            <img src={navIconLeft} alt="anterior" className="w-[14px] h-[14px] object-contain" />
          </button>

          {/* Grid de tiles */}
          <div className="flex-1 grid grid-cols-5 grid-rows-2 gap-[14px]">
            {tiles.map((src, i) => (
              <button
                key={i}
                className="relative bg-white border border-black/[0.1] rounded-[22px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.22),0px_1px_3px_0px_rgba(0,0,0,0.12)] overflow-hidden aspect-square hover:scale-105 transition-transform duration-150"
              >
                {/* Imagen */}
                <div className="absolute inset-[8px] border-2 border-[#e4e4e4] rounded-[13px] overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]">
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_3px_0px_rgba(0,0,0,0.1)] pointer-events-none" />
                </div>
                {/* Brillo superior */}
                <div
                  className="absolute top-0 left-0 right-0 h-[48%] rounded-t-[22px] pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.1))" }}
                />
                <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] pointer-events-none" />
              </button>
            ))}
          </div>

          {/* Flecha derecha */}
          <button className="w-[34px] h-[34px] bg-white/55 border border-black/[0.12] rounded-[17px] shadow-[0px_2px_5px_0px_rgba(0,0,0,0.18)] flex items-center justify-center shrink-0">
            <img src={navIconRight} alt="siguiente" className="w-[14px] h-[14px] object-contain" />
          </button>
        </div>

        {/* Dots de paginación */}
        <div className="flex gap-[9px] items-center">
          <div className="w-[8px] h-[8px] bg-[#787470] border border-black/[0.15] rounded-[4px]" />
          <div className="w-[8px] h-[8px] bg-[#a8a49c] border border-black/[0.15] rounded-[4px]" />
          <div className="w-[8px] h-[8px] bg-[#a8a49c] border border-black/[0.15] rounded-[4px]" />
        </div>

        {/* Postales link */}
        <a
          href={POSTALES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="relative bg-white border border-black/[0.1] rounded-[22px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.22),0px_1px_3px_0px_rgba(0,0,0,0.12)] overflow-hidden px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform duration-150 text-sm font-semibold text-gray-700"
        >
          💌 Postales para Jime
          <div
            className="absolute top-0 left-0 right-0 h-[48%] rounded-t-[22px] pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.1))" }}
          />
          <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] pointer-events-none" />
        </a>
      </div>
    </div>
  );
}
