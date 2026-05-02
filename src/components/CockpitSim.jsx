// src/components/CockpitSim.jsx
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const GOLD       = "rgba(200,169,110,";
const GOLD_SOLID = "#C8A96E";
const RED_SOLID  = "#E53E3E";
const RED        = "rgba(229,62,62,";

// ── Gearbox configs per transmission type ──────────────────────
const GEARBOX_CONFIGS = {
  "4-spd Manual": {
    type: "manual",
    layout: [
      ["1", "3"],
      ["2", "4"],
    ],
    gears: ["N", "1", "2", "3", "4"],
    // Speed thresholds (km/h) to shift UP into that gear
    // index matches gears array: gear[1]="1" active until speedThresholds[1]=30, then shift to gear[2]
    speedThresholds: [0, 30, 60, 110, 999],
    maxRpm: 6800,
    redline: 6500,
  },
  "6-spd Manual": {
    type: "manual",
    layout: [
      ["1", "3", "5"],
      ["2", "4", "6"],
    ],
    gears: ["N", "1", "2", "3", "4", "5", "6"],
    speedThresholds: [0, 30, 60, 100, 140, 180, 999],
    maxRpm: 7500,
    redline: 7200,
  },
  "6-spd Sequential": {
    type: "sequential",
    layout: [
      ["1", "3", "5"],
      ["2", "4", "6"],
    ],
    gears: ["N", "1", "2", "3", "4", "5", "6"],
    speedThresholds: [0, 35, 70, 110, 155, 200, 999],
    maxRpm: 8500,
    redline: 8000,
  },
  "7-spd PDK / 6-spd Manual": {
    type: "manual",
    layout: [
      ["1", "3", "5", "7"],
      ["2", "4", "6", "R"],
    ],
    gears: ["N", "1", "2", "3", "4", "5", "6", "7"],
    speedThresholds: [0, 30, 60, 95, 130, 170, 215, 999],
    maxRpm: 9200,
    redline: 9000,
  },
  "2-spd PDK (rear axle)": {
    type: "electric",
    layout: null,
    gears: ["R", "N", "D"],
    speedThresholds: null,
    maxRpm: null,
    redline: null,
  },
};

// ── Per-car cockpit config ──────────────────────────────────────
// accelRate: km/h per second when pressing up arrow (realistic 0-100 timing)
// brakeRate: km/h per second when pressing down arrow
const CAR_CONFIGS = {
  "930-turbo": {
    accelRate: 29.5, brakeRate: 52, turboLag: 2.5, transmission: "4-spd Manual",
    shiftSpeeds: [0, 65, 115, 180, 260],
  },
  "959": {
    accelRate: 43.0, brakeRate: 64, turboLag: 1.2, transmission: "6-spd Manual",
    shiftSpeeds: [0, 58, 105, 155, 210, 270, 315],
  },
  "993-gt2": {
    accelRate: 41.0, brakeRate: 62, turboLag: 1.8, transmission: "6-spd Manual",
    shiftSpeeds: [0, 62, 108, 158, 208, 255, 295],
  },
  "911-gt1-97": {
    accelRate: 41.0, brakeRate: 70, turboLag: 1.0, transmission: "6-spd Sequential",
    shiftSpeeds: [0, 75, 125, 175, 225, 275, 309],
  },
  "carrera-gt": {
    accelRate: 25.5, brakeRate: 68, turboLag: 0, transmission: "6-spd Manual",
    shiftSpeeds: [0, 70, 118, 168, 220, 275, 330],
  },
  "911-gt3-992": {
    accelRate: 29.5, brakeRate: 72, turboLag: 0, transmission: "7-spd PDK / 6-spd Manual",
    shiftSpeeds: [0, 78, 125, 170, 215, 260, 300, 318],
  },
  "taycan-turbo-s": {
    accelRate: 35.5, brakeRate: 78, turboLag: 0, transmission: "2-spd PDK (rear axle)",
  },
};

// ── Filled annular arc sector (the proper "bar" primitive) ──────
// Draws a filled band between innerR and outerR sweeping from startDeg to endDeg
// Angles: 0° = right, 90° = up (standard math, y-flipped in SVG)
function annularSectorPath(cx, cy, innerR, outerR, fromDeg, toDeg) {
  const toRad = (d) => (d * Math.PI) / 180;
  // SVG y-axis is flipped, so we negate sin
  const pt = (r, deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy - r * Math.sin(toRad(deg)),
  });

  const sweep = fromDeg - toDeg; // always positive (clockwise in our coord)
  const large = sweep > 180 ? 1 : 0;

  const o1 = pt(outerR, fromDeg);
  const o2 = pt(outerR, toDeg);
  const i2 = pt(innerR, toDeg);
  const i1 = pt(innerR, fromDeg);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 0 ${o2.x} ${o2.y}`, // outer arc CW
    `L ${i2.x} ${i2.y}`,
    `A ${innerR} ${innerR} 0 ${large} 1 ${i1.x} ${i1.y}`, // inner arc CCW
    "Z",
  ].join(" ");
}

// ── Semicircular power arc — sits outside dial, fills with pressure ──
// Resets visually when gear changes (parent passes in gear as key signal)
// ── SVG Speedometer ─────────────────────────────────────────────
function Speedometer({ speed, maxSpeed }) {
  const cx       = 100;
  const cy       = 100;
  const startAng = 220;   // start angle (left-bottom)
  const endAng   = -40;   // end angle   (right-bottom)
  const totalAng = startAng - endAng; // 260°
  const innerR   = 78;    // inner edge of bar
  const outerR   = 88;    // outer edge of bar

  const toRad = (deg) => (deg * Math.PI) / 180;

  const pct        = Math.min(speed / maxSpeed, 1);
  const currentAng = startAng - pct * totalAng;
  const needleX    = cx + 70 * Math.cos(toRad(currentAng));
  const needleY    = cy - 70 * Math.sin(toRad(currentAng));

  const isRed = pct > 0.85;
  const barColor = isRed ? RED_SOLID : GOLD_SOLID;

  // Tick marks sit just outside the bar
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const p   = i / 10;
    const ang = startAng - p * totalAng;
    const rad = toRad(ang);
    ticks.push({
      x1: cx + 90 * Math.cos(rad), y1: cy - 90 * Math.sin(rad),
      x2: cx + 94 * Math.cos(rad), y2: cy - 94 * Math.sin(rad),
      label: Math.round(p * maxSpeed),
      lx: cx + 68 * Math.cos(rad),
      ly: cy - 68 * Math.sin(rad),
    });
  }
  const minorTicks = [];
  for (let i = 0; i <= 50; i++) {
    const p   = i / 50;
    const ang = startAng - p * totalAng;
    const rad = toRad(ang);
    minorTicks.push({
      x1: cx + 90 * Math.cos(rad), y1: cy - 90 * Math.sin(rad),
      x2: cx + 92 * Math.cos(rad), y2: cy - 92 * Math.sin(rad),
    });
  }

  return (
    <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={95} fill="rgba(0,0,0,0.6)" stroke="rgba(200,169,110,0.15)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={97} fill="none" stroke="rgba(200,169,110,0.06)" strokeWidth="0.5"/>



      {/* Minor ticks */}
      {minorTicks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
      ))}

      {/* Major ticks + labels */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="rgba(200,169,110,0.6)" strokeWidth="1.5"/>
          <text x={t.lx} y={t.ly} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Orbitron, sans-serif">
            {t.label}
          </text>
        </g>
      ))}

      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke="#fff" strokeWidth="1.5" strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 2px #fff8)" }}
      />
      <circle cx={cx} cy={cy} r="6" fill="#1a1a1a" stroke={GOLD_SOLID} strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r="2.5" fill={GOLD_SOLID}/>

      {/* Speed readout */}
      <text x={cx} y={cy + 28} textAnchor="middle"
        fill="#fff" fontSize="22" fontWeight="900" fontFamily="Orbitron, sans-serif">
        {Math.round(speed)}
      </text>
      <text x={cx} y={cy + 40} textAnchor="middle"
        fill="rgba(200,169,110,0.5)" fontSize="7"
        fontFamily="Orbitron, sans-serif" letterSpacing="3">
        KM/H
      </text>
      <text x={cx} y={cy - 56} textAnchor="middle"
        fill="rgba(255,255,255,0.2)" fontSize="6"
        fontFamily="Orbitron, sans-serif" letterSpacing="4">
        SPEED
      </text>

    </svg>
  );
}

// ── SVG RPM Dial ────────────────────────────────────────────────
function RPMDial({ rpm, maxRpm, redline, isElectric }) {
  if (isElectric) {
    const pct = Math.min(rpm / 100, 1);
    return (
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        <circle cx={100} cy={100} r={95} fill="rgba(0,0,0,0.6)" stroke="rgba(200,169,110,0.15)" strokeWidth="1"/>
        <circle cx={100} cy={100} r={90} fill="none" stroke="rgba(200,169,110,0.08)" strokeWidth="0.5"/>
        <rect x={60} y={40} width={80} height={8} rx={4} fill="rgba(255,255,255,0.06)"/>
        <rect x={60} y={40} width={80 * pct} height={8} rx={4}
          fill={GOLD_SOLID} style={{ filter: `drop-shadow(0 0 4px ${GOLD_SOLID})` }}/>
        <text x={100} y={80} textAnchor="middle" fill="#fff" fontSize="28" fontWeight="900"
          fontFamily="Orbitron, sans-serif">{Math.round(pct * 100)}%</text>
        <text x={100} y={95} textAnchor="middle" fill="rgba(200,169,110,0.5)" fontSize="7"
          fontFamily="Orbitron, sans-serif" letterSpacing="3">POWER</text>
        <text x={100} y={115} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="6"
          fontFamily="Orbitron, sans-serif" letterSpacing="4">INSTANT TORQUE</text>
      </svg>
    );
  }

  const cx       = 100;
  const cy       = 100;
  const startAng = 220;
  const endAng   = -40;
  const totalAng = startAng - endAng;
  const innerR   = 78;
  const outerR   = 88;
  const toRad    = (deg) => (deg * Math.PI) / 180;

  const pct        = Math.min(rpm / maxRpm, 1);
  const redlinePct = redline / maxRpm;
  const currentAng = startAng - pct * totalAng;
  const redlineAng = startAng - redlinePct * totalAng;
  const needleX    = cx + 70 * Math.cos(toRad(currentAng));
  const needleY    = cy - 70 * Math.sin(toRad(currentAng));

  const numTicks = Math.round(maxRpm / 1000);
  const ticks = [];
  for (let i = 0; i <= numTicks; i++) {
    const p   = i / numTicks;
    const ang = startAng - p * totalAng;
    const rad = toRad(ang);
    ticks.push({
      x1: cx + 90 * Math.cos(rad), y1: cy - 90 * Math.sin(rad),
      x2: cx + 94 * Math.cos(rad), y2: cy - 94 * Math.sin(rad),
      label: i,
      lx: cx + 68 * Math.cos(rad),
      ly: cy - 68 * Math.sin(rad),
      isRed: i * 1000 >= redline,
    });
  }

  return (
    <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
      <circle cx={cx} cy={cy} r={95} fill="rgba(0,0,0,0.6)" stroke="rgba(200,169,110,0.15)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={97} fill="none" stroke="rgba(200,169,110,0.06)" strokeWidth="0.5"/>



      {/* Ticks + labels — outside bar */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isRed ? "rgba(229,62,62,0.7)" : "rgba(200,169,110,0.5)"}
            strokeWidth="1.5"/>
          <text x={t.lx} y={t.ly} textAnchor="middle" dominantBaseline="middle"
            fill={t.isRed ? "rgba(229,62,62,0.7)" : "rgba(255,255,255,0.35)"}
            fontSize="7" fontFamily="Orbitron, sans-serif">{t.label}</text>
        </g>
      ))}

      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke="#fff" strokeWidth="1.5" strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 2px #fff8)" }}
      />
      <circle cx={cx} cy={cy} r="6" fill="#1a1a1a"
        stroke={pct > redlinePct ? RED_SOLID : GOLD_SOLID} strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r="2.5" fill={pct > redlinePct ? RED_SOLID : GOLD_SOLID}/>

      {/* RPM readout */}
      <text x={cx} y={cy + 26} textAnchor="middle"
        fill={pct > redlinePct ? RED_SOLID : "#fff"}
        fontSize="18" fontWeight="900" fontFamily="Orbitron, sans-serif">
        {Math.round(rpm / 100) / 10}
      </text>
      <text x={cx} y={cy + 38} textAnchor="middle"
        fill="rgba(200,169,110,0.5)" fontSize="6"
        fontFamily="Orbitron, sans-serif" letterSpacing="2">
        ×1000 RPM
      </text>
      <text x={cx} y={cy - 56} textAnchor="middle"
        fill="rgba(255,255,255,0.2)" fontSize="6"
        fontFamily="Orbitron, sans-serif" letterSpacing="4">
        ENGINE
      </text>

    </svg>
  );
}

// ── Pressure Bar ────────────────────────────────────────────────
function PressureBar({ pressure, isAccel, isBrake }) {
  const color = isBrake ? RED_SOLID : GOLD_SOLID;
  const label = isBrake ? "BRAKE" : "THROTTLE";
  const fillPct = Math.min(Math.max(pressure, 0), 100);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "8px", height: "100%",
    }}>
      <div style={{
        fontFamily: "Orbitron, sans-serif",
        fontSize: "7px", letterSpacing: "0.3em", textTransform: "uppercase",
        color: `${GOLD}0.4)`,
      }}>{label}</div>

      <div style={{
        width: "32px", height: "172px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Fill — transition slowed to feel gradual */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to top, ${color}, ${isBrake ? "rgba(229,62,62,0.3)" : "rgba(200,169,110,0.3)"})`,
          borderRadius: "16px",
          transform: `scaleY(${fillPct / 100})`,
          transformOrigin: "bottom",
          // Smooth but not instant — 150ms feels weighty
          transition: "transform 0.08s linear",
          boxShadow: fillPct > 5 ? `0 0 12px ${color}44` : "none",
        }} />

        {[25, 50, 75].map(p => (
          <div key={p} style={{
            position: "absolute", left: "4px", right: "4px",
            bottom: `${p}%`, height: "1px",
            background: "rgba(255,255,255,0.1)",
          }}/>
        ))}
      </div>

      <div style={{
        fontFamily: "Orbitron, sans-serif",
        fontSize: "9px", fontWeight: 700,
        color: fillPct > 5 ? color : "rgba(255,255,255,0.2)",
      }}>{Math.round(fillPct)}%</div>
    </div>
  );
}

// ── Manual H-Pattern Gearbox ────────────────────────────────────
function ManualGearbox({ config, currentGear }) {
  const { layout, gears } = config;
  const cols = layout[0].length;

  // Always show N in the center of the H-pattern (between top and bottom rows)
  // R is always shown as decorative last position in bottom row (already in layout for 7-spd)
  // For layouts without R, we add it as a static decoration

  const svgWidth  = cols * 52 + 20;
  const svgHeight = 130;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{
        fontFamily: "Orbitron, sans-serif",
        fontSize: "7px", letterSpacing: "0.35em", textTransform: "uppercase",
        color: `${GOLD}0.4)`,
      }}>Gearbox</div>

      <div style={{ position: "relative" }}>
        <svg width={svgWidth} height={svgHeight} style={{ overflow: "visible" }}>
          {/* Horizontal rail */}
          <line x1={20} y1={40} x2={cols * 52} y2={40}
            stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>

          {/* Vertical rails per column */}
          {layout[0].map((_, ci) => (
            <line key={ci}
              x1={20 + ci * 52 + 16} y1={15}
              x2={20 + ci * 52 + 16} y2={65}
              stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
          ))}

          {/* N node — always in center of horizontal rail */}
          {(() => {
            const nX = (20 + (cols * 52)) / 2;
            const nY = 40;
            const isN = currentGear === "N";
            return (
              <g>
                <circle cx={nX} cy={nY} r={14}
                  fill={isN ? `${GOLD}0.15)` : "rgba(20,20,20,0.8)"}
                  stroke={isN ? GOLD_SOLID : "rgba(255,255,255,0.2)"}
                  strokeWidth={isN ? 1.5 : 1}
                  style={{ filter: isN ? `drop-shadow(0 0 6px ${GOLD_SOLID})` : "none" }}
                />
                <text x={nX} y={nY} textAnchor="middle" dominantBaseline="middle"
                  fill={isN ? GOLD_SOLID : "rgba(255,255,255,0.35)"}
                  fontSize={isN ? "11" : "10"} fontWeight={isN ? "900" : "400"}
                  fontFamily="Orbitron, sans-serif">N</text>
              </g>
            );
          })()}

          {/* Top row gears */}
          {layout[0].map((g, ci) => {
            const active = currentGear === g;
            return (
              <g key={`t${ci}`}>
                <circle cx={20 + ci * 52 + 16} cy={15} r={14}
                  fill={active ? `${GOLD}0.15)` : "rgba(20,20,20,0.8)"}
                  stroke={active ? GOLD_SOLID : "rgba(255,255,255,0.12)"}
                  strokeWidth={active ? 1.5 : 1}
                  style={{ filter: active ? `drop-shadow(0 0 6px ${GOLD_SOLID})` : "none" }}
                />
                <text x={20 + ci * 52 + 16} y={15} textAnchor="middle" dominantBaseline="middle"
                  fill={active ? GOLD_SOLID : "rgba(255,255,255,0.4)"}
                  fontSize={active ? "11" : "10"} fontWeight={active ? "900" : "400"}
                  fontFamily="Orbitron, sans-serif">{g}</text>
              </g>
            );
          })}

          {/* Bottom row gears */}
          {layout[1].map((g, ci) => {
            const active = currentGear === g;
            // R is always decorative (never active through normal driving)
            const isR = g === "R";
            return (
              <g key={`b${ci}`}>
                <circle cx={20 + ci * 52 + 16} cy={65} r={14}
                  fill={active && !isR ? `${GOLD}0.15)` : isR ? `${RED}0.06)` : "rgba(20,20,20,0.8)"}
                  stroke={isR ? `${RED}0.3)` : active ? GOLD_SOLID : "rgba(255,255,255,0.12)"}
                  strokeWidth={active && !isR ? 1.5 : 1}
                  strokeDasharray={isR ? "3 2" : "none"}
                  style={{ filter: active && !isR ? `drop-shadow(0 0 6px ${GOLD_SOLID})` : "none" }}
                />
                <text x={20 + ci * 52 + 16} y={65} textAnchor="middle" dominantBaseline="middle"
                  fill={isR ? `${RED}0.4)` : active ? GOLD_SOLID : "rgba(255,255,255,0.4)"}
                  fontSize={active && !isR ? "11" : "10"} fontWeight={active && !isR ? "900" : "400"}
                  fontFamily="Orbitron, sans-serif">{g}</text>
              </g>
            );
          })}

          {/* Static R decoration for gearboxes that don't have R in layout */}
          {!layout[1].includes("R") && (() => {
            // Place R to the right of the last bottom-row gear
            const rx = 20 + (cols) * 52 + 16;
            const ry = 65;
            return (
              <g>
                {/* extend the horizontal rail to include R */}
                <line x1={cols * 52} y1={40} x2={rx} y2={40}
                  stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
                <line x1={rx} y1={40} x2={rx} y2={ry}
                  stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
                <circle cx={rx} cy={ry} r={14}
                  fill={`${RED}0.06)`}
                  stroke={`${RED}0.3)`}
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
                <text x={rx} y={ry} textAnchor="middle" dominantBaseline="middle"
                  fill={`${RED}0.4)`}
                  fontSize="10" fontWeight="400"
                  fontFamily="Orbitron, sans-serif">R</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Current gear large display */}
      <div style={{
        fontFamily: "Orbitron, sans-serif",
        fontSize: "36px", fontWeight: 900,
        color: currentGear === "N" ? "rgba(255,255,255,0.3)" :
               currentGear === "R" ? RED_SOLID : GOLD_SOLID,
        lineHeight: 1, letterSpacing: "-0.02em",
        textShadow: currentGear !== "N" ? `0 0 20px ${currentGear === "R" ? RED_SOLID : GOLD_SOLID}` : "none",
      }}>{currentGear}</div>
    </div>
  );
}

// ── Electric Gearbox ─────────────────────────────────────────────
function ElectricGearbox({ currentGear }) {
  const positions = ["R", "N", "D"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{
        fontFamily: "Orbitron, sans-serif",
        fontSize: "7px", letterSpacing: "0.35em", textTransform: "uppercase",
        color: `${GOLD}0.4)`,
      }}>Drive Mode</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {positions.map((g) => {
          const active = currentGear === g;
          return (
            <div key={g} style={{
              width: "60px", height: "44px",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${active ? (g === "R" ? RED_SOLID : GOLD_SOLID) : "rgba(255,255,255,0.1)"}`,
              background: active ? (g === "R" ? `${RED}0.12)` : `${GOLD}0.12)`) : "rgba(10,10,10,0.5)",
              borderRadius: "3px",
              transition: "all 0.2s ease",
              boxShadow: active ? `0 0 12px ${g === "R" ? RED_SOLID : GOLD_SOLID}44` : "none",
            }}>
              <span style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "18px", fontWeight: 900,
                color: active ? (g === "R" ? RED_SOLID : GOLD_SOLID) : "rgba(255,255,255,0.2)",
              }}>{g}</span>
            </div>
          );
        })}
      </div>

      <div style={{
        fontFamily: "Orbitron, sans-serif",
        fontSize: "36px", fontWeight: 900,
        color: currentGear === "R" ? RED_SOLID : currentGear === "N" ? "rgba(255,255,255,0.3)" : GOLD_SOLID,
        lineHeight: 1,
        textShadow: `0 0 20px ${currentGear === "R" ? RED_SOLID : GOLD_SOLID}`,
      }}>{currentGear}</div>
    </div>
  );
}

// ── Main CockpitSim ─────────────────────────────────────────────
export default function CockpitSim({ isOpen, onClose, car }) {
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);
  const accelRef   = useRef(false);
  const brakeRef   = useRef(false);
  const rafRef     = useRef(null);

  // Mutable physics state — kept in refs to avoid stale closures in RAF loop
  const physicsRef = useRef({
    speed: 0, rpm: 800, gearIndex: 0, pressure: 0,
  });

  const cfg        = car ? CAR_CONFIGS[car.id]              : null;
  const gearCfg    = cfg  ? GEARBOX_CONFIGS[cfg.transmission] : null;
  const isElectric = gearCfg?.type === "electric";
  const maxSpeed   = car  ? car.stats.topSpeed.value         : 300;
  const maxRpm     = gearCfg ? gearCfg.maxRpm  : 8000;
  const redline    = gearCfg ? gearCfg.redline : 7000;

  const [speed,      setSpeed]      = useState(0);
  const [rpm,        setRpm]        = useState(800);
  const [gear,       setGear]       = useState("N");
  const [gearIndex,  setGearIndex]  = useState(0);
  const [pressure,   setPressure]   = useState(0);
  const [isAccel,    setIsAccel]    = useState(false);
  const [isBrake,    setIsBrake]    = useState(false);
  const [flashAccel, setFlashAccel] = useState(false);
  const [flashBrake, setFlashBrake] = useState(false);

  const startAccel = () => {
    accelRef.current = true;
    setFlashAccel(true);
  };
  const stopAccel = () => {
    accelRef.current = false;
    setFlashAccel(false);
  };
  const startBrake = () => {
    brakeRef.current = true;
    setFlashBrake(true);
  };
  const stopBrake = () => {
    brakeRef.current = false;
    setFlashBrake(false);
  };

  // Track previous gear to detect up/downshift
  const prevGearIndexRef = useRef(0);
  useEffect(() => {
    const prev = prevGearIndexRef.current;
    if (gearIndex !== prev) {
      if (gearIndex > prev) {
        // Upshift — reset pressure to 0
      } else {
        // Downshift — flash pressure to 100 then let it drain naturally
      }
      prevGearIndexRef.current = gearIndex;
    }
  }, [gearIndex]);

  // Reset on car change
  useEffect(() => {
    // Electric gears: ["R","N","D"] — index 1 = N. ICE gears: ["N","1",...] — index 0 = N
    const initGearIndex = isElectric ? 1 : 0;
    physicsRef.current = { speed: 0, rpm: isElectric ? 0 : 800, gearIndex: initGearIndex, pressure: 0 };
    prevGearIndexRef.current = initGearIndex;
    setSpeed(0);
    setRpm(isElectric ? 0 : 800);
    setGear("N");
    setGearIndex(initGearIndex);
    setPressure(0);
    setIsAccel(false);
    setIsBrake(false);
  }, [car?.id]);

  // Physics loop
  useEffect(() => {
    if (!isOpen || !cfg || !gearCfg) return;

    const gears            = gearCfg.gears;
    const speedThresholds  = cfg.shiftSpeeds ?? gearCfg.speedThresholds;
    const DT               = 1 / 60; // ~60fps delta

    // Pressure ramp config:
    // Full press (100%) reached in ~2.5s → rate = 100 / 2.5 / 60 per frame ≈ 0.67 per frame
    const PRESSURE_RAMP_UP   = 100 / (2.5 * 60);  // ~0.67 per frame
    const PRESSURE_RAMP_DOWN = 100 / (1.0 * 60);  // release faster — 1s to drop

    const tick = () => {
      const p     = physicsRef.current;
      const accel = accelRef.current;
      const brake = brakeRef.current;

      if (isElectric) {
        if (accel) {
          // Auto-shift N→D when accelerating
          if (gears[p.gearIndex] === "N") p.gearIndex = 2; // N(1) → D(2)
          if (gears[p.gearIndex] === "D") {
            p.speed = Math.min(p.speed + cfg.accelRate * DT, maxSpeed);
            p.rpm   = (p.speed / maxSpeed) * 100;
          }
          p.pressure = Math.min(p.pressure + PRESSURE_RAMP_UP, 100);
        } else if (brake) {
          p.speed    = Math.max(p.speed - cfg.brakeRate * DT, 0);
          p.pressure = Math.min(p.pressure + PRESSURE_RAMP_UP, 100);
          p.rpm      = (p.speed / maxSpeed) * 100;
        } else {
          p.speed    = Math.max(p.speed - 8 * DT, 0);
          p.pressure = Math.max(p.pressure - PRESSURE_RAMP_DOWN, 0);
          p.rpm      = (p.speed / maxSpeed) * 100;
        }
      } else {
        // ── Speed-based gear logic ──
        // Determine correct gear from current speed thresholds
        if (accel) {
          // Auto upshift: if speed exceeds threshold for current gear, move up
          if (p.gearIndex === 0) {
            // In N — kick into 1st immediately
            p.gearIndex = 1;
          }
          while (
            speedThresholds &&
            p.gearIndex < gears.length - 1 &&
            gears[p.gearIndex] !== "N" &&
            p.speed >= speedThresholds[p.gearIndex]
          ) {
            p.gearIndex++;
          }

          // Turbo lag: reduce accel at low rpm
          const lagFactor = cfg.turboLag > 0 && p.speed < 40 ? 0.4 : 1.0;

          // Acceleration: realistic km/h per second
          p.speed = Math.min(p.speed + cfg.accelRate * DT * lagFactor, maxSpeed);

          // RPM tracks speed within current gear band
          const gearMin = speedThresholds ? speedThresholds[p.gearIndex - 1] ?? 0 : 0;
          const gearMax = speedThresholds ? speedThresholds[p.gearIndex] ?? maxSpeed : maxSpeed;
          const bandPct = gearMax > gearMin
            ? Math.max(0, Math.min((p.speed - gearMin) / (gearMax - gearMin), 1))
            : 0;
          const rpmMin = 1200;
          const rpmMax = maxRpm * 0.95;
          p.rpm = rpmMin + bandPct * (rpmMax - rpmMin);

          p.pressure = Math.min(p.pressure + PRESSURE_RAMP_UP, 100);

        } else if (brake) {
          p.speed = Math.max(p.speed - cfg.brakeRate * DT, 0);

          // Auto downshift based on speed
          if (speedThresholds) {
            while (p.gearIndex > 1 && p.speed < speedThresholds[p.gearIndex - 1] * 0.8) {
              p.gearIndex--;
            }
          }
          if (p.speed <= 1) p.gearIndex = 0; // back to N when stopped

          // RPM drops with speed
          const gearMin = speedThresholds ? speedThresholds[p.gearIndex - 1] ?? 0 : 0;
          const gearMax = speedThresholds ? speedThresholds[p.gearIndex] ?? maxSpeed : maxSpeed;
          const bandPct = gearMax > gearMin
            ? Math.max(0, Math.min((p.speed - gearMin) / (gearMax - gearMin), 1))
            : 0;
          p.rpm = Math.max(800, 1200 + bandPct * (maxRpm * 0.95 - 1200));

          p.pressure = Math.min(p.pressure + PRESSURE_RAMP_UP, 100);

        } else {
          // Coast — gradual decel
          p.speed = Math.max(p.speed - 4 * DT, 0);
          if (p.speed <= 1) p.gearIndex = 0;
          p.pressure = Math.max(p.pressure - PRESSURE_RAMP_DOWN, 0);

          // RPM idles
          p.rpm = Math.max(800, p.rpm - 200 * DT);
        }
      }

      setSpeed(p.speed);
      setRpm(p.rpm);
      setGear(gears[p.gearIndex]);
      setGearIndex(p.gearIndex);
      setPressure(p.pressure);
      setIsAccel(accel);
      setIsBrake(brake);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isOpen, car?.id]);

  // Key handlers
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      if (e.key === "ArrowUp")   { e.preventDefault(); startAccel(); }
      if (e.key === "ArrowDown") { e.preventDefault(); startBrake(); }
      if (e.key === "Escape")    onClose();
    };
    const onUp = (e) => {
      if (e.key === "ArrowUp")   stopAccel();
      if (e.key === "ArrowDown") stopBrake();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup",   onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup",   onUp);
    };
  }, [isOpen, onClose]);

  // GSAP open/close
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;
    if (isOpen) {
      gsap.set(overlayRef.current, { display: "flex" });
      gsap.set(panelRef.current, { y: 40, opacity: 0, scale: 0.96 });
      gsap.timeline()
        .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
        .to(panelRef.current,   { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, "-=0.1");
    } else {
      gsap.timeline({ onComplete: () => gsap.set(overlayRef.current, { display: "none" }) })
        .to(panelRef.current,   { y: 24, opacity: 0, scale: 0.97, duration: 0.3, ease: "power2.in" })
        .to(overlayRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" }, "-=0.1");
    }
  }, [isOpen]);

  if (!car || !cfg || !gearCfg) return null;

  const cockpitImage = car.cockpit || `/images/cockpit/${car.id}.jpg`;

  return (
    <div
      ref={overlayRef}
      style={{
        display: "none", opacity: 0,
        position: "fixed", inset: 0, zIndex: 200,
        alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Hue overlays */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 199, pointerEvents: "none",
        background: flashAccel ? "rgba(200,169,110,0.07)" : "transparent",
        transition: "background 0.1s ease",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 199, pointerEvents: "none",
        background: flashBrake ? "rgba(229,62,62,0.1)" : "transparent",
        transition: "background 0.1s ease",
      }} />

      <div
        ref={panelRef}
        style={{
          width: "92vw", height: "88vh", maxWidth: "1400px",
          position: "relative", overflow: "hidden",
          borderRadius: "4px",
          border: `1px solid ${GOLD}0.2)`,
          boxShadow: `0 0 100px rgba(0,0,0,0.95), inset 0 1px 0 ${GOLD}0.1)`,
          display: "flex", flexDirection: "column",
          zIndex: 200,
        }}
      >
        {/* Cockpit Background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${cockpitImage})`,
          backgroundSize: "cover", backgroundPosition: "center",
          zIndex: 0,
        }} />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.75) 100%)",
        }} />

        {/* Gold top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px", zIndex: 10,
          background: `linear-gradient(90deg, transparent, ${GOLD_SOLID}, transparent)`,
          opacity: 0.6,
        }} />

        {/* Header */}
        <div style={{
          position: "relative", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 28px 12px",
          borderBottom: `1px solid ${GOLD}0.1)`,
          flexShrink: 0,
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)",
        }}>
          <div>
            <div style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase",
              color: `${GOLD}0.5)`, marginBottom: "3px",
            }}>Cockpit Simulator</div>
            <div style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "14px", fontWeight: 900, color: "#fff",
            }}>{car.name}
              <span style={{ marginLeft: "12px", fontSize: "10px", fontWeight: 400, color: `${GOLD}0.4)` }}>
                {car.year}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <KeyHint
                label="↑"
                active={flashAccel}
                color={GOLD_SOLID}
                hint="Accelerate"
                onPressStart={startAccel}
                onPressEnd={stopAccel}
              />
              <KeyHint
                label="↓"
                active={flashBrake}
                color={RED_SOLID}
                hint="Brake"
                onPressStart={startBrake}
                onPressEnd={stopBrake}
              />
            </div>
            <button onClick={onClose} style={{
              width: "34px", height: "34px", borderRadius: "50%",
              border: `1px solid ${GOLD}0.3)`, background: "transparent",
              color: `${GOLD}0.6)`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = GOLD_SOLID; e.currentTarget.style.color = GOLD_SOLID; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${GOLD}0.3)`; e.currentTarget.style.color = `${GOLD}0.6)`; }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Instrument Panel */}
        <div style={{
          position: "relative", zIndex: 10,
          flex: 1, display: "grid",
          gridTemplateColumns: "1fr 60px 1fr 60px 1fr",
          alignItems: "center", justifyItems: "center",
          padding: "20px 40px 28px",
          gap: "0", minHeight: 0,
        }}>
          <InstrumentPanel>
            <Speedometer speed={speed} maxSpeed={maxSpeed} />
          </InstrumentPanel>

          <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PressureBar pressure={pressure} isAccel={isAccel} isBrake={isBrake} />
          </div>

          <InstrumentPanel>
            <RPMDial
              rpm={rpm}
              maxRpm={isElectric ? 100 : maxRpm}
              redline={isElectric ? 100 : redline}
              isElectric={isElectric}
            />
          </InstrumentPanel>

          <div style={{ width: "1px", height: "60%", background: `${GOLD}0.08)` }} />

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            alignSelf: "center", justifySelf: "center",
            padding: "18px 22px",
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
            border: `1px solid ${GOLD}0.1)`,
            borderRadius: "14px",
            width: "max-content",
            minWidth: "0",
            height: "auto",
            maxWidth: "100%",
          }}>
            {isElectric
              ? <ElectricGearbox currentGear={gear} />
              : <ManualGearbox config={gearCfg} currentGear={gear} />
            }
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: "relative", zIndex: 10,
          padding: "10px 28px",
          borderTop: `1px solid ${GOLD}0.08)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)",
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase",
            color: `${GOLD}0.3)`,
          }}>{car.engineCharacter}</div>
          <div style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase",
            color: `${GOLD}0.2)`,
          }}>Press ESC to exit</div>
        </div>
      </div>
    </div>
  );
}

// ── Helper sub-components ────────────────────────────────────────
// ── SemiCircle pressure bar ─────────────────────────────────────
function InstrumentPanel({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "min(260px, 100%)", height: "min(260px, 90%)",
        padding: "12px",
        background: hovered ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${GOLD}${hovered ? "0.25" : "0.1"})`,
        borderRadius: "50%",
        transition: "all 0.3s ease",
        boxShadow: hovered ? `0 0 30px ${GOLD}0.1), inset 0 0 20px rgba(0,0,0,0.3)` : "none",
        cursor: "default",
      }}
    >
      {children}
    </div>
  );
}

function KeyHint({ label, active, color, hint, onPressStart, onPressEnd }) {
  return (
    <div
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onPressStart?.();
      }}
      onPointerUp={onPressEnd}
      onPointerCancel={onPressEnd}
      onPointerLeave={onPressEnd}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "pointer", userSelect: "none" }}
    >
      <div style={{
        width: "28px", height: "28px",
        border: `1px solid ${active ? color : "rgba(255,255,255,0.15)"}`,
        background: active ? `${color}22` : "rgba(0,0,0,0.4)",
        borderRadius: "4px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Orbitron, sans-serif", fontSize: "12px", fontWeight: 700,
        color: active ? color : "rgba(255,255,255,0.3)",
        transition: "all 0.1s ease",
        boxShadow: active ? `0 0 8px ${color}44` : "none",
      }}>{label}</div>
      <div style={{
        fontFamily: "Orbitron, sans-serif", fontSize: "6px",
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.2)",
      }}>{hint}</div>
    </div>
  );
}
