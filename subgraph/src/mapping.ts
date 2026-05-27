import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  Staked,
  Unstaked,
  RewardClaimed,
  RewardCompounded,
  PoolCreated,
  PoolUpdated,
} from "../generated/NexusStaking/NexusStaking";
import {
  Pool,
  User,
  Stake,
  Unstake,
  RewardClaim,
  RewardCompound,
  ProtocolStat,
  DailySnapshot,
} from "../generated/schema";

const PROTOCOL_STAT_ID = "protocol";

function getOrCreateUser(address: Bytes): User {
  let user = User.load(address.toHexString());
  if (!user) {
    user = new User(address.toHexString());
    user.address = address;
    user.totalStaked = BigInt.zero();
    user.totalRewardsClaimed = BigInt.zero();
    user.totalRewardsCompounded = BigInt.zero();
    user.stakesCount = 0;
    user.firstStakeAt = null;
    user.save();
  }
  return user;
}

function getOrCreateProtocolStat(): ProtocolStat {
  let stat = ProtocolStat.load(PROTOCOL_STAT_ID);
  if (!stat) {
    stat = new ProtocolStat(PROTOCOL_STAT_ID);
    stat.totalValueLocked = BigInt.zero();
    stat.totalUsersCount = 0;
    stat.totalStakesCount = 0;
    stat.totalClaimsCount = 0;
    stat.totalRewardsDistributed = BigInt.zero();
    stat.save();
  }
  return stat;
}

function getOrCreateDailySnapshot(timestamp: BigInt): DailySnapshot {
  let dayId = timestamp.toI32() / 86400;
  let id = dayId.toString();
  let snapshot = DailySnapshot.load(id);
  if (!snapshot) {
    snapshot = new DailySnapshot(id);
    snapshot.date = dayId * 86400;
    snapshot.totalValueLocked = BigInt.zero();
    snapshot.dailyStaked = BigInt.zero();
    snapshot.dailyUnstaked = BigInt.zero();
    snapshot.dailyRewardsClaimed = BigInt.zero();
    snapshot.newUsersCount = 0;
    snapshot.save();
  }
  return snapshot;
}

export function handlePoolCreated(event: PoolCreated): void {
  let pool = new Pool(event.params.poolId.toString());
  pool.poolId = event.params.poolId;
  pool.stakingToken = event.params.stakingToken;
  pool.rewardToken = event.params.rewardToken;
  pool.rewardRate = event.params.rewardRate;
  pool.lockDuration = event.params.lockDuration;
  pool.totalStaked = BigInt.zero();
  pool.active = true;
  pool.createdAt = event.block.timestamp;
  pool.save();
}

export function handlePoolUpdated(event: PoolUpdated): void {
  let pool = Pool.load(event.params.poolId.toString());
  if (pool) {
    pool.rewardRate = event.params.newRewardRate;
    pool.active = event.params.active;
    pool.save();
  }
}

export function handleStaked(event: Staked): void {
  let user = getOrCreateUser(event.params.user);
  let stat = getOrCreateProtocolStat();
  let snapshot = getOrCreateDailySnapshot(event.params.timestamp);

  let stakeId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let stake = new Stake(stakeId);
  stake.user = user.id;
  stake.pool = event.params.poolId.toString();
  stake.amount = event.params.amount;
  stake.timestamp = event.params.timestamp;
  stake.transactionHash = event.transaction.hash;
  stake.save();

  if (user.stakesCount == 0) {
    user.firstStakeAt = event.params.timestamp;
    stat.totalUsersCount += 1;
    snapshot.newUsersCount += 1;
  }

  user.totalStaked = user.totalStaked.plus(event.params.amount);
  user.stakesCount += 1;
  user.save();

  let pool = Pool.load(event.params.poolId.toString());
  if (pool) {
    pool.totalStaked = pool.totalStaked.plus(event.params.amount);
    pool.save();
  }

  stat.totalValueLocked = stat.totalValueLocked.plus(event.params.amount);
  stat.totalStakesCount += 1;
  stat.save();

  snapshot.totalValueLocked = stat.totalValueLocked;
  snapshot.dailyStaked = snapshot.dailyStaked.plus(event.params.amount);
  snapshot.save();
}

export function handleUnstaked(event: Unstaked): void {
  let user = getOrCreateUser(event.params.user);
  let stat = getOrCreateProtocolStat();
  let snapshot = getOrCreateDailySnapshot(event.params.timestamp);

  let unstakeId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let unstake = new Unstake(unstakeId);
  unstake.user = user.id;
  unstake.pool = event.params.poolId.toString();
  unstake.amount = event.params.amount;
  unstake.penalty = event.params.penalty;
  unstake.timestamp = event.params.timestamp;
  unstake.transactionHash = event.transaction.hash;
  unstake.save();

  user.totalStaked = user.totalStaked.minus(event.params.amount);
  user.save();

  let pool = Pool.load(event.params.poolId.toString());
  if (pool) {
    pool.totalStaked = pool.totalStaked.minus(event.params.amount);
    pool.save();
  }

  stat.totalValueLocked = stat.totalValueLocked.minus(event.params.amount);
  stat.save();

  snapshot.totalValueLocked = stat.totalValueLocked;
  snapshot.dailyUnstaked = snapshot.dailyUnstaked.plus(event.params.amount);
  snapshot.save();
}

export function handleRewardClaimed(event: RewardClaimed): void {
  let user = getOrCreateUser(event.params.user);
  let stat = getOrCreateProtocolStat();
  let snapshot = getOrCreateDailySnapshot(event.params.timestamp);

  let claimId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let claim = new RewardClaim(claimId);
  claim.user = user.id;
  claim.pool = event.params.poolId.toString();
  claim.amount = event.params.amount;
  claim.timestamp = event.params.timestamp;
  claim.transactionHash = event.transaction.hash;
  claim.save();

  user.totalRewardsClaimed = user.totalRewardsClaimed.plus(event.params.amount);
  user.save();

  stat.totalClaimsCount += 1;
  stat.totalRewardsDistributed = stat.totalRewardsDistributed.plus(event.params.amount);
  stat.save();

  snapshot.dailyRewardsClaimed = snapshot.dailyRewardsClaimed.plus(event.params.amount);
  snapshot.save();
}

export function handleRewardCompounded(event: RewardCompounded): void {
  let user = getOrCreateUser(event.params.user);
  let stat = getOrCreateProtocolStat();

  let compoundId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let compound = new RewardCompound(compoundId);
  compound.user = user.id;
  compound.pool = event.params.poolId.toString();
  compound.amount = event.params.amount;
  compound.timestamp = event.params.timestamp;
  compound.transactionHash = event.transaction.hash;
  compound.save();

  user.totalRewardsCompounded = user.totalRewardsCompounded.plus(event.params.amount);
  user.totalStaked = user.totalStaked.plus(event.params.amount);
  user.save();

  let pool = Pool.load(event.params.poolId.toString());
  if (pool) {
    pool.totalStaked = pool.totalStaked.plus(event.params.amount);
    pool.save();
  }

  stat.totalValueLocked = stat.totalValueLocked.plus(event.params.amount);
  stat.save();
}
