// animations/variants.js
// All Framer Motion variants — imported by components and sections
// Easing legend:
//   easeOutExpo  → [0.16, 1, 0.3, 1]  fast out, dramatic
//   easeOutQuart → [0.22, 1, 0.36, 1]  smooth, premium feel
//   easeInOutSine→ [0.37, 0, 0.63, 1]  gentle, balanced

// ─────────────────────────────────────────────────────────────
// CORE VARIANTS
// ─────────────────────────────────────────────────────────────

// Used on: section headings, body text, card content
export const fadeUp = {
  hidden:  { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// Used on: backgrounds, overlays, car images, decorative elements
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

// Used on: stat panels, color swatches, buttons, badges
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// Used on: stat blocks, company info left column
export const slideInLeft = {
  hidden:  { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Used on: car images on detail page, right column content
export const slideInRight = {
  hidden:  { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Used on: car name in Hero, section titles — left-to-right curtain wipe
export const clipReveal = {
  hidden:  { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] },
  },
};

// ─────────────────────────────────────────────────────────────
// STAGGER CONTAINERS
// Parent wrappers — children use any of the above variants
// ─────────────────────────────────────────────────────────────

// Default stagger — used on card grids, nav links, stat lists
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren:  0.12,
      delayChildren:    0.05,
    },
  },
};

// Slower stagger — used on hero text word-by-word reveal
export const staggerSlow = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren:  0.08,
      delayChildren:    0.2,
    },
  },
};

// Fast stagger — used on stat bars filling sequentially
export const staggerFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren:  0.06,
      delayChildren:    0.0,
    },
  },
};

// ─────────────────────────────────────────────────────────────
// HERO SPECIFIC
// ─────────────────────────────────────────────────────────────

// Individual word in hero tagline — used inside staggerSlow
export const heroWord = {
  hidden:  { opacity: 0, y: 40, rotateX: 20 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// Gold divider line drawing left to right
export const dividerDraw = {
  hidden:  { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
  },
};

// ─────────────────────────────────────────────────────────────
// PARALLAX CARD STACK
// ─────────────────────────────────────────────────────────────

// Era label sliding in from the left on card entry
export const eraLabelSlide = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// ─────────────────────────────────────────────────────────────
// CAR DETAIL PAGE — ASPHALT GRID
// ─────────────────────────────────────────────────────────────

// Entire tilted stat box entering with a rotation settle
export const tiltedBoxEntrance = {
  hidden:  { opacity: 0, rotate: -8, scale: 0.92, y: 30 },
  visible: {
    opacity: 1,
    rotate: -3,           // settles at its final tilt angle
    scale: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Individual stat bar fill — value is set inline via custom prop
// Usage: animate={{ scaleX: normalizedValue }} where normalizedValue = 0–1
export const statBarFill = {
  hidden:  { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// Stat hover pop-up tooltip
export const statHoverPop = {
  hidden:  { opacity: 0, scale: 0.8, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 4,
    transition: { duration: 0.15 },
  },
};

// Asphalt grid columns revealing left then right
export const gridReveal = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.1,       // pass custom={index} to stagger columns
    },
  }),
};

// ─────────────────────────────────────────────────────────────
// LOGO ANIMATIONS
// ─────────────────────────────────────────────────────────────

// Step 1 — logo materialises from shadow
export const logoEntrance = {
  hidden:  { opacity: 0, scale: 1.1, filter: "blur(12px)" },
  visible: {
    opacity: 0.25,          // stays dim — it's a shadow, not a spotlight
    scale: 1,
    filter: "blur(4px)",
    transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// Step 2 — logo shrinks and flies to top-left corner
// Triggered after a delay following logoEntrance
export const logoShrinkToCorner = {
  initial: {
    opacity: 0.25,
    scale: 1,
    x: "-50%",
    y: "-50%",
    top: "50%",
    left: "50%",
    filter: "blur(4px)",
  },
  animate: {
    opacity: 0.06,          // near-invisible watermark
    scale: 0.13,
    x: 0,
    y: 0,
    top: "24px",
    left: "24px",
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.76, 0, 0.24, 1],   // fast acceleration — NFS pull-away feel
      delay: 2.0,                  // holds center for 2s before moving
    },
  },
};

// ─────────────────────────────────────────────────────────────
// GLOBAL UI
// ─────────────────────────────────────────────────────────────

// Engine start button pulse ring
export const engineStartShake = {
  animate: {
    x: [0, -4, 4, -3, 3, -1, 1, 0],
    transition: { duration: 0.35, ease: "easeInOut" },
  },
};

// Continuous float for 3D model panel background
export const modelFloat = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3.2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

// Scroll progress bar (top of page) — driven by useScroll, not whileInView
// Use with motionValue: scaleX: scrollYProgress
export const scrollProgressBar = {
  initial: { scaleX: 0, originX: 0 },
};

// Viewport config — pass to whileInView calls sitewide
export const viewportOnce  = { once: true,  amount: 0.2 };
export const viewportRepeat = { once: false, amount: 0.3 };