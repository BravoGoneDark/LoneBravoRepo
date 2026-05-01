// src/components/DriveModal.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import CarViewer from "./CarViewer";
import { cars } from "../constants/carData";
import TechnicalDossier from "./TechnicalDossier";
import ARViewer from "./ARViewer";

const GOLD       = "rgba(200,169,110,";
const GOLD_SOLID = "#C8A96E";
const BLUE       = "rgba(96,165,250,";
const BLUE_SOLID = "#60A5FA";
const BLUE_DIM   = "rgba(147,197,253,";

const GROUND_OFFSETS = {
  "930-turbo":      0.4,
  "959":            0.25,
  "993-gt2":        0.25,
  "911-gt1-97":     0.25,
  "carrera-gt":     0.25,
  "911-gt3-992":    0.25,
  "taycan-turbo-s": 0.25,
};

const HUD_STATS = [
  { key: "topSpeed",     label: "TOP SPEED" },
  { key: "acceleration", label: "0–100"     },
  { key: "horsepower",   label: "POWER"     },
  { key: "torque",       label: "TORQUE"    },
];

function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const hasRaw = d.rawValue !== null && d.rawValue !== undefined;
  return (
    <div style={{
      background: "rgba(6,6,6,0.95)", border: `1px solid ${BLUE}0.35)`,
      borderRadius: "3px", padding: "9px 14px",
      backdropFilter: "blur(12px)", minWidth: "110px",
    }}>
      <div style={{
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase",
        color: `${BLUE_DIM}0.6)`, marginBottom: "5px",
      }}>{d.axis}</div>
      <div style={{
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "20px", fontWeight: 900, lineHeight: 1, color: GOLD_SOLID,
      }}>
        {hasRaw ? d.rawValue : d.value}
        <span style={{ fontSize: "10px", marginLeft: "3px", fontWeight: 400, color: `${GOLD}0.5)` }}>
          {hasRaw ? d.rawUnit : "/100"}
        </span>
      </div>
      <div style={{
        marginTop: "4px", fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
        fontSize: "9px", color: `${BLUE_DIM}0.4)`,
      }}>
        {hasRaw ? `Score ${d.value}/100` : "Estimated score"}
      </div>
    </div>
  );
}

function StatsChart({ car, isOpen, onClose }) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!panelRef.current) return;
    if (isOpen) {
      gsap.fromTo(panelRef.current, { y: "100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.55, ease: "expo.out" });
    } else {
      gsap.to(panelRef.current, { y: "100%", opacity: 0, duration: 0.35, ease: "power3.in" });
    }
  }, [isOpen]);

  const chartData = car.radarStats.map((s) => ({ ...s, name: s.axis }));
  return (
    <div ref={panelRef} onClick={(e) => e.stopPropagation()} style={{
      position: "absolute", inset: 0, zIndex: 20,
      background: "rgba(4,4,4,0.94)", backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column",
      transform: "translateY(100%)", opacity: 0,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: `linear-gradient(90deg, transparent, ${BLUE_SOLID} 30%, ${GOLD_SOLID} 60%, transparent)`,
        opacity: 0.5,
      }} />
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 22px 10px", flexShrink: 0, borderBottom: `1px solid ${BLUE}0.08)`,
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase",
            color: `${BLUE_DIM}0.45)`, marginBottom: "3px",
          }}>Performance Matrix</div>
          <div style={{
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "15px", fontWeight: 900, color: "#fff",
          }}>
            {car.name}
            <span style={{ marginLeft: "10px", fontSize: "11px", fontWeight: 400, color: `${GOLD}0.4)`, letterSpacing: "0.1em" }}>
              {car.year}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{
          width: "32px", height: "32px", borderRadius: "50%",
          border: `1px solid ${BLUE}0.2)`, background: "transparent",
          color: `${BLUE_DIM}0.5)`, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${BLUE}0.6)`; e.currentTarget.style.color = BLUE_SOLID; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${BLUE}0.2)`; e.currentTarget.style.color = `${BLUE_DIM}0.5)`; }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr auto", minHeight: 0, overflow: "hidden" }}>
        <div style={{ padding: "8px 0 8px 8px", minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 12, right: 30, bottom: 12, left: 30 }}>
              <defs>
                <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={BLUE_SOLID} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={BLUE_SOLID} stopOpacity={0.03} />
                </radialGradient>
              </defs>
              <PolarGrid stroke={`${BLUE}0.18)`} strokeDasharray="3 4" />
              <PolarAngleAxis dataKey="axis"
                tick={{ fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)", fontSize: 8, fill: `${BLUE_DIM}0.65)` }}
                tickLine={false}
              />
              <PolarRadiusAxis domain={[40, 100]} tick={false} axisLine={false} />
              <Radar name={car.name} dataKey="value"
                stroke={GOLD_SOLID} strokeWidth={1.5} fill="url(#radarFill)"
                dot={{ r: 3, fill: GOLD_SOLID, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: GOLD_SOLID, stroke: BLUE_SOLID, strokeWidth: 1.5 }}
              />
              <Tooltip content={<RadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          width: "148px", flexShrink: 0, padding: "14px 18px 14px 12px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          gap: "9px", borderLeft: `1px solid ${BLUE}0.08)`,
        }}>
          {[
            { label: "TOP SPEED",  val: car.stats.topSpeed.value,     unit: car.stats.topSpeed.unit     },
            { label: "0–100",      val: car.stats.acceleration.value, unit: car.stats.acceleration.unit },
            { label: "POWER",      val: car.stats.horsepower.value,   unit: car.stats.horsepower.unit   },
            { label: "TORQUE",     val: car.stats.torque.value,       unit: car.stats.torque.unit       },
            { label: "WEIGHT",     val: car.stats.weight.value,       unit: car.stats.weight.unit       },
            { label: "DRIVETRAIN", val: car.stats.drivetrain.value,   unit: ""                          },
            { label: "ENGINE",     val: car.stats.engine.value,       unit: ""                          },
          ].map(({ label, val, unit }) => (
            <div key={label}>
              <div style={{
                fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase",
                color: `${BLUE_DIM}0.38)`, marginBottom: "1px",
              }}>{label}</div>
              <div style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: label === "ENGINE" ? "8.5px" : "13px",
                fontWeight: 700, color: "#fff", lineHeight: 1.2,
              }}>
                {val}
                {unit && <span style={{ fontSize: "8px", marginLeft: "3px", color: `${GOLD}0.45)`, fontWeight: 400 }}>{unit}</span>}
              </div>
            </div>
          ))}
          <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: `1px solid ${BLUE}0.08)` }}>
            <div style={{
              fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
              fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase",
              color: `${BLUE_DIM}0.35)`, marginBottom: "2px",
            }}>Era</div>
            <div style={{
              fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
              fontSize: "12px", fontWeight: 700, color: GOLD_SOLID,
            }}>{car.era}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriveModal({ isOpen, onClose, onEnterCockpit, initialCarId }) {
  const getInitialIndex = () => {
    if (!initialCarId) return 0;
    const idx = cars.findIndex(c => c.id === initialCarId);
    return idx >= 0 ? idx : 0;
  };

  const [carIndex,    setCarIndex]    = useState(getInitialIndex);
  const [bodyColor,   setBodyColor]   = useState(cars[getInitialIndex()].colorOptions[0].hex);
  const [direction,   setDirection]   = useState(1);
  const [modelKey,    setModelKey]    = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [chartOpen,   setChartOpen]   = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [arOpen,      setArOpen]      = useState(false);

  const overlayRef = useRef(null);
  const panelRef   = useRef(null);
  const nameRef    = useRef(null);
  const taglineRef = useRef(null);
  const hudRef     = useRef(null);
  const statRefs   = useRef([]);

  const car = cars[carIndex];

  // When modal opens with a specific car, jump to it
  useEffect(() => {
    if (isOpen && initialCarId) {
      const idx = cars.findIndex(c => c.id === initialCarId);
      if (idx >= 0 && idx !== carIndex) {
        setCarIndex(idx);
        setModelKey(k => k + 1);
      }
    }
  }, [isOpen, initialCarId]);

  useEffect(() => { setBodyColor(car.colorOptions[0].hex); }, [carIndex]);
  useEffect(() => { setChartOpen(false); }, [carIndex]);

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;
    if (isOpen) {
      gsap.set(overlayRef.current, { display: "flex" });
      gsap.set(panelRef.current,   { y: 40, opacity: 0, scale: 0.94 });
      gsap.timeline()
        .to(overlayRef.current, { opacity: 1, duration: 0.35, ease: "power2.out" })
        .to(panelRef.current, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "expo.out" }, "-=0.15")
        .fromTo(statRefs.current.filter(Boolean),
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "expo.out" },
          "-=0.2"
        );
    } else {
      setChartOpen(false);
      setArOpen(false);
      gsap.timeline({ onComplete: () => gsap.set(overlayRef.current, { display: "none" }) })
        .to(panelRef.current, { y: 30, opacity: 0, scale: 0.96, duration: 0.35, ease: "power2.in" })
        .to(overlayRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" }, "-=0.15");
    }
  }, [isOpen]);

  const switchCar = useCallback((newIndex, dir) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const exitX  = dir * -40;
    const enterX = dir *  40;
    gsap.timeline({ onComplete: () => setIsAnimating(false) })
      .to([nameRef.current, taglineRef.current], { opacity: 0, x: exitX, duration: 0.22, ease: "power2.in", stagger: 0.04 })
      .to(statRefs.current.filter(Boolean), { opacity: 0, x: exitX * 0.5, duration: 0.18, ease: "power2.in", stagger: 0.03 }, "<")
      .call(() => { setCarIndex(newIndex); setDirection(dir); setModelKey((k) => k + 1); })
      .fromTo([nameRef.current, taglineRef.current],
        { opacity: 0, x: -enterX },
        { opacity: 1, x: 0, duration: 0.32, ease: "expo.out", stagger: 0.06 },
        "+=0.05"
      )
      .fromTo(statRefs.current.filter(Boolean),
        { opacity: 0, x: -enterX * 0.5 },
        { opacity: 1, x: 0, duration: 0.38, ease: "expo.out", stagger: 0.06 },
        "<+0.04"
      );
  }, [isAnimating]);

  const handlePrev = () => switchCar((carIndex - 1 + cars.length) % cars.length, -1);
  const handleNext = () => switchCar((carIndex + 1) % cars.length, 1);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") {
        if (arOpen)      { setArOpen(false);      return; }
        if (dossierOpen) { setDossierOpen(false);  return; }
        if (chartOpen)   { setChartOpen(false);    return; }
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, carIndex, isAnimating, chartOpen, dossierOpen, arOpen]);

  return (
    <>
      <div
        ref={overlayRef}
        onClick={(e) => e.target === overlayRef.current && onClose()}
        style={{
          display: "none", opacity: 0,
          position: "fixed", inset: 0, zIndex: 50,
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div ref={panelRef} style={{
          width: "82vw", height: "90vh", maxWidth: "1300px",
          background: "#0F0F0F",
          border: `1px solid ${GOLD}0.22)`,
          boxShadow: `0 0 80px rgba(0,0,0,0.8), inset 0 1px 0 ${GOLD}0.12)`,
          borderRadius: "4px",
          display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative",
        }}>
          {/* Gold top accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: `linear-gradient(90deg, transparent, ${GOLD_SOLID}, transparent)`,
            opacity: 0.6,
          }} />

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 28px 16px", borderBottom: `1px solid ${GOLD}0.1)`, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ display: "block", height: "1px", width: "32px", background: GOLD_SOLID, opacity: 0.5 }} />
              <span style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase",
                color: `${GOLD}0.75)`,
              }}>Select Your Machine</span>
              <span style={{ display: "block", height: "1px", width: "32px", background: GOLD_SOLID, opacity: 0.5 }} />
            </div>
            <span style={{
              fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
              fontSize: "11px", letterSpacing: "0.2em", color: `${GOLD}0.45)`,
            }}>
              {String(carIndex + 1).padStart(2, "0")} / {String(cars.length).padStart(2, "0")}
            </span>
            <button onClick={onClose} style={{
              width: "36px", height: "36px", borderRadius: "50%",
              border: `1px solid ${GOLD}0.25)`, background: "transparent",
              color: `${GOLD}0.6)`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease", flexShrink: 0,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${GOLD}0.7)`; e.currentTarget.style.color = GOLD_SOLID; e.currentTarget.style.background = `${GOLD}0.08)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${GOLD}0.25)`; e.currentTarget.style.color = `${GOLD}0.6)`; e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: "flex", alignItems: "stretch", overflow: "hidden", position: "relative", minHeight: 0 }}>
            <ArrowBtn direction="left" onClick={handlePrev} />

            <div style={{ flex: 1, position: "relative", minWidth: 0, background: "#0a0a0a" }}>
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

              {/* Spotlight cone */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: "700px", height: "80%",
                  background: "conic-gradient(from 83deg at 50% 0%, transparent 72deg, rgba(255,255,220,0.015) 82deg, rgba(255,255,220,0.045) 90deg, rgba(255,255,220,0.07) 100deg, rgba(255,255,220,0.045) 108deg, rgba(255,255,220,0.015) 118deg, transparent 128deg)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: "300px", height: "60%",
                  background: "conic-gradient(from 83deg at 50% 0%, transparent 84deg, rgba(255,255,220,0.03) 90deg, rgba(255,255,220,0.055) 95deg, rgba(255,255,220,0.03) 100deg, transparent 106deg)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "rgba(255,255,220,0.9)",
                  boxShadow: "0 0 8px 4px rgba(255,255,220,0.4), 0 0 20px 8px rgba(255,255,220,0.15)",
                }} />
              </div>

              {/* Stats HUD */}
              <div ref={hudRef} onClick={() => setChartOpen(true)} style={{
                position: "absolute", bottom: "18px", left: "18px", zIndex: 10,
                cursor: "pointer", padding: "10px 14px 10px 12px",
                background: "rgba(4,4,4,0.75)", backdropFilter: "blur(14px)",
                border: `1px solid ${BLUE}0.18)`, borderRadius: "3px",
                display: "flex", flexDirection: "column", gap: "7px",
                transition: "border-color 0.25s ease, background 0.25s ease", minWidth: "128px",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${BLUE}0.45)`; e.currentTarget.style.background = "rgba(8,8,8,0.88)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${BLUE}0.18)`; e.currentTarget.style.background = "rgba(4,4,4,0.75)"; }}
              >
                <div style={{
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "7px", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: `${BLUE_DIM}0.38)`, marginBottom: "1px",
                  display: "flex", alignItems: "center", gap: "5px",
                }}>
                  Stats
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
                    <polygon points="5,1 9,9 1,9" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                  </svg>
                </div>
                {HUD_STATS.map(({ key, label }, i) => {
                  const stat = car.stats[key];
                  return (
                    <div key={key} ref={(el) => (statRefs.current[i] = el)}
                      style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px" }}
                    >
                      <span style={{
                        fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                        fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase",
                        color: `${BLUE_DIM}0.4)`, whiteSpace: "nowrap",
                      }}>{label}</span>
                      <span style={{
                        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                        fontSize: "12px", fontWeight: 700, color: GOLD_SOLID, whiteSpace: "nowrap",
                      }}>
                        {stat.value}
                        <span style={{ fontSize: "8px", marginLeft: "2px", color: `${GOLD}0.45)`, fontWeight: 400 }}>{stat.unit}</span>
                      </span>
                    </div>
                  );
                })}
                <div style={{
                  marginTop: "2px", paddingTop: "6px", borderTop: `1px solid ${BLUE}0.1)`,
                  fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                  fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase",
                  color: `${BLUE_DIM}0.28)`, display: "flex", alignItems: "center", gap: "4px",
                }}>
                  View full analysis
                  <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4h5M4 1.5l2.5 2.5L4 6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <StatsChart car={car} isOpen={chartOpen} onClose={() => setChartOpen(false)} />
            </div>

            <ArrowBtn direction="right" onClick={handleNext} />
          </div>

          {/* Footer */}
          <div style={{
            flexShrink: 0, padding: "18px 48px 24px",
            borderTop: `1px solid ${GOLD}0.1)`,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px",
          }}>
            {/* Name + tagline */}
            <div style={{ minWidth: 0 }}>
              <div ref={nameRef} style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "clamp(1.1rem, 2vw, 1.6rem)", fontWeight: 900, color: "#FFFFFF",
                letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: "6px",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{car.name}</div>
              <div ref={taglineRef} style={{
                fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                fontSize: "clamp(0.8rem, 1.2vw, 1rem)", color: `${GOLD}0.65)`,
                fontStyle: "italic", letterSpacing: "0.04em",
              }}>{car.tagline}</div>
            </div>

            {/* Dots */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              {cars.map((_, i) => (
                <button key={i} onClick={() => { if (i !== carIndex) switchCar(i, i > carIndex ? 1 : -1); }} style={{
                  width: i === carIndex ? "20px" : "6px", height: "6px", borderRadius: "3px",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.35s cubic-bezier(0.76,0,0.24,1)",
                  background: i === carIndex ? GOLD_SOLID : `${GOLD}0.25)`,
                }} />
              ))}
            </div>

            {/* Colour + buttons */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                  fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase",
                  color: `${GOLD}0.4)`, marginRight: "4px",
                }}>Colour</span>
                {car.colorOptions.map((opt) => (
                  <button key={opt.hex} title={opt.name} onClick={() => setBodyColor(opt.hex)} style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    border: bodyColor === opt.hex ? `2px solid ${GOLD_SOLID}` : "2px solid rgba(255,255,255,0.15)",
                    background: opt.hex, cursor: "pointer", padding: 0,
                    transition: "border-color 0.2s ease, transform 0.2s ease",
                    transform: bodyColor === opt.hex ? "scale(1.25)" : "scale(1)", flexShrink: 0,
                    boxShadow: bodyColor === opt.hex ? `0 0 8px ${GOLD}0.4)` : "none",
                  }} />
                ))}
              </div>

              {/* Button row */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <ManifestoButton onClick={() => setDossierOpen(true)} />
                <ARButton onClick={() => setArOpen(true)} />
                <CockpitButton onEnterCockpit={onEnterCockpit} car={car} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dossier overlay */}
      {dossierOpen && (
        <TechnicalDossier car={car} onClose={() => setDossierOpen(false)} />
      )}

      {/* AR overlay */}
      <ARViewer
        isOpen={arOpen}
        onClose={() => setArOpen(false)}
        car={car}
      />
    </>
  );
}

function ArrowBtn({ direction, onClick }) {
  const isLeft = direction === "left";
  return (
    <button onClick={onClick} style={{
      width: "52px", flexShrink: 0, background: "transparent", border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(200,169,110,0.3)", transition: "color 0.25s ease, background 0.25s ease",
      borderLeft:  isLeft ? "none" : "1px solid rgba(200,169,110,0.07)",
      borderRight: isLeft ? "1px solid rgba(200,169,110,0.07)" : "none",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(200,169,110,0.9)"; e.currentTarget.style.background = "rgba(200,169,110,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,169,110,0.3)"; e.currentTarget.style.background = "transparent"; }}
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

function ManifestoButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
        padding: "12px 22px",
        border: `1px solid rgba(96,165,250,${hovered ? "0.6" : "0.25"})`,
        color: `rgba(96,165,250,${hovered ? "1" : "0.6"})`,
        background: hovered ? "rgba(96,165,250,0.08)" : "transparent",
        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.76,0,0.24,1)",
        whiteSpace: "nowrap",
        boxShadow: hovered ? "0 0 20px rgba(96,165,250,0.1)" : "none",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Manifesto
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: hovered ? "translateX(2px)" : "translateX(0)", transition: "transform 0.3s ease" }}
        >
          <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  );
}

function ARButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
        padding: "12px 22px",
        border: `1px solid rgba(96,165,250,${hovered ? "0.6" : "0.25"})`,
        color: `rgba(96,165,250,${hovered ? "1" : "0.6"})`,
        background: hovered ? "rgba(96,165,250,0.08)" : "transparent",
        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.76,0,0.24,1)",
        whiteSpace: "nowrap",
        boxShadow: hovered ? "0 0 20px rgba(96,165,250,0.1)" : "none",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        View in AR
      </span>
    </button>
  );
}

function CockpitButton({ onEnterCockpit, car }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={() => onEnterCockpit?.(car)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
        padding: "12px 28px",
        border: `1px solid rgba(200,169,110,${hovered ? "0.7" : "0.35"})`,
        color: `rgba(200,169,110,${hovered ? "1" : "0.75"})`,
        background: hovered ? "rgba(200,169,110,0.1)" : "transparent",
        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.76,0,0.24,1)",
        overflow: "hidden", whiteSpace: "nowrap",
        boxShadow: hovered ? "0 0 24px rgba(200,169,110,0.12)" : "none",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", zIndex: 1 }}>
        Enter Cockpit
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transform: hovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.3s ease" }}
        >
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  );
}