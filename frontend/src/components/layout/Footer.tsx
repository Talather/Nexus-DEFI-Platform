"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-nexus-dark-border mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-emerald to-nexus-tropical-emerald flex items-center justify-center">
                <span className="font-display font-black text-nexus-dark text-lg">N</span>
              </div>
              <span className="font-display font-bold text-xl">
                <span className="text-gradient-emerald">NEXUS</span>
                <span className="text-gradient-gold">DeFi</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              The next generation decentralized staking ecosystem. Stake, earn, govern, and build the future of DeFi together.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-4">Protocol</h4>
            <div className="space-y-2">
              {["Dashboard", "Staking", "Governance", "Treasury"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="block text-gray-400 hover:text-nexus-emerald text-sm transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-4">Resources</h4>
            <div className="space-y-2">
              {["Documentation", "GitHub", "Discord", "Twitter"].map((item) => (
                <a key={item} href="#" className="block text-gray-400 hover:text-nexus-emerald text-sm transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-nexus-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; 2026 NexusDeFi. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-xs">Built with Ethereum &amp; Next.js</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
