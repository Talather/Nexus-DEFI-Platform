"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { NexusButton } from "@/components/ui/NexusButton";
import { RewardsChart } from "@/components/analytics/RewardsChart";
import { TransactionHistory } from "@/components/analytics/TransactionHistory";
import { useAccount } from "wagmi";
import { useTokenBalance } from "@/hooks/useStaking";
import { formatEther } from "viem";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const portfolioData = [
  { name: "Genesis Pool", value: 5000, color: "#00E676" },
  { name: "Diamond Hands", value: 3500, color: "#FFD700" },
  { name: "Emerald Vault", value: 4000, color: "#00BFA5" },
];

const claimHistory = [
  { date: "2026-05-25", amount: "125.5 NXS", pool: "Genesis Pool", usdValue: "$62.75" },
  { date: "2026-05-20", amount: "89.3 NXS", pool: "Diamond Hands", usdValue: "$44.65" },
  { date: "2026-05-15", amount: "210.7 NXS", pool: "Emerald Vault", usdValue: "$105.35" },
  { date: "2026-05-10", amount: "156.2 NXS", pool: "Genesis Pool", usdValue: "$78.10" },
  { date: "2026-05-05", amount: "94.8 NXS", pool: "Diamond Hands", usdValue: "$47.40" },
];

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useTokenBalance();

  const tokenBalance = balance ? parseFloat(formatEther(balance as bigint)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0";
  const totalStaked = portfolioData.reduce((a, b) => a + b.value, 0);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <GlassCard className="text-center py-20">
          <h2 className="text-3xl font-display font-black text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">View your portfolio by connecting your wallet.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-black text-white mb-2">Portfolio</h1>
        <p className="text-gray-400">
          Track your assets, stakes, and rewards.
          <span className="text-nexus-emerald font-mono text-sm ml-2">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Wallet Balance" value={`${tokenBalance} NXS`} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} delay={0} />
        <StatCard title="Total Staked" value={`${totalStaked.toLocaleString()} NXS`} change="12.5%" changeType="positive" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} delay={0.1} />
        <StatCard title="Total Rewards Earned" value="676.5 NXS" change="8.3%" changeType="positive" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>} delay={0.2} />
        <StatCard title="Portfolio Value" value="$6,838" change="18.7%" changeType="positive" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-lg text-white mb-6">Staking Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={portfolioData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {portfolioData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {portfolioData.map((pool) => (
              <div key={pool.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: pool.color }} />
                  <span className="text-sm text-gray-400">{pool.name}</span>
                </div>
                <span className="text-sm font-mono text-white">{pool.value.toLocaleString()} NXS</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="lg:col-span-2">
          <RewardsChart />
        </div>
      </div>

      <GlassCard className="p-6 mb-8">
        <h3 className="font-display font-bold text-lg text-white mb-6">Claim History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-dark-border">
                <th className="text-left text-sm text-gray-400 pb-3 font-medium">Date</th>
                <th className="text-left text-sm text-gray-400 pb-3 font-medium">Pool</th>
                <th className="text-right text-sm text-gray-400 pb-3 font-medium">Amount</th>
                <th className="text-right text-sm text-gray-400 pb-3 font-medium">USD Value</th>
              </tr>
            </thead>
            <tbody>
              {claimHistory.map((claim, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-nexus-dark-border/50">
                  <td className="py-3 text-sm text-gray-400">{claim.date}</td>
                  <td className="py-3 text-sm text-white">{claim.pool}</td>
                  <td className="py-3 text-sm text-nexus-emerald text-right font-mono">{claim.amount}</td>
                  <td className="py-3 text-sm text-gray-400 text-right font-mono">{claim.usdValue}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <TransactionHistory />
    </div>
  );
}
