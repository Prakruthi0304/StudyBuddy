import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, CheckCircle2, CalendarDays, Flame, Trash2, Circle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { remindersApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reminders")({
  component: RemindersPage,
});

type ReminderItem = {
  id: number;
  title: string;
  due?: string;
  category?: string;
  priority: string;
  done: boolean;
};

const CATEGORIES = ["Assignment","Exam","Hackathon","Event","Workshop","Contest","Meeting","Personal","Study Session"];
const PRIORITIES = ["High","Medium","Low"];

const categoryColors: Record<string, string> = {
  Assignment: "bg-violet-400/15 text-violet-400",
  Exam:       "bg-red-400/15 text-red-400",
  Hackathon:  "bg-pink-400/15 text-pink-400",
  Event:      "bg-blue-400/15 text-blue-400",
  Workshop:   "bg-teal-400/15 text-teal-400",
  Contest:    "bg-amber-400/15 text-amber-400",
  Meeting:    "bg-indigo-400/15 text-indigo-400",
  Personal:   "bg-cyan-400/15 text-cyan-400",
  "Study Session": "bg-emerald-400/15 text-emerald-400",
};

function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "done">("all");
  const [form, setForm] = useState({ title: "", due: "", category: "Assignment", priority: "Medium" });

  const load = async () => {
    try { setReminders(await remindersApi.getAll()); }
    catch { toast.error("Failed to load reminders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await remindersApi.create(form);
      toast.success("Reminder added!");
      setForm({ title: "", due: "", category: "Assignment", priority: "Medium" });
      setShowAdd(false);
      load();
    } catch { toast.error("Could not add reminder"); }
    finally { setSaving(false); }
  };

  const handleToggleDone = async (r: ReminderItem) => {
    try {
      await remindersApi.toggleDone(r.id);
      if (!r.done) toast.success(`✅ "${r.title}" marked as done!`);
      load();
    } catch { toast.error("Could not update"); }
  };

  const handleDelete = async (id: number) => {
    try { await remindersApi.delete(id); toast.success("Deleted"); load(); }
    catch { toast.error("Could not delete"); }
  };

  const filtered = useMemo(() => {
    if (activeFilter === "pending") return reminders.filter((r) => !r.done);
    if (activeFilter === "done")    return reminders.filter((r) => r.done);
    return reminders;
  }, [reminders, activeFilter]);

  const pending = reminders.filter((r) => !r.done).length;
  const done    = reminders.filter((r) => r.done).length;

  return (
    <div>
      <PageHeader
        title="Reminders"
        subtitle="Your to-do list — tick off tasks as you complete them."
        action={
          <button onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
            <Plus className="h-4 w-4" /> Add reminder
          </button>
        }
      />

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <GlassCard className="mb-5">
              <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-xs text-muted-foreground">Title</label>
                  <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Submit assignment"
                    className="mt-1 w-full rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Due date</label>
                  <input type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
                    className="mt-1 block rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1 block rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="mt-1 block rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary">
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
                  {saving ? "Saving..." : "Add"}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats + filter tabs */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3 text-sm">
          <div className="rounded-xl border border-border/40 glass px-3 py-1.5 flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">{pending}</span>
            <span className="text-muted-foreground">pending</span>
          </div>
          <div className="rounded-xl border border-border/40 glass px-3 py-1.5 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">{done}</span>
            <span className="text-muted-foreground">done</span>
          </div>
        </div>
        <div className="flex gap-2">
          {(["all","pending","done"] as const).map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`rounded-full px-3 py-1 text-xs capitalize transition-all ${activeFilter === f ? "bg-gradient-primary text-primary-foreground glow" : "border border-border/40 glass text-muted-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder list — todo style */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary/40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
          <div className="font-semibold">
            {activeFilter === "done" ? "No completed reminders" : "All done! Nothing pending 🎉"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Add a new reminder above.</div>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((r, i) => {
              const catStyle = (r.category && categoryColors[r.category]) || "bg-secondary text-muted-foreground";
              const isOverdue = r.due && !r.done && new Date(r.due) < new Date(new Date().toDateString());
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 60, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    r.done ? "border-border/20 opacity-50" :
                    isOverdue ? "border-destructive/40 bg-destructive/5" :
                    "border-border/40 glass"
                  }`}
                >
                  {/* Checkbox */}
                  <button onClick={() => handleToggleDone(r)} className="shrink-0">
                    {r.done
                      ? <CheckCircle2 className="h-5 w-5 text-primary" />
                      : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    }
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${r.done ? "line-through text-muted-foreground" : ""}`}>
                      {r.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      {r.due && (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                          <CalendarDays className="h-3 w-3" />
                          {isOverdue ? "Overdue: " : ""}{r.due}
                        </span>
                      )}
                      {r.category && (
                        <span className={`rounded-full px-2 py-0.5 ${catStyle}`}>{r.category}</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 ${
                        r.priority === "High" ? "bg-destructive/20 text-destructive" :
                        r.priority === "Medium" ? "bg-primary/20 text-primary" :
                        "bg-secondary text-muted-foreground"
                      }`}>{r.priority}</span>
                    </div>
                  </div>

                  {/* Delete (shown on hover) */}
                  <button onClick={() => handleDelete(r.id)}
                    className="hidden group-hover:flex items-center justify-center h-7 w-7 rounded-lg border border-border/40 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
