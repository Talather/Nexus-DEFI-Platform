"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { NexusButton } from "@/components/ui/NexusButton";
import { GlassCard } from "@/components/ui/GlassCard";

const NexusScene = dynamic(() => import("@/components/three/NexusScene").then(m => ({ default: m.NexusScene })), { ssr: false });
const HeroToken = dynamic(() => import("@/components/three/HeroToken").then(m => ({ default: m.HeroToken })), { ssr: false });

const stats = [
  { label: "Total Value Locked", value: "$2.45M", sub: "+24.5% this month" },
  { label: "Active Stakers", value: "1,847", sub: "+312 this week" },
  { label: "Rewards Distributed", value: "850K NXS", sub: "$425K value" },
  { label: "Average APY", value: "93.2%", sub: "Across all pools" },
];

const features = [
  { title: "Multi-Pool Staking", desc: "Choose from multiple staking pools with different lock periods and APY rates.", icon: "⚡" },
  { title: "Auto-Compound", desc: "Automatically compound your rewards to maximize yields with one click.", icon: "🔄" },
  { title: "DAO Governance", desc: "Vote on protocol decisions and shape the future of NexusDeFi.", icon: "🏛️" },
  { title: "NFT Boost", desc: "Hold Nexus NFTs to boost your staking rewards up to 3x multiplier.", icon: "🎯" },
  { title: "Real-Time Analytics", desc: "Track your portfolio performance with live charts and detailed analytics.", icon: "📊" },
  { title: "Treasury Management", desc: "Transparent treasury with on-chain allocation and distribution tracking.", icon: "🔐" },
];

export default function LandingPage() {
  return (
    <div className="relative">
      <NexusScene className="opacity-40 -z-10" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nexus-emerald/10 border border-nexus-emerald/20 text-nexus-emerald text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-nexus-emerald animate-pulse" />
              Live on Ethereum
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-tight mb-6">
              <span className="text-white">THE FUTURE</span>
              <br />
              <span className="text-white">OF </span>
              <span className="text-gradient-emerald">DeFi</span>
              <br />
              <span className="text-gradient-gold">STAKING</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-lg mb-8 leading-relaxed">
              Stake your assets in the most advanced decentralized protocol. Earn dynamic rewards,
              participate in governance, and unlock the full potential of your portfolio.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <NexusButton size="lg">
                  Launch App
                </NexusButton>
              </Link>
              <Link href="/staking">
                <NexusButton variant="ghost" size="lg">
                  Explore Pools
                </NexusButton>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}>
            <HeroToken />
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={stat.label} delay={i * 0.1} className="text-center">
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-black text-gradient-emerald mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.sub}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-display font-black text-white mb-4">
            Why <span className="text-gradient-emerald">NexusDeFi</span>?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built for serious DeFi participants who demand the best yields, security, and user experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <GlassCard key={feature.title} delay={i * 0.1} glow="emerald">
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="font-display font-bold text-lg text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <GlassCard glow="gold" className="text-center py-16 px-8">
          <h2 className="text-4xl font-display font-black mb-4">
            <span className="text-gradient-gold">Start Earning</span>
            <span className="text-white"> Today</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Connect your wallet and start staking in under 60 seconds. No minimum deposit required.
          </p>
          <Link href="/staking">
            <NexusButton variant="gold" size="lg">
              Start Staking Now
            </NexusButton>
          </Link>
        </GlassCard>
      </section>
    </div>
  );
}
