import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { motion } from "framer-motion";
import { Upload, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { timetableApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/timetable")({
  component: TimetablePage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const ALLOWED_TIMETABLE_EXT = ["xlsx", "xls", "csv"];

type Entry = { id: number; subject: string; day: string; start_time: string; end_time: string; room?: string };

function validateTimetableFile(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_TIMETABLE_EXT.includes(ext)) {
    return `❌ Invalid format ".${ext}" — only Excel (.xlsx, .xls) or CSV files are accepted`;
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > 5) {
    return `❌ File too large (${sizeMB.toFixed(1)} MB) — max 5 MB for timetable files`;
  }
  return "";
}

function TimetablePage() {
  const [entries, setEntries]   = useState<Entry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ subject: "", day: "Mon", start_time: "09:00", end_time: "10:00", room: "" });

  const load = async () => {
    try { setEntries(await timetableApi.getAll()); }
    catch { toast.error("Failed to load timetable"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const slots = [...new Set(entries.map((e) => e.start_time))].sort();
  const grid: Record<string, Record<string, Entry | null>> = {};
  slots.forEach((s) => {
    grid[s] = {};
    DAYS.forEach((d) => {
      grid[s][d] = entries.find((e) => e.start_time === s && (e.day === d || e.day.startsWith(d))) ?? null;
    });
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await timetableApi.add(form);
      toast.success("Class added!");
      setShowAdd(false);
      setForm({ subject: "", day: "Mon", start_time: "09:00", end_time: "10:00", room: "" });
      load();
    } catch { toast.error("Could not add class"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await timetableApi.delete(id); toast.success("Removed"); load(); }
    catch { toast.error("Could not remove"); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation first
    const validationErr = validateTimetableFile(file);
    if (validationErr) {
      setUploadStatus({ type: "error", msg: validationErr });
      toast.error(validationErr);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    try {
      await timetableApi.upload(file);
      setUploadStatus({ type: "success", msg: "✅ Timetable uploaded successfully!" });
      toast.success("Timetable uploaded!");
      load();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.detail || "Upload failed — check the file format";
      // Parse common server errors into human-readable messages
      let friendlyMsg = serverMsg;
      if (serverMsg.includes("Missing columns")) {
        friendlyMsg = `❌ Wrong columns in file. Required: subject, day, start_time, end_time. Got: ${serverMsg}`;
      } else if (serverMsg.includes("parse")) {
        friendlyMsg = "❌ Could not read file — make sure it's a valid Excel or CSV file";
      }
      setUploadStatus({ type: "error", msg: friendlyMsg });
      toast.error(friendlyMsg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle="Your week at a glance. Upload an Excel/CSV or add classes manually."
        action={
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
            <button onClick={() => { setUploadStatus(null); fileRef.current?.click(); }} disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl border border-border/40 glass px-4 py-2 text-sm hover:bg-gradient-primary/10 disabled:opacity-50">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Excel/CSV"}
            </button>
            <button onClick={() => setShowAdd((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
              <Plus className="h-4 w-4" /> Add class
            </button>
          </div>
        }
      />

      {/* Upload status banner */}
      {uploadStatus && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            uploadStatus.type === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-primary/40 bg-primary/10 text-primary"
          }`}>
          {uploadStatus.type === "error"
            ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            : <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          }
          <div className="flex-1">{uploadStatus.msg}</div>
          <button onClick={() => setUploadStatus(null)} className="text-xs underline shrink-0">Dismiss</button>
        </motion.div>
      )}

      {/* Format guide */}
      <div className="mb-4 rounded-xl border border-border/40 glass px-4 py-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Upload format:</span> Excel (.xlsx/.xls) or CSV with columns:
        <span className="mx-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">subject</span>
        <span className="mx-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">day</span>
        <span className="mx-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">start_time</span>
        <span className="mx-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">end_time</span>
        <span className="mx-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">room</span>
        <span className="ml-1">(room optional). Day format: Mon/Tue/Wed/Thu/Fri</span>
      </div>

      {/* Add form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="mb-5">
            <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
              {[
                { label: "Subject", key: "subject", placeholder: "e.g. Data Structures" },
                { label: "Room",    key: "room",    placeholder: "e.g. Block A · 204"   },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="flex-1 min-w-[140px]">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <input value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} required={key === "subject"}
                    className="mt-1 w-full rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              ))}
              <div>
                <label className="text-xs text-muted-foreground">Day</label>
                <select value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                  className="mt-1 block rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              {["start_time","end_time"].map((k) => (
                <div key={k}>
                  <label className="text-xs text-muted-foreground">{k === "start_time" ? "Start" : "End"}</label>
                  <input type="time" value={(form as any)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                    className="mt-1 block rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              ))}
              <button type="submit" disabled={saving}
                className="rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
                {saving ? "Saving..." : "Add"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard>
        {loading ? (
          <div className="h-40 animate-pulse rounded-xl bg-secondary/40" />
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <div className="text-4xl mb-3">📅</div>
            <div className="font-semibold">No classes yet</div>
            <div className="text-sm mt-1">Add a class above or upload an Excel/CSV file.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 text-xs">
                <div />
                {DAYS.map((d) => (
                  <div key={d} className="rounded-lg border border-border/40 px-3 py-2 text-center uppercase tracking-widest text-muted-foreground">{d}</div>
                ))}
                {slots.map((s, si) => (
                  <GridRow key={s} slot={s} cells={DAYS.map((d) => grid[s][d])} delay={si * 0.05} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function GridRow({ slot, cells, delay, onDelete }: { slot: string; cells: (Entry | null)[]; delay: number; onDelete: (id: number) => void }) {
  return (
    <>
      <div className="grid place-items-center text-muted-foreground text-xs">{slot}</div>
      {cells.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + i * 0.04 }}
          whileHover={c ? { y: -3 } : undefined}
          className={`group relative min-h-[64px] rounded-xl border p-3 text-sm transition-all ${
            c ? "bg-gradient-primary/15 glass-strong border-primary/30" : "border-dashed border-border/40 text-muted-foreground"
          }`}>
          {c ? (
            <>
              <div className="font-semibold text-xs">{c.subject}</div>
              {c.room && <div className="text-[11px] text-muted-foreground">{c.room}</div>}
              <div className="text-[10px] text-muted-foreground">{c.start_time}–{c.end_time}</div>
              <button onClick={() => onDelete(c.id)}
                className="absolute right-2 top-2 hidden group-hover:block text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          ) : "—"}
        </motion.div>
      ))}
    </>
  );
}
