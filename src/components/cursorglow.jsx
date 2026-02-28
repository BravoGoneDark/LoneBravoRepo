// components/CursorGlow.jsx
// Custom cursor glow circle — follows mouse via GSAP in App.jsx
// This component is purely the visual element — the movement
// logic lives in initCursorGlow() inside gsapAnimations.js
//
// Hidden on touch devices via the "pointer: coarse" check in gsapAnimations
// Also hidden via CSS on mobile as a safety net

import { forwardRef, useEffect } from "react";

/**
 * Must be a forwardRef so App.jsx can pass cursorRef down
 * GSAP in initCursorGlow() targets this element directly
 */
const CursorGlow = forwardRef(function CursorGlow(_props, ref) {
  return (
    <>
      {/* Outer ring — large, low opacity, slow to follow */}
      <div
        ref={ref}
        className={[
          // Positioning — GSAP will override x/y via transform
          "fixed top-0 left-0 z-[9997]",
          "pointer-events-none select-none",
          // Size and shape
          "w-5 h-5 rounded-full",
          // Visual — soft glow ring
          "border border-porsche-gold/20",
          "bg-transparent",
          // Offset so the center of the circle tracks the cursor
          "-translate-x-1/2 -translate-y-1/2",
          // Hide on touch/mobile devices
          "hidden md:block",
        ].join(" ")}
      />

      {/* Inner dot — small, sharp, snaps to cursor instantly */}
      {/* Positioned independently — GSAP does NOT control this one */}
      {/* CSS custom property trick: follows cursor via JS below     */}
      <div
        id="cursor-dot"
        className={[
          "fixed top-0 left-0 z-[9997]",
          "pointer-events-none select-none",
          "w-1 h-1 rounded-full",
          "bg-porsche-gold",
          "-translate-x-1/2 -translate-y-1/2",
          "hidden md:block",
        ].join(" ")}
      />

      {/* Inline script — snaps the dot to cursor with zero lag */}
      {/* Separate from GSAP so the dot feels instant             */}
      <DotFollower />
    </>
  );
});

// Tiny helper — moves the inner dot on every mousemove
// Does not use GSAP so there is zero delay on the dot
function DotFollower() {
  useEffect(() => {
    const dot = document.getElementById("cursor-dot");
    if (!dot) return;

    const onMove = (e) => {
      dot.style.transform =
        `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null; // renders nothing — side effect only
}

export default CursorGlow;