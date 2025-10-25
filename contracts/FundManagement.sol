// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ProjectRegistry.sol";

/**
 * @title FundManagement
 * @dev Manages escrow and milestone-based fund release for approved projects
 */
contract FundManagement is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    
    ProjectRegistry public projectRegistry;
    
    struct Milestone {
        uint256 milestoneId;
        uint256 projectId;
        string description;
        uint256 percentageAllocation;
        bool isCompleted;
        bool isApproved;
        uint256 completionDate;
        uint256 approvalDate;
        string verificationHash; // IPFS proof
        address completedBy;
        address approvedBy;
    }
    
    struct ProjectFunding {
        uint256 totalBudget;
        uint256 allocatedAmount;
        uint256 releasedAmount;
        uint256 remainingAmount;
        bool isFunded;
        uint256 fundedAt;
        uint256 milestoneCount;
        mapping(uint256 => Milestone) milestones;
    }
    
    // State variables
    mapping(uint256 => ProjectFunding) private projectFunds;
    mapping(uint256 => uint256[]) private projectMilestones; // projectId => milestoneIds
    uint256 private milestoneCounter;
    
    uint256 public constant MAX_DAILY_WITHDRAWAL = 1000 ether;
    mapping(uint256 => uint256) public dailyWithdrawals; // projectId => amount today
    mapping(uint256 => uint256) public lastWithdrawalDay; // projectId => day
    
    // Events
    event FundsAllocated(
        uint256 indexed projectId,
        uint256 amount,
        uint256 timestamp
    );
    
    event MilestoneCreated(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        string description,
        uint256 percentage
    );
    
    event MilestoneCompleted(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address completedBy,
        string verificationHash
    );
    
    event MilestoneApproved(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address approvedBy
    );
    
    event FundsReleased(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        address indexed contractor,
        uint256 amount
    );
    
    event EmergencyWithdrawal(
        uint256 indexed projectId,
        address indexed admin,
        uint256 amount,
        string reason
    );
    
    constructor(address _projectRegistryAddress) {
        projectRegistry = ProjectRegistry(_projectRegistryAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Allocate funds to an approved project
     */
    function allocateFunds(uint256 _projectId) 
        external 
        payable
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(msg.value > 0, "Amount must be greater than 0");
        
        ProjectFunding storage funding = projectFunds[_projectId];
        require(!funding.isFunded, "Project already funded");
        
        // Verify project is approved
        (
            ,
            ,
            ,
            uint256 budgetRequested,
            ProjectRegistry.ProjectStatus status,
            ,
        ) = projectRegistry.getProjectAnonymized(_projectId);
        
        require(
            status == ProjectRegistry.ProjectStatus.Approved,
            "Project not approved"
        );
        require(msg.value >= budgetRequested, "Insufficient funds");
        
        funding.totalBudget = budgetRequested;
        funding.allocatedAmount = msg.value;
        funding.remainingAmount = msg.value;
        funding.isFunded = true;
        funding.fundedAt = block.timestamp;
        
        emit FundsAllocated(_projectId, msg.value, block.timestamp);
    }
    
    /**
     * @dev Create milestone for a project
     */
    function createMilestone(
        uint256 _projectId,
        string memory _description,
        uint256 _percentageAllocation
    ) 
        external 
        nonReentrant
        returns (uint256)
    {
        ProjectFunding storage funding = projectFunds[_projectId];
        require(funding.isFunded, "Project not funded");
        require(_percentageAllocation > 0 && _percentageAllocation <= 100, "Invalid percentage");
        require(bytes(_description).length > 0, "Description required");
        
        // Verify total percentage doesn't exceed 100%
        uint256 totalPercentage = 0;
        uint256[] memory milestones = projectMilestones[_projectId];
        for (uint256 i = 0; i < milestones.length; i++) {
            totalPercentage += funding.milestones[milestones[i]].percentageAllocation;
        }
        require(
            totalPercentage + _percentageAllocation <= 100,
            "Total percentage exceeds 100%"
        );
        
        milestoneCounter++;
        uint256 newMilestoneId = milestoneCounter;
        
        Milestone storage milestone = funding.milestones[newMilestoneId];
        milestone.milestoneId = newMilestoneId;
        milestone.projectId = _projectId;
        milestone.description = _description;
        milestone.percentageAllocation = _percentageAllocation;
        milestone.isCompleted = false;
        milestone.isApproved = false;
        
        projectMilestones[_projectId].push(newMilestoneId);
        funding.milestoneCount++;
        
        emit MilestoneCreated(_projectId, newMilestoneId, _description, _percentageAllocation);
        
        return newMilestoneId;
    }
    
    /**
     * @dev Mark milestone as completed with proof
     */
    function completeMilestone(
        uint256 _projectId,
        uint256 _milestoneId,
        string memory _verificationHash
    ) 
        external 
        nonReentrant
    {
        ProjectFunding storage funding = projectFunds[_projectId];
        Milestone storage milestone = funding.milestones[_milestoneId];
        
        require(milestone.projectId == _projectId, "Milestone not found");
        require(!milestone.isCompleted, "Milestone already completed");
        require(bytes(_verificationHash).length > 0, "Verification proof required");
        
        milestone.isCompleted = true;
        milestone.completionDate = block.timestamp;
        milestone.verificationHash = _verificationHash;
        milestone.completedBy = msg.sender;
        
        emit MilestoneCompleted(_projectId, _milestoneId, msg.sender, _verificationHash);
    }
    
    /**
     * @dev Approve milestone and release funds
     */
    function approveMilestone(uint256 _projectId, uint256 _milestoneId) 
        external 
        onlyRole(AUTHORITY_ROLE)
        nonReentrant
        whenNotPaused
    {
        ProjectFunding storage funding = projectFunds[_projectId];
        Milestone storage milestone = funding.milestones[_milestoneId];
        
        require(milestone.projectId == _projectId, "Milestone not found");
        require(milestone.isCompleted, "Milestone not completed");
        require(!milestone.isApproved, "Milestone already approved");
        
        milestone.isApproved = true;
        milestone.approvalDate = block.timestamp;
        milestone.approvedBy = msg.sender;
        
        emit MilestoneApproved(_projectId, _milestoneId, msg.sender);
        
        // Automatically release funds
        _releaseFunds(_projectId, _milestoneId);
    }
    
    /**
     * @dev Internal function to release funds to contractor
     */
    function _releaseFunds(uint256 _projectId, uint256 _milestoneId) 
        private 
    {
        ProjectFunding storage funding = projectFunds[_projectId];
        Milestone storage milestone = funding.milestones[_milestoneId];
        
        require(milestone.isApproved, "Milestone not approved");
        
        uint256 releaseAmount = (funding.totalBudget * milestone.percentageAllocation) / 100;
        require(funding.remainingAmount >= releaseAmount, "Insufficient funds");
        
        // Check daily withdrawal limit
        uint256 currentDay = block.timestamp / 1 days;
        if (lastWithdrawalDay[_projectId] != currentDay) {
            dailyWithdrawals[_projectId] = 0;
            lastWithdrawalDay[_projectId] = currentDay;
        }
        require(
            dailyWithdrawals[_projectId] + releaseAmount <= MAX_DAILY_WITHDRAWAL,
            "Daily withdrawal limit exceeded"
        );
        
        // Get contractor address
        address contractor = projectRegistry.getContractorWallet(_projectId);
        require(contractor != address(0), "Invalid contractor address");
        
        // Update state before transfer (CEI pattern)
        funding.releasedAmount += releaseAmount;
        funding.remainingAmount -= releaseAmount;
        dailyWithdrawals[_projectId] += releaseAmount;
        
        // Transfer funds
        (bool success, ) = payable(contractor).call{value: releaseAmount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(_projectId, _milestoneId, contractor, releaseAmount);
    }
    
    /**
     * @dev Emergency withdrawal by admin
     */
    function emergencyWithdraw(uint256 _projectId, string memory _reason) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        require(bytes(_reason).length > 0, "Reason required");
        
        ProjectFunding storage funding = projectFunds[_projectId];
        uint256 amount = funding.remainingAmount;
        require(amount > 0, "No funds to withdraw");
        
        funding.remainingAmount = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EmergencyWithdrawal(_projectId, msg.sender, amount, _reason);
    }
    
    /**
     * @dev Get project funding details
     */
    function getProjectFunding(uint256 _projectId) 
        external 
        view 
        returns (
            uint256 totalBudget,
            uint256 allocatedAmount,
            uint256 releasedAmount,
            uint256 remainingAmount,
            bool isFunded,
            uint256 fundedAt,
            uint256 milestoneCount
        ) 
    {
        ProjectFunding storage funding = projectFunds[_projectId];
        return (
            funding.totalBudget,
            funding.allocatedAmount,
            funding.releasedAmount,
            funding.remainingAmount,
            funding.isFunded,
            funding.fundedAt,
            funding.milestoneCount
        );
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 _projectId, uint256 _milestoneId) 
        external 
        view 
        returns (Milestone memory) 
    {
        return projectFunds[_projectId].milestones[_milestoneId];
    }
    
    /**
     * @dev Get all milestones for a project
     */
    function getProjectMilestones(uint256 _projectId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return projectMilestones[_projectId];
    }
    
    /**
     * @dev Get milestone completion percentage
     */
    function getMilestoneProgress(uint256 _projectId) 
        external 
        view 
        returns (uint256 completedPercentage, uint256 approvedPercentage) 
    {
        ProjectFunding storage funding = projectFunds[_projectId];
        uint256[] memory milestones = projectMilestones[_projectId];
        
        uint256 completed = 0;
        uint256 approved = 0;
        
        for (uint256 i = 0; i < milestones.length; i++) {
            Milestone storage milestone = funding.milestones[milestones[i]];
            if (milestone.isCompleted) {
                completed += milestone.percentageAllocation;
            }
            if (milestone.isApproved) {
                approved += milestone.percentageAllocation;
            }
        }
        
        return (completed, approved);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
