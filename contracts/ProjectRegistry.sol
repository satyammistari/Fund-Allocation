// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProjectRegistry
 * @dev Manages project submissions with comprehensive document storage
 */
contract ProjectRegistry is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant PROJECT_MANAGER_ROLE = keccak256("PROJECT_MANAGER_ROLE");
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    
    enum ProjectStatus {
        Pending,
        UnderReview,
        Approved,
        Rejected,
        InProgress,
        Completed
    }
    
    struct DocumentStorage {
        string pdfDocumentHash;      // Main project document
        string labReportHash;         // Lab/technical report
        string[] geoTaggedPhotoHashes; // Array of photo hashes
        bytes digitalSignatureHash;   // Digital signature
        string vendorInvoiceHash;     // Invoice document
        string gpsLatitude;           // GPS coordinates
        string gpsLongitude;
    }
    
    struct Project {
        uint256 projectId;
        address projectManager;
        string title;
        string description;
        uint256 budgetRequested;
        ProjectStatus status;
        uint256 createdAt;
        uint256 approvedAt;
        address contractorWallet;     // Hidden during review
        DocumentStorage documents;
        string rejectionReason;
        string revisionComments;
    }
    
    // State variables
    uint256 private projectCounter;
    mapping(uint256 => Project) private projects;
    mapping(address => uint256[]) private managerProjects;
    mapping(ProjectStatus => uint256[]) private projectsByStatus;
    
    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed projectManager,
        string title,
        uint256 budgetRequested
    );
    
    event ProjectSubmittedForReview(
        uint256 indexed projectId,
        address indexed assignedAuthority
    );
    
    event DocumentsUploaded(
        uint256 indexed projectId,
        string[] ipfsHashes
    );
    
    event ProjectStatusUpdated(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new project with all documentation
     */
    function createProject(
        string memory _title,
        string memory _description,
        uint256 _budgetRequested,
        address _contractorWallet,
        string memory _pdfDocumentHash,
        string memory _labReportHash,
        string[] memory _geoTaggedPhotoHashes,
        bytes memory _digitalSignatureHash,
        string memory _vendorInvoiceHash,
        string memory _gpsLatitude,
        string memory _gpsLongitude
    ) external whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_budgetRequested > 0, "Budget must be greater than 0");
        require(_contractorWallet != address(0), "Invalid contractor address");
        require(bytes(_pdfDocumentHash).length > 0, "PDF document required");
        
        projectCounter++;
        uint256 newProjectId = projectCounter;
        
        DocumentStorage memory docs = DocumentStorage({
            pdfDocumentHash: _pdfDocumentHash,
            labReportHash: _labReportHash,
            geoTaggedPhotoHashes: _geoTaggedPhotoHashes,
            digitalSignatureHash: _digitalSignatureHash,
            vendorInvoiceHash: _vendorInvoiceHash,
            gpsLatitude: _gpsLatitude,
            gpsLongitude: _gpsLongitude
        });
        
        Project storage newProject = projects[newProjectId];
        newProject.projectId = newProjectId;
        newProject.projectManager = msg.sender;
        newProject.title = _title;
        newProject.description = _description;
        newProject.budgetRequested = _budgetRequested;
        newProject.status = ProjectStatus.Pending;
        newProject.createdAt = block.timestamp;
        newProject.contractorWallet = _contractorWallet;
        newProject.documents = docs;
        
        managerProjects[msg.sender].push(newProjectId);
        projectsByStatus[ProjectStatus.Pending].push(newProjectId);
        
        emit ProjectCreated(newProjectId, msg.sender, _title, _budgetRequested);
        emit DocumentsUploaded(newProjectId, _geoTaggedPhotoHashes);
        
        return newProjectId;
    }
    
    /**
     * @dev Get full project details (admin/manager only)
     */
    function getProject(uint256 _projectId) 
        external 
        view 
        returns (Project memory) 
    {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        Project memory project = projects[_projectId];
        
        // Only manager, admin, or assigned authority can see full details
        require(
            msg.sender == project.projectManager ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
            hasRole(AUTHORITY_ROLE, msg.sender),
            "Unauthorized"
        );
        
        return project;
    }
    
    /**
     * @dev Get anonymized project (contractor address hidden)
     */
    function getProjectAnonymized(uint256 _projectId) 
        external 
        view 
        returns (
            uint256 projectId,
            string memory title,
            string memory description,
            uint256 budgetRequested,
            ProjectStatus status,
            uint256 createdAt,
            DocumentStorage memory documents
        ) 
    {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        Project memory project = projects[_projectId];
        
        return (
            project.projectId,
            project.title,
            project.description,
            project.budgetRequested,
            project.status,
            project.createdAt,
            project.documents
        );
    }
    
    /**
     * @dev Update project status (internal or authorized only)
     */
    function updateProjectStatus(
        uint256 _projectId,
        ProjectStatus _newStatus,
        string memory _comments
    ) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
            hasRole(AUTHORITY_ROLE, msg.sender),
            "Unauthorized"
        );
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        
        Project storage project = projects[_projectId];
        ProjectStatus oldStatus = project.status;
        
        project.status = _newStatus;
        
        if (_newStatus == ProjectStatus.Approved) {
            project.approvedAt = block.timestamp;
        } else if (_newStatus == ProjectStatus.Rejected) {
            project.rejectionReason = _comments;
        }
        
        // Update status mapping
        _removeFromStatusArray(oldStatus, _projectId);
        projectsByStatus[_newStatus].push(_projectId);
        
        emit ProjectStatusUpdated(_projectId, oldStatus, _newStatus);
    }
    
    /**
     * @dev Get projects by status
     */
    function getProjectsByStatus(ProjectStatus _status) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return projectsByStatus[_status];
    }
    
    /**
     * @dev Get projects by manager
     */
    function getProjectsByManager(address _manager) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return managerProjects[_manager];
    }
    
    /**
     * @dev Get total number of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return projectCounter;
    }
    
    /**
     * @dev Get contractor wallet (only after approval for transparency)
     */
    function getContractorWallet(uint256 _projectId) 
        external 
        view 
        returns (address) 
    {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        Project memory project = projects[_projectId];
        
        // Only show contractor after approval (for public transparency)
        require(
            project.status == ProjectStatus.Approved ||
            project.status == ProjectStatus.InProgress ||
            project.status == ProjectStatus.Completed ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Contractor info not yet public"
        );
        
        return project.contractorWallet;
    }
    
    /**
     * @dev Add revision comments
     */
    function addRevisionComments(uint256 _projectId, string memory _comments) 
        external 
    {
        require(hasRole(AUTHORITY_ROLE, msg.sender), "Only authority can add comments");
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        
        projects[_projectId].revisionComments = _comments;
    }
    
    /**
     * @dev Internal function to remove project from status array
     */
    function _removeFromStatusArray(ProjectStatus _status, uint256 _projectId) 
        private 
    {
        uint256[] storage statusArray = projectsByStatus[_status];
        for (uint256 i = 0; i < statusArray.length; i++) {
            if (statusArray[i] == _projectId) {
                statusArray[i] = statusArray[statusArray.length - 1];
                statusArray.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Grant project manager role
     */
    function grantProjectManagerRole(address _manager) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        grantRole(PROJECT_MANAGER_ROLE, _manager);
    }
    
    /**
     * @dev Pause contract (emergency)
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
}
