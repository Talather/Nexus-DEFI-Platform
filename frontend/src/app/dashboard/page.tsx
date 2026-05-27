"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { NexusButton } from "@/components/ui/NexusButton";
import { RewardsChart } from "@/components/analytics/RewardsChart";
import { TVLChart } from "@/components/analytics/TVLChart";
import { Leaderboard } from "@/components/analytics/Leaderboard";
import { TransactionHistory } from "@/components/analytics/TransactionHistory";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { useTokenBalance, useTotalValueLocked } from "@/hooks/useStaking";
import { formatEther } from "viem";
import Link from "next/link";

const StakingReactor = dynamic(() => import("@/components/three/StakingReactor").then(m => ({ default: m.StakingReactor })), { ssr: false });

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useTokenBalance();
  const { data: tvl, isLoading: tvlLoading } = useTotalValueLocked();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <GlassCard className="text-center py-20">
          <StakingReactor className="max-w-sm mx-auto mb-8" />
          <h2 className="text-3xl font-display font-black text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your Web3 wallet to access the NexusDeFi dashboard and start staking.
          </p>
        </GlassCard>
      </div>
    );
  }

  const tokenBalance = balance ? parseFloat(formatEther(balance as bigint)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0";
  const totalLocked = tvl ? parseFloat(formatEther(tvl as bigint)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-black text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, <span className="text-nexus-emerald font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span></p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {balanceLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} variant="stat" />)
        ) : (
          <>
            <StatCard
              title="Token Balance"
              value={`${tokenBalance} NXS`}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              delay={0}
            />
            <StatCard
              title="Total Staked"
              value="12,500 NXS"
              change="8.5%"
              changeType="positive"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              delay={0.1}
            />
            <StatCard
              title="Pending Rewards"
              value="342.8 NXS"
              change="12.3%"
              changeType="positive"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>}
              delay={0.2}
            />
            <StatCard
              title="Total Value Locked"
              value={`${totalLocked} NXS`}
              change="24.5%"
              changeType="positive"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              delay={0.3}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RewardsChart />
        </div>
        <div>
          <GlassCard className="h-full flex flex-col items-center justify-center text-center p-8">
            <StakingReactor className="mb-4" />
            <h3 className="font-display font-bold text-white mb-2">Staking Reactor</h3>
            <p className="text-sm text-gray-400 mb-4">Your staking power is generating rewards</p>
            <Link href="/staking">
              <NexusButton size="sm">Manage Stakes</NexusButton>
            </Link>
          </GlassCard>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <TVLChart />
        <Leaderboard />
      </div>

      <TransactionHistory />
    </div>
  );
}
