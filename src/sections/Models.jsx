// sections/Models.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence }             from "framer-motion";
import { cars, eras }                          from "../constants/carData";
import { initCardStack, cardImageParallax }    from "../animations/gsapanimations";
import { eraLabelSlide, fadeUp, staggerContainer } from "../animations/variants";
import gsap                                    from "gsap";
import { ScrollTrigger }                       from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARD_VH = 190;

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

function StatPill({ label, value, unit }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-orbitron text-[8px] tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="font-orbitron text-lg font-bold" style={{ color: "#C8A96E" }}>{value}</span>
        <span className="font-orbitron text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{unit}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SINGLE CARD
// ─────────────────────────────────────────────────────────────

function CarCard({ car, index, onLearnMore, cardRef }) {
  const handleLearnMore = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) onLearnMore(car, rect);
  };

  return (
    <div
      ref={cardRef}
      className="stack-card absolute inset-0 w-full h-full overflow-hidden"
      style={{ willChange: "transform" }}
    >
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

      <div className="absolute right-12 top-1/2 -translate-y-1/2 font-orbitron font-black select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "clamp(8rem, 20vw, 18rem)", color: "rgba(255,255,255,0.025)", lineHeight: 1, letterSpacing: "-0.05em" }}>
        {String(index + 1).padStart(2, "0")}
      </div>

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
              <StatPill label="Top Speed" value={car.stats.topSpeed.value}     unit={car.stats.topSpeed.unit} />
              <StatPill label="0–100"     value={car.stats.acceleration.value} unit={car.stats.acceleration.unit} />
              <StatPill label="Power"     value={car.stats.horsepower.value}   unit={car.stats.horsepower.unit} />
              <StatPill label="Torque"    value={car.stats.torque.value}       unit={car.stats.torque.unit} />
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-6">
              <button onClick={handleLearnMore}
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

export default function Models({ onLearnMore }) {
  const wrapperRef = useRef(null);
  const cardRefs   = useRef(cars.map(() => React.createRef()));

  const [activeIndex,   setActiveIndex]   = useState(0);
  const [activeEra,     setActiveEra]     = useState(cars[0].era);
  const [eraBarVisible, setEraBarVisible] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const cleanupStack    = initCardStack("#card-stack-wrapper", ".stack-card");
    const cleanupParallax = cardImageParallax(".card-img", ".stack-card");

    return () => {
      cleanupStack?.();
      cleanupParallax?.();
    };
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onScroll = () => {
      const rect      = wrapper.getBoundingClientRect();
      const inSection = rect.top <= 80 && rect.bottom >= 80;
      setEraBarVisible(inSection);

      const scrolled     = Math.max(-rect.top, 0);
      const cardScrollPx = window.innerHeight * (CARD_VH / 100);
      const idx = Math.min(
        Math.floor(scrolled / cardScrollPx),
        cars.length - 1
      );

      setActiveIndex(idx);
      setActiveEra(cars[idx].era);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEraClick = (era) => {
    const idx = cars.findIndex((c) => c.era === era);
    if (idx === -1) return;

    // Card 0 — no trigger, scroll to wrapper top
    if (idx === 0) {
      const st = ScrollTrigger.getById("porsche-stack-1");
      if (st) window.scrollTo({ top: st.start, behavior: "smooth" });
      return;
    }

    // Cards 1-6 — st.end is when THIS card is fully slid into view.
    // st.start would be one card too early (it's where the previous card ends).
    const st = ScrollTrigger.getById(`porsche-stack-${idx}`);
    if (st) window.scrollTo({ top: st.end, behavior: "smooth" });
  };

  return (
    <section id="models" className="relative bg-dark-base">

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

      <div
        ref={wrapperRef}
        id="card-stack-wrapper"
        className="relative"
        style={{ height: `calc(${cars.length} * ${CARD_VH}vh + 100vh)` }}
      >
        <div className="sticky top-0 w-full h-screen overflow-hidden" style={{ background: "#0A0A0A" }}>
          {cars.map((car, i) => (
            <CarCard
              key={car.id}
              car={car}
              index={i}
              onLearnMore={onLearnMore}
              cardRef={cardRefs.current[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}