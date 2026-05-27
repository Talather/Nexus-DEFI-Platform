// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NexusStaking is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Pool {
        IERC20 stakingToken;
        IERC20 rewardToken;
        uint256 totalStaked;
        uint256 rewardRate;          // Rewards per second
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        uint256 lockDuration;        // Lock period in seconds
        uint256 earlyUnstakePenalty; // Penalty in basis points (e.g., 1000 = 10%)
        uint256 maxStake;           // Max stake per user (0 = unlimited)
        bool active;
    }

    struct UserStake {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingRewards;
        uint256 stakeTimestamp;
        uint256 lastCompoundTime;
    }

    Pool[] public pools;
    mapping(uint256 => mapping(address => UserStake)) public userStakes;
    mapping(uint256 => mapping(address => uint256)) public userRewardPerTokenPaid;
    mapping(address => bool) public nftBoostActive;
    mapping(address => uint256) public nftBoostMultiplier; // basis points, 10000 = 1x

    uint256 public constant BASIS_POINTS = 10000;
    uint256 public totalValueLocked;

    // Events for The Graph indexing
    event PoolCreated(uint256 indexed poolId, address stakingToken, address rewardToken, uint256 rewardRate, uint256 lockDuration);
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 penalty, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 indexed poolId, uint256 amount, uint256 timestamp);
    event RewardCompounded(address indexed user, uint256 indexed poolId, uint256 amount, uint256 timestamp);
    event PoolUpdated(uint256 indexed poolId, uint256 newRewardRate, bool active);
    event NFTBoostSet(address indexed user, uint256 multiplier);
    event EmergencyWithdraw(address indexed user, uint256 indexed poolId, uint256 amount);

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(POOL_MANAGER_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
    }

    function createPool(
        address _stakingToken,
        address _rewardToken,
        uint256 _rewardRate,
        uint256 _lockDuration,
        uint256 _earlyUnstakePenalty,
        uint256 _maxStake
    ) external onlyRole(POOL_MANAGER_ROLE) {
        require(_earlyUnstakePenalty <= 5000, "Penalty too high"); // Max 50%
        
        pools.push(Pool({
            stakingToken: IERC20(_stakingToken),
            rewardToken: IERC20(_rewardToken),
            totalStaked: 0,
            rewardRate: _rewardRate,
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            lockDuration: _lockDuration,
            earlyUnstakePenalty: _earlyUnstakePenalty,
            maxStake: _maxStake,
            active: true
        }));

        emit PoolCreated(pools.length - 1, _stakingToken, _rewardToken, _rewardRate, _lockDuration);
    }

    function stake(uint256 _poolId, uint256 _amount) external nonReentrant whenNotPaused {
        require(_poolId < pools.length, "Invalid pool");
        Pool storage pool = pools[_poolId];
        require(pool.active, "Pool not active");
        require(_amount > 0, "Cannot stake 0");

        UserStake storage userStake = userStakes[_poolId][msg.sender];
        if (pool.maxStake > 0) {
            require(userStake.amount + _amount <= pool.maxStake, "Exceeds max stake");
        }

        _updateReward(_poolId, msg.sender);

        pool.stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
        userStake.amount += _amount;
        userStake.stakeTimestamp = block.timestamp;
        pool.totalStaked += _amount;
        totalValueLocked += _amount;

        emit Staked(msg.sender, _poolId, _amount, block.timestamp);
    }

    function unstake(uint256 _poolId, uint256 _amount) external nonReentrant whenNotPaused {
        require(_poolId < pools.length, "Invalid pool");
        UserStake storage userStake = userStakes[_poolId][msg.sender];
        require(userStake.amount >= _amount, "Insufficient stake");
        require(_amount > 0, "Cannot unstake 0");

        _updateReward(_poolId, msg.sender);

        Pool storage pool = pools[_poolId];
        uint256 penalty = 0;

        if (block.timestamp < userStake.stakeTimestamp + pool.lockDuration) {
            penalty = (_amount * pool.earlyUnstakePenalty) / BASIS_POINTS;
        }

        uint256 transferAmount = _amount - penalty;
        userStake.amount -= _amount;
        pool.totalStaked -= _amount;
        totalValueLocked -= _amount;

        pool.stakingToken.safeTransfer(msg.sender, transferAmount);
        if (penalty > 0) {
            pool.stakingToken.safeTransfer(address(this), penalty); // Penalty stays in contract (treasury)
        }

        emit Unstaked(msg.sender, _poolId, _amount, penalty, block.timestamp);
    }

    function claimReward(uint256 _poolId) external nonReentrant whenNotPaused {
        _updateReward(_poolId, msg.sender);

        UserStake storage userStake = userStakes[_poolId][msg.sender];
        uint256 reward = userStake.pendingRewards;
        require(reward > 0, "No rewards to claim");

        userStake.pendingRewards = 0;
        pools[_poolId].rewardToken.safeTransfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, _poolId, reward, block.timestamp);
    }

    function compoundReward(uint256 _poolId) external nonReentrant whenNotPaused {
        Pool storage pool = pools[_poolId];
        require(address(pool.stakingToken) == address(pool.rewardToken), "Cannot compound: different tokens");
        
        _updateReward(_poolId, msg.sender);

        UserStake storage userStake = userStakes[_poolId][msg.sender];
        uint256 reward = userStake.pendingRewards;
        require(reward > 0, "No rewards to compound");

        userStake.pendingRewards = 0;
        userStake.amount += reward;
        userStake.lastCompoundTime = block.timestamp;
        pool.totalStaked += reward;
        totalValueLocked += reward;

        emit RewardCompounded(msg.sender, _poolId, reward, block.timestamp);
    }

    function emergencyWithdraw(uint256 _poolId) external nonReentrant {
        UserStake storage userStake = userStakes[_poolId][msg.sender];
        uint256 amount = userStake.amount;
        require(amount > 0, "Nothing staked");

        Pool storage pool = pools[_poolId];
        userStake.amount = 0;
        userStake.pendingRewards = 0;
        pool.totalStaked -= amount;
        totalValueLocked -= amount;

        pool.stakingToken.safeTransfer(msg.sender, amount);

        emit EmergencyWithdraw(msg.sender, _poolId, amount);
    }

    function setNFTBoost(address _user, uint256 _multiplier) external onlyRole(POOL_MANAGER_ROLE) {
        require(_multiplier >= BASIS_POINTS && _multiplier <= 30000, "Invalid multiplier");
        nftBoostActive[_user] = true;
        nftBoostMultiplier[_user] = _multiplier;
        emit NFTBoostSet(_user, _multiplier);
    }

    function updatePool(uint256 _poolId, uint256 _rewardRate, bool _active) external onlyRole(POOL_MANAGER_ROLE) {
        require(_poolId < pools.length, "Invalid pool");
        _updatePoolReward(_poolId);
        pools[_poolId].rewardRate = _rewardRate;
        pools[_poolId].active = _active;
        emit PoolUpdated(_poolId, _rewardRate, _active);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // View functions
    function poolCount() external view returns (uint256) { return pools.length; }

    function earned(uint256 _poolId, address _user) public view returns (uint256) {
        Pool storage pool = pools[_poolId];
        UserStake storage userStake = userStakes[_poolId][_user];
        uint256 rpt = rewardPerToken(_poolId);
        uint256 baseReward = (userStake.amount * (rpt - userRewardPerTokenPaid[_poolId][_user])) / 1e18 + userStake.pendingRewards;
        
        if (nftBoostActive[_user]) {
            return (baseReward * nftBoostMultiplier[_user]) / BASIS_POINTS;
        }
        return baseReward;
    }

    function rewardPerToken(uint256 _poolId) public view returns (uint256) {
        Pool storage pool = pools[_poolId];
        if (pool.totalStaked == 0) return pool.rewardPerTokenStored;
        return pool.rewardPerTokenStored + ((block.timestamp - pool.lastUpdateTime) * pool.rewardRate * 1e18) / pool.totalStaked;
    }

    function getAPY(uint256 _poolId) external view returns (uint256) {
        Pool storage pool = pools[_poolId];
        if (pool.totalStaked == 0) return 0;
        return (pool.rewardRate * 365 days * BASIS_POINTS) / pool.totalStaked;
    }

    function getUserStake(uint256 _poolId, address _user) external view returns (
        uint256 amount, uint256 pendingRewards, uint256 stakeTimestamp, uint256 lockEndsAt, bool isLocked
    ) {
        UserStake storage s = userStakes[_poolId][_user];
        amount = s.amount;
        pendingRewards = earned(_poolId, _user);
        stakeTimestamp = s.stakeTimestamp;
        lockEndsAt = s.stakeTimestamp + pools[_poolId].lockDuration;
        isLocked = block.timestamp < lockEndsAt;
    }

    // Internal functions
    function _updateReward(uint256 _poolId, address _user) internal {
        _updatePoolReward(_poolId);
        UserStake storage userStake = userStakes[_poolId][_user];
        userStake.pendingRewards = earned(_poolId, _user);
        userRewardPerTokenPaid[_poolId][_user] = pools[_poolId].rewardPerTokenStored;
    }

    function _updatePoolReward(uint256 _poolId) internal {
        Pool storage pool = pools[_poolId];
        pool.rewardPerTokenStored = rewardPerToken(_poolId);
        pool.lastUpdateTime = block.timestamp;
    }
}
