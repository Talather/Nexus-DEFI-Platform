// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NexusGovernance is AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    enum ProposalState { Pending, Active, Passed, Failed, Executed, Cancelled }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool cancelled;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
    }

    IERC20 public governanceToken;
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public quorumThreshold = 100_000 * 10 ** 18; // 100k tokens
    uint256 public proposalThreshold = 10_000 * 10 ** 18; // 10k tokens to propose
    uint256 public executionDelay = 1 days;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voteWeight;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 startTime, uint256 endTime);
    event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight, uint256 timestamp);
    event ProposalExecuted(uint256 indexed proposalId, uint256 timestamp);
    event ProposalCancelled(uint256 indexed proposalId, uint256 timestamp);

    constructor(address _governanceToken, address defaultAdmin) {
        governanceToken = IERC20(_governanceToken);
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PROPOSER_ROLE, defaultAdmin);
    }

    function propose(
        string calldata _title,
        string calldata _description,
        address[] calldata _targets,
        uint256[] calldata _values,
        bytes[] calldata _calldatas
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        require(governanceToken.balanceOf(msg.sender) >= proposalThreshold, "Below proposal threshold");
        require(_targets.length == _values.length && _values.length == _calldatas.length, "Length mismatch");

        uint256 proposalId = ++proposalCount;
        Proposal storage p = proposals[proposalId];
        p.id = proposalId;
        p.proposer = msg.sender;
        p.title = _title;
        p.description = _description;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + votingPeriod;
        p.targets = _targets;
        p.values = _values;
        p.calldatas = _calldatas;

        emit ProposalCreated(proposalId, msg.sender, _title, p.startTime, p.endTime);
        return proposalId;
    }

    function vote(uint256 _proposalId, uint8 _support) external nonReentrant {
        Proposal storage p = proposals[_proposalId];
        require(block.timestamp >= p.startTime && block.timestamp <= p.endTime, "Voting closed");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(_support <= 2, "Invalid vote type"); // 0=against, 1=for, 2=abstain

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        hasVoted[_proposalId][msg.sender] = true;
        voteWeight[_proposalId][msg.sender] = weight;

        if (_support == 0) p.againstVotes += weight;
        else if (_support == 1) p.forVotes += weight;
        else p.abstainVotes += weight;

        emit VoteCast(msg.sender, _proposalId, _support, weight, block.timestamp);
    }

    function execute(uint256 _proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        Proposal storage p = proposals[_proposalId];
        require(block.timestamp > p.endTime + executionDelay, "Execution delay not met");
        require(!p.executed && !p.cancelled, "Already executed/cancelled");
        require(p.forVotes > p.againstVotes, "Proposal not passed");
        require(p.forVotes + p.againstVotes + p.abstainVotes >= quorumThreshold, "Quorum not reached");

        p.executed = true;

        for (uint256 i = 0; i < p.targets.length; i++) {
            (bool success, ) = p.targets[i].call{value: p.values[i]}(p.calldatas[i]);
            require(success, "Execution failed");
        }

        emit ProposalExecuted(_proposalId, block.timestamp);
    }

    function cancel(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(msg.sender == p.proposer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        require(!p.executed, "Already executed");
        
        p.cancelled = true;
        emit ProposalCancelled(_proposalId, block.timestamp);
    }

    function getProposalState(uint256 _proposalId) external view returns (ProposalState) {
        Proposal storage p = proposals[_proposalId];
        if (p.cancelled) return ProposalState.Cancelled;
        if (p.executed) return ProposalState.Executed;
        if (block.timestamp <= p.endTime) return ProposalState.Active;
        if (p.forVotes <= p.againstVotes || p.forVotes + p.againstVotes + p.abstainVotes < quorumThreshold)
            return ProposalState.Failed;
        return ProposalState.Passed;
    }

    function setVotingPeriod(uint256 _period) external onlyRole(DEFAULT_ADMIN_ROLE) {
        votingPeriod = _period;
    }

    function setQuorumThreshold(uint256 _threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        quorumThreshold = _threshold;
    }

    receive() external payable {}
}
