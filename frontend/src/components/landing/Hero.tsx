import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OrbStage } from "./OrbStage";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-primary/60"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 5 + (i % 6), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}

      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3 w-3 text-primary" />
          A futuristic AI operating system for students
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mx-auto mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Plan smarter, stay consistent,{" "}
          <span className="gradient-text">achieve more.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
        >
          AI-powered student productivity ecosystem for attendance, assignments, notes,
          planning, analytics, and academic growth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Button asChild size="lg" className="group bg-gradient-primary text-primary-foreground glow hover:opacity-95">
            <Link to="/signup">
              Get Started <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="glass border-border/60">
            <Link to="/dashboard">Explore Dashboard</Link>
          </Button>
        </motion.div>
      </div>

      {/* Orb stage */}
      <div className="relative mt-10">
        <OrbStage />
      </div>
    </section>
  );
}
