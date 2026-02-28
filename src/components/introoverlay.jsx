// components/IntroOverlay.jsx
// The full intro sequence:
//   Phase 1 (0.0s → 1.4s) — Crest materialises from shadow/blur
//   Phase 2 (1.4s → 3.4s) — Crest holds center, dramatic pause
//   Phase 3 (3.4s → 4.6s) — Overlay wipes upward off screen
//   Phase 4               — onComplete fires → App.jsx takes over
//
// The crest does NOT animate to the corner here.
// PersistentLogo.jsx handles that separately after this unmounts.

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState }     from "react";
import { introOverlay, introCenterLogo, INTRO_TIMING } from "../animations/transitions";

/**
 * @param {{ onComplete: () => void }} props
 * onComplete — called when the overlay has fully exited the screen
 */
export default function IntroOverlay({ onComplete }) {

  // Controls whether the overlay wrapper is present
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    // Phase 3 — start overlay exit after logo hold finishes
    const exitTimer = setTimeout(() => {
      setOverlayVisible(false);
    }, INTRO_TIMING.logoHoldEnd);

    // Phase 4 — fire onComplete after overlay finishes wiping off screen
    const completeTimer = setTimeout(() => {
      onComplete();
    }, INTRO_TIMING.overlayExitEnd);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence mode="wait">
      {overlayVisible && (
        <motion.div
          key="intro-overlay"
          className={[
            // Full viewport coverage
            "fixed inset-0 z-[9999]",
            // Deep dark background — NFS Hot Pursuit darkness
            "bg-dark-base",
            // Center the crest
            "flex items-center justify-center",
            // Prevent any interaction with the site underneath
            "overflow-hidden",
          ].join(" ")}
          variants={introOverlay}
          initial="initial"
          exit="exit"
        >
          {/* ── Atmospheric background elements ─────────── */}

          {/* Subtle radial glow behind the crest */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,169,110,0.06) 0%, transparent 70%)",
            }}
          />

          {/* Thin horizontal line — appears under crest like a stage */}
          <motion.div
            className="absolute w-48 h-px bg-porsche-gold/20"
            style={{ top: "calc(50% + 96px)" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: 1,
              opacity: 1,
              transition: { duration: 1.2, delay: 0.8, ease: [0.76, 0, 0.24, 1] },
            }}
          />

          {/* ── Porsche crest ────────────────────────────── */}
          <motion.div
            className="relative flex flex-col items-center gap-8"
            variants={introCenterLogo}
            initial="initial"
            animate="animate"
          >
            {/* The crest image */}
            <img
              src="/images/porsche-crest.svg"
              alt="Porsche"
              className="w-48 h-48 md:w-64 md:h-64 object-contain"
              draggable={false}
            />

            {/* PORSCHE wordmark below the crest */}
            <motion.p
              className="font-orbitron text-white/60 text-xs tracking-[0.5em] uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.8, delay: 1.0, ease: "easeOut" },
              }}
            >
              Porsche
            </motion.p>
          </motion.div>

          {/* ── Loading indicator ────────────────────────── */}
          {/* Thin progress line at the bottom — purely decorative */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-px bg-white/10 overflow-hidden"
          >
            <motion.div
              className="h-full bg-porsche-gold/60 origin-left"
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: 1,
                transition: {
                  duration: INTRO_TIMING.logoHoldEnd / 1000,
                  ease: "easeInOut",
                },
              }}
            />
          </motion.div>

          {/* ── Year / brand line ────────────────────────── */}
          <motion.p
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-orbitron text-white/20 text-[10px] tracking-[0.4em] uppercase whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 1, delay: 1.2 },
            }}
          >
            Since 1948
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}