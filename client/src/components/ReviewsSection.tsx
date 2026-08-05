/*
 * METALSTROY REVIEWS SECTION — Dark Industrial Brutalism
 * Auto-scrolling carousel with pause on hover
 */
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { FREONN_REVIEW_SEEDS } from "../../../shared/reviewsJsonLd";

const reviews = FREONN_REVIEW_SEEDS.map((r, i) => ({ id: i + 1, ...r }));

export default function ReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const speed = 0.4; // px per ms

  useEffect(() => {
    const animate = (time: number) => {
      if (!isPaused) {
        const delta = lastTimeRef.current ? time - lastTimeRef.current : 0;
        setOffset((prev) => {
          const trackWidth = trackRef.current?.scrollWidth ?? 0;
          const half = trackWidth / 2;
          return (prev + delta * speed) % half;
        });
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPaused]);

  const doubled = [...reviews, ...reviews];

  return (
    <section id="reviews" aria-label="Отзывы клиентов" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: 'var(--ms-dark)' }}>
      {/* Grid bg */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />

      {/* Section number */}
      <div className="absolute top-8 right-8 ms-section-num hidden lg:block">07</div>

      <div className="container relative z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-px" style={{ background: 'var(--ms-orange)' }} />
            <span className="ms-label">Отзывы</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2
              className="ms-heading"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F0F0F0', maxWidth: '500px' }}
            >
              Что говорят наши клиенты
            </h2>
            <div className="flex items-center gap-3">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={18} fill="var(--ms-orange)" style={{ color: 'var(--ms-orange)' }} />
              ))}
              <span
                style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#F0F0F0',
                }}
              >
                5.0 · {FREONN_REVIEW_SEEDS.length} отзывов на сайте
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Carousel */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--ms-dark), transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--ms-dark), transparent)' }}
        />

        <div
          ref={trackRef}
          className="flex gap-4 px-6"
          style={{ transform: `translateX(-${offset}px)`, willChange: 'transform' }}
        >
          {doubled.map((review, i) => (
            <div
              key={`${review.id}-${i}`}
              className="flex-shrink-0 w-80 p-6"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '1.25rem',
              }}
            >
              {/* Quote icon */}
              <Quote size={20} className="mb-4" style={{ color: 'rgba(237,28,36,0.3)' }} />

              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, si) => (
                  <Star key={si} size={12} fill="var(--ms-orange)" style={{ color: 'var(--ms-orange)' }} />
                ))}
              </div>

              {/* Text */}
              <p
                className="mb-5"
                style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.85rem',
                  lineHeight: 1.7,
                  color: 'rgba(240,240,240,0.55)',
                  fontWeight: 300,
                }}
              >
                {review.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(237,28,36,0.1)',
                    border: '1px solid rgba(237,28,36,0.2)',
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--ms-orange)',
                  }}
                >
                  {review.name[0]}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#F0F0F0',
                    }}
                  >
                    {review.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '0.58rem',
                      letterSpacing: '0.06em',
                      color: 'rgba(240,240,240,0.3)',
                    }}
                  >
                    {review.company} · {review.region}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
