import { motion } from "framer-motion";
import { Calendar, BellRing, ClipboardList, FileText, BarChart3, GraduationCap } from "lucide-react";
import { AIOrb } from "@/components/three/AIOrb";

const cards = [
  { icon: GraduationCap, title: "Attendance", value: "87%", angle: -110, r: 280 },
  { icon: BellRing, title: "Reminders", value: "3 due", angle: -55, r: 300 },
  { icon: Calendar, title: "Timetable", value: "5 today", angle: 0, r: 320 },
  { icon: ClipboardList, title: "Assignments", value: "2 due", angle: 55, r: 300 },
  { icon: FileText, title: "Notes", value: "Smart", angle: 110, r: 280 },
  { icon: BarChart3, title: "Score", value: "9.2", angle: 165, r: 300 },
];

export function OrbStage() {
  return (
    <div className="relative mx-auto h-[640px] w-full max-w-[760px]">
      {/* Aurora backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-aurora opacity-30 blur-3xl animate-spin-slow" />
      </div>

      <div className="absolute inset-0">
        <AIOrb />
      </div>

      {/* Floating holographic cards */}
      {cards.map((c, i) => {
        const rad = (c.angle * Math.PI) / 180;
        const x = Math.cos(rad) * c.r;
        const y = Math.sin(rad) * c.r * 0.55;
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.08, rotate: [0, 2, -2, 0] }}
              className="group relative w-44 rounded-2xl glass-strong p-3 shadow-elegant"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground glow">
                  <c.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{c.title}</div>
                  <div className="text-sm font-semibold">{c.value}</div>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-primary opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40" />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
