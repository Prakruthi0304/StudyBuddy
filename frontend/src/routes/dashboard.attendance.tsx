import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Ring } from "@/components/dashboard/shared";
import { AlertTriangle, CheckCircle2, XCircle, Clock, Plus, Trash2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { attendanceApi, timetableApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/attendance")({
  component: AttendancePage,
});

type TodaySlot = {
  timetable_id: number;
  subject: string;
  start_time: string;
  end_time: string;
  room?: string;
  marked: boolean;
  attended: boolean | null;
  attendance_id: number | null;
};

type SubjectSummary = {
  subject: string;
  percent: number;
  attended: number;
  total: number;
  safe_bunks: number;
};

type OverallStats = {
  overall_percent?: number;
  percentage?: number;
  total: number;
  attended: number;
  safe_bunks: number;
  warning?: string | null;
};

function AttendancePage() {
  const [todaySlots, setTodaySlots] = useState<TodaySlot[]>([]);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [hasTimetable, setHasTimetable] = useState(true);

  // Manual mark form
  const [showManual, setShowManual] = useState(false);
  const [manualSubject, setManualSubject] = useState("");
  const [manualAttended, setManualAttended] = useState(true);
  const [manualSaving, setManualSaving] = useState(false);

  const load = async () => {
    try {
      const [slots, summary, pct] = await Promise.all([
        attendanceApi.todaySubjects(),
        attendanceApi.summary(),
        attendanceApi.percentage(),
      ]);
      setTodaySlots(slots);
      setSubjects(summary);
      setOverall(pct);
      setHasTimetable(slots.length > 0);
    } catch {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMark = async (slot: TodaySlot, attended: boolean) => {
    setSaving(slot.timetable_id);
    try {
      if (slot.attendance_id) {
        await attendanceApi.delete(slot.attendance_id);
      }
      await attendanceApi.mark({
        subject: slot.subject,
        attended,
        timetable_id: slot.timetable_id,
      });
      toast.success(`${slot.subject} — marked ${attended ? "Present ✓" : "Absent ✗"}`);
      load();
    } catch {
      toast.error("Could not mark attendance");
    } finally {
      setSaving(null);
    }
  };

  const handleManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSubject.trim()) return;
    setManualSaving(true);
    try {
      await attendanceApi.mark({ subject: manualSubject.trim(), attended: manualAttended });
      toast.success(`Marked ${manualAttended ? "Present" : "Absent"} for ${manualSubject}`);
      setManualSubject("");
      setShowManual(false);
      load();
    } catch {
      toast.error("Could not mark attendance");
    } finally {
      setManualSaving(false);
    }
  };

  const overallPct = overall ? (overall.overall_percent ?? overall.percentage ?? 0) : 0;

  return (
    <div>
      <PageHeader
        title="Attendance Intelligence"
        subtitle="Today's classes from your timetable — mark present or absent in one tap."
        action={
          <button
            onClick={() => setShowManual((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow"
          >
            <Plus className="h-4 w-4" /> Manual mark
          </button>
        }
      />

      {/* Manual form */}
      <AnimatePresence>
        {showManual && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <GlassCard className="mb-5">
              <form onSubmit={handleManual} className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="text-xs text-muted-foreground">Subject</label>
                  <input
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    placeholder="e.g. Data Structures"
                    required
                    className="mt-1 w-full rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <div className="mt-1 flex gap-2">
                    {["Present", "Absent"].map((s) => (
                      <button
                        key={s} type="button"
                        onClick={() => setManualAttended(s === "Present")}
                        className={`rounded-xl px-3 py-2 text-sm transition-all ${
                          (s === "Present") === manualAttended
                            ? "bg-gradient-primary text-primary-foreground glow"
                            : "border border-border/40 glass"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={manualSaving}
                  className="rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
                  {manualSaving ? "Saving..." : "Save"}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i}><div className="h-40 animate-pulse rounded-xl bg-secondary/40" /></GlassCard>
          ))}
        </div>
      ) : (
        <>
          {/* ── TOP ROW: Today's classes + Overall ring ── */}
          <div className="grid gap-5 lg:grid-cols-3 mb-5">
            {/* Today's timetable quick-mark */}
            <GlassCard className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Today's Classes
                </h3>
                {!hasTimetable && (
                  <Link to="/dashboard/timetable" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Upload className="h-3 w-3" /> Upload timetable
                  </Link>
                )}
              </div>

              {!hasTimetable ? (
                <div className="rounded-2xl border-2 border-dashed border-border/50 p-8 text-center">
                  <div className="text-4xl mb-3">📅</div>
                  <div className="font-semibold">No timetable uploaded yet</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Upload your timetable to auto-populate today's classes here.
                  </div>
                  <Link to="/dashboard/timetable"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
                    <Upload className="h-4 w-4" /> Go to Timetable
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySlots.map((slot, i) => (
                    <motion.div
                      key={slot.timetable_id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`flex items-center gap-4 rounded-xl border p-3 transition-all ${
                        slot.marked
                          ? slot.attended
                            ? "border-primary/40 bg-primary/10"
                            : "border-destructive/40 bg-destructive/10"
                          : "border-border/40 glass"
                      }`}
                    >
                      <div className="min-w-[80px] text-xs text-muted-foreground">
                        {slot.start_time}<br />{slot.end_time}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{slot.subject}</div>
                        {slot.room && <div className="text-xs text-muted-foreground">{slot.room}</div>}
                      </div>

                      {slot.marked ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${slot.attended ? "text-primary" : "text-destructive"}`}>
                            {slot.attended ? "Present" : "Absent"}
                          </span>
                          <button
                            onClick={() => handleMark(slot, !slot.attended)}
                            disabled={saving === slot.timetable_id}
                            className="rounded-lg border border-border/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMark(slot, true)}
                            disabled={saving === slot.timetable_id}
                            className="flex items-center gap-1 rounded-xl bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25 transition-all"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {saving === slot.timetable_id ? "..." : "Present"}
                          </button>
                          <button
                            onClick={() => handleMark(slot, false)}
                            disabled={saving === slot.timetable_id}
                            className="flex items-center gap-1 rounded-xl bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/25 transition-all"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Absent
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Overall ring */}
            <GlassCard>
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall</div>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-4 grid place-items-center">
                <Ring percent={overallPct} size={160} label="this semester" />
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between rounded-xl border border-border/40 glass px-3 py-2">
                  <span className="text-muted-foreground">Classes attended</span>
                  <span className="font-semibold">{overall?.attended ?? 0} / {overall?.total ?? 0}</span>
                </div>
                <div className="flex justify-between rounded-xl border border-border/40 glass px-3 py-2">
                  <span className="text-muted-foreground">Safe to bunk</span>
                  <span className="font-semibold text-primary">{overall?.safe_bunks ?? 0}</span>
                </div>
                {overall?.warning && (
                  <div className="rounded-xl bg-destructive/15 px-3 py-2 text-center text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 shrink-0" /> {overall.warning}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* ── SUBJECT-WISE ── */}
          <GlassCard>
            <h3 className="font-display text-lg font-semibold mb-4">Subject-wise Breakdown</h3>
            {subjects.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-6">
                No attendance records yet. Mark your first class above.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((s, i) => {
                  const low = s.percent < 85;
                  return (
                    <motion.div
                      key={s.subject}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-border/40 p-4 glass"
                    >
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="font-semibold truncate">{s.subject}</div>
                        <div className={`font-bold text-base ${low ? "text-destructive" : "text-primary"}`}>{s.percent}%</div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.percent}%` }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.9 }}
                          className={`h-full ${low ? "bg-destructive" : "bg-gradient-primary"}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{s.attended}/{s.total} attended</span>
                        {low ? (
                          <span className="text-destructive flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Below 85%
                          </span>
                        ) : (
                          <span className="text-primary">Bunk {s.safe_bunks} safely</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
}
