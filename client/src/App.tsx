import { Suspense, lazy, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Route, Switch, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import { PwaSplash } from "@/components/PwaSplash";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MapPage = lazy(() => import("@/pages/MapPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ProjectPage = lazy(() => import("@/pages/ProjectPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const LeadsPage = lazy(() => import("@/pages/LeadsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-muted-foreground">Загрузка…</div>
    </div>
  );
}

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/" component={DashboardPage} />
        <Route path="/map" component={MapPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/leads" component={LeadsPage} />
        <Route path="/users" component={UsersPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/projects/:id" component={ProjectPage} />
        <Route
          component={() => (
            <div className="p-8 text-center">Страница не найдена</div>
          )}
        />
      </Switch>
    </Suspense>
  );
}

export default function App({ onReady }: { onReady?: () => void }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  const publicPaths = ["/login", "/forgot-password", "/reset-password"];
  const isPublic = publicPaths.some(
    path => location === path || location.startsWith(`${path}?`)
  );

  useEffect(() => {
    if (!isLoading) {
      onReady?.();
    }
  }, [isLoading, onReady]);

  useEffect(() => {
    if (isAuthenticated && isPublic) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isPublic, navigate]);

  if (isLoading) {
    return <PwaSplash />;
  }

  if (isAuthenticated && isPublic) {
    return <PwaSplash />;
  }

  if (!isAuthenticated && !isPublic) {
    return <LoginPage />;
  }

  if (!isAuthenticated) {
    return <AppRouter />;
  }

  return (
    <DashboardLayout>
      <AppRouter />
      <PWAInstallPrompt />
    </DashboardLayout>
  );
}
