// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ProjectRegistry.sol";

/**
 * @title ApprovalWorkflow
 * @dev Manages anonymous project review and approval process with anti-corruption features
 */
contract ApprovalWorkflow is AccessControl, ReentrancyGuard {
    bytes32 public constant HIGHER_AUTHORITY_ROLE = keccak256("HIGHER_AUTHORITY_ROLE");
    
    ProjectRegistry public projectRegistry;
    
    struct AuthorityInfo {
        address authorityAddress;
        uint256 pendingReviews;
        uint256 totalReviewed;
        uint256 approvalCount;
        uint256 rejectionCount;
        bool isActive;
        uint256 lastAssignedTime;
    }
    
    struct ReviewRecord {
        uint256 projectId;
        address authority;
        uint256 submittedAt;
        uint256 reviewedAt;
        bool isApproved;
        string comments;
        bool requiresMultiSig;
        address secondAuthority;
        bool secondApproval;
    }
    
    // State variables
    address[] private authorities;
    mapping(address => AuthorityInfo) public authorityInfo;
    mapping(uint256 => address) public projectAssignments; // projectId => authority
    mapping(uint256 => ReviewRecord) public reviewRecords;
    mapping(uint256 => bool) public isUnderReview;
    
    uint256 public constant MINIMUM_REVIEW_TIME = 24 hours;
    uint256 public constant LARGE_PROJECT_THRESHOLD = 10000 ether; // Requires multi-sig
    uint256 private lastAuthorityIndex;
    
    // Events
    event AuthorityRegistered(address indexed authority);
    event AuthorityRemoved(address indexed authority);
    event AuthorityAssigned(uint256 indexed projectId, address indexed authority);
    event ProjectApproved(
        uint256 indexed projectId,
        address indexed authority,
        uint256 timestamp,
        string comments
    );
    event ProjectRejected(
        uint256 indexed projectId,
        address indexed authority,
        string reason
    );
    event RevisionRequested(
        uint256 indexed projectId,
        address indexed authority,
        string comments
    );
    event SecondAuthorityAssigned(
        uint256 indexed projectId,
        address indexed secondAuthority
    );
    event MultiSigApprovalCompleted(uint256 indexed projectId);
    
    constructor(address _projectRegistryAddress) {
        projectRegistry = ProjectRegistry(_projectRegistryAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new higher authority
     */
    function registerAuthority(address _authority) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_authority != address(0), "Invalid address");
        require(!authorityInfo[_authority].isActive, "Authority already registered");
        
        authorities.push(_authority);
        authorityInfo[_authority] = AuthorityInfo({
            authorityAddress: _authority,
            pendingReviews: 0,
            totalReviewed: 0,
            approvalCount: 0,
            rejectionCount: 0,
            isActive: true,
            lastAssignedTime: 0
        });
        
        _grantRole(HIGHER_AUTHORITY_ROLE, _authority);
        
        emit AuthorityRegistered(_authority);
    }
    
    /**
     * @dev Remove an authority
     */
    function removeAuthority(address _authority) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(authorityInfo[_authority].isActive, "Authority not active");
        require(authorityInfo[_authority].pendingReviews == 0, "Authority has pending reviews");
        
        authorityInfo[_authority].isActive = false;
        _revokeRole(HIGHER_AUTHORITY_ROLE, _authority);
        
        emit AuthorityRemoved(_authority);
    }
    
    /**
     * @dev Submit project for approval with random authority assignment
     */
    function submitForApproval(uint256 _projectId) 
        external 
        nonReentrant 
        returns (address assignedAuthority) 
    {
        require(!isUnderReview[_projectId], "Project already under review");
        require(authorities.length > 0, "No authorities available");
        
        // Get project details to check budget
        (
            ,
            ,
            ,
            uint256 budgetRequested,
            ,
            ,
        ) = projectRegistry.getProjectAnonymized(_projectId);
        
        // Assign random authority
        assignedAuthority = _assignRandomAuthority(_projectId);
        
        // Check if multi-signature required for large projects
        bool requiresMultiSig = budgetRequested >= LARGE_PROJECT_THRESHOLD;
        
        reviewRecords[_projectId] = ReviewRecord({
            projectId: _projectId,
            authority: assignedAuthority,
            submittedAt: block.timestamp,
            reviewedAt: 0,
            isApproved: false,
            comments: "",
            requiresMultiSig: requiresMultiSig,
            secondAuthority: address(0),
            secondApproval: false
        });
        
        isUnderReview[_projectId] = true;
        authorityInfo[assignedAuthority].pendingReviews++;
        
        // Update project status in registry
        projectRegistry.updateProjectStatus(
            _projectId,
            ProjectRegistry.ProjectStatus.UnderReview,
            ""
        );
        
        emit AuthorityAssigned(_projectId, assignedAuthority);
        
        return assignedAuthority;
    }
    
    /**
     * @dev Approve a project
     */
    function approveProject(uint256 _projectId, string memory _comments) 
        external 
        onlyRole(HIGHER_AUTHORITY_ROLE) 
        nonReentrant 
    {
        ReviewRecord storage review = reviewRecords[_projectId];
        require(isUnderReview[_projectId], "Project not under review");
        require(review.authority == msg.sender, "Not assigned to you");
        require(
            block.timestamp >= review.submittedAt + MINIMUM_REVIEW_TIME,
            "Minimum review time not elapsed"
        );
        
        // Check if multi-sig required
        if (review.requiresMultiSig && review.secondAuthority == address(0)) {
            // Assign second authority
            address secondAuth = _assignSecondAuthority(_projectId, msg.sender);
            review.secondAuthority = secondAuth;
            authorityInfo[secondAuth].pendingReviews++;
            
            emit SecondAuthorityAssigned(_projectId, secondAuth);
            return;
        }
        
        // If second authority, mark second approval
        if (review.requiresMultiSig && review.secondAuthority == msg.sender) {
            review.secondApproval = true;
            emit MultiSigApprovalCompleted(_projectId);
        }
        
        // Complete approval if no multi-sig or both approved
        if (!review.requiresMultiSig || (review.requiresMultiSig && review.secondApproval)) {
            review.isApproved = true;
            review.reviewedAt = block.timestamp;
            review.comments = _comments;
            isUnderReview[_projectId] = false;
            
            // Update authority stats
            authorityInfo[review.authority].pendingReviews--;
            authorityInfo[review.authority].totalReviewed++;
            authorityInfo[review.authority].approvalCount++;
            
            if (review.requiresMultiSig) {
                authorityInfo[review.secondAuthority].pendingReviews--;
                authorityInfo[review.secondAuthority].totalReviewed++;
                authorityInfo[review.secondAuthority].approvalCount++;
            }
            
            // Update project status
            projectRegistry.updateProjectStatus(
                _projectId,
                ProjectRegistry.ProjectStatus.Approved,
                _comments
            );
            
            emit ProjectApproved(_projectId, msg.sender, block.timestamp, _comments);
        }
    }
    
    /**
     * @dev Reject a project
     */
    function rejectProject(uint256 _projectId, string memory _reason) 
        external 
        onlyRole(HIGHER_AUTHORITY_ROLE) 
        nonReentrant 
    {
        ReviewRecord storage review = reviewRecords[_projectId];
        require(isUnderReview[_projectId], "Project not under review");
        require(review.authority == msg.sender, "Not assigned to you");
        require(bytes(_reason).length > 0, "Rejection reason required");
        
        review.isApproved = false;
        review.reviewedAt = block.timestamp;
        review.comments = _reason;
        isUnderReview[_projectId] = false;
        
        // Update authority stats
        authorityInfo[review.authority].pendingReviews--;
        authorityInfo[review.authority].totalReviewed++;
        authorityInfo[review.authority].rejectionCount++;
        
        // Update project status
        projectRegistry.updateProjectStatus(
            _projectId,
            ProjectRegistry.ProjectStatus.Rejected,
            _reason
        );
        
        emit ProjectRejected(_projectId, msg.sender, _reason);
    }
    
    /**
     * @dev Request revision from project manager
     */
    function requestRevision(uint256 _projectId, string memory _comments) 
        external 
        onlyRole(HIGHER_AUTHORITY_ROLE) 
    {
        ReviewRecord storage review = reviewRecords[_projectId];
        require(isUnderReview[_projectId], "Project not under review");
        require(review.authority == msg.sender, "Not assigned to you");
        require(bytes(_comments).length > 0, "Comments required");
        
        projectRegistry.addRevisionComments(_projectId, _comments);
        
        emit RevisionRequested(_projectId, msg.sender, _comments);
    }
    
    /**
     * @dev Get assigned authority for a project
     */
    function getAssignedAuthority(uint256 _projectId) 
        external 
        view 
        returns (address) 
    {
        return reviewRecords[_projectId].authority;
    }
    
    /**
     * @dev Get authority workload
     */
    function getAuthorityWorkload(address _authority) 
        external 
        view 
        returns (uint256 pending, uint256 total, uint256 approved, uint256 rejected) 
    {
        AuthorityInfo memory info = authorityInfo[_authority];
        return (
            info.pendingReviews,
            info.totalReviewed,
            info.approvalCount,
            info.rejectionCount
        );
    }
    
    /**
     * @dev Get all active authorities
     */
    function getActiveAuthorities() external view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < authorities.length; i++) {
            if (authorityInfo[authorities[i]].isActive) {
                activeCount++;
            }
        }
        
        address[] memory activeAuthorities = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < authorities.length; i++) {
            if (authorityInfo[authorities[i]].isActive) {
                activeAuthorities[index] = authorities[i];
                index++;
            }
        }
        
        return activeAuthorities;
    }
    
    /**
     * @dev Get review record for a project
     */
    function getReviewRecord(uint256 _projectId) 
        external 
        view 
        returns (ReviewRecord memory) 
    {
        return reviewRecords[_projectId];
    }
    
    /**
     * @dev Internal: Assign random authority (round-robin with workload balancing)
     */
    function _assignRandomAuthority(uint256 _projectId) 
        private 
        returns (address) 
    {
        require(authorities.length > 0, "No authorities available");
        
        // Find authority with lowest workload
        address selectedAuthority;
        uint256 lowestWorkload = type(uint256).max;
        uint256 startIndex = (lastAuthorityIndex + 1) % authorities.length;
        
        for (uint256 i = 0; i < authorities.length; i++) {
            uint256 index = (startIndex + i) % authorities.length;
            address authority = authorities[index];
            
            if (authorityInfo[authority].isActive) {
                uint256 workload = authorityInfo[authority].pendingReviews;
                
                // Prevent same authority reviewing consecutive projects
                if (workload < lowestWorkload && 
                    block.timestamp > authorityInfo[authority].lastAssignedTime + 1 hours) {
                    lowestWorkload = workload;
                    selectedAuthority = authority;
                    lastAuthorityIndex = index;
                }
            }
        }
        
        require(selectedAuthority != address(0), "No suitable authority found");
        
        authorityInfo[selectedAuthority].lastAssignedTime = block.timestamp;
        projectAssignments[_projectId] = selectedAuthority;
        
        return selectedAuthority;
    }
    
    /**
     * @dev Internal: Assign second authority for multi-sig (different from first)
     */
    function _assignSecondAuthority(uint256 _projectId, address _firstAuthority) 
        private 
        returns (address) 
    {
        for (uint256 i = 0; i < authorities.length; i++) {
            address authority = authorities[i];
            if (authorityInfo[authority].isActive && authority != _firstAuthority) {
                return authority;
            }
        }
        revert("No second authority available");
    }
}
