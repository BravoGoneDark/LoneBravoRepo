// src/sections/ARPage.jsx
import { useEffect, useRef } from "react";
import { useParams }         from "react-router-dom";
import { getCarById }        from "../constants/carData";

const GOLD_SOLID = "#C8A96E";

export default function ARPage() {
  const { id } = useParams();
  const car    = getCarById(id);
  const mvRef  = useRef(null);

  // Set model-viewer attributes imperatively
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv || !car) return;
    mv.setAttribute("src", car.model);
    mv.setAttribute("ar", "");
    mv.setAttribute("ar-modes", "webxr scene-viewer quick-look");
    mv.setAttribute("camera-controls", "");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("auto-rotate-delay", "500");
    mv.setAttribute("rotation-per-second", "20deg");
    mv.setAttribute("shadow-intensity", "1");
    mv.setAttribute("shadow-softness", "1");
    mv.setAttribute("exposure", "1");
    mv.setAttribute("tone-mapping", "neutral");

    // Auto-activate AR on mobile as soon as model loads
    mv.addEventListener("load", () => {
      if (mv.canActivateAR) {
        mv.activateAR();
      }
    }, { once: true });
  }, [car]);

  if (!car) {
    return (
      <div style={{
        height: "100vh", background: "#0A0A0A",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "12px",
      }}>
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase",
          color: "rgba(200,169,110,0.4)",
        }}>Car not found</div>
      </div>
    );
  }

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#080808", overflow: "hidden",
      position: "relative",
    }}>
      {/* Minimal header — just car name */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        zIndex: 10, padding: "16px 20px",
        background: "linear-gradient(to bottom, rgba(8,8,8,0.9), transparent)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase",
            color: "rgba(200,169,110,0.5)", marginBottom: "3px",
          }}>Porsche · Spatial Viewer</div>
          <div style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "14px", fontWeight: 900, color: "#fff", letterSpacing: "0.02em",
          }}>{car.name}</div>
        </div>
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "10px", color: "rgba(200,169,110,0.3)", letterSpacing: "0.15em",
        }}>{car.year}</div>
      </div>

      {/* Gold top line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, ${GOLD_SOLID}, transparent)`,
        opacity: 0.5, zIndex: 11,
      }} />

      {/* model-viewer fullscreen */}
      <model-viewer
        ref={mvRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#080808",
          "--poster-color": "#080808",
          "--progress-bar-color": GOLD_SOLID,
          "--progress-bar-height": "2px",
        }}
      >
        {/* Custom AR button */}
        <button
          slot="ar-button"
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase",
            padding: "14px 32px",
            border: `1px solid rgba(200,169,110,0.6)`,
            color: GOLD_SOLID,
            background: "rgba(8,8,8,0.9)",
            backdropFilter: "blur(16px)",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "10px",
            borderRadius: "2px",
            boxShadow: "0 0 30px rgba(200,169,110,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          View in AR
        </button>
      </model-viewer>

      {/* Hint — only shows before AR activates */}
      <div style={{
        position: "absolute", bottom: "110px", left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "Orbitron, sans-serif",
        fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase",
        color: "rgba(200,169,110,0.3)", whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        Drag to orbit · Pinch to zoom
      </div>
    </div>
  );
}