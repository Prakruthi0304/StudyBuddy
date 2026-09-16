import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

const stats = [
  { value: 120000, suffix: "+", label: "Active students" },
  { value: 98, suffix: "%", label: "Retention rate" },
  { value: 2.4, suffix: "M", label: "Tasks completed" },
  { value: 4.9, suffix: "/5", label: "Average rating" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => (to % 1 === 0 ? Math.round(v).toLocaleString() : v.toFixed(1)));

  useEffect(() => {
    if (inView) animate(mv, to, { duration: 1.8, ease: [0.22, 1, 0.36, 1] });
  }, [inView, mv, to]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-3xl glass-strong p-8 shadow-elegant sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-semibold sm:text-4xl">
                <span className="gradient-text">
                  <Counter to={s.value} suffix={s.suffix} />
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
