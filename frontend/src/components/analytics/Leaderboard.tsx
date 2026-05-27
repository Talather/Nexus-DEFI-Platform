"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

const mockLeaderboard = [
  { rank: 1, address: "0x742d...44e", staked: "125,000", rewards: "12,500", badge: "Diamond" },
  { rank: 2, address: "0x8f3a...b2c", staked: "98,500", rewards: "9,850", badge: "Gold" },
  { rank: 3, address: "0x1a2b...c3d", staked: "87,200", rewards: "8,720", badge: "Gold" },
  { rank: 4, address: "0x5e6f...789", staked: "65,000", rewards: "6,500", badge: "Silver" },
  { rank: 5, address: "0x9abc...def", staked: "52,300", rewards: "5,230", badge: "Silver" },
];

const badgeColors: Record<string, string> = {
  Diamond: "text-cyan-400 bg-cyan-400/10",
  Gold: "text-nexus-bold-gold bg-nexus-bold-gold/10",
  Silver: "text-gray-300 bg-gray-300/10",
};

export function Leaderboard() {
  return (
    <GlassCard className="p-6">
      <h3 className="font-display font-bold text-lg text-white mb-6">Top Stakers</h3>
      <div className="space-y-3">
        {mockLeaderboard.map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-xl bg-nexus-dark/30 hover:bg-nexus-dark/50 transition-colors"
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
              entry.rank === 1 ? "bg-nexus-bold-gold/20 text-nexus-bold-gold" :
              entry.rank === 2 ? "bg-gray-400/20 text-gray-300" :
              entry.rank === 3 ? "bg-amber-600/20 text-amber-500" :
              "bg-nexus-dark-border text-gray-500"
            }`}>
              {entry.rank}
            </span>
            <div className="flex-1">
              <p className="text-sm font-mono text-white">{entry.address}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-white">{entry.staked} NXS</p>
              <p className="text-xs text-nexus-emerald">{entry.rewards} earned</p>
            </div>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColors[entry.badge]}`}>
              {entry.badge}
            </span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
