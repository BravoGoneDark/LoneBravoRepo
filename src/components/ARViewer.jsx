// src/components/ARViewer.jsx
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { QRCodeSVG } from "qrcode.react";

const GOLD       = "rgba(200,169,110,";
const GOLD_SOLID = "#C8A96E";
const BLUE_SOLID = "#60A5FA";
const BLUE_DIM   = "rgba(147,197,253,";

export default function ARViewer({ isOpen, onClose, car }) {
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  const [arSupported, setArSupported] = useState(false);
  const [qrOpen,      setQrOpen]      = useState(false);
  const [arUrl,       setArUrl]       = useState("");

  // Detect mobile
  useEffect(() => {
    const ua = navigator.userAgent;
    setArSupported(/Android|iPhone|iPad|iPod/i.test(ua));
  }, []);

  // Build AR URL from current host dynamically
  useEffect(() => {
    if (!car) return;
    const { protocol, hostname, port } = window.location;
    const p = port ? `:${port}` : "";
    const src = encodeURIComponent(car.model);
    setArUrl(`${protocol}//${hostname}${p}/ar-viewer.html?src=${src}`);
  }, [car]);

  // GSAP open/close
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;
    if (isOpen) {
      setQrOpen(false);
      gsap.set(overlayRef.current, { display: "flex" });
      gsap.set(panelRef.current, { y: 32, opacity: 0, scale: 0.94 });
      gsap.timeline()
        .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
        .to(panelRef.current, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, "-=0.1");
    } else {
      setQrOpen(false);
      gsap.timeline({
        onComplete: () => gsap.set(overlayRef.current, { display: "none" }),
      })
        .to(panelRef.current, { y: 24, opacity: 0, scale: 0.96, duration: 0.3, ease: "power2.in" })
        .to(overlayRef.current, { opacity: 0, duration: 0.22, ease: "power2.in" }, "-=0.1");
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (qrOpen) { setQrOpen(false); return; }
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, qrOpen, onClose]);

  if (!car) return null;

  const isDesktop = !arSupported;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      style={{
        display: "none", opacity: 0,
        position: "fixed", inset: 0, zIndex: 150,
        alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: "90vw", height: "80vh", maxWidth: "1200px",
          background: "#0C0C0C",
          border: `1px solid ${GOLD}0.2)`,
          boxShadow: `0 0 100px rgba(0,0,0,0.9), inset 0 1px 0 ${GOLD}0.1)`,
          borderRadius: "4px",
          display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative",
        }}
      >
        {/* Gold top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, transparent, ${GOLD_SOLID}, transparent)`,
          opacity: 0.55,
        }} />

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 28px 14px",
          borderBottom: `1px solid ${GOLD}0.08)`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              border: `1px solid ${GOLD}0.3)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${GOLD}0.06)`,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={GOLD_SOLID} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase",
                color: `${GOLD}0.5)`, marginBottom: "2px",
              }}>Spatial Viewer</div>
              <div style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "13px", fontWeight: 900, color: "#fff",
              }}>{car.name}</div>
            </div>
            <div style={{
              fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
              fontSize: "10px", color: `${GOLD}0.35)`, letterSpacing: "0.15em",
            }}>{car.year}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isDesktop && <QRButton onClick={() => setQrOpen((v) => !v)} active={qrOpen} />}
            {!isDesktop && (
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "5px 12px",
                border: `1px solid ${GOLD}0.3)`,
                background: `${GOLD}0.06)`, borderRadius: "2px",
              }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#4ade80", boxShadow: "0 0 6px rgba(74,222,128,0.6)",
                }} />
                <span style={{
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase",
                  color: GOLD_SOLID,
                }}>AR Ready</span>
              </div>
            )}
            <CloseButton onClick={onClose} />
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, position: "relative", minHeight: 0, background: "#080808" }}>

          {/* Subtle grid */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `
              linear-gradient(rgba(200,169,110,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200,169,110,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
          }} />

          <CornerAccents />

          {/* iframe — isolated context, no Three.js conflict */}
          {isOpen && car && (
            <iframe
              src={`/ar-viewer.html?src=${encodeURIComponent(car.model)}`}
              style={{
                width: "100%", height: "100%",
                border: "none", background: "#080808",
                position: "relative", zIndex: 2,
              }}
              allow="camera; xr-spatial-tracking"
              title={`AR Viewer — ${car.name}`}
            />
          )}

          {/* Hint pills */}
          <div style={{
            position: "absolute", bottom: "24px", left: "24px",
            display: "flex", flexDirection: "column", gap: "6px",
            pointerEvents: "none", zIndex: 10,
          }}>
            <HintPill icon="rotate" text="Drag to rotate" />
            <HintPill icon="zoom"   text="Scroll to zoom" />
          </div>

          {/* Watermark */}
          <div style={{
            position: "absolute", bottom: "16px", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "clamp(2rem,5vw,5rem)", fontWeight: 900,
            color: "rgba(200,169,110,0.025)", letterSpacing: "-0.04em",
            pointerEvents: "none", whiteSpace: "nowrap", zIndex: 1,
          }}>
            {car.model_code}
          </div>

          {/* ── QR Popup ── */}
          {qrOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 30,
                background: "#0A0A0A",
                border: `1px solid ${GOLD}0.3)`,
                borderRadius: "4px",
                padding: "32px 36px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
                boxShadow: `0 0 60px rgba(0,0,0,0.95), 0 0 30px ${GOLD}0.08)`,
                minWidth: "280px",
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                background: `linear-gradient(90deg, transparent, ${GOLD_SOLID}, transparent)`,
                opacity: 0.5,
              }} />

              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase",
                  color: `${GOLD}0.5)`, marginBottom: "6px",
                }}>Scan to View in AR</div>
                <div style={{
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "13px", fontWeight: 900, color: "#fff",
                }}>{car.name}</div>
              </div>

              <div style={{
                padding: "12px", background: "#fff", borderRadius: "3px",
                border: `2px solid ${GOLD}0.2)`,
              }}>
                <QRCodeSVG
                  value={arUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0A0A0A"
                  level="M"
                />
              </div>

              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{
                  fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                  fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase",
                  color: `${GOLD}0.45)`,
                }}>Open Chrome on Android · Scan · Place in AR</div>
                <div style={{
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "8px", letterSpacing: "0.15em",
                  color: `${GOLD}0.22)`,
                  wordBreak: "break-all", maxWidth: "220px", margin: "0 auto",
                }}>{arUrl}</div>
              </div>

              <button
                onClick={() => setQrOpen(false)}
                style={{
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase",
                  padding: "8px 20px",
                  border: `1px solid ${GOLD}0.25)`,
                  color: `${GOLD}0.6)`,
                  background: "transparent", cursor: "pointer", borderRadius: "2px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = GOLD_SOLID; e.currentTarget.style.color = GOLD_SOLID; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${GOLD}0.25)`; e.currentTarget.style.color = `${GOLD}0.6)`; }}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          flexShrink: 0, padding: "14px 28px",
          borderTop: `1px solid ${GOLD}0.08)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{
            fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
            fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
            color: `${GOLD}0.3)`,
          }}>
            {isDesktop
              ? "Scan QR with Android Chrome · Place this car in your environment"
              : "Tap View in AR · Place this car in your environment"}
          </div>
          <div style={{
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase",
            color: `${GOLD}0.2)`,
          }}>Powered by WebXR</div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function QRButton({ onClick, active }) {
  const [hovered, setHovered] = useState(false);
  const on = active || hovered;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase",
        padding: "7px 14px",
        border: `1px solid ${GOLD}${on ? "0.7" : "0.3"})`,
        color: on ? GOLD_SOLID : `${GOLD}0.6)`,
        background: active ? `${GOLD}0.1)` : "transparent",
        cursor: "pointer", transition: "all 0.2s ease", borderRadius: "2px",
        boxShadow: active ? `0 0 16px ${GOLD}0.12)` : "none",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="3" height="3" rx="0.5"/>
        <rect x="18" y="14" width="3" height="3" rx="0.5"/>
        <rect x="14" y="18" width="3" height="3" rx="0.5"/>
        <rect x="18" y="18" width="3" height="3" rx="0.5"/>
      </svg>
      Scan for AR
    </button>
  );
}

function CloseButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "36px", height: "36px", borderRadius: "50%",
        border: `1px solid ${GOLD}${hovered ? "0.6" : "0.2"})`,
        background: hovered ? `${GOLD}0.08)` : "transparent",
        color: hovered ? GOLD_SOLID : `${GOLD}0.5)`,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s ease", flexShrink: 0,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

function HintPill({ icon, text }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "7px",
      padding: "5px 10px",
      background: "rgba(6,6,6,0.7)", backdropFilter: "blur(8px)",
      border: "1px solid rgba(200,169,110,0.1)", borderRadius: "2px",
    }}>
      {icon === "rotate" && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="rgba(200,169,110,0.45)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      )}
      {icon === "zoom" && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="rgba(200,169,110,0.45)" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      )}
      <span style={{
        fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
        fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase",
        color: "rgba(200,169,110,0.4)",
      }}>{text}</span>
    </div>
  );
}

function CornerAccents() {
  const s = (pos) => ({ position: "absolute", ...pos, width: "20px", height: "20px", pointerEvents: "none", zIndex: 5 });
  const l = (dir) => ({
    position: "absolute", background: "rgba(200,169,110,0.35)",
    ...(dir === "h" ? { height: "1px", width: "100%", top: 0, left: 0 } : { width: "1px", height: "100%", top: 0, left: 0 }),
  });
  return (
    <>
      <div style={s({ top: 12, left: 12 })}><div style={l("h")}/><div style={l("v")}/></div>
      <div style={s({ top: 12, right: 12, transform: "scaleX(-1)" })}><div style={l("h")}/><div style={l("v")}/></div>
      <div style={s({ bottom: 12, left: 12, transform: "scaleY(-1)" })}><div style={l("h")}/><div style={l("v")}/></div>
      <div style={s({ bottom: 12, right: 12, transform: "scale(-1)" })}><div style={l("h")}/><div style={l("v")}/></div>
    </>
  );
}