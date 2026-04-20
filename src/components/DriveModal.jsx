// src/components/DriveModal.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import CarViewer from "./CarViewer";
import { cars } from "../constants/carData";

const GOLD        = "rgba(200,169,110,";
const GOLD_SOLID  = "#C8A96E";

const GROUND_OFFSETS = {
  "930-turbo":    0.4,
  "959":          0.25,
  "993-gt2":      0.25,
  "911-gt1-97":   0.25,
  "carrera-gt":   0.25,
  "911-gt3-992":  0.25,
  "taycan-turbo-s": 0.25,
};

export default function DriveModal({ isOpen, onClose, onEnterCockpit }) {
  const [carIndex,   setCarIndex]   = useState(0);
  const [bodyColor,  setBodyColor]  = useState(cars[0].colorOptions[0].hex);
  const [direction,  setDirection]  = useState(1);          // +1 = forward, -1 = backward
  const [modelKey,   setModelKey]   = useState(0);          // forces CarViewer remount on car change
  const [isAnimating, setIsAnimating] = useState(false);

  const overlayRef  = useRef(null);
  const panelRef    = useRef(null);
  const infoRef     = useRef(null);   // wraps name + tagline + dots + btn
  const nameRef     = useRef(null);
  const taglineRef  = useRef(null);

  const car = cars[carIndex];

  // ── Reset color when car changes ──────────────────────────────────────────
  useEffect(() => {
    setBodyColor(car.colorOptions[0].hex);
  }, [carIndex]);

  // ── Modal open / close GSAP animation ─────────────────────────────────────
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;

    if (isOpen) {
      // Make sure it's visible first
      gsap.set(overlayRef.current, { display: "flex" });
      gsap.set(panelRef.current,   { y: 40, opacity: 0, scale: 0.94 });

      gsap.timeline()
        .to(overlayRef.current, { opacity: 1, duration: 0.35, ease: "power2.out" })
        .to(panelRef.current,   {
            y: 0, opacity: 1, scale: 1,
            duration: 0.55, ease: "expo.out",
          }, "-=0.15");
    } else {
      gsap.timeline({
        onComplete: () => {
          gsap.set(overlayRef.current, { display: "none" });
        },
      })
        .to(panelRef.current, {
            y: 30, opacity: 0, scale: 0.96,
            duration: 0.35, ease: "power2.in",
          })
        .to(overlayRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" }, "-=0.15");
    }
  }, [isOpen]);

  // ── Car switch transition ──────────────────────────────────────────────────
  const switchCar = useCallback((newIndex, dir) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const exitX  = dir * -40;
    const enterX = dir *  40;

    gsap.timeline({
      onComplete: () => setIsAnimating(false),
    })
      // exit current info
      .to([nameRef.current, taglineRef.current], {
          opacity: 0,
          x: exitX,
          duration: 0.22,
          ease: "power2.in",
          stagger: 0.04,
        })
      // swap model + reset color
      .call(() => {
          setCarIndex(newIndex);
          setDirection(dir);
          setModelKey((k) => k + 1);
        })
      // enter new info from opposite side
      .fromTo(
        [nameRef.current, taglineRef.current],
        { opacity: 0, x: -enterX },
        {
          opacity: 1, x: 0,
          duration: 0.32,
          ease: "expo.out",
          stagger: 0.06,
        },
        "+=0.05"
      );
  }, [isAnimating]);

  const handlePrev = () => {
    const next = (carIndex - 1 + cars.length) % cars.length;
    switchCar(next, -1);
  };

  const handleNext = () => {
    const next = (carIndex + 1) % cars.length;
    switchCar(next, 1);
  };

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, carIndex, isAnimating]);

  return (
    /* ── Overlay ── */
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      style={{
        display:         "none",
        opacity:          0,
        position:        "fixed",
        inset:            0,
        zIndex:           50,
        alignItems:      "center",
        justifyContent:  "center",
        background:      "rgba(0,0,0,0.75)",
        backdropFilter:  "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* ── Panel ── */}
      <div
        ref={panelRef}
        style={{
          width:           "82vw",
          height:          "90vh",
          maxWidth:        "1300px",
          background:      "#0F0F0F",
          border:          `1px solid ${GOLD}0.22)`,
          boxShadow:       `0 0 80px rgba(0,0,0,0.8), inset 0 1px 0 ${GOLD}0.12)`,
          borderRadius:    "4px",
          display:         "flex",
          flexDirection:   "column",
          overflow:        "hidden",
          position:        "relative",
        }}
      >
        {/* ── Gold top accent line ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${GOLD_SOLID}, transparent)`,
          opacity: 0.6,
        }} />

        {/* ── Header ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "20px 28px 16px",
          borderBottom:   `1px solid ${GOLD}0.1)`,
          flexShrink:      0,
        }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{
              display: "block", height: "1px", width: "32px",
              background: GOLD_SOLID, opacity: 0.5,
            }} />
            <span style={{
              fontFamily:    "var(--font-orbitron, 'Orbitron', sans-serif)",
              fontSize:      "10px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color:         `${GOLD}0.75)`,
            }}>
              Select Your Machine
            </span>
            <span style={{
              display: "block", height: "1px", width: "32px",
              background: GOLD_SOLID, opacity: 0.5,
            }} />
          </div>

          {/* Car counter */}
          <span style={{
            fontFamily:    "var(--font-orbitron, 'Orbitron', sans-serif)",
            fontSize:      "11px",
            letterSpacing: "0.2em",
            color:         `${GOLD}0.45)`,
          }}>
            {String(carIndex + 1).padStart(2, "0")} / {String(cars.length).padStart(2, "0")}
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width:        "36px",
              height:       "36px",
              borderRadius: "50%",
              border:       `1px solid ${GOLD}0.25)`,
              background:   "transparent",
              color:        `${GOLD}0.6)`,
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              transition:   "all 0.2s ease",
              flexShrink:    0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor  = `${GOLD}0.7)`;
              e.currentTarget.style.color        = GOLD_SOLID;
              e.currentTarget.style.background   = `${GOLD}0.08)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor  = `${GOLD}0.25)`;
              e.currentTarget.style.color        = `${GOLD}0.6)`;
              e.currentTarget.style.background   = "transparent";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Body: viewer + arrows ── */}
        <div style={{
          flex:     1,
          display:  "flex",
          alignItems: "stretch",
          overflow: "hidden",
          position: "relative",
          minHeight: 0,
        }}>
          {/* Left arrow */}
          <ArrowBtn direction="left" onClick={handlePrev} />

          {/* 3D Viewer */}
        <div style={{
          flex:       1,
          position:   "relative",
          minWidth:   0,
          background: "#0a0a0a",
        }}>
          <CarViewer
            key={modelKey}
            modelPath={car.model}
            bodyColor={bodyColor}
            scaleOverride={car.viewerScale}
            cameraPosition={car.cameraPosition}
            pivotCorrection={car.pivotCorrection ?? 0}
            autoRotate={true}
            groundOffset={GROUND_OFFSETS[car.id] ?? 0.25}
          />

          {/* Spotlight cone overlay */}
          <div style={{
            position:      "absolute",
            inset:          0,
            pointerEvents: "none",
            zIndex:         2,
            overflow:      "hidden",
          }}>
            {/* Cone of light */}
            <div style={{
              position:   "absolute",
              top:        "0px",
              left:       "50%",
              transform:  "translateX(-50%)",
              width:      "700px",
              height:     "80%",
              background: "conic-gradient(from 83deg at 50% 0%, transparent 72deg, rgba(255,255,220,0.015) 82deg, rgba(255,255,220,0.045) 90deg, rgba(255,255,220,0.07) 100deg, rgba(255,255,220,0.045) 108deg, rgba(255,255,220,0.015) 118deg, transparent 128deg)",
              pointerEvents: "none",
            }} />
            
            {/* Inner bright core of cone */}
            <div style={{
              position:   "absolute",
              top:        "0px",
              left:       "50%",
              transform:  "translateX(-50%)",
              width:      "300px",
              height:     "60%",
              background: "conic-gradient(from 83deg at 50% 0%, transparent 84deg, rgba(255,255,220,0.03) 90deg, rgba(255,255,220,0.055) 95deg, rgba(255,255,220,0.03) 100deg, transparent 106deg)",
              pointerEvents: "none",
            }} />

            {/* Light source dot */}
            <div style={{
              position:     "absolute",
              top:          "0px",
              left:         "calc(50% - 0px)",
              transform:    "translateX(-50%)",
              width:        "6px",
              height:       "6px",
              borderRadius: "50%",
              background:   "rgba(255,255,220,0.9)",
              boxShadow:    "0 0 8px 4px rgba(255,255,220,0.4), 0 0 20px 8px rgba(255,255,220,0.15)",
            }} />
          </div>
        </div>

          {/* Right arrow */}
          <ArrowBtn direction="right" onClick={handleNext} />
        </div>

        {/* ── Footer info ── */}
        <div
          ref={infoRef}
          style={{
            flexShrink:  0,
            padding:     "18px 48px 24px",
            borderTop:   `1px solid ${GOLD}0.1)`,
            display:     "flex",
            alignItems:  "center",
            justifyContent: "space-between",
            gap:         "24px",
          }}
        >
          {/* Left: name + tagline */}
          <div style={{ minWidth: 0 }}>
            <div
              ref={nameRef}
              style={{
                fontFamily:    "var(--font-orbitron, 'Orbitron', sans-serif)",
                fontSize:      "clamp(1.1rem, 2vw, 1.6rem)",
                fontWeight:    900,
                color:         "#FFFFFF",
                letterSpacing: "-0.01em",
                lineHeight:    1.1,
                marginBottom:  "6px",
                whiteSpace:    "nowrap",
                overflow:      "hidden",
                textOverflow:  "ellipsis",
              }}
            >
              {car.name}
            </div>
            <div
              ref={taglineRef}
              style={{
                fontFamily:    "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                fontSize:      "clamp(0.8rem, 1.2vw, 1rem)",
                color:         `${GOLD}0.65)`,
                fontStyle:     "italic",
                letterSpacing: "0.04em",
              }}
            >
              {car.tagline}
            </div>
          </div>

          {/* Center: dot indicators */}
          <div style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "8px",
            flexShrink:      0,
          }}>
            {cars.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i === carIndex) return;
                  switchCar(i, i > carIndex ? 1 : -1);
                }}
                style={{
                  width:        i === carIndex ? "20px" : "6px",
                  height:       "6px",
                  borderRadius: "3px",
                  border:       "none",
                  cursor:       "pointer",
                  transition:   "all 0.35s cubic-bezier(0.76,0,0.24,1)",
                  background:   i === carIndex ? GOLD_SOLID : `${GOLD}0.25)`,
                  padding:       0,
                }}
              />
            ))}
          </div>

          {/* Right: color picker + cockpit button */}
          <div style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "flex-end",
            gap:           "12px",
            flexShrink:     0,
          }}>
            {/* Color swatches */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontFamily:    "var(--font-rajdhani, 'Rajdhani', sans-serif)",
                fontSize:      "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color:         `${GOLD}0.4)`,
                marginRight:   "4px",
              }}>
                Colour
              </span>
              {car.colorOptions.map((opt) => (
                <button
                  key={opt.hex}
                  title={opt.name}
                  onClick={() => setBodyColor(opt.hex)}
                  style={{
                    width:        "18px",
                    height:       "18px",
                    borderRadius: "50%",
                    border:       bodyColor === opt.hex
                                    ? `2px solid ${GOLD_SOLID}`
                                    : "2px solid rgba(255,255,255,0.15)",
                    background:   opt.hex,
                    cursor:       "pointer",
                    padding:       0,
                    transition:   "border-color 0.2s ease, transform 0.2s ease",
                    transform:    bodyColor === opt.hex ? "scale(1.25)" : "scale(1)",
                    flexShrink:    0,
                    boxShadow:    bodyColor === opt.hex
                                    ? `0 0 8px ${GOLD}0.4)`
                                    : "none",
                  }}
                />
              ))}
            </div>

            {/* Enter Cockpit button */}
            <CockpitButton onEnterCockpit={onEnterCockpit} car={car} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Arrow button ──────────────────────────────────────────────────────────── */
function ArrowBtn({ direction, onClick }) {
  const isLeft = direction === "left";
  return (
    <button
      onClick={onClick}
      style={{
        width:           "52px",
        flexShrink:       0,
        background:      "transparent",
        border:          "none",
        cursor:          "pointer",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        color:           "rgba(200,169,110,0.3)",
        transition:      "color 0.25s ease, background 0.25s ease",
        borderLeft:      isLeft  ? "none" : "1px solid rgba(200,169,110,0.07)",
        borderRight:     isLeft  ? "1px solid rgba(200,169,110,0.07)" : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color      = "rgba(200,169,110,0.9)";
        e.currentTarget.style.background = "rgba(200,169,110,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color      = "rgba(200,169,110,0.3)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {isLeft
          ? <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M7 4l6 6-6 6"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  );
}

/* ── Enter Cockpit button ──────────────────────────────────────────────────── */
function CockpitButton({ onEnterCockpit, car }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onEnterCockpit?.(car)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:      "relative",
        fontFamily:    "var(--font-orbitron, 'Orbitron', sans-serif)",
        fontSize:      "11px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        padding:       "12px 28px",
        border:        `1px solid rgba(200,169,110,${hovered ? "0.7" : "0.35"})`,
        color:         `rgba(200,169,110,${hovered ? "1" : "0.75"})`,
        background:    hovered ? "rgba(200,169,110,0.1)" : "transparent",
        cursor:        "pointer",
        transition:    "all 0.3s cubic-bezier(0.76,0,0.24,1)",
        overflow:      "hidden",
        whiteSpace:    "nowrap",
        boxShadow:     hovered ? "0 0 24px rgba(200,169,110,0.12)" : "none",
      }}
    >
      <span style={{
        display:        "flex",
        alignItems:     "center",
        gap:            "10px",
        position:       "relative",
        zIndex:          1,
      }}>
        Enter Cockpit
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{
            transform:  hovered ? "translateX(3px)" : "translateX(0)",
            transition: "transform 0.3s ease",
          }}
        >
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  );
}