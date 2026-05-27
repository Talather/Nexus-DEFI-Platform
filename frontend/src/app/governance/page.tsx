"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NexusButton } from "@/components/ui/NexusButton";
import { StatCard } from "@/components/ui/StatCard";
import { useState } from "react";

const mockProposals = [
  { id: 1, title: "Increase Genesis Pool rewards by 15%", status: "Active", forVotes: "245,000", againstVotes: "32,000", abstainVotes: "18,000", endTime: "3 days", proposer: "0x742d...44e" },
  { id: 2, title: "Add ETH/NXS liquidity pool staking", status: "Active", forVotes: "180,000", againstVotes: "45,000", abstainVotes: "22,000", endTime: "5 days", proposer: "0x8f3a...b2c" },
  { id: 3, title: "Reduce early unstake penalty to 5%", status: "Passed", forVotes: "320,000", againstVotes: "28,000", abstainVotes: "12,000", endTime: "Ended", proposer: "0x1a2b...c3d" },
  { id: 4, title: "Allocate 2M NXS to ecosystem grants", status: "Failed", forVotes: "95,000", againstVotes: "210,000", abstainVotes: "55,000", endTime: "Ended", proposer: "0x5e6f...789" },
];

const statusStyles: Record<string, string> = {
  Active: "text-nexus-emerald bg-nexus-emerald/10 border-nexus-emerald/20",
  Passed: "text-nexus-bold-gold bg-nexus-bold-gold/10 border-nexus-bold-gold/20",
  Failed: "text-red-400 bg-red-400/10 border-red-400/20",
  Executed: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
};

export default function GovernancePage() {
  const [selectedVote, setSelectedVote] = useState<Record<number, number>>({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-black text-white mb-2">Governance</h1>
        <p className="text-gray-400">Participate in protocol decisions. Your NXS balance is your voting power.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          title="Your Voting Power"
          value="25,000 NXS"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          delay={0}
        />
        <StatCard
          title="Active Proposals"
          value="2"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          delay={0.1}
        />
        <StatCard
          title="Total Proposals"
          value="4"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          delay={0.2}
        />
      </div>

      <div className="space-y-6">
        {mockProposals.map((proposal, i) => (
          <GlassCard key={proposal.id} delay={i * 0.1}>
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[proposal.status]}`}>
                    {proposal.status}
                  </span>
                  <span className="text-xs text-gray-500">Proposal #{proposal.id}</span>
                  <span className="text-xs text-gray-500">by {proposal.proposer}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{proposal.title}</h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-nexus-emerald">For: {proposal.forVotes} NXS</span>
                      <span className="text-red-400">Against: {proposal.againstVotes} NXS</span>
                    </div>
                    <div className="w-full h-2 bg-nexus-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-nexus-emerald to-nexus-tropical-emerald rounded-full"
                        style={{ width: `${(parseFloat(proposal.forVotes.replace(/,/g, "")) / (parseFloat(proposal.forVotes.replace(/,/g, "")) + parseFloat(proposal.againstVotes.replace(/,/g, "")))) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Abstain: {proposal.abstainVotes} NXS</p>
                  </div>
                </div>
              </div>

              {proposal.status === "Active" && (
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <p className="text-xs text-gray-400 mb-1">Cast your vote:</p>
                  <div className="flex gap-2">
                    <NexusButton size="sm" variant={selectedVote[proposal.id] === 1 ? "primary" : "ghost"} onClick={() => setSelectedVote(s => ({ ...s, [proposal.id]: 1 }))} className="flex-1">
                      For
                    </NexusButton>
                    <NexusButton size="sm" variant={selectedVote[proposal.id] === 0 ? "danger" : "ghost"} onClick={() => setSelectedVote(s => ({ ...s, [proposal.id]: 0 }))} className="flex-1">
                      Against
                    </NexusButton>
                  </div>
                  <NexusButton size="sm" variant="gold" disabled={selectedVote[proposal.id] === undefined}>
                    Submit Vote
                  </NexusButton>
                  <p className="text-xs text-gray-500 text-center">Ends in {proposal.endTime}</p>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
