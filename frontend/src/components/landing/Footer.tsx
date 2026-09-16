import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">StudyBuddy AI</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            A futuristic AI operating system built for students.
          </p>
        </div>
        {[
          { t: "Modules", l: ["Attendance", "Timetable", "Assignments", "Notes", "Reminders"] },
          { t: "Resources", l: ["About", "Help", "Privacy", "Terms"] },
        ].map((c) => (
          <div key={c.t}>
            <div className="text-sm font-semibold">{c.t}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.l.map((i) => (
                <li key={i}>
                  <a className="transition-colors hover:text-foreground" href="#">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-7xl px-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} StudyBuddy AI — designed for students.
      </div>
    </footer>
  );
}
