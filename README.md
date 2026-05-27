# NexusDeFi — Next-Gen Web3 Staking Platform

A production-grade fullstack Web3 DeFi staking ecosystem built with Next.js 15, Solidity, Three.js, and The Graph.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, Framer Motion |
| **3D/WebGL** | Three.js, React Three Fiber, Drei |
| **Web3** | wagmi v2, viem, RainbowKit v2 |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin v5 |
| **Indexing** | The Graph (subgraph) |
| **Charts** | Recharts |
| **State** | Zustand |

## Project Structure

```
nexus-defi-platform/
├── contracts/                 # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── NexusToken.sol     # ERC-20 token with roles
│   │   ├── NexusStaking.sol   # Multi-pool staking engine
│   │   ├── NexusTreasury.sol  # Treasury management
│   │   ├── NexusGovernance.sol # DAO governance
│   │   └── NexusVesting.sol   # Token vesting
│   ├── scripts/deploy.ts      # Deployment script
│   ├── test/                  # Contract tests
│   └── hardhat.config.ts
├── frontend/                  # Next.js 15 frontend
│   └── src/
│       ├── app/               # App router pages
│       │   ├── page.tsx       # Landing page
│       │   ├── dashboard/     # Dashboard
│       │   ├── staking/       # Staking pools
│       │   ├── governance/    # DAO voting
│       │   ├── treasury/      # Treasury analytics
│       │   └── portfolio/     # User portfolio
│       ├── components/
│       │   ├── three/         # Three.js 3D scenes
│       │   ├── ui/            # Reusable UI components
│       │   ├── layout/        # Navbar, Footer
│       │   ├── staking/       # Staking-specific components
│       │   └── analytics/     # Charts and data viz
│       ├── hooks/             # Custom React hooks
│       ├── store/             # Zustand state management
│       └── lib/               # Config, ABIs, constants
├── subgraph/                  # The Graph subgraph
│   ├── schema.graphql         # GraphQL schema
│   ├── subgraph.yaml          # Subgraph manifest
│   └── src/mapping.ts         # Event handlers
└── .env.example               # Environment variables template
```

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm)
- **Git**
- **MetaMask** or any WalletConnect-compatible wallet

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url> nexus-defi-platform
cd nexus-defi-platform

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install subgraph dependencies
cd ../subgraph
npm install
```

### 2. Environment Setup

```bash
# From project root
cp .env.example .env
```

Edit `.env` with your values:
```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id
```

### 3. Compile & Test Smart Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run test coverage
npx hardhat coverage
```

### 4. Deploy Contracts (Local)

```bash
# Terminal 1: Start local Hardhat node
cd contracts
npx hardhat node

# Terminal 2: Deploy contracts
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed contract addresses from the terminal output and update your `.env`:
```
NEXT_PUBLIC_TOKEN_CONTRACT=0x...
NEXT_PUBLIC_STAKING_CONTRACT=0x...
NEXT_PUBLIC_TREASURY_CONTRACT=0x...
NEXT_PUBLIC_GOVERNANCE_CONTRACT=0x...
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Connect MetaMask to Local Network

1. Open MetaMask
2. Add network: RPC URL `http://127.0.0.1:8545`, Chain ID `31337`
3. Import an account using a private key from the Hardhat node output

## Deploy to Sepolia Testnet

```bash
cd contracts

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contracts on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## The Graph Subgraph

### Local Development

```bash
cd subgraph

# Update subgraph.yaml with your deployed contract address and start block
# Then:
npm run codegen
npm run build
```

### Deploy to The Graph Studio

1. Create a subgraph at [The Graph Studio](https://thegraph.com/studio/)
2. Authenticate: `graph auth --studio <DEPLOY_KEY>`
3. Deploy: `npm run deploy`

## Smart Contract Architecture

### NexusToken (ERC-20)
- 1 billion max supply, 100M initial mint
- Role-based minting (MINTER_ROLE)
- Pausable transfers
- ERC-20 Permit (gasless approvals)

### NexusStaking (Multi-Pool)
- Multiple staking pools with different parameters
- Dynamic APY based on reward rate and total staked
- Time-locked staking with configurable lock durations
- Early unstake penalty (configurable per pool)
- Reward compounding (same-token pools)
- NFT boost multiplier support
- Emergency withdraw function
- ReentrancyGuard + Pausable

### NexusTreasury
- Token deposits and balance tracking
- Allocation-based distribution system
- Role-based treasury management
- Emergency withdrawal for admin

### NexusGovernance (DAO)
- On-chain proposal creation
- Three-way voting (For / Against / Abstain)
- Quorum threshold enforcement
- Execution delay (timelock)
- Proposal cancellation

### NexusVesting
- Linear vesting with cliff period
- Revocable and non-revocable schedules
- Automatic releasable amount calculation
- Multi-schedule support per beneficiary

## Frontend Architecture

### Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page with 3D hero, features, stats |
| `/dashboard` | Connected wallet overview, charts, reactor |
| `/staking` | Pool cards with stake/unstake/claim/compound |
| `/governance` | Proposal list with voting interface |
| `/treasury` | Treasury analytics with charts |
| `/portfolio` | Personal staking distribution and history |

### Component Organization
- **`three/`** — Three.js 3D scenes (NexusScene, HeroToken, StakingReactor, FloatingParticles, BlockchainNetwork)
- **`ui/`** — Reusable primitives (GlassCard, NexusButton, StatCard, Modal, SkeletonLoader)
- **`layout/`** — App shell (Navbar with wallet connect, Footer)
- **`staking/`** — Domain components (PoolCard, StakeModal)
- **`analytics/`** — Data visualization (RewardsChart, TVLChart, Leaderboard, TransactionHistory)

### State Management
- **Zustand** store for staking state, transactions, UI
- **wagmi** hooks for contract reads/writes
- **React Query** (via wagmi) for caching and refetching

## Scripts

| Command | Description |
|---------|-------------|
| `cd contracts && npx hardhat compile` | Compile Solidity contracts |
| `cd contracts && npx hardhat test` | Run contract test suite |
| `cd contracts && npx hardhat node` | Start local blockchain |
| `cd contracts && npx hardhat run scripts/deploy.ts --network localhost` | Deploy locally |
| `cd frontend && npm run dev` | Start frontend dev server |
| `cd frontend && npm run build` | Production build |
| `cd subgraph && npm run codegen` | Generate subgraph types |
| `cd subgraph && npm run build` | Build subgraph |

## License

MIT
