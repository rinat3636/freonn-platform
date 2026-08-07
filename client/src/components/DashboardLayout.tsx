import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FreonnLogo from "@/components/FreonnLogo";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import {
  LogOut,
  Menu,
  User,
  Bell,
  ChevronLeft,
  MapPin,
  Building2,
  Users,
  Target,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const baseNav = [
  { path: "/", label: "Объекты", icon: Building2 },
  { path: "/map", label: "Карта", icon: MapPin },
  { path: "/notifications", label: "Уведомления", icon: Bell },
];

function mainClass(isMap: boolean, isProject: boolean) {
  if (isMap) return "flex-1 w-full overflow-hidden";
  if (isProject) return "flex-1 w-full p-4 md:p-6 max-w-6xl mx-auto";
  return "flex-1 w-full p-4 md:p-6 pb-24 lg:pb-8 max-w-6xl mx-auto";
}

function NavItems({
  nav,
  mobile,
  onSelect,
}: {
  nav: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  mobile?: boolean;
  onSelect?: () => void;
}) {
  const [location] = useLocation();
  return (
    <>
      {nav.map(item => {
        const active = location === item.path;
        const Icon = item.icon;
        if (mobile) {
          return (
            <Link key={item.path} href={item.path}>
              <button
                onClick={onSelect}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            </Link>
          );
        }
        return (
          <Link key={item.path} href={item.path}>
            <button
              onClick={onSelect}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          </Link>
        );
      })}
    </>
  );
}

function MobileBottomNav({
  nav,
}: {
  nav: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  const [location] = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {nav.map(item => {
        const active = location === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                active ? "bg-primary/10" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isMap = location === "/map";
  const isProject = location.startsWith("/projects/");
  const [sheetOpen, setSheetOpen] = useState(false);
  const staffNav =
    user?.role === "customer"
      ? baseNav
      : [...baseNav, { path: "/leads", label: "Лиды", icon: Target }];
  const nav =
    user?.role === "director"
      ? [...staffNav, { path: "/users", label: "Команда", icon: Users }]
      : staffNav;

  return (
    <div className="app-theme flex min-h-screen bg-background">
      {/* Desktop side rail */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-card px-4 pt-4 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <FreonnLogo height={28} showPro={false} />
          <span className="text-sm font-bold tracking-tight">Platform</span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <NavItems nav={nav} />
        </div>
        <div className="border-t border-border/60 py-4">
          <PWAInstallButton variant="sidebar" />
          <div className="mt-4 flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border border-border/60">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs capitalize text-muted-foreground truncate">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className={isMap ? "flex-1 min-w-0 flex flex-col max-w-none" : "flex-1 min-w-0 flex flex-col"}>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/60 bg-card/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-r border-border/60 bg-card p-0">
                <SheetHeader className="border-b border-border/60 p-4 text-left">
                  <SheetTitle className="flex items-center gap-2 text-base font-bold">
                    <FreonnLogo height={28} showPro={false} /> Freonn Platform
                  </SheetTitle>
                </SheetHeader>
                <div className="flex h-[calc(100%-64px)] flex-col p-3">
                  <div className="flex-1 space-y-1">
                    <NavItems nav={nav} mobile onSelect={() => setSheetOpen(false)} />
                  </div>
                  <div className="border-t border-border/60 pt-3">
                    <PWAInstallButton variant="sidebar" />
                    <button
                      onClick={() => {
                        setSheetOpen(false);
                        logout();
                      }}
                      className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5" /> Выйти
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 lg:hidden">
              <FreonnLogo height={28} showPro={false} />
            </div>
          </div>
          <div className="flex items-center gap-1">
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
                  <span>{user?.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className={mainClass(isMap, isProject)}>{children}</main>
        {!isProject && <MobileBottomNav nav={nav} />}
      </div>
    </div>
  );
}

export function DashboardHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const [location] = useLocation();
  const isProject = location.startsWith("/projects/");

  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {isProject && (
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full shrink-0 h-9 w-9"
          >
            <Link href="/">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}
