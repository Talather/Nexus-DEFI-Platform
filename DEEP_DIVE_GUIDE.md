# NexusDeFi — Deep Dive Technical Guide

This guide explains every part of the codebase: what each file does, why every package is used, how all components coordinate, and how to set up and run everything from scratch.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Package & Dependency Guide](#2-package--dependency-guide)
3. [Smart Contracts Deep Dive](#3-smart-contracts-deep-dive)
4. [Frontend Deep Dive](#4-frontend-deep-dive)
5. [Three.js 3D Scenes](#5-threejs-3d-scenes)
6. [Web3 Integration](#6-web3-integration)
7. [State Management](#7-state-management)
8. [The Graph Subgraph](#8-the-graph-subgraph)
9. [How Everything Coordinates](#9-how-everything-coordinates)
10. [Complete Setup & Run Guide](#10-complete-setup--run-guide)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Architecture Overview

NexusDeFi follows a standard Web3 fullstack architecture:

```
User Browser
    │
    ├── Next.js Frontend (UI, 3D scenes, wallet connection)
    │     │
    │     ├── wagmi + viem ──────► Ethereum Blockchain
    │     │                         ├── NexusToken.sol
    │     │                         ├── NexusStaking.sol
    │     │                         ├── NexusTreasury.sol
    │     │                         ├── NexusGovernance.sol
    │     │                         └── NexusVesting.sol
    │     │
    │     └── graphql-request ──► The Graph (Subgraph)
    │                               └── Indexes blockchain events
    │
    └── RainbowKit ──► WalletConnect / MetaMask
```

**Data flows:**
1. **Write path**: User clicks "Stake" → wagmi sends transaction → Solidity contract executes → Event emitted → Subgraph indexes
2. **Read path**: Frontend calls contract view functions via wagmi → Data displayed in UI
3. **Analytics path**: Subgraph indexes events → Frontend queries GraphQL → Recharts renders data

---

## 2. Package & Dependency Guide

### Smart Contract Packages (`contracts/`)

| Package | Why We Use It |
|---------|--------------|
| **hardhat** | Development environment for compiling, testing, and deploying Solidity contracts. Provides local blockchain node, task runner, and plugin system. |
| **@nomicfoundation/hardhat-toolbox** | All-in-one Hardhat plugin bundle: ethers.js integration, Chai matchers, gas reporting, coverage, Etherscan verification. |
| **@openzeppelin/contracts** | Battle-tested, audited smart contract libraries. We use ERC20, AccessControl, Pausable, ReentrancyGuard. Saves months of security auditing. |
| **dotenv** | Loads environment variables from `.env` file. Used for private keys, API keys, and RPC URLs that must never be committed to git. |
| **typescript** | Type safety for deployment scripts and tests. Catches errors at compile time. |
| **typechain** | Auto-generates TypeScript types from Solidity ABIs. Gives full autocomplete and type checking when interacting with contracts in tests. |

### Frontend Packages (`frontend/`)

| Package | Why We Use It |
|---------|--------------|
| **next** (v15) | React meta-framework with App Router, server components, file-based routing, and built-in optimizations (image, font, bundling). |
| **react** / **react-dom** (v19) | UI library. React 19 brings improved server components and hooks. |
| **typescript** | Type safety across the entire frontend. Essential for large codebases. |
| **tailwindcss** | Utility-first CSS framework. Enables rapid UI development with consistent design tokens. The config defines our emerald/gold color palette. |
| **postcss** / **autoprefixer** | CSS processing pipeline. PostCSS runs Tailwind; Autoprefixer adds vendor prefixes for cross-browser support. |
| **framer-motion** | Animation library for React. Powers page transitions, card animations, hover effects, and layout animations. More declarative than CSS animations. |
| **three** | 3D rendering library (WebGL). Creates the floating particles, blockchain network, and holographic token. |
| **@react-three/fiber** | React renderer for Three.js. Lets us write Three.js scenes as JSX components with React's lifecycle and state management. |
| **@react-three/drei** | Helper components for R3F: `Float`, `MeshDistortMaterial`, `Sphere`, `Text`, etc. Saves writing boilerplate Three.js code. |
| **@react-three/postprocessing** | Post-processing effects (bloom, chromatic aberration). Adds the "glow" effect to 3D scenes. |
| **wagmi** (v2) | React hooks for Ethereum. Provides `useReadContract`, `useWriteContract`, `useAccount`, etc. Handles wallet connection state, transaction lifecycle, and caching. |
| **viem** | Low-level Ethereum library (alternative to ethers.js). Used by wagmi internally. We use its `parseEther`, `formatEther` utilities. |
| **@rainbow-me/rainbowkit** (v2) | Pre-built wallet connection modal. Supports MetaMask, WalletConnect, Coinbase, and 100+ wallets with beautiful UI. |
| **@tanstack/react-query** | Data fetching/caching library. wagmi uses it internally for contract read caching, refetching, and optimistic updates. |
| **zustand** | Lightweight state management. Simpler than Redux — single function creates a store with actions. Used for staking state, transaction history. |
| **recharts** | Chart library built on D3 + React. Renders Area, Bar, Pie charts for analytics dashboards. Composable and responsive. |
| **clsx** | Utility for conditionally joining CSS class names. Cleaner than template literals for dynamic Tailwind classes. |
| **date-fns** | Date formatting library. Used for formatting timestamps in transaction history. Tree-shakeable (only imports what you use). |
| **react-hot-toast** | Toast notification library. Shows success/error messages for transactions. |
| **react-icons** | Icon library with thousands of icons from multiple packs. |
| **graphql** / **graphql-request** | GraphQL client for querying The Graph subgraph. Lightweight alternative to Apollo Client. |

### Subgraph Packages (`subgraph/`)

| Package | Why We Use It |
|---------|--------------|
| **@graphprotocol/graph-cli** | CLI tool for The Graph. Generates types, builds WASM, deploys subgraphs. |
| **@graphprotocol/graph-ts** | AssemblyScript library for writing subgraph mappings. Provides BigInt, Bytes, entity helpers. |

---

## 3. Smart Contracts Deep Dive

### NexusToken.sol — The ERC-20 Token

**Purpose**: The platform's native token. Used for staking, rewards, governance voting, and treasury operations.

**Key design decisions:**
- **MAX_SUPPLY (1 billion)**: Hard cap prevents inflation abuse. The `mint` function checks this.
- **AccessControl over Ownable**: Multiple roles (MINTER, PAUSER) instead of single owner. Staking contract gets MINTER_ROLE to emit rewards.
- **Pausable**: Emergency stop mechanism. If a vulnerability is found, admin can pause all transfers instantly.
- **ERC20Permit**: Enables gasless approvals via EIP-2612 signatures. Users sign a message instead of sending an approve transaction, saving gas.

**How `_update` works**: This is OpenZeppelin v5's transfer hook. Every transfer (including mint/burn) goes through `_update`. We add `whenNotPaused` modifier here, so pausing blocks ALL token movement.

### NexusStaking.sol — The Staking Engine

**Purpose**: Manages multiple staking pools. Users deposit tokens, earn time-based rewards, and can compound or claim.

**Reward calculation (the core algorithm):**
```
rewardPerToken = storedRewardPerToken + (timeDelta * rewardRate * 1e18 / totalStaked)
earned = userStake * (rewardPerToken - userPaidRewardPerToken) / 1e18 + pendingRewards
```
This is the **"reward per token stored" pattern** (used by Synthetix). Instead of iterating all users on every block, we track a global accumulator. When any user stakes/unstakes/claims, we snapshot their personal reward debt.

**Why `1e18` scaling?** Solidity has no floating point. We multiply by 10^18 to maintain precision. Without this, small stakers would lose rewards to rounding.

**Pool struct fields explained:**
- `rewardRate`: Tokens distributed per second across all stakers. Higher rate = higher APY.
- `lockDuration`: Seconds before unstaking is penalty-free. Creates commitment.
- `earlyUnstakePenalty`: Basis points (1000 = 10%). Penalty stays in contract as treasury revenue.
- `maxStake`: Prevents whale dominance. 0 means unlimited.
- `rewardPerTokenStored`: The global accumulator — updated on every state-changing call.

**NFT Boost**: External NFT contract can call `setNFTBoost` to give users a multiplier (e.g., 15000 = 1.5x rewards). The `earned()` function applies this multiplier.

**Security measures:**
- `ReentrancyGuard`: Prevents reentrancy attacks on stake/unstake/claim (the classic DeFi exploit vector).
- `Pausable`: Emergency stop for all user operations.
- `SafeERC20`: Handles tokens that don't return bool on transfer (like USDT). Prevents silent failures.
- `AccessControl`: Only POOL_MANAGER can create/update pools.

### NexusTreasury.sol — Treasury Management

**Purpose**: Holds protocol funds and distributes them through a transparent allocation system.

**Design**: Uses an allocation queue pattern. A TREASURER creates an allocation (purpose, recipient, amount), then later executes it. This creates an audit trail on-chain.

### NexusGovernance.sol — DAO Voting

**Purpose**: On-chain governance for protocol decisions.

**Voting mechanism:**
- Token balance = voting power (1 NXS = 1 vote)
- Three options: For (1), Against (0), Abstain (2)
- Quorum: Minimum total votes needed (100K NXS default)
- Execution delay: 1 day after voting ends (timelock for safety)

**Why `hasVoted` mapping?** Prevents double-voting. Once you vote, your weight is locked based on your balance at vote time.

### NexusVesting.sol — Token Vesting

**Purpose**: Time-locks tokens for team members, investors, advisors.

**Linear vesting formula:**
```
If time < cliff: vested = 0
If time >= totalDuration: vested = totalAmount
Otherwise: vested = totalAmount * elapsed / totalDuration
```

**Revocable vs non-revocable**: Revocable schedules let the admin claw back unvested tokens (e.g., if an employee leaves). Non-revocable is used for investors.

---

## 4. Frontend Deep Dive

### App Router (Next.js 15)

**`src/app/layout.tsx`** — Root layout wrapping every page:
- Imports global CSS (Tailwind + custom styles)
- Wraps children in `<Providers>` (wagmi, RainbowKit, React Query)
- Renders `<Navbar>` (fixed top) and `<Footer>`
- Adds `<Toaster>` for notifications
- The `grid-lines` div creates the subtle background grid pattern

**`src/app/providers.tsx`** — Client component that sets up Web3:
- `WagmiProvider`: Makes wagmi hooks available everywhere
- `QueryClientProvider`: React Query for data caching
- `RainbowKitProvider`: Wallet connection modal with our emerald theme

**`src/app/page.tsx`** — Landing page:
- Hero section with 3D token (loaded with `dynamic()` to avoid SSR issues with Three.js)
- Protocol stats grid
- Features section
- CTA section

**`src/app/dashboard/page.tsx`** — Main dashboard:
- Checks wallet connection first
- Shows stat cards (balance, staked, rewards, TVL)
- Rewards chart + StakingReactor 3D
- TVL chart + Leaderboard
- Transaction history

### Component Architecture

**GlassCard** — The building block. Every card uses glassmorphism:
- Semi-transparent background with blur
- Gradient border (top glow line via `::before`)
- Framer Motion entrance animation
- Optional hover glow (emerald or gold)

**NexusButton** — Five variants:
- `primary`: Emerald gradient (main actions)
- `secondary`: Dark with border (secondary actions)
- `gold`: Gold gradient (premium actions like claim)
- `danger`: Red (destructive actions like unstake)
- `ghost`: Transparent with border (tertiary actions)
- All have shimmer hover effect and loading spinner

**StatCard** — Displays a single metric:
- Icon, title, value, optional change indicator
- Color-coded change (green/red/neutral)
- Hover lift effect with bottom glow line

**PoolCard** — Staking pool interface:
- Shows pool name, lock period, APY
- Displays user's stake amount and pending rewards
- Lock indicator when in lock period
- Action buttons: Stake (opens modal), Claim, Compound, Unstake

**StakeModal** — Two-step staking flow:
1. If allowance < amount: Show "Approve" button first
2. After approval: "Stake" button becomes active
3. Uses `useStakingActions()` hook for transactions
4. Toast notifications for success/error

### CSS Architecture

**`globals.css`** defines three layers:

1. **`@layer base`**: Root CSS variables, body styles, scrollbar customization
2. **`@layer components`**: Reusable classes:
   - `.glass-card`: The glassmorphism card style
   - `.nexus-button`: Primary button with shimmer
   - `.stat-card`: Metric card
   - `.shimmer-bg`: Animated shimmer background
   - `.grid-lines`: Background grid pattern
3. **`@layer utilities`**: Text gradient utilities

**`tailwind.config.ts`** extends the default theme:
- Custom color palette (nexus-emerald, nexus-gold, nexus-dark variants)
- Font families (Orbitron for display, Inter for body, JetBrains Mono for code)
- Custom gradients and box shadows
- Animation keyframes (pulse-glow, float, shimmer)

---

## 5. Three.js 3D Scenes

### How React Three Fiber Works

R3F creates a Three.js `WebGLRenderer` inside a `<Canvas>` component. Every JSX element inside Canvas maps to a Three.js object:
- `<mesh>` → `THREE.Mesh`
- `<boxGeometry>` → `THREE.BoxGeometry`
- `<meshStandardMaterial>` → `THREE.MeshStandardMaterial`
- `<pointLight>` → `THREE.PointLight`

The `useFrame` hook runs every animation frame (~60fps). This is where we update positions, rotations, and scales.

### NexusScene (Background)

**File**: `components/three/NexusScene.tsx`

The full-screen background scene containing:
- `AmbientEnvironment`: Lighting + rotating glow rings
- `FloatingParticles`: 200 instanced spheres drifting in space
- `BlockchainNetwork`: Cube nodes connected by lines

**Performance tip**: Uses `<Canvas dpr={[1, 1.5]}>` to cap pixel ratio, preventing GPU overload on Retina displays.

### FloatingParticles

**File**: `components/three/FloatingParticles.tsx`

Uses `THREE.InstancedMesh` — renders 200 spheres in a SINGLE draw call. Without instancing, 200 separate meshes would kill performance.

Each particle has:
- Random starting position (spread across 40x40x40 units)
- Unique speed and phase offset (creates organic movement)
- Sinusoidal position updates in `useFrame`
- Scale pulsing for a breathing effect

### HeroToken

**File**: `components/three/HeroToken.tsx`

The rotating 3D token on the landing page:
- **Gold torus** (ring): Represents the token shape. `metalness: 1, roughness: 0.1` makes it look like polished gold.
- **Emerald sphere**: Uses `MeshDistortMaterial` from Drei — distorts the mesh vertices in real-time, creating an organic, glowing core.
- **Orbital rings**: Thin tori at different angles, creating a "planetary" effect.
- **OrbitalParticles**: 30 small spheres orbiting the token in circular paths.
- **Float**: Drei component that adds gentle bobbing motion.

### StakingReactor

**File**: `components/three/StakingReactor.tsx`

The "reactor core" visualization on the dashboard:
- **Icosahedron core**: 20-faced shape with distort material — looks like an energy ball.
- **Three orbital rings**: Different sizes, colors, and rotation speeds.
- **EnergyStreams**: 40 particles in dynamic orbits around the core.
- Represents the "staking engine" processing rewards.

### BlockchainNetwork

**File**: `components/three/BlockchainNetwork.tsx`

Simulates a blockchain node network:
- 12 cube nodes at predefined positions
- Nodes float with sinusoidal movement
- Lines connect nodes within distance threshold (< 8 units)
- Line opacity pulses to simulate data transmission

---

## 6. Web3 Integration

### Configuration (`lib/web3-config.ts`)

`getDefaultConfig` from RainbowKit creates the wagmi config:
- Defines supported chains (Hardhat local, Sepolia testnet, Mainnet)
- Sets up transport for each chain (HTTP RPC endpoints)
- `ssr: true` enables server-side rendering compatibility

### Contract ABIs (`lib/abis/`)

ABIs (Application Binary Interface) define the contract's public interface. They tell wagmi/viem:
- Function names, parameter types, return types
- Event signatures for filtering logs
- Whether functions are `view` (free) or state-changing (costs gas)

We define them as `const ... as const` — this enables TypeScript to infer exact types for wagmi hooks.

### Custom Hooks (`hooks/useStaking.ts`)

**Read hooks** (free, no gas):
- `useTokenBalance()`: Reads user's NXS balance
- `useTokenAllowance()`: Checks how much the staking contract can spend
- `useTotalValueLocked()`: Total tokens in staking contract
- `usePoolAPY()`: Current APY for a pool
- `useUserStake()`: User's stake details (amount, lock status, pending rewards)

All use `refetchInterval` to auto-refresh data (every 5-15 seconds).

**Write hooks** (costs gas):
- `approveToken()`: ERC-20 approval for staking contract
- `stake()`: Deposit tokens into a pool
- `unstake()`: Withdraw tokens from a pool
- `claimReward()`: Withdraw earned rewards
- `compoundReward()`: Re-stake earned rewards

Each write function uses `writeContractAsync` and adds a record to the transaction store.

### Transaction Flow (Staking Example)

1. User enters amount in StakeModal
2. If allowance < amount → user clicks "Approve" → `approveToken()` called
3. MetaMask pops up → user confirms → transaction sent → wait for confirmation
4. "Approve" button disappears, "Stake" activates
5. User clicks "Stake" → `stake()` called → MetaMask confirms → transaction sent
6. On success: toast notification, modal closes, transaction added to history
7. wagmi auto-refetches balance, stake amounts, pending rewards

---

## 7. State Management

### Zustand Store (`store/useStakingStore.ts`)

Zustand creates a single store with:

```typescript
const useStore = create((set) => ({
  // State
  pools: [],
  userStakes: [],
  transactions: [],
  totalValueLocked: "0",
  
  // Actions
  setPools: (pools) => set({ pools }),
  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions].slice(0, 50)
  })),
}));
```

**Why Zustand over Context/Redux?**
- No Provider wrapper needed (less boilerplate)
- Built-in selectors (only re-renders when selected state changes)
- Simpler API (just a function, no reducers/actions/dispatch)
- Works outside React (can call from wagmi callbacks)

**Why not just wagmi for everything?**
- wagmi handles on-chain data perfectly
- But we also need client-side state: transaction history, UI state, loading states
- Zustand bridges the gap — stores transaction hashes from writes, UI preferences, etc.

---

## 8. The Graph Subgraph

### Why The Graph?

Blockchain nodes are optimized for writing, not reading. Querying "all stakes by user X across all pools sorted by date" would require scanning every block — impossibly slow.

The Graph indexes blockchain events into a queryable database, giving us:
- Fast GraphQL queries
- Aggregated statistics (total users, daily volumes)
- Historical time-series data (for charts)

### Schema Design (`schema.graphql`)

**Entities:**
- `Pool`: Mirrors on-chain pool data + derived stake list
- `User`: Aggregated user stats (total staked, rewards claimed)
- `Stake/Unstake/RewardClaim/RewardCompound`: Individual event records
- `ProtocolStat`: Global protocol metrics (singleton entity)
- `DailySnapshot`: Daily aggregated data for time-series charts

**`@derivedFrom`**: Creates reverse lookups. `User.stakes` is derived from `Stake.user` — The Graph automatically populates it.

### Event Mapping (`src/mapping.ts`)

Each Solidity event has a handler:

```typescript
export function handleStaked(event: Staked): void {
  // 1. Get or create the user entity
  // 2. Create a Stake entity (event record)
  // 3. Update user's aggregate stats
  // 4. Update pool's total staked
  // 5. Update global protocol stats
  // 6. Update daily snapshot
}
```

**ID generation**: `txHash + "-" + logIndex` ensures uniqueness even if multiple events fire in one transaction.

**DailySnapshot**: Groups data by day using `timestamp / 86400` (seconds in a day). This powers the time-series charts on the frontend.

### Example GraphQL Query

```graphql
query UserDashboard($address: String!) {
  user(id: $address) {
    totalStaked
    totalRewardsClaimed
    stakes(orderBy: timestamp, orderDirection: desc, first: 10) {
      amount
      timestamp
      pool { poolId }
    }
    claims(orderBy: timestamp, orderDirection: desc, first: 10) {
      amount
      timestamp
    }
  }
  protocolStat(id: "protocol") {
    totalValueLocked
    totalUsersCount
  }
}
```

---

## 9. How Everything Coordinates

### Full System Flow

```
1. DEPLOYMENT
   Hardhat deploys contracts → addresses saved to .env → subgraph.yaml updated

2. FRONTEND LOADS
   Next.js renders → providers initialize wagmi → RainbowKit ready

3. USER CONNECTS WALLET
   RainbowKit modal → MetaMask signs → wagmi stores connection → UI updates

4. USER VIEWS DASHBOARD
   useTokenBalance() → wagmi calls balanceOf() on NexusToken → displays balance
   useTotalValueLocked() → wagmi calls totalValueLocked() on NexusStaking → shows TVL
   usePoolAPY() → wagmi calls getAPY() per pool → renders APY %

5. USER STAKES TOKENS
   StakeModal → approveToken() → MetaMask confirms → allowance set
   stake() → MetaMask confirms → NexusStaking.stake() executes on-chain
   Event emitted: Staked(user, poolId, amount, timestamp)
   wagmi auto-refetches → balance updates → stake amount updates

6. SUBGRAPH INDEXES
   Graph node detects Staked event → handleStaked() runs
   Creates Stake entity, updates User, Pool, ProtocolStat, DailySnapshot
   GraphQL API now reflects the new data

7. ANALYTICS LOAD
   Frontend queries subgraph → DailySnapshot data → Recharts renders time-series
   User entity → transaction history component
   ProtocolStat → dashboard stat cards
```

### Component Dependency Tree

```
layout.tsx (root)
├── providers.tsx (WagmiProvider → QueryClientProvider → RainbowKitProvider)
├── Navbar (ConnectButton, nav links)
├── page.tsx (landing)
│   ├── NexusScene (Three.js background)
│   ├── HeroToken (Three.js 3D token)
│   └── GlassCard, NexusButton
├── dashboard/page.tsx
│   ├── StatCard × 4 (balance, staked, rewards, TVL)
│   ├── RewardsChart (Recharts AreaChart)
│   ├── StakingReactor (Three.js reactor)
│   ├── TVLChart (Recharts AreaChart)
│   ├── Leaderboard (mock data)
│   └── TransactionHistory (Zustand store)
├── staking/page.tsx
│   └── PoolCard × 3
│       └── StakeModal (approve + stake flow)
├── governance/page.tsx (proposal cards + voting)
├── treasury/page.tsx (PieChart, BarChart, allocation table)
└── portfolio/page.tsx (distribution, claim history)
```

---

## 10. Complete Setup & Run Guide

### Step-by-Step Installation

**Prerequisites:**
```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# Install MetaMask browser extension from metamask.io
```

**1. Clone the project:**
```bash
cd C:\Users\HP
cd nexus-defi-platform
```

**2. Install contract dependencies:**
```bash
cd contracts
npm install
```
This installs Hardhat, OpenZeppelin, TypeScript, and testing tools.

**3. Compile smart contracts:**
```bash
npx hardhat compile
```
This generates:
- `artifacts/` — compiled contract bytecode + ABI
- `typechain-types/` — TypeScript type definitions

**4. Run contract tests:**
```bash
npx hardhat test
```
Should show passing tests for staking, rewards, unstaking, emergency, and admin functions.

**5. Start local blockchain:**
```bash
npx hardhat node
```
This starts a local Ethereum node at `http://127.0.0.1:8545` with:
- 20 test accounts pre-funded with 10,000 ETH each
- Instant block mining
- Console output for every transaction

**Keep this terminal open!**

**6. Deploy contracts (new terminal):**
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```
Output shows deployed addresses. Copy them.

**7. Update environment:**
Edit `.env` in the project root with the deployed addresses:
```
NEXT_PUBLIC_TOKEN_CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_STAKING_CONTRACT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_TREASURY_CONTRACT=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_GOVERNANCE_CONTRACT=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

**8. Install frontend dependencies:**
```bash
cd frontend
npm install
```

**9. Start frontend:**
```bash
npm run dev
```
Open http://localhost:3000

**10. Connect MetaMask:**
1. Open MetaMask → Settings → Networks → Add Network
2. Network Name: `Hardhat Local`
3. RPC URL: `http://127.0.0.1:8545`
4. Chain ID: `31337`
5. Currency: `ETH`
6. Import account: Copy a private key from the Hardhat node terminal output

**11. Use the app!**
- Go to /staking
- Click "Stake" on any pool
- Approve tokens → Stake tokens
- Watch your rewards accumulate
- Try claiming, compounding, unstaking

### Production Deployment

**Contracts → Sepolia:**
```bash
# Set PRIVATE_KEY and SEPOLIA_RPC_URL in .env
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia <TOKEN_ADDRESS> <DEPLOYER_ADDRESS>
```

**Frontend → Vercel:**
```bash
cd frontend
npm run build    # Check for errors
# Deploy via Vercel CLI or GitHub integration
# Set environment variables in Vercel dashboard
```

**Subgraph → The Graph Studio:**
```bash
cd subgraph
# Update subgraph.yaml with Sepolia contract address and start block
npm run codegen
npm run build
graph auth --studio <YOUR_DEPLOY_KEY>
graph deploy --studio nexus-defi
```

---

## 11. Troubleshooting

### Common Issues

**"Cannot read property of undefined" in wagmi hooks:**
- Wallet not connected. Wrap contract calls with `enabled: !!address`.

**"Transaction reverted" on stake:**
- Check you've approved tokens first (allowance must be >= stake amount)
- Check you haven't exceeded maxStake

**Three.js shows blank:**
- Three.js requires `"use client"` directive (no SSR)
- Use `dynamic(() => import(...), { ssr: false })` for 3D components

**MetaMask "nonce too high":**
- Reset MetaMask: Settings → Advanced → Clear Activity Tab Data
- Happens when you restart Hardhat node (nonces reset on chain but not in wallet)

**"Module not found" errors:**
- Run `npm install` in the correct directory (contracts/ or frontend/)
- Check path aliases: `@/*` maps to `./src/*` in `tsconfig.json`

**Subgraph build fails:**
- Run `npm run codegen` first to generate types from schema
- Check event signatures in subgraph.yaml match your contract exactly

---

*This guide covers the complete NexusDeFi architecture. For questions, open an issue on the repository.*
