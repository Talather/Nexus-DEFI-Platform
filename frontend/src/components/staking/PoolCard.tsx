"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NexusButton } from "@/components/ui/NexusButton";
import { StakeModal } from "./StakeModal";
import { useUserStake, usePoolAPY, useStakingActions, useEarned } from "@/hooks/useStaking";
import { formatEther } from "viem";
import toast from "react-hot-toast";
import { STAKING_POOLS } from "@/lib/constants";

interface PoolCardProps {
  pool: typeof STAKING_POOLS[0];
  delay?: number;
}

export function PoolCard({ pool, delay = 0 }: PoolCardProps) {
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCompounding, setIsCompounding] = useState(false);

  const { data: userStake } = useUserStake(pool.id);
  const { data: apyData } = usePoolAPY(pool.id);
  const { data: earned } = useEarned(pool.id);
  const { unstake, claimReward, compoundReward } = useStakingActions();

  const stakeData = userStake as readonly [bigint, bigint, bigint, bigint, boolean] | undefined;
  const stakedAmount = stakeData ? formatEther(stakeData[0]) : "0";
  const pendingRewards = earned ? formatEther(earned as bigint) : "0";
  const isLocked = stakeData ? stakeData[4] : false;
  const apy = apyData ? Number(apyData) / 100 : pool.baseApy;

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      await claimReward(pool.id);
      toast.success("Rewards claimed!");
    } catch (err: any) {
      toast.error(err?.shortMessage || "Claim failed");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCompound = async () => {
    try {
      setIsCompounding(true);
      await compoundReward(pool.id);
      toast.success("Rewards compounded!");
    } catch (err: any) {
      toast.error(err?.shortMessage || "Compound failed");
    } finally {
      setIsCompounding(false);
    }
  };

  const handleUnstake = async () => {
    try {
      setIsUnstaking(true);
      await unstake(pool.id, stakedAmount);
      toast.success("Unstaked successfully!");
    } catch (err: any) {
      toast.error(err?.shortMessage || "Unstake failed");
    } finally {
      setIsUnstaking(false);
    }
  };

  return (
    <>
      <GlassCard delay={delay} className="relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-nexus-emerald/5 rounded-full blur-3xl group-hover:bg-nexus-emerald/10 transition-colors" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{pool.icon}</span>
            <div>
              <h3 className="font-display font-bold text-lg text-white">{pool.name}</h3>
              <p className="text-sm text-gray-400">{pool.lockDays} Day Lock</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">APY</p>
            <p className="text-2xl font-display font-bold text-gradient-emerald">{apy}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-nexus-dark/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Your Stake</p>
            <p className="font-mono font-bold text-white">{parseFloat(stakedAmount).toLocaleString()} NXS</p>
          </div>
          <div className="bg-nexus-dark/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Pending Rewards</p>
            <p className="font-mono font-bold text-nexus-emerald">{parseFloat(pendingRewards).toFixed(4)} NXS</p>
          </div>
        </div>

        {isLocked && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-nexus-bold-gold/10 border border-nexus-bold-gold/20">
            <svg className="w-4 h-4 text-nexus-bold-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-nexus-bold-gold">Lock period active — early unstake incurs 10% penalty</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <NexusButton onClick={() => setStakeModalOpen(true)} size="sm" className="flex-1">
            Stake
          </NexusButton>
          <NexusButton onClick={handleClaim} loading={isClaiming} size="sm" variant="gold" className="flex-1">
            Claim
          </NexusButton>
          <NexusButton onClick={handleCompound} loading={isCompounding} size="sm" variant="secondary" className="flex-1">
            Compound
          </NexusButton>
          {parseFloat(stakedAmount) > 0 && (
            <NexusButton onClick={handleUnstake} loading={isUnstaking} size="sm" variant="danger" className="flex-1">
              Unstake
            </NexusButton>
          )}
        </div>
      </GlassCard>

      <StakeModal isOpen={stakeModalOpen} onClose={() => setStakeModalOpen(false)} poolId={pool.id} poolName={pool.name} />
    </>
  );
}
