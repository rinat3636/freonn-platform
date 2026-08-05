/*
 * METALSTROY ENTRANCE ANIMATION
 * Design: Dark Industrial Brutalism — cinematic blueprint-to-building reveal
 * Sequence: black → grid lines draw → building wireframe assembles → title → CTAs → reveal
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FreonnLogo from "./FreonnLogo";

interface EntranceAnimationProps {
  onComplete: () => void;
}

const GRID_BG = {
  backgroundImage: `
    linear-gradient(rgba(26,26,46,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26,26,46,0.05) 1px, transparent 1px)
  `,
  backgroundSize: "60px 60px",
} as const;

export default function EntranceAnimation({ onComplete }: EntranceAnimationProps) {
  const [phase, setPhase] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  // phase 0: intro (subtle grid always visible on shell)
  // phase 1: grid lines appear
  // phase 2: building wireframe assembles
  // phase 3: title reveals
  // phase 4: CTAs appear
  // phase 5: done

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /** Без движущихся линий: логотип + полоска, чтобы не было «пустого» экрана при reduce motion. */
    if (reduceMotion) {
      setPhase(3);
      const bar = window.setTimeout(() => setPhase(4), 100);
      const done = window.setTimeout(() => onCompleteRef.current(), 250);
      return () => {
        window.clearTimeout(bar);
        window.clearTimeout(done);
      };
    }
    // Максимально короткая анимация, чтобы не блокировать LCP.
    const timings = [40, 80, 130, 180, 230];
    const timers = timings.map((t, i) => window.setTimeout(() => setPhase(i + 1), t));
    const done = window.setTimeout(() => onCompleteRef.current(), 300);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: "#FFFFFF",
            ...GRID_BG,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {/* Blueprint SVG building wireframe */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <svg
                  viewBox="0 0 800 400"
                  className="w-full max-w-3xl opacity-20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Ground line */}
                  <motion.line
                    x1="50" y1="350" x2="750" y2="350"
                    stroke="#2B3A8F" strokeWidth="1.5"
                    strokeDasharray="700"
                    initial={{ strokeDashoffset: 700 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.5, delay: 0 }}
                  />
                  {/* Left column */}
                  <motion.line
                    x1="100" y1="350" x2="100" y2="80"
                    stroke="#2B3A8F" strokeWidth="1.5"
                    strokeDasharray="300"
                    initial={{ strokeDashoffset: 300 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  />
                  {/* Right column */}
                  <motion.line
                    x1="700" y1="350" x2="700" y2="80"
                    stroke="#2B3A8F" strokeWidth="1.5"
                    strokeDasharray="300"
                    initial={{ strokeDashoffset: 300 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  />
                  {/* Top beam */}
                  <motion.line
                    x1="100" y1="80" x2="700" y2="80"
                    stroke="#2B3A8F" strokeWidth="1.5"
                    strokeDasharray="600"
                    initial={{ strokeDashoffset: 600 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  />
                  {/* Mid columns */}
                  <motion.line x1="250" y1="350" x2="250" y2="80" stroke="#2B3A8F" strokeWidth="0.8" strokeDasharray="300" initial={{ strokeDashoffset: 300 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.3, delay: 0.5 }} />
                  <motion.line x1="400" y1="350" x2="400" y2="80" stroke="#2B3A8F" strokeWidth="0.8" strokeDasharray="300" initial={{ strokeDashoffset: 300 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.3, delay: 0.55 }} />
                  <motion.line x1="550" y1="350" x2="550" y2="80" stroke="#2B3A8F" strokeWidth="0.8" strokeDasharray="300" initial={{ strokeDashoffset: 300 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.3, delay: 0.6 }} />
                  {/* Mid beam */}
                  <motion.line x1="100" y1="215" x2="700" y2="215" stroke="#2B3A8F" strokeWidth="0.8" strokeDasharray="600" initial={{ strokeDashoffset: 600 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.4, delay: 0.65 }} />
                  {/* Diagonal braces */}
                  <motion.line x1="100" y1="215" x2="250" y2="80" stroke="#ED1C24" strokeWidth="0.6" strokeDasharray="200" initial={{ strokeDashoffset: 200 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.3, delay: 0.7 }} />
                  <motion.line x1="550" y1="215" x2="700" y2="80" stroke="#ED1C24" strokeWidth="0.6" strokeDasharray="200" initial={{ strokeDashoffset: 200 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.3, delay: 0.75 }} />
                  {/* Roof line */}
                  <motion.line x1="100" y1="80" x2="400" y2="30" stroke="#2B3A8F" strokeWidth="1" strokeDasharray="400" initial={{ strokeDashoffset: 400 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.4, delay: 0.8 }} />
                  <motion.line x1="700" y1="80" x2="400" y2="30" stroke="#2B3A8F" strokeWidth="1" strokeDasharray="400" initial={{ strokeDashoffset: 400 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.4, delay: 0.85 }} />
                  {/* Dimension lines */}
                  <motion.line x1="80" y1="80" x2="80" y2="350" stroke="rgba(237,28,36,0.4)" strokeWidth="0.5" strokeDasharray="5,5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} />
                  <motion.line x1="100" y1="370" x2="700" y2="370" stroke="rgba(237,28,36,0.4)" strokeWidth="0.5" strokeDasharray="5,5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} />
                  {/* Corner marks */}
                  <motion.circle cx="100" cy="80" r="3" fill="#ED1C24" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }} />
                  <motion.circle cx="700" cy="80" r="3" fill="#ED1C24" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.05 }} />
                  <motion.circle cx="400" cy="30" r="3" fill="#2B3A8F" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center content */}
          <div className="relative z-10 text-center px-6">
            {/* Title */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className="mb-6"
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: 'rgba(237,28,36,0.9)',
                    }}
                  >
                    — ПРОМЫШЛЕННЫЕ ЗДАНИЯ ПОД КЛЮЧ —
                  </div>
                  <FreonnLogo height="clamp(3rem, 8vw, 6rem)" style={{ margin: '0 auto' }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading bar */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.div
                  className="mt-8 flex flex-col items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-48 h-px bg-black/10 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-red-600"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '0.6rem',
                      letterSpacing: '0.2em',
                      color: 'rgba(26,26,46,0.35)',
                    }}
                  >
                    ЗАГРУЗКА...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
