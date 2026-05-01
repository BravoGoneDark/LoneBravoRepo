// sections/CarDetailPage.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate }               from "react-router-dom";
import { motion }                               from "framer-motion";
import { cars, getCarById }                     from "../constants/carData";
import CarViewer                                from "../components/CarViewer";
import StatBar                                  from "../components/StatBar";
import Navbar                                   from "../components/Navbar";
import DriveModal                               from "../components/DriveModal";
import ARViewer                                 from "../components/ARViewer";

// ─── Stat range across fleet ─────────────────────────────────
function buildStatRanges(carList) {
  return {
    topSpeed:     { min: Math.min(...carList.map(c => c.stats.topSpeed.value)),     max: Math.max(...carList.map(c => c.stats.topSpeed.value))     },
    acceleration: { min: Math.min(...carList.map(c => c.stats.acceleration.value)), max: Math.max(...carList.map(c => c.stats.acceleration.value)) },
    horsepower:   { min: Math.min(...carList.map(c => c.stats.horsepower.value)),   max: Math.max(...carList.map(c => c.stats.horsepower.value))   },
    torque:       { min: Math.min(...carList.map(c => c.stats.torque.value)),       max: Math.max(...carList.map(c => c.stats.torque.value))       },
    weight:       { min: Math.min(...carList.map(c => c.stats.weight.value)),       max: Math.max(...carList.map(c => c.stats.weight.value))       },
  };
}

function statPercent(value, min, max) {
  if (max === min) return 80;
  return Math.round(60 + ((value - min) / (max - min)) * 40);
}
function accelPercent(value, min, max) {
  if (max === min) return 80;
  return Math.round(60 + ((max - value) / (max - min)) * 40);
}
function weightPercent(value, min, max) {
  if (max === min) return 80;
  return Math.round(60 + ((max - value) / (max - min)) * 40);
}

// ─── Stat Panel ──────────────────────────────────────────────
function StatPanel({ car, ranges, accentColor }) {
  const barsData = [
    { label: "Top Speed", value: car.stats.topSpeed.value,     unit: car.stats.topSpeed.unit,     percent: statPercent(car.stats.topSpeed.value, ranges.topSpeed.min, ranges.topSpeed.max) },
    { label: "0 – 100",   value: car.stats.acceleration.value, unit: car.stats.acceleration.unit, percent: accelPercent(car.stats.acceleration.value, ranges.acceleration.min, ranges.acceleration.max) },
    { label: "Power",     value: car.stats.horsepower.value,   unit: car.stats.horsepower.unit,   percent: statPercent(car.stats.horsepower.value, ranges.horsepower.min, ranges.horsepower.max) },
    { label: "Torque",    value: car.stats.torque.value,       unit: car.stats.torque.unit,       percent: statPercent(car.stats.torque.value, ranges.torque.min, ranges.torque.max) },
  ];

  const textData = [
    { label: "Weight",       value: `${car.stats.weight.value} kg` },
    { label: "Drivetrain",   value: car.stats.drivetrain.value     },
    { label: "Transmission", value: car.stats.transmission.value   },
    { label: "Engine",       value: car.stats.engine.value         },
  ];

  return (
    <motion.div
      style={{ perspective: "1200px", perspectiveOrigin: "left center" }}
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative"
        style={{
          transform:       "rotateY(14deg) rotateX(3deg)",
          transformStyle:  "preserve-3d",
          transformOrigin: "left center",
          background:      "rgba(10,10,10,0.75)",
          backdropFilter:  "blur(12px)",
          border:          `1px solid ${accentColor}33`,
          boxShadow:       `4px 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 ${accentColor}22`,
          padding:         "32px 36px",
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-px"  style={{ background: accentColor }} />
        <div className="absolute top-0 left-0 w-px h-8"  style={{ background: accentColor }} />
        <div className="absolute bottom-0 right-0 w-8 h-px" style={{ background: accentColor }} />
        <div className="absolute bottom-0 right-0 w-px h-8" style={{ background: accentColor }} />

        <p className="font-orbitron text-[8px] tracking-[0.4em] uppercase mb-5"
          style={{ color: "rgba(255,255,255,0.2)" }}>
          Performance Profile
        </p>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-x-8">
          {/* LEFT — animated bars */}
          <div className="flex flex-col gap-6 pr-6"
            style={{ borderRight: `1px solid ${accentColor}22` }}>
            {barsData.map((s, i) => (
              <StatBar
                key={s.label}
                label={s.label}
                value={s.value}
                unit={s.unit}
                percent={s.percent}
                accentColor={accentColor}
                delay={0.5 + i * 0.08}
              />
            ))}
          </div>

          {/* RIGHT — text specs */}
          <div className="flex flex-col justify-between gap-4 pl-4">
            {textData.map(s => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="font-orbitron text-[8px] tracking-[0.3em] uppercase"
                  style={{ color: "rgba(255,255,255,0.2)" }}>
                  {s.label}
                </span>
                <span className="font-rajdhani text-base leading-tight"
                  style={{ color: accentColor }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Color picker ─────────────────────────────────────────────
function ColorPicker({ options, selected, onSelect, accentColor }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-orbitron text-[8px] tracking-[0.4em] uppercase"
        style={{ color: "rgba(255,255,255,0.25)" }}>
        Exterior Colour
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.hex}
            onClick={() => onSelect(opt)}
            title={opt.name}
            className="relative w-6 h-6 rounded-full transition-transform duration-200 hover:scale-110"
            style={{
              background: opt.hex,
              border:     selected.hex === opt.hex ? `2px solid ${accentColor}` : "2px solid rgba(255,255,255,0.1)",
              boxShadow:  selected.hex === opt.hex ? `0 0 8px ${accentColor}88` : "none",
            }}
          />
        ))}
      </div>
      <p className="font-orbitron text-[9px] tracking-widest" style={{ color: accentColor }}>
        {selected.name}
      </p>
    </div>
  );
}

// ─── Speaker icon ─────────────────────────────────────────────
function SpeakerIcon({ muted }) {
  return muted ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function CarDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const car      = getCarById(id);

  const ranges = useMemo(() => buildStatRanges(cars), []);

  const [color,         setColor]         = useState(car?.colorOptions?.[0] ?? { name: "Default", hex: "#C8A96E" });
  const [muted,         setMuted]         = useState(false);
  const [driveOpen,     setDriveOpen]     = useState(false);
  const [arOpen,        setArOpen]        = useState(false);
  const [cockpitOpen,   setCockpitOpen]   = useState(false); // placeholder for CockpitSim

  const audioRef = useRef(null);

  useEffect(() => {
    if (!car?.engineSound) return;
    const audio = new Audio(`/sounds/${car.engineSound}.mp3`);
    audio.volume = 0.25;
    audio.loop   = false;
    audioRef.current = audio;
    const timer = setTimeout(() => {
      audio.play().catch(() => {});
    }, 400);
    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [car?.engineSound]);

  const handleMuteToggle = () => {
    setMuted(prev => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  if (!car) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="font-orbitron text-white/40">Car not found.</p>
      </div>
    );
  }

  const accent = car.accentColor;

  return (
    <>
      <div className="h-screen text-white relative overflow-hidden" style={{ background: "#0D0D0D" }}>

        {/* Showroom grid bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }} />

        {/* Accent glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 55% 60%, ${accent}14 0%, transparent 70%)`,
        }} />

        {/* Navbar */}
        <Navbar activeSection="" />

        {/* ── 2-row layout ─────────────────────────── */}
        <div className="relative z-10 h-full flex flex-col pt-14 overflow-hidden">

          {/* ── TOP ROW: 3 columns ─────────────────────────── */}
          <div className="grid grid-cols-[420px_1fr_260px] flex-1 min-h-0">

            {/* LEFT */}
            <div className="flex flex-col justify-between px-8 py-5 gap-4 overflow-hidden">
              <div>
                <motion.div className="flex items-center gap-2 mb-3"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}>
                  <span className="block w-4 h-px" style={{ background: accent }} />
                  <span className="font-orbitron text-[8px] tracking-[0.5em] uppercase" style={{ color: accent }}>
                    {car.era} · {car.model_code}
                  </span>
                  <span className="font-orbitron text-[7px] tracking-widest border px-1.5 py-0.5"
                    style={{ color: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.08)" }}>
                    Class {car.class}
                  </span>
                </motion.div>
                <motion.h1 className="font-orbitron font-black leading-none mb-2"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.6rem)", letterSpacing: "-0.02em" }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 }}>
                  {car.name}
                </motion.h1>
                <motion.p className="font-rajdhani text-base italic mb-2" style={{ color: accent }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}>
                  "{car.tagline}"
                </motion.p>
                <motion.p className="font-rajdhani leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.38 }}>
                  {car.description}
                </motion.p>
              </div>

              <StatPanel car={car} ranges={ranges} accentColor={accent} />

              <motion.div className="flex items-end justify-between pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}>
                <div>
                  <p className="font-orbitron text-[7px] tracking-[0.4em] uppercase mb-0.5"
                    style={{ color: "rgba(255,255,255,0.2)" }}>Year</p>
                  <p className="font-orbitron text-xl font-black" style={{ color: accent }}>{car.year}</p>
                </div>
                <div className="text-right">
                  <p className="font-orbitron text-[7px] tracking-[0.4em] uppercase mb-0.5"
                    style={{ color: "rgba(255,255,255,0.2)" }}>Original MSRP</p>
                  <p className="font-orbitron text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {car.price}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* CENTER — 3D Viewer */}
            <div className="relative flex flex-col items-center justify-end pb-2">
              <motion.p className="absolute top-3 left-1/2 -translate-x-1/2 font-orbitron text-[8px] tracking-[0.4em] uppercase z-10"
                style={{ color: "rgba(255,255,255,0.15)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}>
                Hold &amp; drag to rotate
              </motion.p>
              <motion.div className="w-full h-full"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                <CarViewer
                  modelPath={car.model}
                  bodyColor={color.hex}
                  scaleOverride={car.viewerScale}
                  cameraPosition={car.cameraPosition}
                />
              </motion.div>
              <div className="absolute bottom-2 right-4 font-orbitron font-black pointer-events-none select-none"
                style={{ fontSize: "clamp(3rem, 6vw, 6rem)", color: "rgba(255,255,255,0.018)", lineHeight: 1, letterSpacing: "-0.05em" }}>
                {car.model_code}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col justify-between px-6 py-5 gap-3 overflow-hidden">

              {/* Back button */}
              <motion.button
                onClick={() => navigate(-1)}
                className="self-end flex items-center gap-2 font-orbitron text-[9px] tracking-[0.3em] uppercase px-4 py-2"
                style={{ color: accent, border: `1px solid ${accent}33`, background: "rgba(10,10,10,0.5)" }}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ background: `${accent}18`, borderColor: accent }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Back
              </motion.button>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}>
                <p className="font-orbitron text-[8px] tracking-[0.4em] uppercase mb-2"
                  style={{ color: "rgba(255,255,255,0.2)" }}>Character</p>
                <p className="font-rajdhani text-xs italic leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.38)" }}>
                  {car.engineCharacter}
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}>
                <ColorPicker options={car.colorOptions} selected={color} onSelect={setColor} accentColor={accent} />
              </motion.div>

              {/* CTAs */}
              <motion.div className="flex flex-col gap-2"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}>

                {/* Commission Yours — unchanged */}
                <button
                  className="font-orbitron text-[10px] tracking-[0.25em] uppercase py-3 px-6 transition-all duration-300"
                  style={{ background: accent, color: "#0A0A0A", border: `1px solid ${accent}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = accent; }}
                  onMouseLeave={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = "#0A0A0A"; }}
                >
                  Commission Yours
                </button>

                {/* Schedule a Drive → opens DriveModal pre-set to this car */}
                <button
                  className="font-orbitron text-[10px] tracking-[0.25em] uppercase py-3 px-6 transition-all duration-300"
                  style={{ background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                  onClick={() => setDriveOpen(true)}
                >
                  Schedule a Drive
                </button>

                {/* Interior View → CockpitSim (placeholder) */}
                <button
                  className="font-orbitron text-[10px] tracking-[0.25em] uppercase py-3 px-6 transition-all duration-300"
                  style={{ background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                  onClick={() => setCockpitOpen(true)}
                >
                  Interior View
                </button>

                {/* View in AR */}
                <button
                  className="font-orbitron text-[10px] tracking-[0.25em] uppercase py-3 px-6 transition-all duration-300"
                  style={{ background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                  onClick={() => setArOpen(true)}
                >
                  View in AR
                </button>

                {/* Sound toggle */}
                <button
                  onClick={handleMuteToggle}
                  className="flex items-center gap-2 font-orbitron text-[9px] tracking-[0.25em] uppercase py-2 px-3 transition-all duration-300 self-start"
                  style={{
                    color:      muted ? "rgba(255,255,255,0.25)" : accent,
                    border:     `1px solid ${muted ? "rgba(255,255,255,0.08)" : accent + "55"}`,
                    background: "transparent",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = muted ? "rgba(255,255,255,0.08)" : accent + "55";
                    e.currentTarget.style.color       = muted ? "rgba(255,255,255,0.25)" : accent;
                  }}
                >
                  <SpeakerIcon muted={muted} />
                  {muted ? "Sound Off" : "Sound On"}
                </button>

              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Drive Modal — pre-set to this car */}
      <DriveModal
        isOpen={driveOpen}
        onClose={() => setDriveOpen(false)}
        initialCarId={car.id}
        onEnterCockpit={(selectedCar) => {
          setDriveOpen(false);
          setCockpitOpen(true);
          // CockpitSim will receive selectedCar in Step 3
          console.log("Enter cockpit:", selectedCar.name);
        }}
      />

      {/* AR Viewer — current car */}
      <ARViewer
        isOpen={arOpen}
        onClose={() => setArOpen(false)}
        car={car}
      />
    </>
  );
}