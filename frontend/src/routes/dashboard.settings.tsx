import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/stores/auth";
import { settingsApi } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout, setAuth } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing]         = useState(false);
  const [name, setName]               = useState(user?.name || "");
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateProfile({ name });
      setAuth({ name: updated.name, email: updated.email }, localStorage.getItem("sb_token")!);
      toast.success("Profile updated!");
      setEditing(false);
    } catch { toast.error("Could not update profile"); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") {
      toast.error('Type "DELETE" to confirm');
      return;
    }
    setDeleting(true);
    try {
      await settingsApi.deleteAccount();
      logout();
      toast.success("Account deleted. Goodbye!");
      navigate({ to: "/" });
    } catch { toast.error("Could not delete account. Try again."); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Profile */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Profile</h3>
            {!editing && <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">Edit</button>}
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {editing ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border/40 glass px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="rounded-xl bg-gradient-primary px-4 py-2 text-sm text-primary-foreground glow">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditing(false)} className="rounded-xl border border-border/40 px-4 py-2 text-sm">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <Row label="Name"  value={user?.name  || "Student"} />
                <Row label="Email" value={user?.email || "—"} />
                <Row label="Plan"  value="Student · Free" />
              </>
            )}
          </div>
        </GlassCard>

        {/* Preferences */}
        <GlassCard>
          <h3 className="font-display text-lg font-semibold">Preferences</h3>
          <div className="mt-4 space-y-4 text-sm">
            <Toggle label="Attendance warnings under 85%" defaultChecked />
            <Toggle label="AI suggestions on dashboard"  defaultChecked />
            <Toggle label="Reminder notifications"       defaultChecked />
            <Toggle label="Focus mode" />
          </div>
        </GlassCard>

        {/* Account actions */}
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Account</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => { logout(); navigate({ to: "/" }); }}
              className="rounded-xl border border-border/50 px-4 py-2 text-sm hover:bg-secondary">
              Sign out
            </button>
            <button onClick={() => setConfirmDelete(true)}
              className="rounded-xl border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
              Delete account
            </button>
          </div>

          {/* Delete confirmation */}
          {confirmDelete && (
            <div className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
              <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
                <AlertTriangle className="h-4 w-4" /> This will permanently delete all your data
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                All timetable, attendance, notes, assignments and reminders will be deleted. This cannot be undone.
              </p>
              <p className="text-xs font-semibold mb-2">Type <span className="text-destructive">DELETE</span> to confirm:</p>
              <div className="flex gap-2">
                <input
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="rounded-xl border border-destructive/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-destructive w-32"
                />
                <button onClick={handleDeleteAccount} disabled={deleting}
                  className="rounded-xl bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/80">
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button onClick={() => { setConfirmDelete(false); setDeleteInput(""); }}
                  className="rounded-xl border border-border/40 px-4 py-2 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2 glass">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2 glass">
      <span>{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </label>
  );
}
