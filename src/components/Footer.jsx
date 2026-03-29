// components/Footer.jsx
// Clean, premium footer matching the Porsche site aesthetic
// – Quote line
// – Nav links (smooth scroll, same IDs as Navbar)
// – Social icons (inline SVG, no library)
// – Contact Us (mailto)
// – Porsche.com external link
// – Copyright strip
// – Scroll-to-top button (appears after 300px scroll, fixed bottom-right)
// – Watermark logo text fixed at bottom of footer

import { useEffect, useState } from "react";
import { motion }              from "framer-motion";

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Models",      href: "#models"       },
  { label: "Configure",   href: "#configurator" },
  { label: "Performance", href: "#performance"  },
  { label: "Experience",  href: "#experience"   },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href:  "https://www.instagram.com/porsche/",
    icon:  <InstagramIcon />,
  },
  {
    label: "YouTube",
    href:  "https://www.youtube.com/@Porsche",
    icon:  <YouTubeIcon />,
  },
  {
    label: "X / Twitter",
    href:  "https://twitter.com/porsche",
    icon:  <XIcon />,
  },
  {
    label: "Facebook",
    href:  "https://www.facebook.com/porsche",
    icon:  <FacebookIcon />,
  },
  {
    label: "LinkedIn",
    href:  "https://www.linkedin.com/company/porsche-ag",
    icon:  <LinkedInIcon />,
  },
];

// ─────────────────────────────────────────────────────────────
// SMOOTH SCROLL HELPER (mirrors Navbar behaviour)
// ─────────────────────────────────────────────────────────────

function scrollToSection(href) {
  const target = document.querySelector(href);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function Footer() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollBtn(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="relative bg-dark-base overflow-hidden">

        {/* Top gold separator */}
        <div className="w-full h-px bg-porsche-gold/30" />

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto px-6 pt-16 pb-32"
        >

          {/* ── Quote ──────────────────────────────────────── */}
          <div className="text-center mb-14">
            <p className="font-rajdhani italic text-porsche-gold/60 text-2xl tracking-widest">
              "There is no substitute."
            </p>
          </div>

          {/* ── Mid row ────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">

            {/* Social icons */}
            <div className="flex items-center gap-6">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-white/30 hover:text-porsche-gold transition-colors duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-8 flex-wrap justify-center">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="font-orbitron text-[10px] tracking-[0.25em] uppercase text-white/35 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* External Porsche link */}
            <a
              href="https://www.porsche.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-orbitron text-[10px] tracking-[0.2em] uppercase text-porsche-gold/70 hover:text-porsche-gold border-b border-porsche-gold/30 hover:border-porsche-gold pb-0.5 transition-all duration-300 whitespace-nowrap"
            >
              More Information ↗
            </a>
          </div>

          {/* ── Contact ────────────────────────────────────── */}
          <div className="flex justify-center mb-12">
            <a
              href="mailto:contact@porsche.com"
              className="flex items-center gap-2.5 text-white/30 hover:text-white transition-colors duration-300 group"
            >
              <EnvelopeIcon />
              <span className="font-orbitron text-[10px] tracking-[0.2em] uppercase group-hover:text-porsche-gold transition-colors duration-300">
                Contact Us
              </span>
            </a>
          </div>

          {/* ── Thin divider ───────────────────────────────── */}
          <div className="w-full h-px bg-white/5 mb-8" />

          {/* ── Copyright ──────────────────────────────────── */}
          <p className="text-center font-orbitron text-[9px] tracking-[0.3em] uppercase text-white/20">
            © {new Date().getFullYear()} Porsche AG. All rights reserved.
            &nbsp;·&nbsp; Crafted for Hackathon
          </p>
        </motion.div>

        {/* ── Watermark wordmark ─────────────────────────────
            Positioned at the bottom of the footer div itself,
            not fixed to viewport — purely decorative          */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden"
        >
          <span
            className="font-orbitron font-black uppercase leading-none"
            style={{
              fontSize:      "clamp(4rem, 14vw, 11rem)",
              color:         "rgba(200, 169, 110, 0.09)",
              letterSpacing: "0.15em",
              transform:     "translateY(30%)",
            }}
          >
            PORSCHE
          </span>
        </div>
      </footer>

      {/* ── SCROLL-TO-TOP BUTTON ──────────────────────────────
          Fixed bottom-right, appears only after scrolling 300px  */}
      <motion.button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showScrollBtn ? 1 : 0,
          scale:   showScrollBtn ? 1 : 0.8,
          pointerEvents: showScrollBtn ? "auto" : "none",
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={[
          "fixed bottom-8 right-8 z-50",
          "w-11 h-11 rounded-full",
          "border border-porsche-gold/40 hover:border-porsche-gold",
          "bg-dark-base/80 backdrop-blur-md",
          "flex items-center justify-center",
          "text-white/50 hover:text-porsche-gold",
          "transition-colors duration-300",
        ].join(" ")}
      >
        <ChevronUpIcon />
      </motion.button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// INLINE SVG ICONS — no icon library dependency
// ─────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.626zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="4" ry="4" />
      <line x1="8" y1="11" x2="8" y2="16" />
      <line x1="8" y1="8" x2="8" y2="8.01" />
      <line x1="12" y1="16" x2="12" y2="11" />
      <path d="M16 16v-3a2 2 0 0 0-4 0" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}