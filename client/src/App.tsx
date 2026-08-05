import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router as WouterRouter, Route, Switch, useLocation } from "wouter";
import { parseRoute as wouterInlineParser } from "./lib/wouterInlineParser";
const CookieConsentBanner = lazy(() => import("./components/CookieConsentBanner"));
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FreonnAuthProvider } from "./contexts/FreonnAuthContext";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  loadAnalyticsScripts,
  readAnalyticsConsentFromStorage,
} from "./lib/analyticsBootstrap";
import { gaPageView } from "./lib/ga";
import { startWebVitalsReporting } from "./lib/reportWebVitals";
import { ymHit } from "./lib/ym";
import { useAnalytics } from "./hooks/useAnalytics";

import Home from "./pages/Home";
import { LANDING_PATH_PREFIXES } from "./data/landingRoutes";
const LandingPage   = lazy(() => import("./pages/LandingPage"));
const BuildingTypesHubPage = lazy(() => import("./pages/BuildingTypesHubPage"));
const BuildingTypePage = lazy(() => import("./pages/BuildingTypePage"));
const MoHubPage = lazy(() => import("./pages/MoHubPage"));
const GeoPage       = lazy(() => import("./pages/GeoPage"));
const SizePage      = lazy(() => import("./pages/SizePage"));
const BlogListPage  = lazy(() => import("./pages/BlogListPage"));
const BlogPostPage  = lazy(() => import("./pages/BlogPostPage"));
const RekvizityPage = lazy(() => import("./pages/RekvizityPage"));
const InfoArticlePage = lazy(() => import("./pages/InfoArticlePage"));
const PortfolioListPage = lazy(() => import("./pages/PortfolioListPage"));
const PortfolioDetailPage = lazy(() => import("./pages/PortfolioDetailPage"));
const NotFound      = lazy(() => import("./pages/NotFound"));
const AppCallback   = lazy(() => import("./pages/auth/AppCallback"));
const UnifiedLoginPage = lazy(() => import("./components/freonn-group/UnifiedLoginPage"));

const INFO_ROUTES = [
  "/garantii",
  "/litsenzii",
  "/o-kompanii",
  "/komanda",
  "/kontakty",
  "/vakansii",
  "/tseny",
  "/proektirovanie",
  "/montazh",
  "/dostavka",
  "/politika-konfidencialnosti",
  "/publichnaya-oferta",
] as const;

function PageLoader() {
  return <div style={{ minHeight: "100vh", background: "#fff" }} />;
}

function AnalyticsTracker({ ready }: { ready: boolean }) {
  const [location] = useLocation();
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      ymHit(window.location.href, document.title);
      gaPageView(window.location.pathname, document.title);
    }, 150);
    return () => clearTimeout(timer);
  }, [location, ready]);
  return null;
}

function GlobalAnalytics() {
  useAnalytics();
  return null;
}

function Router({ analyticsReady }: { analyticsReady: boolean }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnalyticsTracker ready={analyticsReady} />
      {analyticsReady && <GlobalAnalytics />}
      <Switch>
        <Route path="/" component={Home} />

        {LANDING_PATH_PREFIXES.map((prefix) => (
          <Route key={`${prefix}-sub`} path={`/${prefix}/:subtype`} component={LandingPage} />
        ))}
        {LANDING_PATH_PREFIXES.map((prefix) => (
          <Route key={prefix} path={`/${prefix}`} component={LandingPage} />
        ))}

        {/* SEO: хаб каталога типов зданий (до маршрута с :id) */}
        <Route path="/zdaniya" component={BuildingTypesHubPage} />
        <Route path="/zdaniya/:id" component={BuildingTypePage} />
        <Route path="/moskovskaya-oblast" component={MoHubPage} />

        {INFO_ROUTES.map((path) => (
          <Route key={path} path={path} component={InfoArticlePage} />
        ))}

        <Route path="/portfolio/:slug" component={PortfolioDetailPage} />
        <Route path="/portfolio" component={PortfolioListPage} />

        {/* Blog */}
        <Route path="/blog"        component={BlogListPage} />
        <Route path="/blog/:slug"  component={BlogPostPage} />
        <Route path="/rekvizity"   component={RekvizityPage} />
        <Route path="/auth/login" component={UnifiedLoginPage} />
        <Route path="/auth/app-callback" component={AppCallback} />

        {/* SEO Size Pages — moskva before MO Tier1 before generic */}
        <Route path="/tsekh-:sizeVal-m2-moskva" component={SizePage} />
        <Route path="/sklad-:sizeVal-m2-moskva" component={SizePage} />
        <Route path="/angar-:sizeVal-m2-moskva" component={SizePage} />
        <Route path="/tsekh-:sizeVal-m2-:moCity" component={SizePage} />
        <Route path="/sklad-:sizeVal-m2-:moCity" component={SizePage} />
        <Route path="/angar-:sizeVal-m2-:moCity" component={SizePage} />
        <Route path="/tsekh-:sizeVal-m2" component={SizePage} />
        <Route path="/sklad-:sizeVal-m2" component={SizePage} />
        <Route path="/angar-:sizeVal-m2" component={SizePage} />

        {/* SEO Geo Pages */}
        <Route path="/angary-:city" component={GeoPage} />
        <Route path="/sklady-:city" component={GeoPage} />
        <Route path="/proizvodstvennye-zdaniya-:city" component={GeoPage} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [consentUi, setConsentUi] = useState<"unknown" | "need-choice" | "closed">("unknown");
  const [analyticsReady, setAnalyticsReady] = useState(false);

  useEffect(() => {
    const stored = readAnalyticsConsentFromStorage();
    if (stored === "accepted") {
      setConsentUi("closed");
      void loadAnalyticsScripts().then(() => setAnalyticsReady(true));
      return;
    }
    if (stored === "declined") {
      setConsentUi("closed");
      return;
    }
    setConsentUi("need-choice");
  }, []);

  const handleConsentAccept = useCallback(async () => {
    try {
      localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setConsentUi("closed");
    await loadAnalyticsScripts();
    setAnalyticsReady(true);
  }, []);

  const handleConsentDecline = useCallback(() => {
    try {
      localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "declined");
    } catch {
      /* ignore */
    }
    setConsentUi("closed");
  }, []);

  useEffect(() => {
    if (consentUi !== "need-choice") {
      document.body.style.paddingBottom = "";
      return;
    }
    document.body.style.paddingBottom =
      "max(8.5rem, calc(env(safe-area-inset-bottom, 0px) + 7rem))";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [consentUi]);

  useEffect(() => {
    if (!analyticsReady) return;
    startWebVitalsReporting();
  }, [analyticsReady]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <FreonnAuthProvider>
        <TooltipProvider>
          <WouterRouter parser={wouterInlineParser}>
            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: "#0F0F18",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#F0F0F0",
                },
              }}
            />
            <Router analyticsReady={analyticsReady} />
            {consentUi === "need-choice" ? (
              <Suspense fallback={null}>
                <CookieConsentBanner onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
              </Suspense>
            ) : null}
          </WouterRouter>
        </TooltipProvider>
        </FreonnAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
