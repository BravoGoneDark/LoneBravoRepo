// animations/gsapAnimations.js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
// CARD STACK
//
// StrictMode in React 18 double-invokes every useEffect in dev,
// meaning initCardStack() runs twice before the first cleanup fires.
// Previous fix (_porscheStack tag) didn't work because ScrollTrigger
// doesn't expose vars on the instance after creation.
//
// Solution:
//   1. Named IDs ("porsche-stack-N") — the only reliable way to find
//      and kill triggers after they're created.
//   2. Module-level _stackSetupScheduled flag — if StrictMode fires
//      a second scheduleSetup() before the first rAF runs, we skip it.
//      The first setup() always resets the flag and kills stale triggers.
// ─────────────────────────────────────────────────────────────

let _stackSetupScheduled = false;

const killStackTriggers = () => {
  ScrollTrigger.getAll()
    .filter((t) => t.vars.id?.startsWith("porsche-stack-"))
    .forEach((t) => t.kill());
};

export function initCardStack(wrapperSelector, cardSelector) {

  const setup = () => {
    _stackSetupScheduled = false;
    killStackTriggers(); // wipe any stale triggers before re-creating

    const wrapper = document.querySelector(wrapperSelector);
    const cards   = gsap.utils.toArray(cardSelector);
    if (!wrapper || cards.length === 0) return;

    const cardScrollPx = window.innerHeight * (CARD_VH / 100);

    cards.forEach((card, i) => {
      gsap.set(card, { yPercent: i === 0 ? 0 : 100, zIndex: i + 1 });
      if (i === 0) return;

      ScrollTrigger.create({
        id:                  `porsche-stack-${i}`,  // named → reliably killable
        trigger:             wrapper,
        start:               `top+=${(i - 1) * cardScrollPx} top`,
        end:                 `top+=${i * cardScrollPx} top`,
        scrub:               0.6,
        invalidateOnRefresh: true,                  // recalcs on resize
        onUpdate: (self) => {
          gsap.set(card, { yPercent: 100 - self.progress * 100 });
        },
      });
    });

    ScrollTrigger.refresh();
  };

  const scheduleSetup = () => {
    // StrictMode calls this twice — the flag ensures only the first
    // scheduled rAF runs. setup() resets it so future hot-reloads work.
    if (_stackSetupScheduled) return;
    _stackSetupScheduled = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(setup);
    });
  };

  if (document.readyState === "complete") {
    scheduleSetup();
  } else {
    window.addEventListener("load", scheduleSetup, { once: true });
  }

  const onResize = () => ScrollTrigger.refresh(true);
  window.addEventListener("resize", onResize);

  return () => {
    killStackTriggers();
    window.removeEventListener("resize", onResize);
  };
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
        trigger:             card,
        start:               "top bottom",
        end:                 "bottom top",
        scrub:               true,
        invalidateOnRefresh: true,
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
// ENGINE SHAKE
// ─────────────────────────────────────────────────────────────

export function triggerEngineShake(containerRef) {
  gsap.fromTo(
    containerRef.current,
    { x: 0 },
    {
      x: "+=5", duration: 0.05, ease: "none", yoyo: true, repeat: 7,
      onComplete: () => gsap.set(containerRef.current, { x: 0 }),
    }
  );
}