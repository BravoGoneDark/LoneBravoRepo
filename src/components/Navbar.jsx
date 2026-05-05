// components/Navbar.jsx
// Fixed navigation bar — transparent on top, frosted glass on scroll
// Receives activeSection from App.jsx to highlight the current link
// Mobile: hamburger + full-height right drawer below md breakpoint

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { staggerContainer, fadeUp, clipReveal } from "../animations/variants";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);
// ─────────────────────────────────────────────────────────────
// NAV LINKS
// href matches the id of each <section> in the page
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Models",    href: "#models"    },
  { label: "Heritage",  href: "#history"   },
  { label: "Experience", href: "#experience" },
];

// ─────────────────────────────────────────────────────────────
// MOBILE DRAWER VARIANTS
// ─────────────────────────────────────────────────────────────

const drawerVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: "0%",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
  },
};

const drawerLinkVariants = {
  hidden:  { opacity: 0, x: 30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

/**
 * @param {{ activeSection: string }} props
 * activeSection — id string of the currently visible section
 *                 e.g. "hero", "models", "performance"
 *                 Passed down from App.jsx via IntersectionObserver
 */
export default function Navbar({ activeSection, onNavLinkClick }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef(null);

  // ── Scroll detection ───────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close drawer on outside click ─────────────────────────
  useEffect(() => {
    if (!mobileOpen) return;
    const handleOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [mobileOpen]);

  // ── Lock body scroll when drawer is open ──────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // ── Smooth scroll handler ──────────────────────────────────
  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    if (onNavLinkClick) { onNavLinkClick(href); return; }
    const target = document.querySelector(href);
    if (!target) return;
    gsap.to(window, {
      duration: 1.4,
      scrollTo: { y: target, offsetY: 50 },
      ease: "power3.inOut",
    });
  };

  // ── Active link helper ─────────────────────────────────────
  const isActive = (href) => activeSection === href.replace("#", "");

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1  }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-500",
          scrolled
            ? "bg-dark-base/80 backdrop-blur-xl border-b border-porsche-gold/10 py-4"
            : "bg-transparent py-6",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* ── Left — Wordmark ───────────────────────────── */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            className="group flex items-center gap-3"
          >
            {/* Thin animated gold accent bar */}
            <span className="block w-0.5 h-6 bg-porsche-gold group-hover:h-8 transition-all duration-300" />
            <span className="font-orbitron text-white text-sm font-bold tracking-[0.25em] uppercase group-hover:text-porsche-gold transition-colors duration-300">
              Porsche
            </span>
          </a>

          {/* ── Center — Desktop nav links ────────────────── */}
          <motion.ul
            className="hidden md:flex items-center gap-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {NAV_LINKS.map((link) => (
              <motion.li key={link.href} variants={fadeUp}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={[
                    "relative font-orbitron text-[11px] tracking-[0.2em] uppercase",
                    "transition-colors duration-300 pb-1",
                    isActive(link.href)
                      ? "text-porsche-gold"
                      : "text-white/50 hover:text-white",
                  ].join(" ")}
                >
                  {link.label}

                  {/* Active underline — clipReveal wipe animation */}
                  {isActive(link.href) && (
                    <motion.span
                      className="absolute bottom-0 left-0 right-0 h-px bg-porsche-gold"
                      variants={clipReveal}
                      initial="hidden"
                      animate="visible"
                    />
                  )}
                </a>
              </motion.li>
            ))}
          </motion.ul>

          {/* ── Right — Mute button + Hamburger ──────────── */}
          <div className="flex items-center gap-4">

            {/* Hamburger — visible on mobile only */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="md:hidden flex flex-col gap-1.5 p-1"
            >
              <span className={[
                "block w-6 h-px bg-white transition-all duration-300 origin-center",
                mobileOpen ? "rotate-45 translate-y-2" : "",
              ].join(" ")} />
              <span className={[
                "block w-6 h-px bg-white transition-all duration-300",
                mobileOpen ? "opacity-0 scale-x-0" : "",
              ].join(" ")} />
              <span className={[
                "block w-6 h-px bg-white transition-all duration-300 origin-center",
                mobileOpen ? "-rotate-45 -translate-y-2" : "",
              ].join(" ")} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile drawer ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Drawer panel */}
            <motion.div
              ref={drawerRef}
              className={[
                "fixed top-0 right-0 bottom-0 z-40 md:hidden",
                "w-72 bg-dark-surface border-l border-porsche-gold/10",
                "flex flex-col justify-center px-10",
              ].join(" ")}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Top decorative line */}
              <div className="absolute top-8 left-10 right-10 h-px bg-porsche-gold/20" />

              {/* Label */}
              <p className="font-orbitron text-white/20 text-[10px] tracking-[0.4em] uppercase mb-12">
                Navigation
              </p>

              {/* Links */}
              <ul className="flex flex-col gap-8">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    custom={i}
                    variants={drawerLinkVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={[
                        "font-orbitron text-lg tracking-[0.15em] uppercase",
                        "transition-colors duration-300",
                        isActive(link.href)
                          ? "text-porsche-gold"
                          : "text-white/60 hover:text-white",
                      ].join(" ")}
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Bottom decorative line */}
              <div className="absolute bottom-8 left-10 right-10 h-px bg-porsche-gold/20" />

              {/* Since tag */}
              <p className="absolute bottom-12 left-10 font-orbitron text-white/15 text-[9px] tracking-[0.3em]">
                Since 1948
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
