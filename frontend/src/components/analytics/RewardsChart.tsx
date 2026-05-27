"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";

const mockData = [
  { date: "Jan", rewards: 120, staked: 5000 },
  { date: "Feb", rewards: 280, staked: 8200 },
  { date: "Mar", rewards: 450, staked: 12000 },
  { date: "Apr", rewards: 620, staked: 15500 },
  { date: "May", rewards: 890, staked: 22000 },
  { date: "Jun", rewards: 1100, staked: 28000 },
  { date: "Jul", rewards: 1350, staked: 35000 },
  { date: "Aug", rewards: 1580, staked: 41000 },
  { date: "Sep", rewards: 1820, staked: 48000 },
  { date: "Oct", rewards: 2100, staked: 55000 },
  { date: "Nov", rewards: 2400, staked: 63000 },
  { date: "Dec", rewards: 2750, staked: 72000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-mono">
          {entry.name}: {entry.value.toLocaleString()} NXS
        </p>
      ))}
    </div>
  );
};

export function RewardsChart() {
  return (
    <GlassCard className="p-6">
      <h3 className="font-display font-bold text-lg text-white mb-6">Rewards & Staking Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={mockData}>
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="staked" name="Total Staked" stroke="#00E676" fillOpacity={1} fill="url(#emeraldGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="rewards" name="Rewards" stroke="#FFD700" fillOpacity={1} fill="url(#goldGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
