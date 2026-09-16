import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {title}
        </motion.h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function GlassCard({ className = "", children, hover = true }: { className?: string; children: React.ReactNode; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -3 } : undefined}
      className={`relative overflow-hidden rounded-2xl glass-strong p-5 shadow-elegant transition-all ${className}`}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity duration-500 hover:opacity-30" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export function Ring({ percent, size = 140, label }: { percent: number; size?: number; label?: string }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setVal(percent), 50);
    return () => clearTimeout(t);
  }, [percent]);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.2 300)" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 320)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(1 0 0 / 0.1)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * val) / 100 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: "drop-shadow(0 0 12px oklch(0.72 0.2 300 / 0.7))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-3xl font-semibold">
            <Counter to={percent} />%
          </div>
          {label && <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>}
        </div>
      </div>
    </div>
  );
}

export function Counter({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const [n, setN] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    const step = (t: number) => {
      if (start.current === null) start.current = t;
      const p = Math.min(1, (t - start.current) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span className="tabular-nums">{Number.isInteger(to) ? Math.round(n) : n.toFixed(1)}</span>;
}
