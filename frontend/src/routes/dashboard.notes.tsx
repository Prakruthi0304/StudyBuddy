import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Plus, Trash2, Upload, Loader2, ChevronDown, ChevronUp, FileType, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { notesApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/notes")({
  component: NotesPage,
});

type Note = { id: number; title: string; content?: string; subject?: string; created_at?: string; file_name?: string; file_type?: string };

const ALLOWED_EXTENSIONS = ["pdf", "ppt", "pptx"];
const MAX_FILE_SIZE_MB = 20;

function validateFile(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `❌ Invalid file format ".${ext}" — only PDF, PPT, or PPTX files are supported`;
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return `❌ File too large (${sizeMB.toFixed(1)} MB) — maximum size is ${MAX_FILE_SIZE_MB} MB`;
  }
  return "";
}

function NotesPage() {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm]         = useState({ title: "", content: "", subject: "" });
  const [uploadSubject, setUploadSubject] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setNotes(await notesApi.getAll()); }
    catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await notesApi.create(form);
      toast.success("Note saved!");
      setForm({ title: "", content: "", subject: "" });
      setShowForm(false);
      load();
    } catch { toast.error("Could not save note"); }
    finally { setSaving(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate before upload
    const err = validateFile(file);
    if (err) {
      setUploadError(err);
      toast.error(err);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploadError("");
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    toast.info("Uploading & analysing with AI… this may take 15–30 seconds ☕");
    try {
      await notesApi.upload(file, uploadSubject);
      toast.success("AI summary generated! ✨");
      setUploadSubject("");
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Upload failed — please try again";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Drag-and-drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setUploadError(err); toast.error(err); return; }
    setUploadError("");
    handleUpload(file);
  };

  const handleDelete = async (id: number) => {
    try { await notesApi.delete(id); toast.success("Deleted"); load(); }
    catch { toast.error("Could not delete"); }
  };

  const fileIcon = (type?: string) => {
    if (type === "pdf")  return "📄";
    if (type === "ppt" || type === "pptx") return "📊";
    return "📝";
  };

  return (
    <div>
      <PageHeader
        title="AI Notes"
        subtitle="Upload a PDF or PowerPoint — AI summarises, extracts key concepts & crafts exam questions."
        action={
          <button onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
            <Plus className="h-4 w-4" /> New note
          </button>
        }
      />

      {/* Manual note form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <GlassCard className="mb-5">
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Title</label>
                    <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Note title"
                      className="mt-1 w-full rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Subject</label>
                    <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="e.g. DSA"
                      className="mt-1 w-full rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Content</label>
                  <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Write your notes here..." rows={4}
                    className="mt-1 w-full rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                </div>
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
                  {saving ? "Saving..." : "Save note"}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload zone */}
      <GlassCard className="mb-5">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            uploadError ? "border-destructive/60 bg-destructive/5" : "border-border/60 hover:border-primary/50"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="font-display text-lg font-semibold">AI is analysing your document…</div>
              <div className="text-sm text-muted-foreground">Extracting text · Generating summary · Creating exam questions</div>
            </>
          ) : (
            <>
              <div className={`grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground glow ${uploadError ? "bg-destructive" : "bg-gradient-primary"}`}>
                {uploadError ? <AlertCircle className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
              </div>

              {uploadError ? (
                <div className="space-y-2">
                  <div className="font-semibold text-destructive">{uploadError}</div>
                  <div className="text-sm text-muted-foreground">Please choose a valid file and try again.</div>
                  <button onClick={() => setUploadError("")}
                    className="text-xs text-primary hover:underline">Dismiss</button>
                </div>
              ) : (
                <div>
                  <div className="font-display text-lg font-semibold">Drop a PDF or PowerPoint here</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    AI will summarise, extract key terms, and craft exam questions in seconds.
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 justify-center">
                <input value={uploadSubject} onChange={(e) => setUploadSubject(e.target.value)}
                  placeholder="Subject (optional)"
                  className="rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary w-44" />
                <input ref={fileRef} type="file" accept=".pdf,.ppt,.pptx" className="hidden" onChange={handleFileSelect} />
                <button onClick={() => { setUploadError(""); fileRef.current?.click(); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm text-primary-foreground glow">
                  <FileType className="h-4 w-4" /> Choose file
                </button>
              </div>

              {/* Accepted formats */}
              <div className="flex gap-2 text-xs">
                <span className="rounded-full border border-border/40 px-2 py-0.5 text-muted-foreground">📄 PDF</span>
                <span className="rounded-full border border-border/40 px-2 py-0.5 text-muted-foreground">📊 PPT</span>
                <span className="rounded-full border border-border/40 px-2 py-0.5 text-muted-foreground">📊 PPTX</span>
                <span className="rounded-full border border-destructive/40 px-2 py-0.5 text-destructive">✗ DOCX</span>
                <span className="rounded-full border border-destructive/40 px-2 py-0.5 text-destructive">✗ TXT</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Max file size: 20 MB</p>
            </>
          )}
        </div>
      </GlassCard>

      {/* Notes grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <GlassCard key={i}><div className="h-40 animate-pulse rounded-xl bg-secondary/40" /></GlassCard>)}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <div className="text-5xl mb-4">📚</div>
          <div className="font-semibold">No notes yet</div>
          <div className="text-sm mt-1">Upload a PDF/PPT or create a note manually above.</div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard className="group relative flex flex-col">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-primary">
                    {fileIcon(n.file_type)} {n.subject || "General"}
                  </span>
                  <span className="text-muted-foreground">{n.created_at || "Today"}</span>
                </div>
                <h3 className="mt-3 font-display text-base font-semibold leading-snug">{n.title}</h3>
                {n.file_name && <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{n.file_name}</div>}
                <div className="mt-2 flex-1">
                  {expanded === n.id ? (
                    <div className="text-xs text-muted-foreground whitespace-pre-wrap max-h-80 overflow-y-auto rounded-xl border border-border/30 p-3 glass">
                      {n.content || "No content"}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground line-clamp-3">{n.content || "No content"}</p>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <button onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-2.5 py-1 text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    {expanded === n.id ? "Collapse" : "View AI Summary"}
                    {expanded === n.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  <button onClick={() => handleDelete(n.id)}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border/50 px-2.5 py-1 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
