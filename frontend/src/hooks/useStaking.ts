"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { STAKING_CONTRACT_ADDRESS, NEXUS_TOKEN_ADDRESS } from "@/lib/constants";
import { NexusStakingABI } from "@/lib/abis/NexusStaking";
import { NexusTokenABI } from "@/lib/abis/NexusToken";
import { useStakingStore } from "@/store/useStakingStore";
import { useCallback } from "react";

export function useTokenBalance() {
  const { address } = useAccount();
  return useReadContract({
    address: NEXUS_TOKEN_ADDRESS,
    abi: NexusTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });
}

export function useTokenAllowance() {
  const { address } = useAccount();
  return useReadContract({
    address: NEXUS_TOKEN_ADDRESS,
    abi: NexusTokenABI,
    functionName: "allowance",
    args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });
}

export function useTotalValueLocked() {
  return useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: NexusStakingABI,
    functionName: "totalValueLocked",
    query: { refetchInterval: 15000 },
  });
}

export function usePoolCount() {
  return useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: NexusStakingABI,
    functionName: "poolCount",
    query: { refetchInterval: 30000 },
  });
}

export function usePoolInfo(poolId: number) {
  return useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: NexusStakingABI,
    functionName: "pools",
    args: [BigInt(poolId)],
    query: { refetchInterval: 15000 },
  });
}

export function usePoolAPY(poolId: number) {
  return useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: NexusStakingABI,
    functionName: "getAPY",
    args: [BigInt(poolId)],
    query: { refetchInterval: 15000 },
  });
}

export function useUserStake(poolId: number) {
  const { address } = useAccount();
  return useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: NexusStakingABI,
    functionName: "getUserStake",
    args: address ? [BigInt(poolId), address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });
}

export function useEarned(poolId: number) {
  const { address } = useAccount();
  return useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: NexusStakingABI,
    functionName: "earned",
    args: address ? [BigInt(poolId), address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
}

export function useStakingActions() {
  const { writeContractAsync } = useWriteContract();
  const addTransaction = useStakingStore((s) => s.addTransaction);

  const approveToken = useCallback(async (amount: string) => {
    const hash = await writeContractAsync({
      address: NEXUS_TOKEN_ADDRESS,
      abi: NexusTokenABI,
      functionName: "approve",
      args: [STAKING_CONTRACT_ADDRESS, parseEther(amount)],
    });
    return hash;
  }, [writeContractAsync]);

  const stake = useCallback(async (poolId: number, amount: string) => {
    const hash = await writeContractAsync({
      address: STAKING_CONTRACT_ADDRESS,
      abi: NexusStakingABI,
      functionName: "stake",
      args: [BigInt(poolId), parseEther(amount)],
    });
    addTransaction({
      id: hash, type: "stake", amount, poolId, timestamp: Date.now(), hash,
    });
    return hash;
  }, [writeContractAsync, addTransaction]);

  const unstake = useCallback(async (poolId: number, amount: string) => {
    const hash = await writeContractAsync({
      address: STAKING_CONTRACT_ADDRESS,
      abi: NexusStakingABI,
      functionName: "unstake",
      args: [BigInt(poolId), parseEther(amount)],
    });
    addTransaction({
      id: hash, type: "unstake", amount, poolId, timestamp: Date.now(), hash,
    });
    return hash;
  }, [writeContractAsync, addTransaction]);

  const claimReward = useCallback(async (poolId: number) => {
    const hash = await writeContractAsync({
      address: STAKING_CONTRACT_ADDRESS,
      abi: NexusStakingABI,
      functionName: "claimReward",
      args: [BigInt(poolId)],
    });
    addTransaction({
      id: hash, type: "claim", amount: "0", poolId, timestamp: Date.now(), hash,
    });
    return hash;
  }, [writeContractAsync, addTransaction]);

  const compoundReward = useCallback(async (poolId: number) => {
    const hash = await writeContractAsync({
      address: STAKING_CONTRACT_ADDRESS,
      abi: NexusStakingABI,
      functionName: "compoundReward",
      args: [BigInt(poolId)],
    });
    addTransaction({
      id: hash, type: "compound", amount: "0", poolId, timestamp: Date.now(), hash,
    });
    return hash;
  }, [writeContractAsync, addTransaction]);

  return { approveToken, stake, unstake, claimReward, compoundReward };
}
