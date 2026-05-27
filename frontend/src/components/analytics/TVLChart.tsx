"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";

const mockTVLData = [
  { date: "Week 1", tvl: 150000 },
  { date: "Week 2", tvl: 280000 },
  { date: "Week 3", tvl: 420000 },
  { date: "Week 4", tvl: 580000 },
  { date: "Week 5", tvl: 750000 },
  { date: "Week 6", tvl: 920000 },
  { date: "Week 7", tvl: 1100000 },
  { date: "Week 8", tvl: 1350000 },
  { date: "Week 9", tvl: 1580000 },
  { date: "Week 10", tvl: 1850000 },
  { date: "Week 11", tvl: 2100000 },
  { date: "Week 12", tvl: 2450000 },
];

export function TVLChart() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg text-white">Total Value Locked</h3>
        <span className="text-2xl font-display font-bold text-gradient-emerald">$2.45M</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={mockTVLData}>
          <defs>
            <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00BFA5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
          <Tooltip
            contentStyle={{ background: "#131A2B", border: "1px solid #1E293B", borderRadius: "12px" }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "TVL"]}
          />
          <Area type="monotone" dataKey="tvl" stroke="#00BFA5" fillOpacity={1} fill="url(#tvlGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
