"use client";

import { useEffect, useRef } from "react";

/**
 * CursorTarget — floating circle that follows the cursor with spring physics.
 * No external animation libraries needed — pure rAF + lerp.
 *
 * Features:
 *  • Smooth spring follow via lerp (adjustable stiffness)
 *  • Continuously rotating dashed outer ring
 *  • Inner dot that snaps closer to the real cursor (faster lerp)
 *  • Scales up on hover over interactive elements
 *  • Hides on mobile (touch devices)
 */
export default function CursorTarget() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  // Tracked positions
  const mouse  = useRef({ x: -200, y: -200 });
  const outer  = useRef({ x: -200, y: -200 });
  const inner  = useRef({ x: -200, y: -200 });
  const rotate = useRef(0);
  const scale  = useRef(1);

  useEffect(() => {
    // Hide on touch-only devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // ── Hide native cursor globally ──────────────────────────────
    document.documentElement.style.cursor = "none";

    // ── Track pointer ────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    // ── Scale on interactive elements ────────────────────────────
    const onEnter = () => { scale.current = 1.7; };
    const onLeave = () => { scale.current = 1; };

    const interactives = document.querySelectorAll("a, button, [role=button], input, textarea, select, label");
    interactives.forEach(el => {
      el.addEventListener("mouseenter", onEnter as EventListener);
      el.addEventListener("mouseleave", onLeave as EventListener);
    });

    // ── rAF loop ─────────────────────────────────────────────────
    const LERP_OUTER = 0.095; // slower = more spring lag
    const LERP_INNER = 0.30;  // faster = snappier dot

    const loop = () => {
      // Lerp positions
      outer.current.x += (mouse.current.x - outer.current.x) * LERP_OUTER;
      outer.current.y += (mouse.current.y - outer.current.y) * LERP_OUTER;
      inner.current.x += (mouse.current.x - inner.current.x) * LERP_INNER;
      inner.current.y += (mouse.current.y - inner.current.y) * LERP_INNER;

      // Rotation — continuous + speed based on distance to cursor
      const dx = mouse.current.x - outer.current.x;
      const dy = mouse.current.y - outer.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      rotate.current += 0.6 + dist * 0.04;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${outer.current.x}px, ${outer.current.y}px) translate(-50%, -50%) rotate(${rotate.current}deg) scale(${scale.current})`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${inner.current.x}px, ${inner.current.y}px) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      interactives.forEach(el => {
        el.removeEventListener("mouseenter", onEnter as EventListener);
        el.removeEventListener("mouseleave", onLeave as EventListener);
      });
    };
  }, []);

  return (
    <>
      {/* ── Outer rotating ring ── */}
      <div
        ref={outerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1.5px dashed rgba(255,255,255,0.65)",
          pointerEvents: "none",
          zIndex: 99999,
          willChange: "transform",
          mixBlendMode: "difference",
          transition: "opacity 0.3s",
        }}
      />

      {/* ── Inner dot (snappier) ── */}
      <div
        ref={innerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "white",
          pointerEvents: "none",
          zIndex: 99999,
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
