import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
const EntranceAnimation = lazy(() => import("@/components/EntranceAnimation"));
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
import DeferredSection from "@/components/DeferredSection";
import FloatingButtons from "@/components/FloatingButtons";

const MoscowRegionSection = lazy(() => import("@/components/MoscowRegionSection"));
const Calculator = lazy(() => import("@/components/Calculator"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const AdvantagesSection = lazy(() => import("@/components/AdvantagesSection"));
const ProjectsSection = lazy(() => import("@/components/ProjectsSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const GroupSection = lazy(() => import("@/components/GroupSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));
import CalculatorSectionSkeleton from "@/components/CalculatorSectionSkeleton";

export default function Home() {
  // На мобильных пропускаем тяжелый входной анимационный экран — ускоряет LCP/FCP.
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
  const [animDone, setAnimDone] = useState(isMobile);

  const handleAnimComplete = useCallback(() => {
    setAnimDone(true);
  }, []);

  /** Если заставка не завершилась (редкие баги WebView / таймеры в фоне) — не держим белый экран бесконечно. */
  useEffect(() => {
    if (animDone) return;
    const t = window.setTimeout(() => setAnimDone(true), 4500);
    return () => window.clearTimeout(t);
  }, [animDone]);

  /** После заставки: прокрутка к якорю из URL или из sessionStorage (меню с внутренних страниц). */
  useEffect(() => {
    if (!animDone || typeof window === "undefined") return;
    let href: string | null = null;
    const hash = window.location.hash;
    if (hash && /^#[\w-]+$/.test(hash)) {
      href = hash;
      try {
        sessionStorage.removeItem("freonn:pendingScroll");
      } catch {
        /* ignore */
      }
    }
    if (!href) {
      try {
        href = sessionStorage.getItem("freonn:pendingScroll");
        if (href) sessionStorage.removeItem("freonn:pendingScroll");
      } catch {
        return;
      }
    }
    if (!href || !href.startsWith("#")) return;

    let attempts = 0;
    const maxAttempts = 30;
    const tick = () => {
      const el = document.querySelector(href!);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) requestAnimationFrame(() => setTimeout(tick, 100));
    };
    requestAnimationFrame(() => setTimeout(tick, 80));
  }, [animDone]);

  useEffect(() => {
    clearRoutePageJsonLd();
    let cancelled = false;
    Promise.all([
      import("@shared/seoPagePresentation"),
      import("@/lib/homePageJsonLd"),
    ]).then(([{ presentationHome, homeOgHead }, { HOME_PAGE_JSON_LD }]) => {
      if (cancelled) return;
      const head = presentationHome();
      syncStandardPageHead(head);
      const og = homeOgHead();
      const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
      if (ogTitle) ogTitle.content = og.title;
      const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
      if (ogDesc) ogDesc.content = og.description;

      const ld = document.createElement("script");
      ld.id = "ld-home-graph";
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify(HOME_PAGE_JSON_LD);
      document.head.appendChild(ld);
    });
    return () => {
      cancelled = true;
      document.getElementById("ld-home-graph")?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--ms-bg)' }}>
      {/* Интро-анимация только на десктопе; на мобильных сразу виден контент (ускоряет LCP). */}
      {!animDone && (
        <Suspense fallback={null}>
          <div className="hidden md:block">
            <EntranceAnimation onComplete={handleAnimComplete} />
          </div>
        </Suspense>
      )}
      <Header />
      <main id="main-content">
        <HeroSection />
        <Suspense fallback={null}>
          <ServicesSection />
        </Suspense>
        <DeferredSection minHeight={320}>
          <Suspense fallback={null}>
            <MoscowRegionSection />
          </Suspense>
        </DeferredSection>
        <Suspense fallback={<CalculatorSectionSkeleton />}>
          <Calculator />
        </Suspense>
        <DeferredSection minHeight={480}>
          <Suspense fallback={null}>
            <AboutSection />
            <AdvantagesSection />
            <ProjectsSection />
            <ProcessSection />
            <PricingSection />
            <FAQSection />
            <GroupSection />
            <ContactSection />
          </Suspense>
        </DeferredSection>
      </main>
      <DeferredSection minHeight={200}>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </DeferredSection>
      <FloatingButtons />
    </div>
  );
}
