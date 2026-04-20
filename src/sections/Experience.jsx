// src/sections/Experience.jsx
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import DriveModal from "../components/DriveModal";

export default function Experience() {
  const [modalOpen, setModalOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-15%" });

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <>
      <section
        id="experience"
        ref={sectionRef}
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* ── Video Background ── */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            src="/videos/porsche-legacy.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-base/60 via-dark-base/40 to-dark-base/80" />
          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        </div>

        {/* ── Mute / Unmute Button — bottom-left corner ── */}
        <motion.button
          onClick={toggleMute}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="absolute bottom-10 left-8 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300"
          style={{
            border: "1px solid rgba(200,169,110,0.35)",
            background: "rgba(0,0,0,0.45)",
            color: muted ? "rgba(200,169,110,0.45)" : "rgba(200,169,110,0.9)",
            backdropFilter: "blur(6px)",
          }}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            // Speaker muted — X over speaker
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 5L6 9H2v6h4l5 4V5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            // Speaker with sound waves
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 5L6 9H2v6h4l5 4V5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.54 8.46a5 5 0 0 1 0 7.07"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M19.07 4.93a10 10 0 0 1 0 14.14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </motion.button>

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">

          {/* Eyebrow line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="block h-px w-16" style={{ background: "rgba(200,169,110,0.6)" }} />
            <span
              className="font-orbitron text-xs tracking-[0.35em] uppercase"
              style={{ color: "rgba(200,169,110,0.8)" }}
            >
              Experience
            </span>
            <span className="block h-px w-16" style={{ background: "rgba(200,169,110,0.6)" }} />
          </motion.div>

          {/* Hero headline */}
          <div className="overflow-hidden mb-6">
            <motion.h2
              initial={{ y: "100%", opacity: 0 }}
              animate={isInView ? { y: "0%", opacity: 1 } : {}}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
              className="font-orbitron font-black leading-none tracking-tight"
              style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)", color: "#FFFFFF" }}
            >
              Want to Test Drive?
            </motion.h2>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
            className="font-rajdhani text-lg md:text-xl max-w-xl leading-relaxed mb-12"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Seven machines. Seven eras. One seat.
            <br />
            Choose your Porsche and feel what it's like behind the wheel.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
          >
            <button
              onClick={() => setModalOpen(true)}
              className="group relative font-orbitron text-sm tracking-[0.2em] uppercase px-10 py-4 overflow-hidden"
              style={{
                border: "1px solid rgba(200,169,110,0.6)",
                color: "#C8A96E",
                background: "transparent",
              }}
            >
              <span
                className="absolute inset-0 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
                style={{ background: "rgba(200,169,110,0.12)" }}
              />
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "inset 0 0 20px rgba(200,169,110,0.15)" }}
              />
              <span className="relative z-10 flex items-center gap-3">
                Select Your Machine
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span
              className="font-rajdhani text-xs tracking-[0.25em] uppercase"
              style={{ color: "rgba(200,169,110,0.4)" }}
            >
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-px h-8"
              style={{ background: "rgba(200,169,110,0.3)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* Drive Modal */}
      <DriveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnterCockpit={(car) => {
          setModalOpen(false);
          // CockpitSim trigger goes here in Step 3
          console.log("Enter cockpit:", car.name);
        }}
      />
    </>
  );
}