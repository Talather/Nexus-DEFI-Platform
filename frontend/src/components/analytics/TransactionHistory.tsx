"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useStakingStore } from "@/store/useStakingStore";
import { motion } from "framer-motion";
import { format } from "date-fns";

const typeStyles: Record<string, { color: string; label: string }> = {
  stake: { color: "text-nexus-emerald bg-nexus-emerald/10", label: "Stake" },
  unstake: { color: "text-red-400 bg-red-400/10", label: "Unstake" },
  claim: { color: "text-nexus-bold-gold bg-nexus-bold-gold/10", label: "Claim" },
  compound: { color: "text-cyan-400 bg-cyan-400/10", label: "Compound" },
};

const mockTransactions = [
  { id: "1", type: "stake" as const, amount: "5,000", poolId: 0, timestamp: Date.now() - 86400000, hash: "0xabc...123" },
  { id: "2", type: "claim" as const, amount: "250", poolId: 0, timestamp: Date.now() - 172800000, hash: "0xdef...456" },
  { id: "3", type: "compound" as const, amount: "180", poolId: 1, timestamp: Date.now() - 259200000, hash: "0xghi...789" },
  { id: "4", type: "stake" as const, amount: "10,000", poolId: 1, timestamp: Date.now() - 345600000, hash: "0xjkl...012" },
  { id: "5", type: "unstake" as const, amount: "2,000", poolId: 0, timestamp: Date.now() - 432000000, hash: "0xmno...345" },
];

export function TransactionHistory() {
  const transactions = useStakingStore((s) => s.transactions);
  const displayTxs = transactions.length > 0 ? transactions : mockTransactions;

  return (
    <GlassCard className="p-6">
      <h3 className="font-display font-bold text-lg text-white mb-6">Transaction History</h3>
      <div className="space-y-2">
        {displayTxs.map((tx, i) => {
          const style = typeStyles[tx.type];
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-nexus-dark/30 hover:bg-nexus-dark/50 transition-colors"
            >
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${style.color}`}>
                {style.label}
              </span>
              <div className="flex-1">
                <p className="text-sm font-mono text-white">{tx.amount} NXS</p>
                <p className="text-xs text-gray-500">Pool {tx.poolId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{format(tx.timestamp, "MMM d, yyyy")}</p>
                <p className="text-xs text-gray-500 font-mono">{tx.hash}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
