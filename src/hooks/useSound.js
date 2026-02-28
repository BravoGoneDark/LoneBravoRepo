// hooks/useSound.js
// Wraps Howler.js into clean React hooks
// Two exports:
//   useSound(src, options)          → general purpose, any audio file
//   useEngineSound(engineSoundKey)  → specialised, maps carData engineSound keys to files + behaviour

import { useRef, useCallback, useEffect } from "react";
import { Howl, Howler } from "howler";

// ─────────────────────────────────────────────────────────────
// ENGINE SOUND MAP
// Maps carData.js engineSound keys → public folder paths
// Export this if you want to preload all sounds on app init
// ─────────────────────────────────────────────────────────────

export const ENGINE_SOUND_MAP = {
  "flat-six-na":    "/sounds/engine-flat-six-na.mp3",
  "flat-six-turbo": "/sounds/engine-flat-six-turbo.mp3",
  "v10-na":         "/sounds/engine-v10-na.mp3",
  "electric-motor": "/sounds/engine-electric.mp3",
};

// ─────────────────────────────────────────────────────────────
// ENGINE BEHAVIOUR PROFILES
// Controls how each engine type responds to throttle input
// rate    → Howler playback rate (pitch proxy)
// volume  → Howler volume
// idle    → rate + volume at 0 throttle
// full    → rate + volume at 1 throttle
// surge   → optional mid-throttle boost for turbo engines
//           { at: 0–1, rateBonus: number } — simulates turbo lag
// ─────────────────────────────────────────────────────────────

const ENGINE_PROFILES = {
  "flat-six-na": {
    // Linear climb, highest ceiling — the GT3 scream
    idle:  { rate: 0.75, volume: 0.30 },
    full:  { rate: 2.00, volume: 0.85 },
    surge: null,
  },
  "flat-six-turbo": {
    // Builds slowly then surges hard past 0.55 throttle — turbo lag feel
    idle:  { rate: 0.65, volume: 0.28 },
    full:  { rate: 1.60, volume: 0.80 },
    surge: { at: 0.55, rateBonus: 0.25 },
  },
  "v10-na": {
    // Smooth operatic climb, slightly lower ceiling than flat-six-na
    idle:  { rate: 0.80, volume: 0.32 },
    full:  { rate: 1.90, volume: 0.88 },
    surge: null,
  },
  "electric-motor": {
    // Starts relatively high, rises smoothly, no lag at all
    idle:  { rate: 1.00, volume: 0.22 },
    full:  { rate: 1.50, volume: 0.60 },
    surge: null,
  },
};

// ─────────────────────────────────────────────────────────────
// useSound — general purpose hook
// ─────────────────────────────────────────────────────────────

/**
 * useSound
 * Wraps a single Howl instance with a clean React interface.
 * The Howl is created once on mount and unloaded on unmount.
 *
 * @param {string|string[]} src      — path(s) to audio file(s)
 * @param {object}          options
 * @param {number}          options.volume     — initial volume 0–1 (default 1)
 * @param {boolean}         options.loop       — loop the sound (default false)
 * @param {boolean}         options.autoplay   — play on mount (default false)
 * @param {number}          options.rate       — initial playback rate (default 1)
 * @param {function}        options.onend      — callback when sound ends
 * @param {function}        options.onload     — callback when sound loads
 *
 * @returns {{ play, pause, stop, setVolume, setRate, fade, toggleMute, soundRef }}
 *
 * Usage:
 *   const { play } = useSound("/sounds/click.mp3");
 *   <button onClick={play}>Click me</button>
 */
export function useSound(src, options = {}) {
  const {
    volume   = 1.0,
    loop     = false,
    autoplay = false,
    rate     = 1.0,
    onend,
    onload,
  } = options;

  const soundRef = useRef(null);

  useEffect(() => {
    const howl = new Howl({
      src:      Array.isArray(src) ? src : [src],
      volume,
      loop,
      autoplay,
      rate,
      onend,
      onload,
      onloaderror: (_id, err) =>
        console.warn(`[useSound] Failed to load: ${src}`, err),
    });

    soundRef.current = howl;

    return () => {
      howl.unload();
      soundRef.current = null;
    };
    // Re-create only if src changes — options are intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(src)]);

  /** Play the sound — returns Howler sound ID */
  const play = useCallback(() => soundRef.current?.play(), []);

  /** Pause without rewinding */
  const pause = useCallback(() => soundRef.current?.pause(), []);

  /** Stop and rewind to start */
  const stop = useCallback(() => soundRef.current?.stop(), []);

  /** Set volume 0–1 */
  const setVolume = useCallback(
    (val) => soundRef.current?.volume(Math.max(0, Math.min(1, val))),
    []
  );

  /**
   * Set playback rate — proxy for pitch
   * 0.5 = half speed / deep,  2.0 = double speed / high
   */
  const setRate = useCallback(
    (val) => soundRef.current?.rate(Math.max(0.5, Math.min(4.0, val))),
    []
  );

  /**
   * Fade volume from one level to another over ms milliseconds
   * @param {number} from  — start volume 0–1
   * @param {number} to    — end volume 0–1
   * @param {number} ms    — duration in milliseconds
   */
  const fade = useCallback(
    (from, to, ms = 1000) => soundRef.current?.fade(from, to, ms),
    []
  );

  /** Toggle global mute for all Howler sounds */
  const toggleMute = useCallback(() => Howler.mute(!Howler._muted), []);

  return { play, pause, stop, setVolume, setRate, fade, toggleMute, soundRef };
}

// ─────────────────────────────────────────────────────────────
// useEngineSound — specialised engine audio hook
// ─────────────────────────────────────────────────────────────

/**
 * useEngineSound
 * Takes a carData.js engineSound key, loads the correct audio file,
 * and exposes engine-specific controls. The throttle → rate/volume
 * mapping is driven by ENGINE_PROFILES so each engine type feels distinct.
 *
 * @param {string} engineSoundKey — one of the keys in ENGINE_SOUND_MAP
 *                                  e.g. car.engineSound from carData.js
 *
 * @returns {{
 *   startEngine:  () => void,
 *   stopEngine:   () => void,
 *   setThrottle:  (value: number) => void,   // 0 = idle, 1 = full throttle
 *   isRunning:    React.RefObject<boolean>,
 *   soundRef:     React.RefObject<Howl>
 * }}
 *
 * Usage — in CarDetail.jsx:
 *   const { startEngine, stopEngine, setThrottle } = useEngineSound(car.engineSound);
 *
 *   <button onClick={startEngine}>Engine Start</button>
 *   <button
 *     onMouseDown={() => setThrottle(1)}
 *     onMouseUp={() => setThrottle(0)}
 *   >
 *     Accelerate
 *   </button>
 */
export function useEngineSound(engineSoundKey) {
  const filePath = ENGINE_SOUND_MAP[engineSoundKey];
  const profile  = ENGINE_PROFILES[engineSoundKey];

  if (!filePath || !profile) {
    console.warn(`[useEngineSound] Unknown key: "${engineSoundKey}". Check carData.js and ENGINE_SOUND_MAP.`);
  }

  // Start at idle volume so fade-in on startEngine works correctly
  const { soundRef } = useSound(filePath ?? "", {
    loop:   true,
    volume: 0,          // starts silent — fade in on startEngine
    rate:   profile?.idle.rate ?? 1.0,
  });

  const isRunning     = useRef(false);
  const currentRate   = useRef(profile?.idle.rate   ?? 1.0);
  const currentVolume = useRef(profile?.idle.volume ?? 0.3);

  /**
   * startEngine
   * Plays the loop and fades volume up to idle level.
   * Safe to call multiple times — ignores if already running.
   */
  const startEngine = useCallback(() => {
    if (isRunning.current || !soundRef.current) return;

    soundRef.current.rate(profile.idle.rate);
    soundRef.current.play();
    soundRef.current.fade(0, profile.idle.volume, 900);

    currentRate.current   = profile.idle.rate;
    currentVolume.current = profile.idle.volume;
    isRunning.current     = true;
  }, [profile, soundRef]);

  /**
   * stopEngine
   * Fades volume to zero then stops the loop.
   * Safe to call multiple times.
   */
  const stopEngine = useCallback(() => {
    if (!isRunning.current || !soundRef.current) return;

    soundRef.current.fade(currentVolume.current, 0, 700);

    setTimeout(() => {
      soundRef.current?.stop();
      isRunning.current = false;
    }, 720);
  }, [soundRef]);

  /**
   * setThrottle
   * Maps a 0–1 throttle value to rate + volume based on the engine profile.
   * For turbo engines, a surge bonus is applied past the surge threshold
   * to simulate turbo lag — a sudden jump in rate mid-throttle.
   *
   * @param {number} throttle — 0 (idle) to 1 (full throttle)
   */
  const setThrottle = useCallback(
    (throttle) => {
      if (!isRunning.current || !soundRef.current) return;

      const t = Math.max(0, Math.min(1, throttle));

      // Linear interpolation between idle and full
      const lerpRate = profile.idle.rate + t * (profile.full.rate - profile.idle.rate);
      const lerpVol  = profile.idle.volume + t * (profile.full.volume - profile.idle.volume);

      // Apply turbo surge bonus if this engine has one and throttle is past the threshold
      let finalRate = lerpRate;
      if (profile.surge && t >= profile.surge.at) {
        // Scale bonus 0→full as throttle goes from surge.at → 1
        const surgeProgress = (t - profile.surge.at) / (1 - profile.surge.at);
        finalRate += profile.surge.rateBonus * surgeProgress;
      }

      // Smooth the transition — don't hard-set, tween toward target
      const smoothDuration = 120; // ms — fast enough to feel responsive
      gsapRateTween(soundRef.current, currentRate.current, finalRate, smoothDuration);

      soundRef.current.volume(lerpVol);
      currentRate.current   = finalRate;
      currentVolume.current = lerpVol;
    },
    [profile, soundRef]
  );

  return { startEngine, stopEngine, setThrottle, isRunning, soundRef };
}

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * gsapRateTween
 * Smoothly transitions a Howl's playback rate from current to target
 * using a manual requestAnimationFrame loop (no GSAP dependency needed).
 * This avoids jarring pitch jumps when the user moves the throttle quickly.
 */
function gsapRateTween(howl, fromRate, toRate, durationMs) {
  const startTime = performance.now();
  const delta     = toRate - fromRate;

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    // Ease out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    howl.rate(fromRate + delta * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export default useSound;