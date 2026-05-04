// sections/History.jsx
// Porsche Heritage — horizontal carousel
// Pagani-style black curtain wipe transition on drag + button clicks
// Text left + overflowing image right, gold accents, Orbitron + Rajdhani

import { useRef, useState, useCallback } from "react";
import { motion }                         from "framer-motion";

// ─────────────────────────────────────────────────────────────
// CARD DATA
// ─────────────────────────────────────────────────────────────

const HISTORY_CARDS = [
  {
    year:       "1948",
    era:        "The Beginning",
    heading:    "The First Porsche",
    body:       "In a small Austrian workshop, Ferry Porsche built the 356 — a lightweight, rear-engined sports car that would define a dynasty. With a borrowed Volkswagen chassis and sheer determination, Porsche became a name the world would never forget.",
    image:      "/images/history/porsche-356.jpg",
    largeImage: true,
  },
  {
    year:       "1963",
    era:        "The Icon",
    heading:    "Birth of the 911",
    body:       "Unveiled at the Frankfurt Motor Show, the 911 replaced the 356 and instantly became a legend. Designed by Ferdinand 'Butzi' Porsche, its timeless silhouette has endured for over six decades — and counting.",
    image:      "/images/history/911-classic.jpg",
    largeImage: false,
  },
  {
    year:       "1970",
    era:        "Racing Glory",
    heading:    "Le Mans & the 917",
    body:       "The Porsche 917 dominated Le Mans in 1970 and 1971, cementing Porsche's place in motorsport history. Steve McQueen immortalised the era in his film 'Le Mans', making the 917 one of the most iconic racing cars ever built.",
    image:      "/images/history/1970-lemans.JPG",
    largeImage: true,
  },
  {
    year:       "1973",
    era:        "The Lightweight",
    heading:    "Carrera RS 2.7",
    body:       "The 911 Carrera RS 2.7 was Porsche's first true homologation special. Stripped of excess weight and fitted with a larger engine, it set the template for every performance Porsche that followed. Only 1,580 were ever made.",
    image:      "/images/history/carrera-rs.jpeg",
    largeImage: true,
  },
  {
    year:       "1986",
    era:        "The Supercar",
    heading:    "The 959",
    body:       "The 959 was a technological tour de force — all-wheel drive, twin-turbocharged, and capable of 197 mph. It was the fastest production car in the world and previewed technology that would take the industry decades to catch up with.",
    image:      "/images/history/959-hero.jpg",
    largeImage: true,
  },
  {
    year:       "1996",
    era:        "The Saviour",
    heading:    "Boxster Saves Porsche",
    body:       "By the mid-90s Porsche was in financial freefall. The Boxster, a mid-engine roadster, saved the company entirely. Affordable, beautiful, and supremely capable — it brought a new generation into the Porsche fold.",
    image:      "/images/history/boxster.996.avif",
    largeImage: false,
  },
  {
    year:       "2004",
    era:        "The Widow Maker",
    heading:    "Carrera GT",
    body:       "The Carrera GT was raw, analogue, and utterly unforgiving. A 5.7-litre V10, a ceramic clutch with a hair-trigger, and zero electronic aids. Widely regarded as one of the greatest — and most demanding — supercars ever built.",
    image:      "/images/history/carrera-gt.jpg",
    largeImage: true,
  },
  {
    year:       "2019",
    era:        "The Future",
    heading:    "Taycan — Porsche Electrified",
    body:       "Porsche entered the electric age not with compromise, but with conviction. The Taycan proved that electrification and driving excitement were not mutually exclusive — 0–60 in 2.6 seconds, and unmistakably Porsche.",
    image:      "/images/history/taycan-hero.jpeg",
    largeImage: true,
  },
];

// ─────────────────────────────────────────────────────────────
// ANIMATION CONSTANTS
// Slightly faster than Pagani (~1200ms total) — 760ms total
// ─────────────────────────────────────────────────────────────

const WIPE_IN_DURATION  = 0.34; // seconds — curtain sweeps in
const WIPE_OUT_DURATION = 0.34; // seconds — curtain sweeps out
const WIPE_EASE         = [0.76, 0, 0.24, 1];
const MIDPOINT_MS       = WIPE_IN_DURATION * 1000; // index swaps here
const TOTAL_MS          = (WIPE_IN_DURATION + WIPE_OUT_DURATION) * 1000;

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function History() {
  const [activeIdx,     setActiveIdx]     = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  // curtainX controls the curtain position:
  // "start"  = translateX(-101%) — off screen left, invisible
  // "cover"  = translateX(0%)    — fully covers card
  // "done"   = translateX(101%)  — off screen right, invisible
  const [curtainX,      setCurtainX]      = useState("-101%");
  const TOTAL                             = HISTORY_CARDS.length;

  // ── Core transition engine ────────────────────────────────
  const triggerTransition = useCallback((nextIdx) => {
    if (transitioning)           return;
    if (nextIdx < 0)             return;
    if (nextIdx >= TOTAL)        return;
    if (nextIdx === activeIdx)   return;

    setTransitioning(true);

    // Step 1 — sweep curtain in from left
    setCurtainX("0%");

    // Step 2 — at midpoint: swap card content (hidden behind curtain)
    setTimeout(() => {
      setActiveIdx(nextIdx);
      // Step 3 — sweep curtain out to the right
      setCurtainX("101%");
    }, MIDPOINT_MS);

    // Step 4 — reset curtain to left ready for next transition
    setTimeout(() => {
      setCurtainX("-101%");
      setTransitioning(false);
    }, TOTAL_MS + 60);
  }, [transitioning, activeIdx, TOTAL]);

  const goTo   = (idx) => triggerTransition(idx);
  const goPrev = ()    => triggerTransition(activeIdx - 1);
  const goNext = ()    => triggerTransition(activeIdx + 1);

  // ── Drag handlers ─────────────────────────────────────────
  const handleDragEnd = (_, info) => {
    if (transitioning) return;
    const offset   = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -80 || velocity < -400) goNext();
    else if (offset > 80 || velocity > 400) goPrev();
  };

  const card = HISTORY_CARDS[activeIdx];

  return (
    <section
      id="history"
      className="relative bg-dark-base overflow-hidden py-24"
      style={{ minHeight: "80vh" }}
    >
      {/* ── Section header ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-6 mb-16"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-px bg-porsche-gold" />
          <span className="font-orbitron text-[10px] tracking-[0.4em] uppercase text-porsche-gold">
            Since 1948
          </span>
        </div>
        <h2 className="font-orbitron font-black text-4xl md:text-5xl uppercase text-white tracking-tight">
          A Legacy <br />
          <span className="text-porsche-gold">Forged in Speed</span>
        </h2>
      </motion.div>

      {/* ── Single card stage ───────────────────────────────── */}
      <div className="max-w-[90vw] mx-auto">
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-dark-surface select-none"
          style={{ height: 420, cursor: transitioning ? "default" : "grab" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing" }}
        >
          {/* ── Card content ──────────────────────────────── */}
          <div className="flex h-full">

            {/* LEFT — Text */}
            <div className="relative flex flex-col justify-center px-12 py-12 flex-1 z-10">
              {/* Gold left accent bar */}
              <div className="absolute left-0 top-12 bottom-12 w-0.5 bg-porsche-gold/40 rounded-full" />

              {/* Year + Era — re-animates on index change */}
              <motion.div
                key={`meta-${activeIdx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: WIPE_IN_DURATION + 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 mb-3"
              >
                <span className="font-orbitron text-porsche-gold text-xs tracking-[0.35em] uppercase">
                  {card.year}
                </span>
                <span className="w-4 h-px bg-porsche-gold/40" />
                <span className="font-orbitron text-white/30 text-[10px] tracking-[0.25em] uppercase">
                  {card.era}
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h3
                key={`heading-${activeIdx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: WIPE_IN_DURATION + 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="font-orbitron font-black text-2xl md:text-3xl uppercase text-white leading-tight mb-5"
              >
                {card.heading}
              </motion.h3>

              {/* Body */}
              <motion.p
                key={`body-${activeIdx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: WIPE_IN_DURATION + 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="font-rajdhani text-white/55 text-base leading-relaxed max-w-xs"
              >
                {card.body}
              </motion.p>
            </div>

            {/* RIGHT — Image */}
            <div className="relative flex-shrink-0 overflow-visible" style={{ width: 320 }}>
              <div
                className="absolute"
                style={card.largeImage ? {
                  top: "-48px", right: "-40px", bottom: "-48px", left: "-400px"
                } : {
                  top: "-12px", right: "-10px", bottom: "-12px", left: "-300px"
                }}
              >
                <motion.img
                  key={`img-${activeIdx}`}
                  src={card.image}
                  alt={card.heading}
                  draggable={false}
                  initial={{ scale: 1.07 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.65, delay: WIPE_IN_DURATION, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover rounded-xl"
                  style={{
                    transform: "rotate(1deg)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,169,110,0.08)",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(200,169,110,0.12)" }}
                />
              </div>
            </div>
          </div>

          {/* ── BLACK CURTAIN WIPE ─────────────────────────────
              Sits above all card content, sweeps left → right
              Leading edge has a thin gold line for the Pagani feel  */}
          <motion.div
            className="absolute inset-0 z-20 bg-dark-base pointer-events-none"
            animate={{ x: curtainX }}
            transition={{
              duration: curtainX === "0%"
                ? WIPE_IN_DURATION
                : WIPE_OUT_DURATION,
              ease: WIPE_EASE,
            }}
          />

          {/* Gold leading edge on curtain */}
          <motion.div
            className="absolute top-0 bottom-0 z-21 pointer-events-none"
            style={{ width: "2px", background: "rgba(200,169,110,0.55)", left: 0 }}
            animate={{ x: curtainX }}
            transition={{
              duration: curtainX === "0%"
                ? WIPE_IN_DURATION
                : WIPE_OUT_DURATION,
              ease: WIPE_EASE,
            }}
          />
        </motion.div>
      </div>

      {/* ── Progress bar ────────────────────────────────────── */}
      <div className="max-w-[90vw] mx-auto mt-5 h-px bg-white/5">
        <motion.div
          className="h-full bg-porsche-gold/50"
          animate={{ width: `${((activeIdx + 1) / TOTAL) * 100}%` }}
          transition={{ duration: 0.5, ease: WIPE_EASE }}
        />
      </div>

      {/* ── Counter + Dots + Arrows ─────────────────────────── */}
      <div className="max-w-[90vw] mx-auto flex items-center justify-between mt-5">

        {/* Counter */}
        <div className="flex items-center gap-2">
          <span className="font-orbitron text-porsche-gold text-sm tracking-widest">
            {String(activeIdx + 1).padStart(2, "0")}
          </span>
          <span className="w-8 h-px bg-white/15" />
          <span className="font-orbitron text-white/25 text-sm tracking-widest">
            {String(TOTAL).padStart(2, "0")}
          </span>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-3">
          {HISTORY_CARDS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              disabled={transitioning}
              aria-label={`Go to card ${idx + 1}`}
            >
              <span
                className={[
                  "block rounded-full transition-all duration-500",
                  idx === activeIdx
                    ? "w-6 h-1.5 bg-porsche-gold"
                    : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40",
                ].join(" ")}
              />
            </button>
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            disabled={activeIdx === 0 || transitioning}
            className="w-10 h-10 rounded-full border border-white/10 hover:border-porsche-gold flex items-center justify-center text-white/30 hover:text-porsche-gold transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={goNext}
            disabled={activeIdx === TOTAL - 1 || transitioning}
            className="w-10 h-10 rounded-full border border-white/10 hover:border-porsche-gold flex items-center justify-center text-white/30 hover:text-porsche-gold transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}