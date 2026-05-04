// sections/Models.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence }             from "framer-motion";
import { useNavigate }                         from "react-router-dom";
import { cars, eras }                          from "../constants/carData";
import { eraLabelSlide, fadeUp, staggerContainer } from "../animations/variants";
import gsap                                    from "gsap";
import { ScrollTrigger }                       from "gsap/ScrollTrigger";
import { ScrollToPlugin }                      from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Each card occupies this much scroll distance (vh) for its transition
const CARD_VH = 220;

// ─────────────────────────────────────────────────────────────
// ERA FILTER BAR
// ─────────────────────────────────────────────────────────────
function EraFilterBar({ activeEra, onEraClick, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 px-4 py-2"
          style={{
            background:     "rgba(10,10,10,0.85)",
            backdropFilter: "blur(12px)",
            border:         "1px solid rgba(200,169,110,0.15)",
          }}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {eras.map((era, i) => {
            const isActive = activeEra === era;
            return (
              <button
                key={era}
                onClick={() => onEraClick(era)}
                className="relative font-orbitron text-[10px] tracking-[0.25em] uppercase px-4 py-2 transition-colors duration-300"
                style={{ color: isActive ? "#C8A96E" : "rgba(255,255,255,0.35)" }}
              >
                {era}
                {isActive && (
                  <motion.span
                    layoutId="era-underline"
                    className="absolute bottom-0 left-2 right-2 h-px"
                    style={{ background: "#C8A96E" }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {i < eras.length - 1 && (
                  <span
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT PILL
// ─────────────────────────────────────────────────────────────
function StatPill({ label, value, unit, accentColor, isActive }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const rawValue = String(value);
    const numericValue = Number(rawValue.replace(/[^\d.]/g, ""));

    if (!isActive || Number.isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    const decimals = rawValue.includes(".") ? rawValue.split(".")[1].length : 0;
    const duration = 900;
    let frameId;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue((numericValue * eased).toFixed(decimals));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    setDisplayValue((0).toFixed(decimals));
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, isActive]);

  return (
    <div className="flex flex-col gap-1 min-w-[76px]">
      <span className="font-orbitron text-[8px] tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="font-orbitron text-lg font-bold tabular-nums" style={{ color: accentColor }}>{displayValue}</span>
        <span className="font-orbitron text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{unit}</span>
      </div>
      <motion.span
        className="block h-px origin-left"
        style={{ background: accentColor }}
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0.2, opacity: isActive ? 0.75 : 0.18 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SINGLE CARD
// ─────────────────────────────────────────────────────────────
function CarCard({ car, index, cardRef, isActive }) {
  const navigate = useNavigate();

  return (
    <div
      ref={cardRef}
      className="pagani-card absolute inset-0 w-full h-full overflow-hidden"
      style={{
        willChange: "transform, opacity, filter",
        // Cards start invisible (except the first)
        opacity: index === 0 ? 1 : 0,
        filter:  index === 0 ? "blur(0px)" : "blur(20px)",
        transform: index === 0 ? "scale(1)" : "scale(1.04)",
        pointerEvents: "none",
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          className="card-img w-full h-[120%] object-cover will-change-transform"
          src={car.cardImage || car.image}
          alt={car.name}
          draggable={false}
          style={{
            objectPosition: index === 4 ? "center 35%" : index === 5 ? "center 30%" : "center center",
            marginTop: "-10%",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.3) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-64" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.95) 0%, transparent 100%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 40% at 70% 50%, ${car.accentColor}10 0%, transparent 70%)` }} />
      </div>

      <div
        className="highlight-sweep pointer-events-none absolute top-0 bottom-0 z-[4] w-[28%]"
        style={{
          left: 0,
          opacity: 0,
          transform: "translateX(-140%) skewX(-16deg)",
          mixBlendMode: "screen",
          background: `linear-gradient(90deg, transparent 0%, ${car.accentColor}08 25%, rgba(255,255,255,0.35) 48%, ${car.accentColor}18 62%, transparent 100%)`,
          filter: "blur(1px)",
        }}
      />

      {/* Large ghost number */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 font-orbitron font-black select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "clamp(8rem, 20vw, 18rem)", color: "rgba(255,255,255,0.025)", lineHeight: 1, letterSpacing: "-0.05em" }}>
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-8 md:px-12 flex flex-col justify-between pt-24 pb-10">

        <motion.div className="flex items-center gap-3" variants={eraLabelSlide} initial="hidden" animate="visible">
          <span className="block w-6 h-px" style={{ background: car.accentColor }} />
          <span className="font-orbitron text-[10px] tracking-[0.5em] uppercase" style={{ color: car.accentColor }}>
            {car.era} · {car.year}
          </span>
          <span className="font-orbitron text-[9px] tracking-widest border px-2 py-0.5"
            style={{ color: "rgba(255,255,255,0.3)", borderColor: "rgba(255,255,255,0.1)" }}>
            Class {car.class}
          </span>
        </motion.div>

        <div className="max-w-xl">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h2 variants={fadeUp} className="font-orbitron font-black mb-2"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1, letterSpacing: "-0.02em", color: "#ffffff" }}>
              {car.name}
            </motion.h2>
            <motion.p variants={fadeUp} className="font-orbitron text-xs tracking-[0.35em] uppercase mb-5"
              style={{ color: "rgba(255,255,255,0.25)" }}>
              {car.model_code} · {car.year}
            </motion.p>
            <motion.p variants={fadeUp} className="font-rajdhani text-xl md:text-2xl mb-8 leading-snug"
              style={{ color: car.accentColor, fontStyle: "italic" }}>
              "{car.tagline}"
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-x-8 gap-y-4 mb-10 pb-8"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <StatPill label="Top Speed" value={car.stats.topSpeed.value}     unit={car.stats.topSpeed.unit}     accentColor={car.accentColor} isActive={isActive} />
              <StatPill label="0–100"     value={car.stats.acceleration.value} unit={car.stats.acceleration.unit} accentColor={car.accentColor} isActive={isActive} />
              <StatPill label="Power"     value={car.stats.horsepower.value}   unit={car.stats.horsepower.unit}   accentColor={car.accentColor} isActive={isActive} />
              <StatPill label="Torque"    value={car.stats.torque.value}       unit={car.stats.torque.unit}       accentColor={car.accentColor} isActive={isActive} />
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-6">
              <button
                onClick={() => navigate(`/car/${car.id}`)}
                className="learn-more font-orbitron text-[11px] tracking-[0.25em] uppercase"
                style={{ padding: "14px 36px", background: car.accentColor, color: "#0A0A0A", border: `1px solid ${car.accentColor}`, transition: "all 0.35s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = car.accentColor; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = car.accentColor; e.currentTarget.style.color = "#0A0A0A"; }}>
                Explore Car
              </button>
              <p className="hidden md:block font-rajdhani text-sm leading-snug max-w-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                {car.engineCharacter.split(" ").slice(0, 8).join(" ")}...
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="font-orbitron text-[8px] tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Original Price</p>
              <p className="font-orbitron text-sm font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{car.price}</p>
            </div>
            <span className="w-px h-8" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div>
              <p className="font-orbitron text-[8px] tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Drivetrain</p>
              <p className="font-orbitron text-sm font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{car.stats.drivetrain.value}</p>
            </div>
            <span className="w-px h-8" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div>
              <p className="font-orbitron text-[8px] tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Engine</p>
              <p className="font-rajdhani text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{car.stats.engine.value}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(255,255,255,0.15)" }}>
              {String(index + 1).padStart(2, "0")} / {String(cars.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Models() {
  const wrapperRef = useRef(null);
  const stickyRef  = useRef(null);
  const cardRefs   = useRef(cars.map(() => React.createRef()));

  const [activeIndex,   setActiveIndex]   = useState(0);
  const [activeEra,     setActiveEra]     = useState(cars[0].era);
  const [eraBarVisible, setEraBarVisible] = useState(false);

  // ── Pagani-style GSAP scroll transitions ────────────────────
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const wrapper = wrapperRef.current;
      const sticky  = stickyRef.current;
      if (!wrapper || !sticky) return;

      const cardEls = cardRefs.current.map(r => r.current).filter(Boolean);
      // First card starts active
      cardEls[0].style.pointerEvents = "auto";
      if (!cardEls.length) return;

      // Each card transition zone = CARD_VH vh of scroll
      const cardScrollPx = window.innerHeight * (CARD_VH / 100);

      cars.forEach((_, i) => {
        const card = cardEls[i];
        const next = cardEls[i + 1];
        const nextSweep = next?.querySelector(".highlight-sweep");
        if (!card) return;

        // ── OUT animation: current card fades to black + scales down
        // Happens in the second half of its scroll zone
        if (next) {
          ScrollTrigger.create({
            trigger:  wrapper,
            start:    () => `top+=${i * cardScrollPx + cardScrollPx * 0.35}px top`,
            end:      () => `top+=${i * cardScrollPx + cardScrollPx}px top`,
            scrub:    0.85,
            onUpdate: (self) => {
              const p = self.progress; // 0 → 1 as we scroll through the out zone
              gsap.set(card, {
                opacity:  1 - p,
                filter:   `blur(${p * 8}px)`,
                scale:    1 - p * 0.03,
              });
              // ── IN animation: next card sharpens from blur + scales to 1
              gsap.set(next, {
                opacity: p,
                filter:  `blur(${(1 - p) * 20}px)`,
                scale:   1.04 - p * 0.04,
              });

              if (nextSweep) {
                const sweepProgress = gsap.utils.clamp(0, 1, (p - 0.12) / 0.58);
                gsap.set(nextSweep, {
                  xPercent: -140 + sweepProgress * 560,
                  skewX: -16,
                  opacity: Math.sin(sweepProgress * Math.PI) * 0.42,
                });
              }
            },
          });
        }

        // Track active index for era bar
        ScrollTrigger.create({
          trigger:    wrapper,
          start:      () => `top+=${i * cardScrollPx}px top`,
          end:        () => `top+=${(i + 1) * cardScrollPx}px top`,
          onEnter: () => {
            setActiveIndex(i);
            setActiveEra(cars[i].era);
            // Enable clicks only on active card, disable all others
            cardEls.forEach((el, j) => {
              el.style.pointerEvents = j === i ? "auto" : "none";
            });
          },
          onEnterBack: () => {
            setActiveIndex(i);
            setActiveEra(cars[i].era);
            cardEls.forEach((el, j) => {
              el.style.pointerEvents = j === i ? "auto" : "none";
            });
          },
        });
      });

      // Era bar visibility
      ScrollTrigger.create({
        trigger:    wrapper,
        start:      "top 80px",
        end:        "bottom 80px",
        onEnter:    () => setEraBarVisible(true),
        onLeave:    () => setEraBarVisible(false),
        onEnterBack:() => setEraBarVisible(true),
        onLeaveBack:() => setEraBarVisible(false),
      });

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const handleEraClick = (era) => {
    const idx = cars.findIndex((c) => c.era === era);
    if (idx === -1) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapperTop   = wrapper.getBoundingClientRect().top + window.scrollY;
    const cardScrollPx = window.innerHeight * (CARD_VH / 100);
    const target       = wrapperTop + idx * cardScrollPx;
    gsap.to(window, {
      duration: 1.4,
      scrollTo: { y: target, autoKill: false },
      ease: "power3.inOut",
    });
  };

  return (
    <section id="models" className="relative bg-dark-base">
      {/* Section header */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 pt-32 pb-16">
        <motion.div className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <span className="block w-10 h-px bg-porsche-gold" />
          <span className="font-orbitron text-porsche-gold text-[10px] tracking-[0.5em] uppercase">The Collection</span>
        </motion.div>
        <motion.h2 className="font-orbitron font-black text-white mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          Seven Decades.<br />Seven Legends.
        </motion.h2>
        <motion.p className="font-rajdhani text-white/40 text-lg max-w-xl"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          From the savage 930 Turbo to the instant torque of the Taycan —
          scroll through the cars that defined Porsche's legacy.
        </motion.p>
      </div>

      <EraFilterBar activeEra={activeEra} onEraClick={handleEraClick} visible={eraBarVisible} />

      {/* Scroll container */}
      <div
        ref={wrapperRef}
        id="card-stack-wrapper"
        className="relative"
        style={{ height: `calc(${cars.length} * ${CARD_VH}vh + 100vh)` }}
      >
        {/* Sticky viewport */}
        <div
          ref={stickyRef}
          className="sticky top-0 overflow-hidden"
          style={{
            width:        "92vw",
            height:       "88vh",
            margin:       "6vh auto 0",
            borderRadius: "28px",
            background:   "#0A0A0A",
            border:       "1px solid rgba(200,169,110,0.16)",
            boxShadow:    "0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {cars.map((car, i) => (
            <CarCard
              key={car.id}
              car={car}
              index={i}
              cardRef={cardRefs.current[i]}
              isActive={activeIndex === i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
