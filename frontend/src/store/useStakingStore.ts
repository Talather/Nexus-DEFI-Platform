import { create } from "zustand";

interface StakingPool {
  id: number;
  name: string;
  totalStaked: string;
  rewardRate: string;
  lockDuration: number;
  apy: number;
  active: boolean;
}

interface UserStakeInfo {
  poolId: number;
  amount: string;
  pendingRewards: string;
  stakeTimestamp: number;
  lockEndsAt: number;
  isLocked: boolean;
}

interface Transaction {
  id: string;
  type: "stake" | "unstake" | "claim" | "compound";
  amount: string;
  poolId: number;
  timestamp: number;
  hash: string;
}

interface StakingState {
  pools: StakingPool[];
  userStakes: UserStakeInfo[];
  transactions: Transaction[];
  totalValueLocked: string;
  userTotalStaked: string;
  userTotalRewards: string;
  isLoading: boolean;
  setPools: (pools: StakingPool[]) => void;
  setUserStakes: (stakes: UserStakeInfo[]) => void;
  addTransaction: (tx: Transaction) => void;
  setTotalValueLocked: (tvl: string) => void;
  setUserTotalStaked: (amount: string) => void;
  setUserTotalRewards: (amount: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useStakingStore = create<StakingState>((set) => ({
  pools: [],
  userStakes: [],
  transactions: [],
  totalValueLocked: "0",
  userTotalStaked: "0",
  userTotalRewards: "0",
  isLoading: false,
  setPools: (pools) => set({ pools }),
  setUserStakes: (userStakes) => set({ userStakes }),
  addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions].slice(0, 50) })),
  setTotalValueLocked: (totalValueLocked) => set({ totalValueLocked }),
  setUserTotalStaked: (userTotalStaked) => set({ userTotalStaked }),
  setUserTotalRewards: (userTotalRewards) => set({ userTotalRewards }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
