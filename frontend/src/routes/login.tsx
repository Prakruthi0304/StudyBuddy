import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/stores/auth";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

// Strict email regex — must have valid domain with TLD
const EMAIL_REGEX = /^[a-zA-Z][a-zA-Z0-9._%+\-]*@gmail\.com$/;

function validateEmail(email: string): string {
  if (!email) return "Email is required";
  email = email.trim();

  const parts = email.split("@");
  if (parts.length < 2) return "Email must contain @";
  if (parts.length > 2) return "Email must contain only one @";

  const [local, domain] = parts;

  if (!local) return "Missing username before @";
  if (local.length < 2) return "Username before @ is too short";
  if (!/^[a-zA-Z]/.test(local)) return "Username must start with a letter";
  if (!/[a-zA-Z]/.test(local)) return "Username must contain at least one letter";
  if (/[._%+\-]$/.test(local)) return "Username cannot end with a special character";

  if (!domain) return "Missing domain after @";

  // Only gmail.com allowed
  if (domain.toLowerCase() !== "gmail.com") return "Only @gmail.com email addresses are accepted";

  if (!EMAIL_REGEX.test(email)) return "Invalid email address format";

  return "";
}

function LoginPage() {
  const [show, setShow]       = useState(false);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const setAuth   = useAuth((s) => s.setAuth);

  const handleEmailBlur = () => setEmailError(validateEmail(email));
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(validateEmail(e.target.value));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAuth({ name: data.user.name, email: data.user.email }, data.access_token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Continue your academic journey.">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <div className={`mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-1 glass transition-all ${
            emailError ? "border-destructive" : "border-border/60 focus-within:border-primary"
          }`}>
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input type="text" required value={email}
              onChange={handleEmailChange} onBlur={handleEmailBlur}
              placeholder="yourname@gmail.com"
              className="border-0 bg-transparent focus-visible:ring-0" />
            {emailError && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
          </div>
          {emailError && <p className="mt-1 text-xs text-destructive flex items-center gap-1">{emailError}</p>}
        </div>

        <Field icon={<Lock className="h-4 w-4" />} label="Password">
          <div className="flex w-full items-center">
            <Input type={show ? "text" : "password"} required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="border-0 bg-transparent focus-visible:ring-0" />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" disabled={loading || !!emailError}
          className="w-full bg-gradient-primary text-primary-foreground glow">
          {loading ? "Signing in..." : (<>Sign in <ArrowRight className="ml-1 h-4 w-4" /></>)}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen overflow-hidden bg-background text-foreground lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 bg-gradient-aurora opacity-30 blur-3xl animate-spin-slow" />
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.span key={i} className="absolute h-1 w-1 rounded-full bg-primary/60"
            style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.1 }} />
        ))}
        <div className="relative grid h-full place-items-center p-12">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <Sparkles className="h-3 w-3 text-primary" /> Your AI study companion
            </div>
            <h2 className="mt-6 font-display text-5xl font-semibold leading-tight">
              Step inside your <span className="gradient-text">academic OS.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">Attendance, assignments, notes, reminders — all in one place.</p>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }}
              className="mt-10 h-56 w-56 mx-auto rounded-full bg-gradient-aurora opacity-70 blur-2xl" />
          </div>
        </div>
      </div>
      <div className="relative grid place-items-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md rounded-3xl glass-strong p-8 shadow-elegant">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">StudyBuddy <span className="gradient-text">AI</span></span>
          </Link>
          <h1 className="mt-6 font-display text-3xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border/60 glass px-3 py-1 transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_oklch(0.72_0.2_300/0.15)]">
        <span className="text-muted-foreground">{icon}</span>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
