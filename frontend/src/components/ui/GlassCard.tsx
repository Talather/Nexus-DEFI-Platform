"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "emerald" | "gold" | "none";
  animate?: boolean;
  delay?: number;
}

export function GlassCard({ children, className, hover = true, glow = "emerald", animate = true, delay = 0 }: GlassCardProps) {
  const glowStyles = {
    emerald: "hover:border-nexus-emerald/30 hover:shadow-nexus-glow",
    gold: "hover:border-nexus-bold-gold/30 hover:shadow-nexus-gold-glow",
    none: "",
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay }}
      className={clsx(
        "glass-card p-6",
        hover && "transition-all duration-300 hover:-translate-y-1",
        hover && glowStyles[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
