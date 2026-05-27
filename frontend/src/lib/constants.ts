export const NEXUS_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}` || "0x0000000000000000000000000000000000000000";
export const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}` || "0x0000000000000000000000000000000000000000";
export const TREASURY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_CONTRACT as `0x${string}` || "0x0000000000000000000000000000000000000000";
export const GOVERNANCE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT as `0x${string}` || "0x0000000000000000000000000000000000000000";

export const SUPPORTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;

export const STAKING_POOLS = [
  { id: 0, name: "NXS Genesis Pool", lockDays: 30, baseApy: 45, token: "NXS", icon: "🟢" },
  { id: 1, name: "NXS Diamond Hands", lockDays: 90, baseApy: 85, token: "NXS", icon: "💎" },
  { id: 2, name: "NXS Emerald Vault", lockDays: 180, baseApy: 150, token: "NXS", icon: "🏆" },
];

export const NAV_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: "grid" },
  { name: "Staking", href: "/staking", icon: "layers" },
  { name: "Governance", href: "/governance", icon: "vote" },
  { name: "Treasury", href: "/treasury", icon: "vault" },
  { name: "Portfolio", href: "/portfolio", icon: "chart" },
];
