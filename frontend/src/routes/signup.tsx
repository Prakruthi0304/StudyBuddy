import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

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

function getPasswordStrength(pw: string) {
  const checks = {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return { checks, passed, strong: passed >= 4 };
}

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] ${ok ? "text-primary" : "text-muted-foreground"}`}>
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {label}
    </div>
  );
}

function SignupPage() {
  const [show, setShow]         = useState(false);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const navigate = useNavigate();

  const { checks, passed, strong } = getPasswordStrength(password);
  const strengthColor = passed <= 1 ? "bg-destructive" : passed <= 3 ? "bg-amber-400" : "bg-primary";
  const strengthLabel = passed <= 1 ? "Weak" : passed <= 3 ? "Fair" : "Strong";

  const handleEmailBlur   = () => setEmailError(validateEmail(email));
  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (emailError) setEmailError(validateEmail(v));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    if (eErr) { setEmailError(eErr); return; }
    if (!strong) { toast.error("Password too weak — need uppercase, number and 8+ chars"); return; }
    setLoading(true);
    try {
      await authApi.signup(name, email, password);
      toast.success("Account Created Successfully");
      navigate({ to: "/login" });
    } catch (err: any) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.detail || "Could not create account. Try again.";
      if (status === 400 && /already|exist/i.test(msg)) {
        msg = "An account with this email already exists. Please log in instead.";
      }
      if (!err?.response) {
        msg = "Cannot reach server. Please check your connection and try again.";
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start your AI-powered semester.">
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <Label className="text-xs text-muted-foreground">Full name</Label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border/60 glass px-3 py-1 transition-all focus-within:border-primary">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Alex Kim" className="border-0 bg-transparent focus-visible:ring-0" />
          </div>
        </div>

        {/* Email with validation */}
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <div className={`mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-1 glass transition-all ${
            emailError ? "border-destructive" : "border-border/60 focus-within:border-primary"
          }`}>
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input type="text" required value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="yourname@gmail.com"
              className="border-0 bg-transparent focus-visible:ring-0" />
            {email && (emailError
              ? <XCircle className="h-4 w-4 text-destructive shrink-0" />
              : <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>
          {emailError && (
            <p className="mt-1 text-xs text-destructive flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {emailError}
            </p>
          )}
          {email && !emailError && (
            <p className="mt-1 text-xs text-primary flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Valid email address
            </p>
          )}
        </div>

        {/* Password with strength */}
        <div>
          <Label className="text-xs text-muted-foreground">Password</Label>
          <div className={`mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-1 glass transition-all ${
            pwTouched && !strong ? "border-amber-400/60" : "border-border/60 focus-within:border-primary"
          }`}>
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input type={show ? "text" : "password"} required minLength={8}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPwTouched(true); }}
              placeholder="Min 8 chars, uppercase, number"
              className="border-0 bg-transparent focus-visible:ring-0" />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {pwTouched && password.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${(passed / 5) * 100}%` }} />
                </div>
                <span className={`text-[11px] font-semibold ${passed <= 1 ? "text-destructive" : passed <= 3 ? "text-amber-400" : "text-primary"}`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <PasswordRule ok={checks.length}    label="Min 8 characters" />
                <PasswordRule ok={checks.uppercase} label="Uppercase letter"  />
                <PasswordRule ok={checks.lowercase} label="Lowercase letter"  />
                <PasswordRule ok={checks.number}    label="Number (0–9)"      />
                <PasswordRule ok={checks.special}   label="Special char (!@#)" />
              </div>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading || !!emailError}
          className="w-full bg-gradient-primary text-primary-foreground glow">
          {loading ? "Creating account..." : (<>Create account <ArrowRight className="ml-1 h-4 w-4" /></>)}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
