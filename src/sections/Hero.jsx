// sections/Hero.jsx
// Full viewport hero — cinematic, dark, editorial
// Background blur-to-sharp bang on introComplete
// Slower word stagger, Perfection in gold, visible divider

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import {
  fadeIn,
  fadeUp,
  slideInLeft,
  scaleIn,
  staggerContainer,
} from "../animations/variants";
import { heroBackgroundParallax } from "../animations/gsapanimations";
import { featuredCar }            from "../constants/carData";

// ─────────────────────────────────────────────────────────────
// SLOWER WORD VARIANT — overrides heroWord with longer duration
// ─────────────────────────────────────────────────────────────

const slowWord = {
  hidden:  { opacity: 0, y: 50, rotateX: 15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  },
};

// Very slow stagger — each word waits longer before appearing
const slowStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.25,   // 250ms between each word — cinematic
      delayChildren:   0.3,
    },
  },
};

// ─────────────────────────────────────────────────────────────
// SCROLL INDICATOR
// ─────────────────────────────────────────────────────────────

function ScrollIndicator({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 2.5, duration: 1 } }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <span className="font-orbitron text-white/30 text-[9px] tracking-[0.4em] uppercase">
            Scroll
          </span>
          <div className="relative w-px h-12 bg-white/10">
            <motion.div
              className="absolute top-0 left-0 w-full bg-porsche-gold"
              animate={{
                height:  ["0%", "100%"],
                opacity: [1, 0],
              }}
              transition={{
                duration:    1.4,
                repeat:      Infinity,
                repeatDelay: 0.6,
                ease:        "easeInOut",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

/**
 * @param {{ introComplete: boolean }} props
 * introComplete — passed from App.jsx, gates all animations
 */
export default function Hero({ introComplete }) {
  const bgRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // Hide scroll indicator once user scrolls
  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 80) setScrolled(true); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP parallax — only start after intro is done
  useEffect(() => {
    if (!introComplete) return;
    const cleanup = heroBackgroundParallax(bgRef);
    return cleanup;
  }, [introComplete]);

  const handleExplore = () =>
    document.querySelector("#models")?.scrollIntoView({ behavior: "smooth" });

  const handleLegacy = () =>
    document.querySelector("#experience")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      className="relative w-full h-screen overflow-hidden bg-dark-base"
    >
      {/* ── Background image — blur bang on entry ─────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={introComplete ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <motion.img
          ref={bgRef}
          src={featuredCar.image}
          alt={featuredCar.name}
          className="w-full h-[120%] object-cover object-center will-change-transform"
          draggable={false}
          // Blur-to-sharp bang effect
          initial={{ opacity: 0, filter: "blur(24px)", scale: 1.08 }}
          animate={introComplete ? {
            opacity: 1,
            filter:  "blur(0px)",
            scale:   1,
          } : {}}
          transition={{
            duration: 1.4,
            ease:     [0.22, 1, 0.36, 1],
          }}
        />

        {/* Left gradient — darkens text area */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.65) 55%, rgba(10,10,10,0.15) 100%)",
          }}
        />

        {/* Bottom fade into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, #0A0A0A 100%)",
          }}
        />

        {/* Top fade from navbar */}
        <div
          className="absolute top-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex items-center">
        <div className="max-w-2xl">

          {/* Since 1948 tag */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            variants={slideInLeft}
            initial="hidden"
            animate={introComplete ? "visible" : "hidden"}
            transition={{ delay: 0.5 }}
          >
            <span className="block w-8 h-px bg-porsche-gold" />
            <span className="font-orbitron text-porsche-gold text-[10px] tracking-[0.4em] uppercase">
              Since 1948
            </span>
          </motion.div>

          {/* ── Heading — word by word, slow stagger ──────── */}
          <div className="mb-8" style={{ perspective: "800px" }}>
            {/* Line 1 — "Driven by" — white */}
            <motion.div
              className="flex flex-wrap gap-x-5 mb-2"
              variants={slowStagger}
              initial="hidden"
              animate={introComplete ? "visible" : "hidden"}
            >
              {["Driven", "by"].map((word, i) => (
                <motion.span
                  key={i}
                  variants={slowWord}
                  className="font-orbitron text-white font-black tracking-tight"
                  style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>

            {/* Line 2 — "Perfection." — GOLD */}
            <motion.div
              className="flex flex-wrap gap-x-5"
              variants={slowStagger}
              initial="hidden"
              animate={introComplete ? "visible" : "hidden"}
              transition={{ delayChildren: 0.5 }} // starts after line 1
            >
              {["Perfection."].map((word, i) => (
                <motion.span
                  key={i}
                  variants={slowWord}
                  className="font-orbitron text-porsche-gold font-black tracking-tight"
                  style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", lineHeight: 1, color: "#C8A96E"  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* ── Gold divider — highly visible ─────────────── */}
          <motion.div
            className="mb-8 origin-left"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={introComplete ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 1.4, ease: [0.76, 0, 0.24, 1] }}
            style={{ originX: 0 }}
          >
            {/* Main gold line — thick and visible */}
            <div className="w-48 h-1 bg-porsche-gold rounded-full" />
            {/* Subtle glow line below */}
            <div className="w-48 h-0.5 mt-1 rounded-full" style={{ background: "rgba(200,169,110,0.4)" }} />
          </motion.div>

          {/* Subtext */}
          <motion.p
            className="font-rajdhani text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-md"
            variants={fadeUp}
            initial="hidden"
            animate={introComplete ? "visible" : "hidden"}
            transition={{ delay: 1.8 }}
          >
            Seven decades of engineering obsession. From the iconic 930 Turbo
            to the electric Taycan — this is the legacy of Porsche AG.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={introComplete ? "visible" : "hidden"}
            transition={{ delayChildren: 2.0 }}
          >
            <motion.button
              variants={scaleIn}
              onClick={handleExplore}
              className="font-orbitron text-[11px] tracking-[0.2em] uppercase bg-porsche-red text-white px-8 py-4 border border-porsche-red hover:bg-transparent hover:text-porsche-gold hover:border-porsche-gold transition-all duration-300"
            >
              Explore Models
            </motion.button>

            <motion.button
              variants={scaleIn}
              onClick={handleLegacy}
              className="font-orbitron text-[11px] tracking-[0.2em] uppercase bg-transparent text-porsche-gold px-8 py-4 border border-porsche-gold/50 hover:border-porsche-gold hover:bg-porsche-gold/10 transition-all duration-300"
            >
              Our Legacy
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ── Right side — vertical text ────────────────────── */}
      <motion.div
        className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col items-center gap-4"
        variants={fadeIn}
        initial="hidden"
        animate={introComplete ? "visible" : "hidden"}
        transition={{ delay: 2.2 }}
      >
        <div className="w-px h-16 bg-porsche-gold/20" />
        <p
          className="font-orbitron text-white/15 text-[10px] tracking-[0.4em] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Porsche AG
        </p>
        <div className="w-px h-16 bg-porsche-gold/20" />

        {/* Class badge — now properly labelled */}
        <div className="border border-porsche-gold/20 px-2 py-1 flex flex-col items-center gap-0.5">
          <p className="font-orbitron text-white/20 text-[7px] tracking-widest uppercase">Class</p>
          <p className="font-orbitron text-porsche-gold/50 text-xs font-bold">
            {featuredCar.class}
          </p>
        </div>
      </motion.div>

      {/* ── Scroll indicator ──────────────────────────────── */}
      <ScrollIndicator visible={!scrolled && introComplete} />

      {/* ── Bottom info strip ─────────────────────────────── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5"
        variants={fadeIn}
        initial="hidden"
        animate={introComplete ? "visible" : "hidden"}
        transition={{ delay: 2.2 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-orbitron text-white/20 text-[9px] tracking-[0.3em] uppercase">
              Featured
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="font-orbitron text-white/60 text-xs tracking-[0.2em] uppercase">
              {featuredCar.name}
            </span>
            <span className="font-orbitron text-white/20 text-[10px]">
              {featuredCar.year}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-white/20 text-[9px] tracking-[0.3em] uppercase">Legacy</span>
              <span className="font-orbitron text-porsche-gold text-sm font-bold">75+</span>
              <span className="font-orbitron text-white/30 text-[9px]">Years</span>
            </div>
            <span className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-white/20 text-[9px] tracking-[0.3em] uppercase">Le Mans</span>
              <span className="font-orbitron text-porsche-gold text-sm font-bold">16</span>
              <span className="font-orbitron text-white/30 text-[9px]">Victories</span>
            </div>
            <span className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-white/20 text-[9px] tracking-[0.3em] uppercase">Produced</span>
              <span className="font-orbitron text-porsche-gold text-sm font-bold">1M+</span>
              <span className="font-orbitron text-white/30 text-[9px]">Cars</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}