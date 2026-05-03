// App.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Animations
import { initCursorGlow }  from "./animations/gsapanimations";

// Global UI
import ScrollProgressBar from "./components/ScrollProgressBar";
import CursorGlow        from "./components/CursorGlow";
import PersistentLogo    from "./components/PersistentLogo";
import IntroOverlay      from "./components/IntroOverlay";
import Navbar            from "./components/Navbar";
import Footer            from "./components/Footer";

// Sections
import Hero         from "./sections/Hero";
import Models       from "./sections/Models";
import History      from "./sections/History";
import Experience   from "./sections/Experience";

// Pages
import CarDetailPage from "./sections/CarDetailPage";
import ARPage        from "./sections/ARPage";

// ─────────────────────────────────────────────────────────────
// Main site layout
// ─────────────────────────────────────────────────────────────
function MainSite() {
  const [introComplete, setIntroComplete] = useState(false);
  const [logoReady,     setLogoReady]     = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const cursorRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping:   30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (!introComplete) return;
    const cleanup = initCursorGlow(cursorRef, [
      "a", "button", ".card", ".learn-more", ".color-swatch",
    ]);
    return cleanup;
  }, [introComplete]);

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

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setTimeout(() => setLogoReady(true), 100);
  }, []);

  return (
    <>
      <ScrollProgressBar scaleX={scaleX} />
      <CursorGlow ref={cursorRef} />
      <PersistentLogo ready={logoReady} />

      <AnimatePresence mode="wait">
        {!introComplete && (
          <IntroOverlay key="intro" onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: "100vh", borderRadius: "24px 24px 0 0" }}
        animate={{
          opacity:      introComplete ? 1 : 0,
          y:            introComplete ? "0vh" : "100vh",
          borderRadius: introComplete ? "0px" : "24px 24px 0 0",
        }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        style={{ visibility: introComplete ? "visible" : "hidden" }}
        className="min-h-screen bg-dark-base text-white"
      >
        <Navbar activeSection={activeSection} />
        <main>
          <Hero introComplete={introComplete} />
          <Models />
          <History />
          <Experience />
        </main>
        <Footer />
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<MainSite />} />
        <Route path="/car/:id" element={<CarDetailPage />} />
        <Route path="/ar/:id"  element={<ARPage />} />
      </Routes>
    </BrowserRouter>
  );
}