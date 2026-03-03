// components/StatBar.jsx
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function StatBar({ label, value, unit, percent, accentColor, delay = 0 }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-baseline justify-between">
        <span
          className="font-orbitron text-[9px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-orbitron text-sm font-bold" style={{ color: accentColor }}>
            {value}
          </span>
          <span className="font-orbitron text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            {unit}
          </span>
        </div>
      </div>

      {/* Track */}
      <div
        className="relative w-full overflow-hidden rounded-sm"
        style={{
          height:     "6px",
          background: "rgba(255,255,255,0.06)",
          boxShadow:  "inset 0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        {/* Fluid fill */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-sm"
          style={{
            background:  `linear-gradient(90deg, ${accentColor}99, ${accentColor})`,
            boxShadow:   `0 0 8px ${accentColor}99, 0 0 2px ${accentColor}`,
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? percent / 100 : 0 }}
          transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Glowing tip dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            width:      "8px",
            height:     "8px",
            background: accentColor,
            boxShadow:  `0 0 6px 2px ${accentColor}, 0 0 12px ${accentColor}88`,
            marginLeft: "-4px",
          }}
          initial={{ left: "0%" }}
          animate={{ left: inView ? `${percent}%` : "0%" }}
          transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Shimmer sweep */}
        <motion.div
          className="absolute top-0 h-full w-8"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            transformOrigin: "left",
          }}
          initial={{ left: "-10%" }}
          animate={{ left: inView ? `${percent + 5}%` : "-10%" }}
          transition={{ duration: 1.2, delay: delay + 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}