import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, GraduationCap, Calendar, BellRing,
  FileText, Settings, Sparkles,
  Bell, LogOut, X, AlertTriangle, Info, CheckCircle2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/stores/auth";
import { notificationsApi } from "@/lib/api";

// Analytics removed from nav as requested
const nav = [
  { to: "/dashboard",            label: "Overview",   icon: LayoutDashboard },
  { to: "/dashboard/attendance", label: "Attendance", icon: GraduationCap },
  { to: "/dashboard/timetable",  label: "Timetable",  icon: Calendar },
  { to: "/dashboard/reminders",  label: "Reminders",  icon: BellRing },
  { to: "/dashboard/notes",      label: "Notes",      icon: FileText },
  { to: "/dashboard/settings",   label: "Settings",   icon: Settings },
] as const;

type Notification = {
  id: string;
  type: "danger" | "warning" | "info";
  icon: string;
  title: string;
  message: string;
  link: string;
};

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<{ count: number; notifications: Notification[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.get()
      .then(setData)
      .catch(() => setData({ count: 0, notifications: [] }))
      .finally(() => setLoading(false));
  }, []);

  const typeStyle = {
    danger:  "border-destructive/40 bg-destructive/10",
    warning: "border-amber-400/40 bg-amber-400/10",
    info:    "border-primary/40 bg-primary/10",
  };
  const typeIcon = {
    danger:  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
    info:    <Info className="h-4 w-4 text-primary shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border/50 bg-background/95 shadow-elegant backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold text-sm">Notifications</span>
          {data && data.count > 0 && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary font-semibold">{data.count}</span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>

      <div className="max-h-96 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary/40" />)}
          </div>
        ) : !data || data.notifications.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <div className="font-semibold text-sm">All caught up!</div>
            <div className="text-xs text-muted-foreground mt-1">No alerts right now.</div>
          </div>
        ) : (
          data.notifications.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={n.link as any} onClick={onClose}
                className={`flex items-start gap-3 rounded-xl border p-3 mb-2 transition-all hover:scale-[1.01] ${typeStyle[n.type]}`}>
                <div className="mt-0.5">{typeIcon[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{n.message}</div>
                </div>
                <span className="text-lg shrink-0">{n.icon}</span>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export function DashboardLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, hydrate, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
    document.documentElement.classList.add("dark");
  }, [hydrate]);

  useEffect(() => {
    const fetch = () => notificationsApi.get().then((d) => setUnreadCount(d.unread || 0)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-gradient-aurora opacity-20 blur-3xl animate-spin-slow" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-gradient-primary opacity-10 blur-3xl" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/40 p-4 lg:block">
          <Link to="/" className="flex items-center gap-2 px-2 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold">StudyBuddy <span className="gradient-text">AI</span></span>
          </Link>
          <nav className="mt-6 space-y-1">
            {nav.map((n) => {
              const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
              return (
                <Link key={n.to} to={n.to}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active ? "bg-gradient-primary text-primary-foreground glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}>
                  <n.icon className="h-4 w-4" />
                  {n.label}
                  {active && <motion.span layoutId="active-dot" className="absolute right-3 h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </Link>
              );
            })}
          </nav>
          <button onClick={logout}
            className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl border border-border/40 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Top bar — search removed, just notification bell + user */}
          <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-xl">
            <div className="flex items-center justify-end gap-3 px-4 py-3 sm:px-8">
              {/* Notification Bell */}
              <div ref={bellRef} className="relative">
                <button onClick={() => setShowNotifs((v) => !v)}
                  className="relative grid h-9 w-9 place-items-center rounded-xl border border-border/50 glass hover:border-primary/50 transition-all">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
                </AnimatePresence>
              </div>

              {/* User badge */}
              <div className="flex items-center gap-2 rounded-xl border border-border/50 glass px-2.5 py-1.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {(user?.name || "S")[0].toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold">{user?.name || "Student"}</div>
                  <div className="text-[10px] text-muted-foreground">{user?.email || ""}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile nav */}
          <nav className="flex gap-2 overflow-x-auto border-b border-border/40 px-4 py-2 lg:hidden">
            {nav.map((n) => {
              const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
              return (
                <Link key={n.to} to={n.to}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${active ? "bg-gradient-primary text-primary-foreground" : "border border-border/40 text-muted-foreground"}`}>
                  <n.icon className="h-3.5 w-3.5" /> {n.label}
                </Link>
              );
            })}
          </nav>

          <main className="px-4 py-6 sm:px-8 sm:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
