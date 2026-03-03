// App.jsx
// Root component — conductor of the entire application
// Manages: intro sequence, global state, section assembly, car detail takeover
// Contains zero content or styling — everything lives in child components

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";

// Animations
import { INTRO_TIMING }    from "./animations/transitions";
import { initCursorGlow }  from "./animations/gsapanimations";

// Global UI components
import ScrollProgressBar from "./components/ScrollProgressBar";
import CursorGlow        from "./components/CursorGlow";
import PersistentLogo    from "./components/PersistentLogo";
import IntroOverlay      from "./components/IntroOverlay";
import Navbar            from "./components/Navbar";
import Footer            from "./components/Footer";

// Sections
import Hero         from "./sections/Hero";
import Models       from "./sections/Models";
import Configurator from "./sections/Configurator";
import Performance  from "./sections/Performance";
import Experience   from "./sections/Experience";

// Car detail fullscreen takeover
import CarDetail from "./sections/CarDetail";

// ─────────────────────────────────────────────────────────────

export default function App() {

  // ── Intro state ───────────────────────────────────────────

  // False until the intro overlay animation fully finishes
  const [introComplete, setIntroComplete] = useState(false);

  // Fires slightly after introComplete — staggers logo corner animation
  // so it doesn't clash with the overlay exit wipe
  const [logoReady, setLogoReady] = useState(false);

  // ── Car detail takeover state ─────────────────────────────

  // The car object being viewed — null means takeover is closed
  const [selectedCar, setSelectedCar] = useState(null);

  // Live bounding rect of the card that was clicked
  // CarDetail uses this to know where on screen to expand from
  const [originRect, setOriginRect] = useState(null);

  // ── Active section — drives Navbar highlight ──────────────
  const [activeSection, setActiveSection] = useState("hero");

  // ── Refs ──────────────────────────────────────────────────
  const cursorRef = useRef(null);

  // ─────────────────────────────────────────────────────────
  // SCROLL PROGRESS BAR
  // useScroll from Framer Motion tracks page scroll 0→1
  // useSpring smooths it so the bar doesn't feel jittery
  // ─────────────────────────────────────────────────────────

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping:   30,
    restDelta: 0.001,
  });

  // ─────────────────────────────────────────────────────────
  // CURSOR GLOW
  // Initialised after intro completes so GSAP targets
  // elements that are actually in the DOM
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!introComplete) return;
    const cleanup = initCursorGlow(cursorRef, [
      "a", "button", ".card", ".learn-more", ".color-swatch",
    ]);
    return cleanup;
  }, [introComplete]);

  // ─────────────────────────────────────────────────────────
  // ACTIVE SECTION TRACKING
  // IntersectionObserver watches each <section id="...">
  // and updates activeSection as the user scrolls
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!introComplete) return;

    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [introComplete]);

  // ─────────────────────────────────────────────────────────
  // SCROLL LOCK
  // Prevents background scroll while car detail is open
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = selectedCar ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedCar]);

  // ─────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────

  // Called by IntroOverlay when its full animation sequence ends
  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);      // site fades in immediately — no black gap
    setTimeout(() => setLogoReady(true), 100);  // logo starts corner travel almost instantly
  }, []);

  // Called by a car card in Models when Learn More is clicked
  // Receives the car data object + the card's live bounding rect
  const handleLearnMore = useCallback((car, rect) => {
    setOriginRect(rect);
    setSelectedCar(car);
  }, []);

  // Called by CarDetail's back button
  const handleCloseDetail = useCallback(() => {
    setSelectedCar(null);
    // Keep originRect alive briefly so exit animation can reference it
    // then clear it once the animation window has passed
    setTimeout(() => setOriginRect(null), 700);
  }, []);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Always-on fixed UI ──────────────────────────── */}

      {/* Thin gold line at top of viewport, fills as user scrolls */}
      <ScrollProgressBar scaleX={scaleX} />

      {/* Soft red/gold cursor glow — desktop only, hidden on touch */}
      <CursorGlow ref={cursorRef} />

      {/* Porsche crest watermark — starts center, moves to corner */}
      <PersistentLogo ready={logoReady} />

      {/* ── Intro overlay ───────────────────────────────── */}
      {/* Unmounts itself via AnimatePresence once introComplete is true */}
      <AnimatePresence mode="wait">
        {!introComplete && (
          <IntroOverlay
            key="intro"
            onComplete={handleIntroComplete}
          />
        )}
      </AnimatePresence>

      {/* ── Main site ───────────────────────────────────── */}
      {/* Hidden (opacity 0) until intro finishes, then fades in */}
      <motion.div
        initial={{ opacity: 0, y: "100vh", borderRadius: "24px 24px 0 0" }}
        animate={{
          opacity: introComplete ? 1 : 0,
          y: introComplete ? "0vh" : "100vh",
          borderRadius: introComplete ? "0px" : "24px 24px 0 0",
        }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        style={{ visibility: introComplete ? "visible" : "hidden" }}
        className="min-h-screen bg-dark-base text-white"
      >
        {/* Sticky navigation — highlights active section */}
        <Navbar activeSection={activeSection} />

        <main>
          {/* Full-viewport hero with company intro */}
          <Hero introComplete = {introComplete}/>

          {/* 7-car parallax card stack, chronological 70s → 2020s */}
          {/* onLearnMore receives (car, DOMRect) from each card */}
          <Models onLearnMore={handleLearnMore} />

          {/* Interactive colour + trim configurator */}
          <Configurator />

          {/* Animated stat counters — metric values from carData */}
          <Performance />

          {/* Immersive brand story / 3D experience section */}
          <Experience />
        </main>

        <Footer />
      </motion.div>

      {/* ── Car detail fullscreen takeover ──────────────── */}
      {/* Mounts over everything when selectedCar is set      */}
      {/* Expands from originRect position to fill screen     */}
      {/* AnimatePresence plays exit animation before unmount  */}
      <AnimatePresence mode="wait">
        {selectedCar && originRect && (
          <CarDetail
            key={selectedCar.id}
            car={selectedCar}
            originRect={originRect}
            onClose={handleCloseDetail}
          />
        )}
      </AnimatePresence>
    </>
  );
}