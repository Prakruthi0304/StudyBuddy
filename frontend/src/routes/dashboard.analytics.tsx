import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

const focus = [
  { d: "Mon", h: 3.4 },
  { d: "Tue", h: 4.6 },
  { d: "Wed", h: 2.8 },
  { d: "Thu", h: 5.2 },
  { d: "Fri", h: 4.1 },
  { d: "Sat", h: 1.8 },
  { d: "Sun", h: 3.0 },
];
const subj = [
  { s: "DSA", v: 92 },
  { s: "Quantum", v: 88 },
  { s: "Algebra", v: 74 },
  { s: "Philosophy", v: 81 },
  { s: "Discrete", v: 85 },
];
const split = [
  { name: "Focus", value: 42 },
  { name: "Revision", value: 26 },
  { name: "Reading", value: 18 },
  { name: "Rest", value: 14 },
];
const colors = ["#a855f7", "#60a5fa", "#f472b6", "#34d399"];

function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="A clear lens on focus, output, and growth." />

      <div className="grid gap-5 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Weekly focus hours</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={focus}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeOpacity={0.08} />
                <XAxis dataKey="d" stroke="currentColor" opacity={0.5} fontSize={12} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 285)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="h" stroke="#c084fc" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-lg font-semibold">Time split</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={split} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {split.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 285)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {split.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
                {s.name} · {s.value}%
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-5">
        <GlassCard>
          <h3 className="font-display text-lg font-semibold">Subject performance</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={subj}>
                <defs>
                  <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeOpacity={0.08} />
                <XAxis dataKey="s" stroke="currentColor" opacity={0.5} fontSize={12} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 285)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="url(#bar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
