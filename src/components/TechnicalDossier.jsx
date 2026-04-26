// src/components/TechnicalDossier.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

// ── Palette ───────────────────────────────────────────────────────────────────
const GOLD       = "rgba(200,169,110,";
const GOLD_S     = "#C8A96E";
const BLUE       = "rgba(96,165,250,";
const BLUE_S     = "#60A5FA";
const BLUE_DIM   = "rgba(147,197,253,";

const SECTIONS = ["Provenance", "Supremacy", "Matrix", "Chronicle"];

// ── Radar tooltip ─────────────────────────────────────────────────────────────
function DossierTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const hasRaw = d.rawValue !== null && d.rawValue !== undefined;
  return (
    <div style={{
      background: "rgba(4,4,4,0.96)", border: `1px solid ${BLUE}0.3)`,
      borderRadius: "4px", padding: "10px 14px",
      backdropFilter: "blur(16px)", minWidth: "118px",
    }}>
      <div style={{
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase",
        color: `${BLUE_DIM}0.55)`, marginBottom: "5px",
      }}>{d.axis}</div>
      <div style={{
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "20px", fontWeight: 900, color: GOLD_S, lineHeight: 1,
      }}>
        {hasRaw ? d.rawValue : d.value}
        <span style={{ fontSize: "9px", marginLeft: "3px", color: `${GOLD}0.5)`, fontWeight: 400 }}>
          {hasRaw ? d.rawUnit : "/100"}
        </span>
      </div>
      <div style={{
        marginTop: "4px", fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
        fontSize: "9px", color: `${BLUE_DIM}0.38)`,
      }}>
        {hasRaw ? `Score ${d.value}/100` : "Estimated score"}
      </div>
    </div>
  );
}

// ── Section: PROVENANCE ───────────────────────────────────────────────────────
function Provenance({ car }) {
  const { provenance } = car.dossier;
  const specs = provenance.specs;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: "100%", overflow: "hidden" }}>
      {/* Left — hero image + history */}
      <div style={{
        borderRight: `1px solid ${BLUE}0.08)`,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Hero image */}
        <div style={{ height: "42%", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <img
            src={`/images/dossier/${car.id}/hero.webp`}
            alt={car.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 50%, rgba(4,4,4,0.9) 100%)",
          }} />
          {/* Year badge */}
          <div style={{
            position: "absolute", bottom: "14px", left: "20px",
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "11px", letterSpacing: "0.3em", color: `${GOLD}0.6)`,
          }}>
            {car.year} · {car.era}
          </div>
        </div>

        {/* History text */}
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
          <div style={{
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase",
            color: `${BLUE_DIM}0.4)`, marginBottom: "10px",
          }}>
            Origin &amp; History
          </div>
          <p style={{
            fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
            fontSize: "0.88rem", color: "rgba(255,255,255,0.62)",
            lineHeight: 1.72, margin: 0,
          }}>
            {provenance.history}
          </p>
        </div>
      </div>

      {/* Right — spec grid */}
      <div style={{ padding: "20px 24px", overflowY: "auto" }}>
        <div style={{
          fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
          fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase",
          color: `${BLUE_DIM}0.4)`, marginBottom: "16px",
        }}>
          Technical Specification
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(specs).map(([key, val]) => (
            <div key={key} style={{
              background: "rgba(96,165,250,0.03)",
              border: `1px solid ${BLUE}0.08)`,
              borderRadius: "4px", padding: "10px 14px",
            }}>
              <div style={{
                fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase",
                color: `${BLUE_DIM}0.35)`, marginBottom: "3px",
              }}>
                {key.replace(/([A-Z])/g, " $1").trim()}
              </div>
              <div style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "11px", color: "#e8e8e8", letterSpacing: "0.02em", lineHeight: 1.4,
              }}>
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* Price badge */}
        <div style={{
          marginTop: "16px", padding: "12px 14px",
          background: `${GOLD}0.06)`, border: `1px solid ${GOLD}0.18)`,
          borderRadius: "4px",
        }}>
          <div style={{
            fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
            fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase",
            color: `${GOLD}0.4)`, marginBottom: "3px",
          }}>
            Original Price
          </div>
          <div style={{
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "15px", fontWeight: 900, color: GOLD_S,
          }}>
            {car.price}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section: SUPREMACY ────────────────────────────────────────────────────────
function Supremacy({ car }) {
  const { supremacy } = car.dossier;
  return (
    <div style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}>
      <div style={{
        fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
        fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase",
        color: `${BLUE_DIM}0.4)`, marginBottom: "6px",
      }}>
        Competitive Dominance
      </div>
      <p style={{
        fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
        fontSize: "0.82rem", color: "rgba(255,255,255,0.35)",
        marginBottom: "24px", letterSpacing: "0.04em",
      }}>
        How the {car.name} outpaced its contemporaries — era by era, class by class.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {supremacy.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "rgba(96,165,250,0.03)",
              border: `1px solid ${BLUE}0.1)`,
              borderLeft: `3px solid ${BLUE_S}`,
              borderRadius: "0 6px 6px 0",
              padding: "16px 20px",
            }}
          >
            {/* Rival header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "13px", fontWeight: 900, color: "#fff",
                letterSpacing: "-0.01em",
              }}>
                {entry.rival}
              </div>
              <div style={{
                padding: "2px 8px",
                background: `${BLUE}0.1)`, border: `1px solid ${BLUE}0.2)`,
                borderRadius: "3px",
                fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase",
                color: BLUE_S,
              }}>
                {entry.tag}
              </div>
            </div>

            {/* Advantage text */}
            <p style={{
              fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
              fontSize: "0.88rem", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.65, margin: 0,
            }}>
              {entry.advantage}
            </p>

            {/* Bottom decorator */}
            <div style={{
              marginTop: "10px", paddingTop: "8px",
              borderTop: `1px solid ${BLUE}0.06)`,
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: GOLD_S, opacity: 0.6 }} />
              <span style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "7px", letterSpacing: "0.2em", textTransform: "uppercase",
                color: `${GOLD}0.38)`,
              }}>
                Advantage: {car.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Section: MATRIX ───────────────────────────────────────────────────────────
function Matrix({ car }) {
  const [radarMode, setRadarMode] = useState("core");
  const coreData    = car.radarStats.map((s) => ({ ...s, name: s.axis }));
  const extendedData = car.dossier.dossierRadar.map((s) => ({ ...s, name: s.axis }));
  const chartData = radarMode === "core" ? coreData : extendedData;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", height: "100%", overflow: "hidden" }}>
      {/* Radar */}
      <div style={{
        borderRight: `1px solid ${BLUE}0.08)`,
        padding: "16px 12px 16px 16px",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexShrink: 0 }}>
          <div style={{
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase",
            color: `${BLUE_DIM}0.4)`,
          }}>
            Performance Signature
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {[{ key: "core", label: "Core" }, { key: "extended", label: "Extended" }].map(({ key, label }) => (
              <button key={key} onClick={() => setRadarMode(key)} style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "8px", letterSpacing: "0.12em",
                padding: "4px 10px", borderRadius: "3px", cursor: "pointer",
                border: radarMode === key ? `1px solid ${BLUE_S}` : `1px solid ${BLUE}0.15)`,
                background: radarMode === key ? `${BLUE}0.12)` : "rgba(255,255,255,0.02)",
                color: radarMode === key ? BLUE_S : `${BLUE_DIM}0.4)`,
                transition: "all 0.2s ease",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 16, right: 36, bottom: 16, left: 36 }}>
              <defs>
                <radialGradient id="dossierFill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={BLUE_S} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={BLUE_S} stopOpacity={0.02} />
                </radialGradient>
              </defs>
              <PolarGrid stroke={`${BLUE}0.15)`} strokeDasharray="3 4" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)", fontSize: 8, fill: `${BLUE_DIM}0.6)` }}
                tickLine={false}
              />
              <PolarRadiusAxis domain={[40, 100]} tick={false} axisLine={false} />
              <Radar
                name={car.name} dataKey="value"
                stroke={GOLD_S} strokeWidth={1.5}
                fill="url(#dossierFill)"
                dot={{ r: 3, fill: GOLD_S, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: GOLD_S, stroke: BLUE_S, strokeWidth: 1.5 }}
              />
              <Tooltip content={<DossierTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right stat column */}
      <div style={{ padding: "16px 18px", overflowY: "auto" }}>
        <div style={{
          fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
          fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase",
          color: `${BLUE_DIM}0.4)`, marginBottom: "14px",
        }}>
          Full Specification
        </div>

        {/* Core stats */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{
            fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
            fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase",
            color: `${GOLD}0.35)`, marginBottom: "8px", paddingBottom: "4px",
            borderBottom: `1px solid ${GOLD}0.08)`,
          }}>
            Core
          </div>
          {[
            { label: "TOP SPEED",   val: car.stats.topSpeed.value,     unit: car.stats.topSpeed.unit     },
            { label: "0–100",       val: car.stats.acceleration.value, unit: car.stats.acceleration.unit },
            { label: "POWER",       val: car.stats.horsepower.value,   unit: car.stats.horsepower.unit   },
            { label: "TORQUE",      val: car.stats.torque.value,       unit: car.stats.torque.unit       },
            { label: "WEIGHT",      val: car.stats.weight.value,       unit: car.stats.weight.unit       },
            { label: "DRIVETRAIN",  val: car.stats.drivetrain.value,   unit: ""                          },
          ].map(({ label, val, unit }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "7px" }}>
              <span style={{
                fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase",
                color: `${BLUE_DIM}0.38)`,
              }}>{label}</span>
              <span style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "12px", fontWeight: 700, color: "#fff",
              }}>
                {val}
                {unit && <span style={{ fontSize: "8px", marginLeft: "2px", color: `${GOLD}0.45)` }}>{unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Extended stats */}
        <div>
          <div style={{
            fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
            fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase",
            color: `${BLUE}0.4)`, marginBottom: "8px", paddingBottom: "4px",
            borderBottom: `1px solid ${BLUE}0.08)`,
          }}>
            Extended
          </div>
          {car.dossier.dossierRadar.map(({ axis, rawValue, rawUnit }) => (
            <div key={axis} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "7px" }}>
              <span style={{
                fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase",
                color: `${BLUE_DIM}0.38)`,
              }}>{axis}</span>
              <span style={{
                fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                fontSize: "11px", fontWeight: 700, color: BLUE_S,
              }}>
                {rawValue ?? "—"}
                {rawUnit && <span style={{ fontSize: "8px", marginLeft: "2px", color: `${BLUE}0.5)` }}>{rawUnit}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section: CHRONICLE ────────────────────────────────────────────────────────
function ChronicleCardModal({ card, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "680px", maxWidth: "90vw",
          background: "#06060e",
          border: `1px solid ${BLUE}0.2)`,
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: `0 40px 120px rgba(0,0,0,0.9), 0 0 60px ${BLUE}0.06)`,
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Blue-gold accent */}
        <div style={{
          height: "2px",
          background: `linear-gradient(90deg, ${BLUE_S}, ${BLUE_S}66 40%, ${GOLD_S} 70%, transparent)`,
          opacity: 0.6,
        }} />

        {/* Image */}
        <div style={{ height: "240px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <img
            src={card.image} alt={card.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.75)" }}
            onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "rgba(20,20,30,1)"; }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(6,6,14,1) 0%, rgba(6,6,14,0.3) 60%, transparent 100%)",
          }} />
          {/* Year overlay on image */}
          <div style={{
            position: "absolute", bottom: "16px", left: "22px",
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "36px", fontWeight: 900, color: GOLD_S,
            lineHeight: 1, textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}>
            {card.year}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px 24px" }}>
          {/* Title + close row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{
              fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
              fontSize: "16px", fontWeight: 900, color: "#fff",
              letterSpacing: "-0.01em", lineHeight: 1.2,
            }}>
              {card.title}
            </div>
            <button
              onClick={onClose}
              style={{
                width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                border: `1px solid ${BLUE}0.2)`, background: "transparent",
                color: `${BLUE_DIM}0.5)`, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease", marginLeft: "12px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${BLUE}0.55)`; e.currentTarget.style.color = BLUE_S; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${BLUE}0.2)`; e.currentTarget.style.color = `${BLUE_DIM}0.5)`; }}
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: `${BLUE}0.1)`, marginBottom: "14px" }} />

          {/* Quote */}
          <div style={{
            fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
            fontSize: "1rem", fontStyle: "italic",
            color: GOLD_S, opacity: 0.8,
            letterSpacing: "0.04em", marginBottom: "12px",
            paddingLeft: "12px",
            borderLeft: `2px solid ${GOLD}0.4)`,
            lineHeight: 1.5,
          }}>
            "{card.quote}"
          </div>

          {/* Body */}
          <p style={{
            fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
            fontSize: "0.9rem", color: "rgba(255,255,255,0.62)",
            lineHeight: 1.72, margin: 0,
          }}>
            {card.body}
          </p>
        </div>
      </div>
    </div>
  );
}

function Chronicle({ car }) {
  const cards = car.dossier.chronicle;
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 28px 10px", flexShrink: 0 }}>
          <div style={{
            fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
            fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase",
            color: `${BLUE_DIM}0.4)`, marginBottom: "4px",
          }}>
            Milestone Archive
          </div>
          <p style={{
            fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
            fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", margin: 0, letterSpacing: "0.04em",
          }}>
            Hover to preview — click to open the full record.
          </p>
        </div>

        {/* Cards — equally spaced, vertically centered */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "0 36px 24px",
          overflow: "hidden",
        }}>
          {cards.map((card, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setSelectedCard(card)}
                style={{
                  flex: 1,
                  height: "320px",
                  maxWidth: "320px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  border: isHovered ? `1px solid ${GOLD}0.5)` : `1px solid ${BLUE}0.12)`,
                  boxShadow: isHovered
                    ? `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${GOLD}0.1)`
                    : `0 8px 32px rgba(0,0,0,0.5)`,
                  transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                  transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                {/* Image */}
                <img
                  src={card.image} alt={card.title}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", display: "block",
                    filter: isHovered ? "brightness(0.28)" : "brightness(0.6)",
                    transition: "filter 0.4s ease",
                  }}
                  onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "rgba(20,20,30,1)"; }}
                />

                {/* Always visible bottom: year + title */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "40px 18px 16px",
                  background: "linear-gradient(to top, rgba(4,4,4,0.97) 0%, transparent 100%)",
                  transform: isHovered ? "translateY(100%)" : "translateY(0)",
                  transition: "transform 0.32s cubic-bezier(0.76,0,0.24,1)",
                }}>
                  <div style={{
                    fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                    fontSize: "26px", fontWeight: 900, color: GOLD_S, lineHeight: 1, marginBottom: "4px",
                  }}>{card.year}</div>
                  <div style={{
                    fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                    fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "0.03em",
                  }}>{card.title}</div>
                </div>

                {/* Hover reveal: year + quote only */}
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  justifyContent: "center", padding: "22px 20px",
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.32s ease, transform 0.32s ease",
                }}>
                  {/* Gold accent bar */}
                  <div style={{ width: "28px", height: "2px", background: GOLD_S, opacity: 0.7, marginBottom: "10px" }} />

                  <div style={{
                    fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                    fontSize: "22px", fontWeight: 900, color: GOLD_S, lineHeight: 1, marginBottom: "6px",
                  }}>{card.year}</div>

                  <div style={{
                    fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                    fontSize: "10px", fontWeight: 700, color: "#fff",
                    letterSpacing: "0.03em", marginBottom: "14px",
                  }}>{card.title}</div>

                  <div style={{ width: "100%", height: "1px", background: `${BLUE}0.2)`, marginBottom: "12px" }} />

                  {/* Quote — the teaser */}
                  <p style={{
                    fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                    fontSize: "0.86rem", fontStyle: "italic",
                    color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0,
                  }}>
                    "{card.quote}"
                  </p>

                  {/* Click hint */}
                  <div style={{
                    position: "absolute", bottom: "14px", right: "16px",
                    display: "flex", alignItems: "center", gap: "4px",
                    fontFamily: "var(--font-rajdhani,'Rajdhani',sans-serif)",
                    fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase",
                    color: `${BLUE_DIM}0.45)`,
                  }}>
                    Open record
                    <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4h5M4 1.5l2.5 2.5L4 6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Card number */}
                <div style={{
                  position: "absolute", top: "12px", right: "12px",
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "7px", letterSpacing: "0.2em", textTransform: "uppercase",
                  color: `${BLUE_DIM}${isHovered ? "0.6)" : "0.3)"}`,
                  transition: "color 0.3s ease",
                }}>
                  {String(i + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Click modal — portal-like, renders above dossier */}
      {selectedCard && (
        <ChronicleCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}

// ── Main TechnicalDossier ─────────────────────────────────────────────────────
export default function TechnicalDossier({ car, onClose }) {
  const [activeSection, setActiveSection] = useState(0);
  const [prevSection,   setPrevSection]   = useState(null);
  const [direction,     setDirection]     = useState(1);

  const switchSection = useCallback((idx) => {
    if (idx === activeSection) return;
    setDirection(idx > activeSection ? 1 : -1);
    setPrevSection(activeSection);
    setActiveSection(idx);
  }, [activeSection]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sectionVariants = {
    enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <AnimatePresence>
      <motion.div
        key="dossier-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <motion.div
          key="dossier-panel"
          initial={{ opacity: 0, scale: 0.84, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{
            opacity: { duration: 0.5, delay: 0.1 },
            scale:   { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
            y:       { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "88vw", height: "86vh", maxWidth: "1380px",
            background: "#04040a",
            border: `1px solid ${BLUE}0.14)`,
            borderRadius: "12px",
            display: "flex", flexDirection: "column",
            overflow: "hidden", position: "relative",
            boxShadow: `0 0 120px rgba(0,0,0,0.95), 0 0 60px ${BLUE}0.06)`,
          }}
        >
          {/* Blue-gold top accent line */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: "2px", flexShrink: 0, transformOrigin: "left",
              background: `linear-gradient(90deg, ${BLUE_S}, ${BLUE_S}88 40%, ${GOLD_S} 70%, transparent)`,
            }}
          />

          {/* ── Header ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px 12px",
            borderBottom: `1px solid ${BLUE}0.08)`,
            flexShrink: 0,
          }}>
            {/* Left: car identity */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase",
                  color: `${BLUE_DIM}0.45)`, marginBottom: "3px",
                }}>
                  Manifesto
                </div>
                <div style={{
                  fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                  fontSize: "1.3rem", fontWeight: 900, color: "#fff",
                  letterSpacing: "-0.01em", lineHeight: 1,
                }}>
                  {car.name}
                  <span style={{
                    marginLeft: "12px", fontSize: "11px", fontWeight: 400,
                    color: `${GOLD}0.4)`, letterSpacing: "0.15em",
                  }}>
                    {car.model_code} · {car.year}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: section nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {SECTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => switchSection(i)}
                  style={{
                    fontFamily: "var(--font-orbitron,'Orbitron',sans-serif)",
                    fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase",
                    padding: "6px 14px", borderRadius: "4px", cursor: "pointer",
                    border: activeSection === i ? `1px solid ${BLUE_S}` : `1px solid ${BLUE}0.12)`,
                    background: activeSection === i ? `${BLUE}0.14)` : "rgba(255,255,255,0.02)",
                    color: activeSection === i ? BLUE_S : `${BLUE_DIM}0.4)`,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== i) {
                      e.currentTarget.style.borderColor = `${BLUE}0.3)`;
                      e.currentTarget.style.color = `${BLUE_DIM}0.7)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== i) {
                      e.currentTarget.style.borderColor = `${BLUE}0.12)`;
                      e.currentTarget.style.color = `${BLUE_DIM}0.4)`;
                    }
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Right: close */}
            <button
              onClick={onClose}
              style={{
                width: "34px", height: "34px", borderRadius: "50%",
                border: `1px solid ${BLUE}0.2)`, background: "transparent",
                color: `${BLUE_DIM}0.5)`, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${BLUE}0.55)`;
                e.currentTarget.style.color = BLUE_S;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${BLUE}0.2)`;
                e.currentTarget.style.color = `${BLUE_DIM}0.5)`;
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* ── Section content with slide transition ── */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeSection}
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "absolute", inset: 0, overflow: "hidden" }}
              >
                {activeSection === 0 && <Provenance car={car} />}
                {activeSection === 1 && <Supremacy car={car} />}
                {activeSection === 2 && <Matrix car={car} />}
                {activeSection === 3 && <Chronicle car={car} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer: section dots ── */}
          <div style={{
            flexShrink: 0, padding: "8px 24px",
            borderTop: `1px solid ${BLUE}0.06)`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            {SECTIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => switchSection(i)}
                style={{
                  width: activeSection === i ? "20px" : "6px",
                  height: "4px", borderRadius: "2px", border: "none",
                  cursor: "pointer", padding: 0,
                  background: activeSection === i ? BLUE_S : `${BLUE}0.2)`,
                  transition: "all 0.35s cubic-bezier(0.76,0,0.24,1)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}