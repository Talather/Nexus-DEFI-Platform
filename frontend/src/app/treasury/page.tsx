"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { TVLChart } from "@/components/analytics/TVLChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const allocationData = [
  { name: "Staking Rewards", value: 40, color: "#00E676" },
  { name: "Development", value: 25, color: "#FFD700" },
  { name: "Ecosystem Grants", value: 15, color: "#00BFA5" },
  { name: "Marketing", value: 10, color: "#7C4DFF" },
  { name: "Reserve", value: 10, color: "#00E5FF" },
];

const monthlyData = [
  { month: "Jan", inflow: 250000, outflow: 120000 },
  { month: "Feb", inflow: 310000, outflow: 140000 },
  { month: "Mar", inflow: 420000, outflow: 180000 },
  { month: "Apr", inflow: 380000, outflow: 200000 },
  { month: "May", inflow: 500000, outflow: 220000 },
  { month: "Jun", inflow: 550000, outflow: 250000 },
];

const recentAllocations = [
  { purpose: "Q2 Staking Rewards Fund", amount: "500,000 NXS", date: "2026-05-15", status: "Executed" },
  { purpose: "Dev Team Vesting Release", amount: "200,000 NXS", date: "2026-05-01", status: "Executed" },
  { purpose: "Ecosystem Grant - DeFi Analytics", amount: "75,000 NXS", date: "2026-04-20", status: "Pending" },
  { purpose: "Marketing Campaign Q2", amount: "100,000 NXS", date: "2026-04-15", status: "Executed" },
];

export default function TreasuryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-black text-white mb-2">Treasury Analytics</h1>
        <p className="text-gray-400">Transparent on-chain treasury management and allocation tracking.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Treasury Balance" value="$12.5M" change="15.2%" changeType="positive" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} delay={0} />
        <StatCard title="Monthly Inflow" value="$550K" change="10.0%" changeType="positive" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} delay={0.1} />
        <StatCard title="Monthly Outflow" value="$250K" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>} delay={0.2} />
        <StatCard title="Allocations" value="42" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-lg text-white mb-6">Treasury Allocation</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                  {allocationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-gray-400">{item.name}</span>
                  <span className="text-sm font-mono text-white ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-lg text-white mb-6">Monthly Cash Flow</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "#131A2B", border: "1px solid #1E293B", borderRadius: "12px" }} />
              <Bar dataKey="inflow" name="Inflow" fill="#00E676" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" name="Outflow" fill="#FFD700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <TVLChart />

      <GlassCard className="p-6 mt-8">
        <h3 className="font-display font-bold text-lg text-white mb-6">Recent Allocations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-dark-border">
                <th className="text-left text-sm text-gray-400 pb-3 font-medium">Purpose</th>
                <th className="text-right text-sm text-gray-400 pb-3 font-medium">Amount</th>
                <th className="text-right text-sm text-gray-400 pb-3 font-medium">Date</th>
                <th className="text-right text-sm text-gray-400 pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAllocations.map((alloc, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="border-b border-nexus-dark-border/50">
                  <td className="py-4 text-sm text-white">{alloc.purpose}</td>
                  <td className="py-4 text-sm text-white text-right font-mono">{alloc.amount}</td>
                  <td className="py-4 text-sm text-gray-400 text-right">{alloc.date}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${alloc.status === "Executed" ? "text-nexus-emerald bg-nexus-emerald/10" : "text-nexus-bold-gold bg-nexus-bold-gold/10"}`}>
                      {alloc.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
