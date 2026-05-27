// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NexusTreasury is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Allocation {
        string purpose;
        address recipient;
        uint256 amount;
        address token;
        uint256 executedAt;
        bool executed;
    }

    Allocation[] public allocations;
    mapping(address => uint256) public tokenBalances;
    
    uint256 public totalAllocated;
    uint256 public totalDistributed;

    event FundsDeposited(address indexed token, address indexed from, uint256 amount, uint256 timestamp);
    event AllocationCreated(uint256 indexed allocationId, string purpose, address recipient, uint256 amount);
    event AllocationExecuted(uint256 indexed allocationId, address indexed recipient, uint256 amount, uint256 timestamp);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(TREASURER_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
    }

    function deposit(address _token, uint256 _amount) external nonReentrant whenNotPaused {
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        tokenBalances[_token] += _amount;
        emit FundsDeposited(_token, msg.sender, _amount, block.timestamp);
    }

    function createAllocation(
        string calldata _purpose,
        address _recipient,
        uint256 _amount,
        address _token
    ) external onlyRole(TREASURER_ROLE) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Invalid amount");

        allocations.push(Allocation({
            purpose: _purpose,
            recipient: _recipient,
            amount: _amount,
            token: _token,
            executedAt: 0,
            executed: false
        }));

        totalAllocated += _amount;
        emit AllocationCreated(allocations.length - 1, _purpose, _recipient, _amount);
    }

    function executeAllocation(uint256 _allocationId) external onlyRole(TREASURER_ROLE) nonReentrant whenNotPaused {
        Allocation storage allocation = allocations[_allocationId];
        require(!allocation.executed, "Already executed");
        require(tokenBalances[allocation.token] >= allocation.amount, "Insufficient balance");

        allocation.executed = true;
        allocation.executedAt = block.timestamp;
        tokenBalances[allocation.token] -= allocation.amount;
        totalDistributed += allocation.amount;

        IERC20(allocation.token).safeTransfer(allocation.recipient, allocation.amount);

        emit AllocationExecuted(_allocationId, allocation.recipient, allocation.amount, block.timestamp);
    }

    function emergencyWithdraw(address _token, address _to, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(tokenBalances[_token] >= _amount, "Insufficient balance");
        tokenBalances[_token] -= _amount;
        IERC20(_token).safeTransfer(_to, _amount);
        emit EmergencyWithdrawal(_token, _to, _amount);
    }

    function getAllocationCount() external view returns (uint256) { return allocations.length; }
    function getBalance(address _token) external view returns (uint256) { return tokenBalances[_token]; }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
