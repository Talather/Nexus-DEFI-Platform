"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { NexusButton } from "@/components/ui/NexusButton";
import { useStakingActions, useTokenBalance, useTokenAllowance } from "@/hooks/useStaking";
import { formatEther, parseEther } from "viem";
import toast from "react-hot-toast";

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolId: number;
  poolName: string;
}

export function StakeModal({ isOpen, onClose, poolId, poolName }: StakeModalProps) {
  const [amount, setAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);

  const { data: balance } = useTokenBalance();
  const { data: allowance } = useTokenAllowance();
  const { approveToken, stake } = useStakingActions();

  const formattedBalance = balance ? formatEther(balance) : "0";
  const needsApproval = allowance !== undefined && amount ? parseEther(amount) > allowance : true;

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveToken(amount || "999999999");
      toast.success("Approval successful!");
    } catch (err: any) {
      toast.error(err?.shortMessage || "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    try {
      setIsStaking(true);
      await stake(poolId, amount);
      toast.success(`Staked ${amount} NXS successfully!`);
      setAmount("");
      onClose();
    } catch (err: any) {
      toast.error(err?.shortMessage || "Staking failed");
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Stake in ${poolName}`}>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Amount to Stake</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-nexus-dark border border-nexus-dark-border rounded-xl px-4 py-3 text-white text-lg font-mono focus:border-nexus-emerald/50 focus:outline-none focus:ring-1 focus:ring-nexus-emerald/30 transition-all"
            />
            <button
              onClick={() => setAmount(formattedBalance)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-nexus-emerald hover:text-nexus-bold-gold transition-colors font-medium"
            >
              MAX
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Balance: <span className="text-nexus-emerald font-mono">{parseFloat(formattedBalance).toLocaleString()} NXS</span>
          </p>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Pool</span>
            <span className="text-white">{poolName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-mono">{amount || "0"} NXS</span>
          </div>
        </div>

        <div className="flex gap-3">
          {needsApproval ? (
            <NexusButton onClick={handleApprove} loading={isApproving} variant="gold" className="flex-1">
              Approve NXS
            </NexusButton>
          ) : null}
          <NexusButton
            onClick={handleStake}
            loading={isStaking}
            disabled={needsApproval || !amount}
            className="flex-1"
          >
            Stake NXS
          </NexusButton>
        </div>
      </div>
    </Modal>
  );
}
