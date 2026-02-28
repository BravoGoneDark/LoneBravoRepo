// animations/transitions.js
// Page-level transitions — the most complex animations on the site
// These are used by specific components, not reused everywhere

// ─────────────────────────────────────────────────────────────
// INTRO OVERLAY (Framer Motion)
// Used by: components/IntroOverlay.jsx
// ─────────────────────────────────────────────────────────────

/**
 * The intro sequence has 3 phases:
 *
 * Phase 1 — Logo materialises (logoEntrance)     ~0.0s → 1.4s
 * Phase 2 — Logo holds center, dramatic pause     ~1.4s → 3.4s
 * Phase 3 — Logo shrinks to corner (logoToCorner) ~3.4s → 4.6s
 * Phase 4 — Overlay wipes upward (overlayExit)    ~4.6s → 5.4s
 *
 * Total intro duration: ~5.5 seconds
 * Set onComplete to flip a loaded state in App.jsx
 */

// The full-screen dark overlay that contains the logo
export const introOverlay = {
  initial: { opacity: 1 },
  exit: {
    clipPath: "inset(100% 0 0 0)",      // wipes upward like a curtain
    transition: {
      duration: 0.9,
      ease: [0.76, 0, 0.24, 1],
      delay: 0,
    },
  },
};

// The logo while it's centered and large
export const introCenterLogo = {
  initial: {
    opacity: 0,
    scale:   1.15,
    filter:  "blur(16px)",
  },
  animate: {
    opacity: 0.3,             // dim shadow appearance
    scale:   1,
    filter:  "blur(0px)",
    transition: {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Timing constants — use these to sync sounds and other effects
export const INTRO_TIMING = {
  logoFadeInEnd:    1400,   // ms — logo fully materialised
  logoHoldEnd:      3400,   // ms — logo starts moving to corner
  logoCornerEnd:    4600,   // ms — logo locked in corner
  overlayExitEnd:   5400,   // ms — overlay fully gone, site visible
};

// ─────────────────────────────────────────────────────────────
// PERSISTENT LOGO (Framer Motion)
// Used by: components/PersistentLogo.jsx
// This is the watermark that lives in the top-left corner
// after the intro completes. Mounted permanently in App.jsx.
// ─────────────────────────────────────────────────────────────

export const persistentLogo = {
  // Starts at center, large — matches introCenterLogo exit state
  initial: {
    position: "fixed",
    top:      "50%",
    left:     "50%",
    x:        "-50%",
    y:        "-50%",
    scale:    1,
    opacity:  0.3,
    filter:   "blur(0px)",
    zIndex:   40,
  },
  // Animates to top-left watermark position
  animate: {
    top:     "20px",
    left:    "20px",
    x:       "0%",
    y:       "0%",
    scale:   0.35,
    opacity: 0.15,
    filter:  ["blur(0px)", "blur(8px)", "blur(0px)"],  // clear → blurry → clear
    transition: {
      duration: 1.2,
      ease:     [0.76, 0, 0.24, 1],
      delay:    3.4,
      filter: {
        duration: 1.2,
        times:    [0, 0.5, 1],   // blur peaks exactly halfway through
        delay:    3.4,
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// FULLSCREEN TAKEOVER (Framer Motion)
// Used by: sections/CarDetail.jsx (the Learn More destination)
// ─────────────────────────────────────────────────────────────

/**
 * How the takeover works:
 *
 * 1. User clicks "Learn More" on a card
 * 2. The card records its own bounding rect (getBoundingClientRect)
 * 3. CarDetail mounts with initial position/size matching that rect
 * 4. It animates to position: fixed, inset: 0 (fullscreen)
 * 5. Back button reverses: shrinks back to the original card rect
 * 6. CarDetail unmounts after reverse animation completes
 *
 * The `originRect` prop is passed from the card to CarDetail via
 * React state or context in App.jsx / a router.
 */

/**
 * generateTakeoverVariants
 * Call this with the card's bounding rect to produce the correct
 * initial position for the takeover expansion.
 *
 * @param {DOMRect} originRect — from cardElement.getBoundingClientRect()
 * @returns Framer Motion variants object
 */
export function generateTakeoverVariants(originRect) {
  return {
    initial: {
      position: "fixed",
      top:      originRect.top,
      left:     originRect.left,
      width:    originRect.width,
      height:   originRect.height,
      borderRadius: "16px",
      zIndex: 100,
      opacity: 1,
    },
    animate: {
      top:    0,
      left:   0,
      width:  "100vw",
      height: "100vh",
      borderRadius: "0px",
      transition: {
        duration: 0.65,
        ease: [0.76, 0, 0.24, 1],
      },
    },
    exit: {
      top:      originRect.top,
      left:     originRect.left,
      width:    originRect.width,
      height:   originRect.height,
      borderRadius: "16px",
      opacity: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
}

// Content inside the takeover fades in AFTER expansion completes
export const takeoverContent = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.5,          // waits for expansion to finish
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

// Back button slides in from top-left after content appears
export const backButton = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.8,
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.15 },
  },
};

// ─────────────────────────────────────────────────────────────
// USAGE REFERENCE
// ─────────────────────────────────────────────────────────────

/*
── IntroOverlay.jsx ──────────────────────────────────────────

import { AnimatePresence, motion } from "framer-motion";
import { introOverlay, introCenterLogo, INTRO_TIMING } from "../animations/transitions";
import { persistentLogo } from "../animations/transitions";

function IntroOverlay({ onComplete }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-dark-base flex items-center justify-center"
        variants={introOverlay}
        initial="initial"
        exit="exit"
      >
        <motion.img
          src="/images/porsche-crest.svg"
          variants={introCenterLogo}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-64 h-64"
          onAnimationComplete={(def) => {
            // After logo fades in, wait then trigger exit
            if (def === "animate") {
              setTimeout(onComplete, INTRO_TIMING.logoHoldEnd - INTRO_TIMING.logoFadeInEnd);
            }
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

── CarDetail.jsx (takeover) ─────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { generateTakeoverVariants, takeoverContent, backButton } from "../animations/transitions";

function CarDetail({ car, originRect, onClose }) {
  const variants = generateTakeoverVariants(originRect);

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-dark-base overflow-hidden"
    >
      <motion.button variants={backButton} initial="initial" animate="animate" exit="exit"
        onClick={onClose}
        className="absolute top-6 left-6 z-10 text-white font-orbitron text-sm"
      >
        ← BACK
      </motion.button>

      <motion.div variants={takeoverContent} initial="initial" animate="animate" exit="exit">
        // ... rest of car detail content
      </motion.div>
    </motion.div>
  );
}
*/