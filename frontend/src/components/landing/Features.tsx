import { motion } from "framer-motion";
import {
  CalendarDays,
  GraduationCap,
  BellRing,
  ListChecks,
  FileText,
  LineChart,
} from "lucide-react";

const features = [
  { icon: CalendarDays, title: "Smart Timetable", desc: "Upload your timetable and let AI track every class with live countdowns." },
  { icon: GraduationCap, title: "Attendance Intelligence", desc: "Subject-wise analytics with a safe-bunk calculator and trend alerts." },
  { icon: BellRing, title: "Smart Reminders", desc: "Never miss a deadline with categorized, priority-based reminders." },
  { icon: ListChecks, title: "Assignment Tracker", desc: "Kanban-style tasks with deadlines, priorities, and AI suggestions." },
  { icon: FileText, title: "Notes Generator", desc: "Drop a PDF — get summaries, flashcards, and instant quiz prep." },
  { icon: LineChart, title: "Productivity Analytics", desc: "Focus score, study streaks, and weekly progress beautifully visualized." },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="inline-flex rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            Everything you need
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Built for the way <span className="gradient-text">students actually study</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six powerful modules, one cohesive workspace. Designed to feel calm, fast, and intelligent.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl glass-strong p-6 shadow-elegant transition-all"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30" />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
