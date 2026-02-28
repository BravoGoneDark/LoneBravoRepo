// animations/gsapAnimations.js
// All GSAP + ScrollTrigger functions
// Import and call these inside useEffect() hooks in your components
// Every function returns a cleanup array so useEffect can kill them on unmount

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────

/**
 * heroBackgroundParallax
 * The hero background image moves at 0.4x scroll speed
 * creating depth between the image and the foreground text.
 *
 * @param {RefObject} bgRef  — ref on the background <img> or <div>
 * @returns cleanup function
 *
 * Usage:
 *   const bgRef = useRef();
 *   useEffect(() => heroBackgroundParallax(bgRef), []);
 */
export function heroBackgroundParallax(bgRef) {
  const tween = gsap.to(bgRef.current, {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
      trigger:  bgRef.current,
      start:    "top top",
      end:      "bottom top",
      scrub:    true,
    },
  });

  return () => tween.scrollTrigger?.kill();
}

// ─────────────────────────────────────────────────────────────
// PARALLAX CARD STACK
// ─────────────────────────────────────────────────────────────

/**
 * initCardStack
 * Pins each card and creates a scroll-driven stack effect.
 * Each card slides up from below and covers the previous one.
 * The wrapper element must have enough height: cards.length * 100vh minimum.
 *
 * @param {string}   wrapperSelector  — CSS selector for the outer scroll container
 * @param {string}   cardSelector     — CSS selector for each individual card
 *
 * Usage:
 *   useEffect(() => {
 *     const cleanup = initCardStack("#card-stack-wrapper", ".stack-card");
 *     return cleanup;
 *   }, []);
 */
export function initCardStack(wrapperSelector, cardSelector) {
  const cards    = gsap.utils.toArray(cardSelector);
  const triggers = [];

  cards.forEach((card, i) => {
    // All cards except the first start below the viewport
    if (i !== 0) gsap.set(card, { yPercent: 100 });

    // Each card gets its own ScrollTrigger
    const st = ScrollTrigger.create({
      trigger:  wrapperSelector,
      start:    () => `top+=${i * (window.innerHeight * 0.85)} top`,
      end:      () => `top+=${(i + 1) * (window.innerHeight * 0.85)} top`,
      scrub:    0.6,
      onUpdate: (self) => {
        if (i !== 0) {
          // Slide up as scroll progresses
          gsap.set(card, { yPercent: 100 - self.progress * 100 });
        }
      },
    });

    triggers.push(st);
  });

  return () => triggers.forEach((t) => t.kill());
}

/**
 * cardImageParallax
 * The car image inside each stack card moves at 0.6x the card's scroll speed,
 * creating a sense of depth within each card.
 *
 * @param {string} imageSelector — CSS selector targeting card images
 * @param {string} cardSelector  — CSS selector for the card wrapper
 * @returns cleanup function
 */
export function cardImageParallax(imageSelector, cardSelector) {
  const pairs   = gsap.utils.toArray(cardSelector);
  const tweens  = [];

  pairs.forEach((card) => {
    const img = card.querySelector(imageSelector);
    if (!img) return;

    const tween = gsap.to(img, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start:   "top bottom",
        end:     "bottom top",
        scrub:   true,
      },
    });

    tweens.push(tween);
  });

  return () => tweens.forEach((t) => t.scrollTrigger?.kill());
}

// ─────────────────────────────────────────────────────────────
// STAT COUNTER (Performance / Car Detail)
// ─────────────────────────────────────────────────────────────

/**
 * animateCounter
 * Counts a DOM element's text content from 0 up to a target number
 * when it enters the viewport. Asphalt 8 style number reveal.
 *
 * @param {RefObject} ref      — ref on the element displaying the number
 * @param {number}    target   — the final number to count to
 * @param {number}    duration — animation duration in seconds (default 1.8)
 * @param {string}    suffix   — optional suffix e.g. " km/h", " hp"
 * @returns cleanup function
 *
 * Usage:
 *   const speedRef = useRef();
 *   useEffect(() => animateCounter(speedRef, 318, 2, " km/h"), []);
 */
export function animateCounter(ref, target, duration = 1.8, suffix = "") {
  const obj = { val: 0 };

  const tween = gsap.to(obj, {
    val: target,
    duration,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ref.current,
      start:   "top 85%",
      once:    true,
    },
    onUpdate: () => {
      if (ref.current) {
        // Show one decimal place if target is a float (e.g. 3.4s)
        const display = Number.isInteger(target)
          ? Math.round(obj.val)
          : obj.val.toFixed(1);
        ref.current.textContent = display + suffix;
      }
    },
  });

  return () => tween.kill();
}

// ─────────────────────────────────────────────────────────────
// SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────────

/**
 * initScrollProgressBar
 * Drives a fixed progress bar at the top of the page.
 * The bar element should be: fixed, top-0, left-0, h-[2px], w-full,
 * bg-porsche-gold, origin-left, scaleX-0 by default.
 *
 * @param {RefObject} barRef — ref on the progress bar element
 * @returns cleanup function
 *
 * Usage:
 *   const barRef = useRef();
 *   useEffect(() => initScrollProgressBar(barRef), []);
 */
export function initScrollProgressBar(barRef) {
  const tween = gsap.to(barRef.current, {
    scaleX: 1,
    ease:   "none",
    scrollTrigger: {
      trigger:   document.body,
      start:     "top top",
      end:       "bottom bottom",
      scrub:     0.1,
    },
  });

  return () => tween.scrollTrigger?.kill();
}

// ─────────────────────────────────────────────────────────────
// CURSOR GLOW
// ─────────────────────────────────────────────────────────────

/**
 * initCursorGlow
 * Creates a custom cursor glow that follows the mouse.
 * The cursor element should be: fixed, pointer-events-none, z-[9999],
 * rounded-full, positioned via transform translate.
 *
 * @param {RefObject} cursorRef      — ref on the glow circle element
 * @param {string[]}  hoverSelectors — CSS selectors that trigger cursor growth
 * @returns cleanup function
 *
 * Usage:
 *   const cursorRef = useRef();
 *   useEffect(() => initCursorGlow(cursorRef, ["button", "a", ".card"]), []);
 */
export function initCursorGlow(cursorRef, hoverSelectors = ["a", "button"]) {
  const cursor = cursorRef.current;
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) return () => {};

  // Follow mouse with slight lag
  const onMove = (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.15,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // Grow on hover
  const onEnter = () =>
    gsap.to(cursor, { scale: 2.5, duration: 0.3, ease: "power2.out" });

  const onLeave = () =>
    gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });

  window.addEventListener("mousemove", onMove);

  const hoverEls = document.querySelectorAll(hoverSelectors.join(", "));
  hoverEls.forEach((el) => {
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
  });

  return () => {
    window.removeEventListener("mousemove", onMove);
    hoverEls.forEach((el) => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    });
  };
}

// ─────────────────────────────────────────────────────────────
// ENGINE START — SCREEN SHAKE
// ─────────────────────────────────────────────────────────────

/**
 * triggerEngineShake
 * One-shot screen shake when the Engine Start button is pressed.
 * Call this directly from an onClick handler — no cleanup needed.
 *
 * @param {RefObject} containerRef — ref on the element to shake (usually the detail page root)
 *
 * Usage:
 *   <button onClick={() => triggerEngineShake(pageRef)}>Engine Start</button>
 */
export function triggerEngineShake(containerRef) {
  gsap.fromTo(
    containerRef.current,
    { x: 0 },
    {
      x: "+=5",
      duration: 0.05,
      ease: "none",
      yoyo: true,
      repeat: 7,
      onComplete: () => gsap.set(containerRef.current, { x: 0 }),
    }
  );
}