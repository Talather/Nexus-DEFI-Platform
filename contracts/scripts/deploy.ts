import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy NexusToken
  const NexusToken = await ethers.getContractFactory("NexusToken");
  const token = await NexusToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("NexusToken deployed to:", tokenAddress);

  // Deploy NexusStaking
  const NexusStaking = await ethers.getContractFactory("NexusStaking");
  const staking = await NexusStaking.deploy(deployer.address);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("NexusStaking deployed to:", stakingAddress);

  // Deploy NexusTreasury
  const NexusTreasury = await ethers.getContractFactory("NexusTreasury");
  const treasury = await NexusTreasury.deploy(deployer.address);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("NexusTreasury deployed to:", treasuryAddress);

  // Deploy NexusGovernance
  const NexusGovernance = await ethers.getContractFactory("NexusGovernance");
  const governance = await NexusGovernance.deploy(tokenAddress, deployer.address);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("NexusGovernance deployed to:", governanceAddress);

  // Deploy NexusVesting
  const NexusVesting = await ethers.getContractFactory("NexusVesting");
  const vesting = await NexusVesting.deploy(tokenAddress, deployer.address);
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();
  console.log("NexusVesting deployed to:", vestingAddress);

  // Grant MINTER_ROLE to staking contract for reward emissions
  const MINTER_ROLE = await token.MINTER_ROLE();
  await token.grantRole(MINTER_ROLE, stakingAddress);
  console.log("Granted MINTER_ROLE to staking contract");

  // Create initial staking pool (NXS-NXS, 30 day lock, 10% penalty, 1 token/sec reward)
  await staking.createPool(
    tokenAddress,
    tokenAddress,
    ethers.parseEther("1"),    // 1 token per second reward rate
    30 * 24 * 60 * 60,         // 30 day lock
    1000,                       // 10% early unstake penalty
    ethers.parseEther("1000000") // 1M max stake
  );
  console.log("Created initial staking pool");

  // Fund staking contract with reward tokens
  await token.transfer(stakingAddress, ethers.parseEther("10000000")); // 10M tokens
  console.log("Funded staking contract with 10M NXS");

  // Fund treasury
  await token.approve(treasuryAddress, ethers.parseEther("5000000"));
  await treasury.deposit(tokenAddress, ethers.parseEther("5000000"));
  console.log("Funded treasury with 5M NXS");

  console.log("\n--- Deployment Summary ---");
  console.log("NexusToken:", tokenAddress);
  console.log("NexusStaking:", stakingAddress);
  console.log("NexusTreasury:", treasuryAddress);
  console.log("NexusGovernance:", governanceAddress);
  console.log("NexusVesting:", vestingAddress);
  console.log("\nUpdate your .env file with these addresses!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
