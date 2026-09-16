import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassCard, Ring } from "@/components/dashboard/shared";
import { motion } from "framer-motion";
import {
  BookOpen, CalendarDays, Clock, Flame,
  Sparkles, AlertTriangle, ArrowRight, TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { attendanceApi, timetableApi, remindersApi } from "@/lib/api";
import { useAuth } from "@/stores/auth";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

type TodayClass = { id: number; subject: string; start_time: string; end_time: string; room?: string };
type AttPct     = { percentage?: number; overall_percent?: number; attended: number; total: number; safe_bunks: number; warning?: string | null };
type Reminder   = { id: number; title: string; due?: string; category?: string; priority: string; done: boolean };

function DashboardHome() {
  const { user }  = useAuth();
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [attPct,   setAttPct]   = useState<AttPct | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tc, pct, rem] = await Promise.all([
          timetableApi.getToday(),
          attendanceApi.percentage(),
          remindersApi.getAll(),
        ]);
        setTodayClasses(tc);
        setAttPct(pct);
        setReminders(rem);
      } catch (e) {
        console.error("Dashboard load error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const overallPct  = attPct ? (attPct.overall_percent ?? attPct.percentage ?? 0) : 0;
  const safeBunks   = attPct?.safe_bunks ?? 0;
  const attendedCnt = attPct?.attended ?? 0;
  const totalCnt    = attPct?.total ?? 0;

  // Pending = reminders not done
  const pendingRem  = reminders.filter((r) => !r.done);
  // Pending assignments = reminders with category "Assignment" not done
  const pendingAssignments = reminders.filter((r) => !r.done && r.category === "Assignment");

  const statCards = [
    {
      label: "Overall Attendance",
      value: totalCnt === 0 ? "—" : `${overallPct}%`,
      sub:   totalCnt === 0 ? "No data yet" : `${attendedCnt}/${totalCnt} classes`,
      icon:  <TrendingUp className="h-4 w-4" />,
      color: totalCnt === 0 ? "text-muted-foreground" : overallPct < 75 ? "text-destructive" : overallPct < 85 ? "text-amber-400" : "text-primary",
      href:  "/dashboard/attendance",
    },
    {
      label: "Pending Assignments",
      value: String(pendingAssignments.length),
      sub:   pendingAssignments.length === 0 ? "All caught up! 🎉" : `${pendingAssignments.length} assignment(s) pending`,
      icon:  <BookOpen className="h-4 w-4" />,
      color: pendingAssignments.length > 0 ? "text-amber-400" : "text-primary",
      href:  "/dashboard/reminders",
    },
    {
      label: "Safe Bunks Left",
      value: totalCnt === 0 ? "—" : String(safeBunks),
      sub:   totalCnt === 0 ? "Mark attendance first" : safeBunks === 0 ? "⚠ Attend next class" : `Can skip ${safeBunks} class(es)`,
      icon:  <Flame className="h-4 w-4" />,
      color: safeBunks === 0 && totalCnt > 0 ? "text-destructive" : "text-primary",
      href:  "/dashboard/attendance",
    },
    {
      label: "Open Reminders",
      value: String(pendingRem.length),
      sub:   pendingRem.length === 0 ? "Nothing pending" : pendingRem[0]?.due ? `Next: ${pendingRem[0].due}` : `${pendingRem.length} reminder(s)`,
      icon:  <CalendarDays className="h-4 w-4" />,
      color: pendingRem.length > 0 ? "text-primary" : "text-muted-foreground",
      href:  "/dashboard/reminders",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-semibold">
          {greeting}, <span className="gradient-text">{user?.name?.split(" ")[0] ?? "Student"}</span> 👋
        </motion.h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={card.href as any}>
              <GlassCard className="group cursor-pointer hover:border-primary/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                  <span className={card.color}>{card.icon}</span>
                </div>
                <div className={`mt-2 font-display text-3xl font-bold ${card.color}`}>
                  {loading ? "—" : card.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{loading ? "Loading…" : card.sub}</div>
                <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View <ArrowRight className="h-3 w-3" />
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">

        {/* Today's Classes */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Today's Classes
            </h3>
            <Link to="/dashboard/timetable" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary/40" />)}</div>
          ) : todayClasses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border/50 p-8 text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-sm text-muted-foreground">No classes today or timetable not uploaded.</div>
              <Link to="/dashboard/timetable" className="mt-3 inline-flex items-center gap-2 text-xs text-primary hover:underline">
                Upload timetable <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((cls, i) => {
                const now     = new Date();
                const [sh, sm] = cls.start_time.split(":").map(Number);
                const [eh, em] = cls.end_time.split(":").map(Number);
                const nowMin   = now.getHours() * 60 + now.getMinutes();
                const startMin = sh * 60 + (sm || 0);
                const endMin   = eh * 60 + (em || 0);
                const ongoing  = nowMin >= startMin && nowMin <= endMin;
                const done     = nowMin > endMin;
                return (
                  <motion.div key={cls.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className={`flex items-center gap-4 rounded-xl border p-3 ${
                      ongoing ? "border-primary/50 bg-primary/10" :
                      done    ? "border-border/20 opacity-60" : "border-border/40 glass"
                    }`}
                  >
                    <div className="min-w-[72px] text-xs text-muted-foreground font-mono">
                      {cls.start_time}<br />{cls.end_time}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{cls.subject}</div>
                      {cls.room && <div className="text-xs text-muted-foreground">{cls.room}</div>}
                    </div>
                    {ongoing && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] text-primary font-semibold animate-pulse">Ongoing</span>}
                    {done    && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">Done</span>}
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Attendance ring */}
          <GlassCard>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Attendance</div>
            <div className="grid place-items-center">
              <Ring percent={overallPct} size={140} label="overall" />
            </div>
            {attPct?.warning && (
              <div className="mt-3 rounded-xl bg-destructive/15 px-3 py-2 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {attPct.warning}
              </div>
            )}
            {totalCnt === 0 && (
              <div className="mt-2 text-center text-xs text-muted-foreground">Mark attendance to see stats</div>
            )}
            <Link to="/dashboard/attendance"
              className="mt-3 flex items-center justify-center gap-1 text-xs text-primary hover:underline">
              Mark today's attendance <ArrowRight className="h-3 w-3" />
            </Link>
          </GlassCard>

          {/* Pending assignment reminders */}
          {pendingAssignments.length > 0 && (
            <GlassCard>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Assignments Due
              </div>
              <div className="space-y-2">
                {pendingAssignments.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-2 rounded-xl border border-border/40 glass px-3 py-2 text-xs">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${r.priority === "High" ? "bg-destructive" : "bg-amber-400"}`} />
                    <span className="truncate flex-1">{r.title}</span>
                    {r.due && <span className="text-muted-foreground shrink-0">{r.due}</span>}
                  </div>
                ))}
              </div>
              <Link to="/dashboard/reminders"
                className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </GlassCard>
          )}

          {/* Other pending reminders */}
          {pendingRem.filter(r => r.category !== "Assignment").length > 0 && (
            <GlassCard>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Upcoming
              </div>
              <div className="space-y-2">
                {pendingRem.filter(r => r.category !== "Assignment").slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-2 rounded-xl border border-border/40 glass px-3 py-2 text-xs">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${r.priority === "High" ? "bg-destructive" : r.priority === "Medium" ? "bg-primary" : "bg-muted-foreground"}`} />
                    <span className="truncate flex-1">{r.title}</span>
                    {r.due && <span className="text-muted-foreground shrink-0">{r.due}</span>}
                  </div>
                ))}
              </div>
              <Link to="/dashboard/reminders"
                className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
