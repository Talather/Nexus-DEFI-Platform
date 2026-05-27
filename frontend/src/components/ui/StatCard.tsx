"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  delay?: number;
}

export function StatCard({ title, value, change, changeType = "neutral", icon, delay = 0 }: StatCardProps) {
  const changeColors = {
    positive: "text-nexus-emerald",
    negative: "text-red-400",
    neutral: "text-gray-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-nexus-emerald/10 text-nexus-emerald group-hover:bg-nexus-emerald/20 transition-colors">
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-mono ${changeColors[changeType]}`}>
            {changeType === "positive" ? "+" : ""}{change}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold font-display text-white">{value}</p>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-nexus-emerald/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
