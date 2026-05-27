// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NexusVesting is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant VESTING_MANAGER_ROLE = keccak256("VESTING_MANAGER_ROLE");

    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        bool revocable;
        bool revoked;
    }

    IERC20 public token;
    VestingSchedule[] public schedules;
    mapping(address => uint256[]) public userSchedules;

    uint256 public totalVested;
    uint256 public totalReleased;

    event VestingCreated(uint256 indexed scheduleId, address indexed beneficiary, uint256 amount, uint256 startTime, uint256 cliffDuration, uint256 vestingDuration);
    event TokensReleased(uint256 indexed scheduleId, address indexed beneficiary, uint256 amount, uint256 timestamp);
    event VestingRevoked(uint256 indexed scheduleId, uint256 refundAmount, uint256 timestamp);

    constructor(address _token, address defaultAdmin) {
        token = IERC20(_token);
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(VESTING_MANAGER_ROLE, defaultAdmin);
    }

    function createVesting(
        address _beneficiary,
        uint256 _totalAmount,
        uint256 _cliffDuration,
        uint256 _vestingDuration,
        bool _revocable
    ) external onlyRole(VESTING_MANAGER_ROLE) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_totalAmount > 0, "Invalid amount");
        require(_vestingDuration > _cliffDuration, "Invalid durations");

        token.safeTransferFrom(msg.sender, address(this), _totalAmount);

        uint256 scheduleId = schedules.length;
        schedules.push(VestingSchedule({
            beneficiary: _beneficiary,
            totalAmount: _totalAmount,
            releasedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: _cliffDuration,
            vestingDuration: _vestingDuration,
            revocable: _revocable,
            revoked: false
        }));

        userSchedules[_beneficiary].push(scheduleId);
        totalVested += _totalAmount;

        emit VestingCreated(scheduleId, _beneficiary, _totalAmount, block.timestamp, _cliffDuration, _vestingDuration);
    }

    function release(uint256 _scheduleId) external nonReentrant {
        VestingSchedule storage schedule = schedules[_scheduleId];
        require(msg.sender == schedule.beneficiary, "Not beneficiary");
        require(!schedule.revoked, "Vesting revoked");

        uint256 releasable = _computeReleasable(schedule);
        require(releasable > 0, "Nothing to release");

        schedule.releasedAmount += releasable;
        totalReleased += releasable;
        token.safeTransfer(schedule.beneficiary, releasable);

        emit TokensReleased(_scheduleId, schedule.beneficiary, releasable, block.timestamp);
    }

    function revoke(uint256 _scheduleId) external onlyRole(VESTING_MANAGER_ROLE) {
        VestingSchedule storage schedule = schedules[_scheduleId];
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");

        uint256 releasable = _computeReleasable(schedule);
        uint256 refund = schedule.totalAmount - schedule.releasedAmount - releasable;

        schedule.revoked = true;

        if (releasable > 0) {
            schedule.releasedAmount += releasable;
            totalReleased += releasable;
            token.safeTransfer(schedule.beneficiary, releasable);
        }
        if (refund > 0) {
            token.safeTransfer(msg.sender, refund);
        }

        emit VestingRevoked(_scheduleId, refund, block.timestamp);
    }

    function getVestedAmount(uint256 _scheduleId) external view returns (uint256) {
        return _computeVested(schedules[_scheduleId]);
    }

    function getReleasable(uint256 _scheduleId) external view returns (uint256) {
        return _computeReleasable(schedules[_scheduleId]);
    }

    function getUserSchedules(address _user) external view returns (uint256[] memory) {
        return userSchedules[_user];
    }

    function getScheduleCount() external view returns (uint256) { return schedules.length; }

    function _computeVested(VestingSchedule storage schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) return 0;
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) return schedule.totalAmount;
        return (schedule.totalAmount * (block.timestamp - schedule.startTime)) / schedule.vestingDuration;
    }

    function _computeReleasable(VestingSchedule storage schedule) internal view returns (uint256) {
        return _computeVested(schedule) - schedule.releasedAmount;
    }
}
