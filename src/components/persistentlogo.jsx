// components/PersistentLogo.jsx
// The Porsche crest watermark — always mounted in the DOM,
// invisible until `ready` flips true, then animates to corner.
// Keeping it always mounted avoids the useAnimation timing race
// where controls.start() fires before the component paints.

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { persistentLogo } from "../animations/transitions";

/**
 * @param {{ ready: boolean }} props
 * ready — set to true by App.jsx ~300ms after intro overlay exits
 */
export default function PersistentLogo({ ready }) {
  const controls = useAnimation();

  useEffect(() => {
    if (!ready) return;
    // Component is already mounted and painted — safe to animate now
    controls.start("animate");
  }, [ready, controls]);

  return (
    <motion.div
      className="fixed z-40 pointer-events-none select-none"
      // Hidden until ready — no null return, avoids remount timing issue
      style={{ visibility: ready ? "visible" : "hidden" }}
      variants={persistentLogo}
      initial="initial"
      animate={controls}
    >
      <img
        src="/images/porsche-crest.svg"
        alt="Porsche Crest"
        className="w-64 h-64 object-contain"
        style={{ filter: "brightness(1.1) contrast(1.1)" }}
        draggable={false}
      />
    </motion.div>
  );
}