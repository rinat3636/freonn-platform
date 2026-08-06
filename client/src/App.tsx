import { useAuth } from "@/hooks/useAuth";
import { Route, Switch } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import MapPage from "@/pages/MapPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProjectPage from "@/pages/ProjectPage";
import UsersPage from "@/pages/UsersPage";
import ProfilePage from "@/pages/ProfilePage";

function AppRouter() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={DashboardPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/projects/:id" component={ProjectPage} />
      <Route
        component={() => (
          <div className="p-8 text-center">Страница не найдена</div>
        )}
      />
    </Switch>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <AppRouter />
    </DashboardLayout>
  );
}
