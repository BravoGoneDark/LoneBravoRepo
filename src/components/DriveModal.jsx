// src/components/DriveModal.jsx
// ─────────────────────────────────────────────────────────────
// STUB — Oval orbit car selector
// Full build: next session
// ─────────────────────────────────────────────────────────────
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function DriveModal({ isOpen, onClose }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="drive-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-8 font-orbitron text-xs tracking-[0.2em] uppercase"
            style={{ color: "rgba(200,169,110,0.6)" }}
          >
            ✕ Close
          </button>

          {/* Placeholder content */}
          <div className="flex flex-col items-center gap-4 text-center">
            <p
              className="font-orbitron text-xs tracking-[0.3em] uppercase"
              style={{ color: "rgba(200,169,110,0.5)" }}
            >
              Oval Orbit Car Selector
            </p>
            <h2
              className="font-orbitron text-2xl font-black"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              — Coming Next Session —
            </h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}