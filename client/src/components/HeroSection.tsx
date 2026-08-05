/*
 * METALSTROY HERO SECTION — Dark Industrial Brutalism
 * Full-bleed dark hero with engineering grid, steel-chrome typography
 * Mouse parallax, animated stats, dual CTAs
 */
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Phone, ChevronDown } from "lucide-react";
import { ymGoal } from "../lib/ym";

const stats = [
  { val: "20+", label: "лет опыта" },
  { val: "500+", label: "объектов сдано" },
  { val: "65 000", label: "м² смонтировано" },
  { val: "47", label: "регионов России" },
];

function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const imgX = useTransform(springX, [-1, 1], [-15, 15]);
  const imgY = useTransform(springY, [-1, 1], [-10, 10]);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = (m: MediaQueryList | MediaQueryListEvent) => {
      if (m.matches) setLoadVideo(true);
    };
    apply(mq);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!loadVideo || !videoRef.current) return;
    videoRef.current.load();
    const p = videoRef.current.play();
    if (p) p.catch(() => { /* autoplay may be blocked */ });
  }, [loadVideo]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = (e.clientY - rect.top) / rect.height * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      aria-label="Главная секция — строительство промышленных зданий"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'transparent' }}
      onMouseMove={handleMouseMove}
    >
      {/* Engineering grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(26,26,46,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,26,46,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(237,28,36,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Background video / poster */}
      <motion.div
        className="absolute inset-0 w-full"
        style={{ x: imgX, y: imgY }}
      >
        <img
          src="/hero-poster.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 0 }}
        />
        <video
          ref={videoRef}
          autoPlay={loadVideo}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onCanPlay={() => setVideoReady(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            zIndex: 1,
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
          disableRemotePlayback
          x-webkit-airplay="deny"
        >
          {loadVideo && (
            <>
              <source src="/hero-video.webm" type="video/webm" />
              <source src="/hero-video.mp4" type="video/mp4" />
            </>
          )}
        </video>
        {/* Белый полупрозрачный оверлей — слева 40%, справа прозрачный */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.70) 30%, rgba(255,255,255,0.30) 60%, rgba(255,255,255,0.0) 100%)',
            zIndex: 2,
          }}
        />
      </motion.div>

      {/* Vertical section label */}
      <div
        className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 items-center gap-3"
        style={{ transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'center' }}
      >
        <div className="w-8 h-px" style={{ background: 'var(--ms-orange)' }} />
        <span className="ms-label" style={{ whiteSpace: 'nowrap' }}>
          ПРОМЫШЛЕННЫЕ ЗДАНИЯ
        </span>
        <div className="w-8 h-px" style={{ background: 'var(--ms-orange)' }} />
      </div>

      {/* Main content */}
      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-3xl w-full">
          {/* Label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-px" style={{ background: 'var(--ms-orange)' }} />
            <span className="ms-label">Промышленные здания · с 2011 года</span>
          </div>

          {/* Main heading */}
          <h1
            className="ms-display mb-6"
            style={{
              fontSize: 'clamp(1.6rem, 8.5vw, 7.5rem)',
              color: '#1A1A2E',
              lineHeight: 1.0,
            }}
          >
            <span className="block">ПРОМЫШЛЕННЫЕ</span>
            <span className="block ms-steel-text">
              ЗДАНИЯ
            </span>
            <span className="block" style={{ color: 'rgba(26,26,46,0.85)' }}>
              ПОД КЛЮЧ
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="mb-8 max-w-xl"
            style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'rgba(15,15,30,0.85)',
              fontWeight: 500,
            }}
          >
Строительство ангаров, складов и производственных зданий в Москве, Московской области и по всей России. Собственное проектное бюро, монтажные бригады. Более 500 объектов с 2011 года. Фиксированная цена в договоре. Гарантия 5 лет.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-12">
            <button
              onClick={() => scrollTo("#calculator")}
              className="ms-btn-primary"
            >
              Рассчитать стоимость
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollTo("#contact")}
              className="ms-btn-ghost"
            >
              Получить КП
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{ background: 'rgba(237,28,36,0.15)', border: '1px solid rgba(237,28,36,0.3)', borderRadius: '0.6rem' }}
            >
              <Phone size={14} style={{ color: 'var(--ms-orange)' }} />
            </div>
            <div>
              <a
                href="tel:+78001012009"
                onClick={() => ymGoal('phone_click', { source: 'hero' })}
                style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#1A1A2E',
                  letterSpacing: '0.03em',
                }}
              >
                8(800)101-2009
              </a>
              <div
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  color: 'rgba(26,26,46,0.45)',
                  textTransform: 'uppercase',
                }}
              >
                Бесплатно · Пн–Сб 9:00–19:00
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8"
            style={{ borderTop: '1px solid rgba(26,26,46,0.1)' }}
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="group">
                <div
                  className="ms-display mb-1"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                    color: i % 2 === 0 ? '#1A1A2E' : 'var(--ms-orange)',
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(26,26,46,0.4)',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        onClick={() => scrollTo("#about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ color: 'rgba(26,26,46,0.3)' }}
      >
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          ПРОКРУТИТЬ
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      {/* Corner coordinates */}
      <div
        className="absolute bottom-6 right-6 hidden lg:block"
        style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '0.55rem',
          letterSpacing: '0.15em',
          color: 'rgba(26,26,46,0.2)',
          textTransform: 'uppercase',
        }}
      >
        55°45'N · 37°37'E · МОСКВА
      </div>
    </section>
  );
}
