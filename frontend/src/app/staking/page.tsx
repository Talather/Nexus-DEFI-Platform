"use client";

import { motion } from "framer-motion";
import { PoolCard } from "@/components/staking/PoolCard";
import { StatCard } from "@/components/ui/StatCard";
import { STAKING_POOLS } from "@/lib/constants";
import { useTotalValueLocked } from "@/hooks/useStaking";
import { formatEther } from "viem";

export default function StakingPage() {
  const { data: tvl } = useTotalValueLocked();
  const totalLocked = tvl ? parseFloat(formatEther(tvl as bigint)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-black text-white mb-2">Staking Pools</h1>
        <p className="text-gray-400">Choose a pool, stake your tokens, and earn rewards.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          title="Total Value Locked"
          value={`${totalLocked} NXS`}
          change="24.5%"
          changeType="positive"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          delay={0}
        />
        <StatCard
          title="Active Pools"
          value="3"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          delay={0.1}
        />
        <StatCard
          title="Average APY"
          value="93.2%"
          change="5.2%"
          changeType="positive"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          delay={0.2}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STAKING_POOLS.map((pool, i) => (
          <PoolCard key={pool.id} pool={pool} delay={i * 0.15} />
        ))}
      </div>
    </div>
  );
}
