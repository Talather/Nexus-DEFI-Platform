"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

interface NexusButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "gold" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function NexusButton({ children, variant = "primary", size = "md", loading, icon, className, disabled, ...props }: NexusButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-nexus-emerald to-nexus-tropical-emerald text-nexus-dark shadow-nexus-glow hover:shadow-[0_0_30px_rgba(0,230,118,0.5)]",
    secondary: "bg-nexus-dark-card border border-nexus-dark-border text-white hover:border-nexus-emerald/50",
    gold: "bg-gradient-to-r from-nexus-bold-gold to-nexus-gold text-nexus-dark shadow-nexus-gold-glow hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    ghost: "bg-transparent border border-nexus-dark-border text-nexus-emerald hover:bg-nexus-emerald/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={clsx(
        "relative rounded-xl font-semibold overflow-hidden transition-all duration-300",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : icon}
        {children}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
    </motion.button>
  );
}
