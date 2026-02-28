// components/ScrollProgressBar.jsx
// Thin gold line fixed at the very top of the viewport
// Receives the spring-smoothed scaleX motion value from App.jsx
// Driven by Framer Motion's useScroll — no GSAP needed here

import { motion } from "framer-motion";

/**
 * @param {{ scaleX: MotionValue<number> }} props
 * scaleX is passed down from App.jsx:
 *   const { scrollYProgress } = useScroll();
 *   const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
 */
export default function ScrollProgressBar({ scaleX }) {
  return (
    // Track — full width, fixed to top, sits above everything
    <div className="fixed top-0 left-0 right-0 z-[9998] h-[2px] bg-white/5">
      {/* Fill — scales from left as user scrolls */}
      <motion.div
        className="h-full bg-porsche-gold origin-left"
        style={{ scaleX }}
      />
    </div>
  );
}