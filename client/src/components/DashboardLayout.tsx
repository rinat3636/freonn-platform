import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FreonnLogo from "@/components/FreonnLogo";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { LogOut, Menu, User, Bell, ChevronLeft, MapPin, Building2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const nav = [
  { path: "/", label: "Объекты", icon: Building2 },
  { path: "/map", label: "Карта", icon: MapPin },
  { path: "/notifications", label: "Уведомления", icon: Bell },
];

function asideClass(mobileOpen: boolean) {
  return (
    "fixed inset-y-0 left-0 z-40 w-64 border-r bg-card shadow-sm transform transition-transform duration-300 lg:static lg:translate-x-0 " +
    (mobileOpen ? "translate-x-0" : "-translate-x-full")
  );
}

function mainClass(isMap: boolean) {
  if (isMap) return "flex-1 w-full";
  return "flex-1 w-full p-4 md:p-6 max-w-7xl mx-auto";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isMap = location === "/map";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={asideClass(mobileOpen)}>
        <div className="flex h-16 items-center px-5 border-b gap-3">
          <FreonnLogo height={34} showPro={false} />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Platform</div>
          </div>
        </div>

        <div className="p-3 space-y-1">
          {nav.map(item => {
            const active = location === item.path;
            const Icon = item.icon;
            const base = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all";
            const cls = active
              ? base + " bg-primary text-primary-foreground shadow-sm"
              : base + " text-muted-foreground hover:bg-accent hover:text-foreground";
            return (
              <Link key={item.path} href={item.path}>
                <button onClick={() => setMobileOpen(false)} className={cls}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 w-full border-t p-4 space-y-3 bg-card">
          <PWAInstallButton variant="sidebar" />
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="close"
        />
      )}

      <div className={isMap ? "flex-1 min-w-0 flex flex-col max-w-none" : "flex-1 min-w-0 flex flex-col"}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md lg:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="lg:hidden flex items-center gap-2">
              <FreonnLogo height={28} showPro={false} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="capitalize">{user?.role}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className={mainClass(isMap)}>{children}</main>
      </div>
    </div>
  );
}

export function DashboardHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  const [location] = useLocation();
  const isProject = location.startsWith("/projects/");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div className="flex items-center gap-3">
        {isProject && (
          <Button variant="outline" size="icon" asChild className="rounded-full shrink-0">
            <Link href="/">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}
