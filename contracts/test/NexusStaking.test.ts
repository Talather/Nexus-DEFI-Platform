import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { NexusToken, NexusStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NexusStaking", function () {
  let token: NexusToken;
  let staking: NexusStaking;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const REWARD_RATE = ethers.parseEther("1"); // 1 token per second
  const LOCK_DURATION = 30 * 24 * 60 * 60; // 30 days
  const PENALTY_BPS = 1000; // 10%
  const MAX_STAKE = ethers.parseEther("1000000");
  const STAKE_AMOUNT = ethers.parseEther("1000");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const NexusToken = await ethers.getContractFactory("NexusToken");
    token = await NexusToken.deploy(owner.address);

    const NexusStaking = await ethers.getContractFactory("NexusStaking");
    staking = await NexusStaking.deploy(owner.address);

    await staking.createPool(
      await token.getAddress(),
      await token.getAddress(),
      REWARD_RATE,
      LOCK_DURATION,
      PENALTY_BPS,
      MAX_STAKE
    );

    // Transfer tokens to users and staking contract
    await token.transfer(user1.address, ethers.parseEther("10000"));
    await token.transfer(user2.address, ethers.parseEther("10000"));
    await token.transfer(await staking.getAddress(), ethers.parseEther("1000000"));

    // Approve staking contract
    await token.connect(user1).approve(await staking.getAddress(), ethers.MaxUint256);
    await token.connect(user2).approve(await staking.getAddress(), ethers.MaxUint256);
  });

  describe("Staking", function () {
    it("Should stake tokens successfully", async function () {
      await staking.connect(user1).stake(0, STAKE_AMOUNT);
      const userStake = await staking.getUserStake(0, user1.address);
      expect(userStake.amount).to.equal(STAKE_AMOUNT);
    });

    it("Should emit Staked event", async function () {
      await expect(staking.connect(user1).stake(0, STAKE_AMOUNT))
        .to.emit(staking, "Staked");
    });

    it("Should revert on zero stake", async function () {
      await expect(staking.connect(user1).stake(0, 0)).to.be.revertedWith("Cannot stake 0");
    });

    it("Should revert when exceeding max stake", async function () {
      await token.transfer(user1.address, ethers.parseEther("2000000"));
      await expect(staking.connect(user1).stake(0, ethers.parseEther("1000001")))
        .to.be.revertedWith("Exceeds max stake");
    });
  });

  describe("Rewards", function () {
    it("Should accumulate rewards over time", async function () {
      await staking.connect(user1).stake(0, STAKE_AMOUNT);
      await time.increase(86400); // 1 day
      const earned = await staking.earned(0, user1.address);
      expect(earned).to.be.gt(0);
    });

    it("Should claim rewards", async function () {
      await staking.connect(user1).stake(0, STAKE_AMOUNT);
      await time.increase(86400);
      const balanceBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).claimReward(0);
      const balanceAfter = await token.balanceOf(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should compound rewards", async function () {
      await staking.connect(user1).stake(0, STAKE_AMOUNT);
      await time.increase(86400);
      const stakeBefore = (await staking.getUserStake(0, user1.address)).amount;
      await staking.connect(user1).compoundReward(0);
      const stakeAfter = (await staking.getUserStake(0, user1.address)).amount;
      expect(stakeAfter).to.be.gt(stakeBefore);
    });
  });

  describe("Unstaking", function () {
    it("Should apply early unstake penalty", async function () {
      await staking.connect(user1).stake(0, STAKE_AMOUNT);
      const balanceBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).unstake(0, STAKE_AMOUNT);
      const balanceAfter = await token.balanceOf(user1.address);
      const received = balanceAfter - balanceBefore;
      const expectedPenalty = STAKE_AMOUNT * BigInt(PENALTY_BPS) / 10000n;
      expect(received).to.equal(STAKE_AMOUNT - expectedPenalty);
    });

    it("Should unstake without penalty after lock period", async function () {
      await staking.connect(user1).stake(0, STAKE_AMOUNT);
      await time.increase(LOCK_DURATION + 1);
      const balanceBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).unstake(0, STAKE_AMOUNT);
      const balanceAfter = await token.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.be.gte(STAKE_AMOUNT);
    });
  });

  describe("Emergency", function () {
    it("Should emergency withdraw", async function () {
      await staking.connect(user1).stake(0, STAKE_AMOUNT);
      await staking.connect(user1).emergencyWithdraw(0);
      const userStake = await staking.getUserStake(0, user1.address);
      expect(userStake.amount).to.equal(0);
    });
  });

  describe("Admin", function () {
    it("Should pause and unpause", async function () {
      await staking.pause();
      await expect(staking.connect(user1).stake(0, STAKE_AMOUNT)).to.be.reverted;
      await staking.unpause();
      await staking.connect(user1).stake(0, STAKE_AMOUNT);
    });

    it("Should update pool", async function () {
      await staking.updatePool(0, ethers.parseEther("2"), true);
      const pool = await staking.pools(0);
      expect(pool.rewardRate).to.equal(ethers.parseEther("2"));
    });
  });
});
