import { motion } from "framer-motion";
import { Sparkles, Moon, Sun, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Modules", href: "#modules" },
    { label: "About", href: "#about" },
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className={`flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 ${scrolled ? "glass-strong shadow-elegant" : ""}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              StudyBuddy <span className="gradient-text">AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              aria-label="Toggle theme"
              onClick={() => setDark((d) => !d)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border/50 transition-colors hover:bg-secondary"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>

          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-border/50 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl glass-strong p-4 md:hidden"
          >
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <a key={l.label} href={l.href} className="text-sm text-muted-foreground">
                  {l.label}
                </a>
              ))}
              <div className="flex gap-2 pt-2">
                <Button asChild variant="ghost" size="sm" className="flex-1">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="flex-1 bg-gradient-primary text-primary-foreground">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
              <button
                onClick={() => setDark((d) => !d)}
                className="mt-1 grid h-9 w-9 place-items-center rounded-lg border border-border/50"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
