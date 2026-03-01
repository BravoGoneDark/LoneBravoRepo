// animations/gsapAnimations.js
// All GSAP + ScrollTrigger functions

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Must match CARD_VH in Models.jsx
const CARD_VH = 190;

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────

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

export function initCardStack(wrapperSelector, cardSelector) {
  const wrapper  = document.querySelector(wrapperSelector);
  const cards    = gsap.utils.toArray(cardSelector);
  const triggers = [];

  // cardScrollPx = how many pixels of scroll each card occupies
  const cardScrollPx = window.innerHeight * (CARD_VH / 100);

  cards.forEach((card, i) => {
    gsap.set(card, { yPercent: i === 0 ? 0 : 100, zIndex: i + 1 });
    if (i === 0) return;

    const st = ScrollTrigger.create({
      trigger:  wrapper,
      start:    `top+=${(i - 1) * cardScrollPx} top`,
      end:      `top+=${i * cardScrollPx} top`,
      scrub:    0.6,
      onUpdate: (self) => {
        gsap.set(card, { yPercent: 100 - self.progress * 100 });
      },
    });

    triggers.push(st);
  });

  ScrollTrigger.refresh();
  return () => triggers.forEach((t) => t.kill());
}

// ─────────────────────────────────────────────────────────────
// CARD IMAGE PARALLAX
// ─────────────────────────────────────────────────────────────

export function cardImageParallax(imageSelector, cardSelector) {
  const pairs  = gsap.utils.toArray(cardSelector);
  const tweens = [];

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
// STAT COUNTER
// ─────────────────────────────────────────────────────────────

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
        const display = Number.isInteger(target) ? Math.round(obj.val) : obj.val.toFixed(1);
        ref.current.textContent = display + suffix;
      }
    },
  });
  return () => tween.kill();
}

// ─────────────────────────────────────────────────────────────
// SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────────

export function initScrollProgressBar(barRef) {
  const tween = gsap.to(barRef.current, {
    scaleX: 1,
    ease:   "none",
    scrollTrigger: {
      trigger: document.body,
      start:   "top top",
      end:     "bottom bottom",
      scrub:   0.1,
    },
  });
  return () => tween.scrollTrigger?.kill();
}

// ─────────────────────────────────────────────────────────────
// CURSOR GLOW
// ─────────────────────────────────────────────────────────────

export function initCursorGlow(cursorRef, hoverSelectors = ["a", "button"]) {
  const cursor = cursorRef.current;
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) return () => {};

  const onMove  = (e) => gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out", overwrite: "auto" });
  const onEnter = () => gsap.to(cursor, { scale: 2.5, duration: 0.3, ease: "power2.out" });
  const onLeave = () => gsap.to(cursor, { scale: 1,   duration: 0.3, ease: "power2.out" });

  window.addEventListener("mousemove", onMove);
  const hoverEls = document.querySelectorAll(hoverSelectors.join(", "));
  hoverEls.forEach((el) => { el.addEventListener("mouseenter", onEnter); el.addEventListener("mouseleave", onLeave); });

  return () => {
    window.removeEventListener("mousemove", onMove);
    hoverEls.forEach((el) => { el.removeEventListener("mouseenter", onEnter); el.removeEventListener("mouseleave", onLeave); });
  };
}

// ─────────────────────────────────────────────────────────────
// ENGINE SHAKE
// ─────────────────────────────────────────────────────────────

export function triggerEngineShake(containerRef) {
  gsap.fromTo(
    containerRef.current,
    { x: 0 },
    { x: "+=5", duration: 0.05, ease: "none", yoyo: true, repeat: 7,
      onComplete: () => gsap.set(containerRef.current, { x: 0 }) }
  );
}