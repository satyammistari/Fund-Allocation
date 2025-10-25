// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DocumentVerification
 * @dev Manages document registry and verification for project documents
 */
contract DocumentVerification is AccessControl {
    
    enum DocumentType {
        PDF,
        LabReport,
        GeoTaggedPhoto,
        DigitalSignature,
        VendorInvoice,
        MilestoneProof,
        Other
    }
    
    struct DocumentMetadata {
        bytes32 documentHash;
        address uploadedBy;
        uint256 timestamp;
        DocumentType docType;
        uint256 projectId;
        string ipfsHash;
        bool isFlagged;
        string flagReason;
        address flaggedBy;
        bool isVerified;
        address verifiedBy;
    }
    
    struct GPSCoordinates {
        string latitude;
        string longitude;
        uint256 timestamp;
        uint256 projectId;
    }
    
    // State variables
    mapping(bytes32 => DocumentMetadata) private documents;
    mapping(uint256 => bytes32[]) private projectDocuments; // projectId => document hashes
    mapping(uint256 => GPSCoordinates) private projectLocations;
    bytes32[] private allDocumentHashes;
    
    // Events
    event DocumentRegistered(
        bytes32 indexed documentHash,
        address indexed uploader,
        DocumentType docType,
        uint256 indexed projectId,
        string ipfsHash
    );
    
    event DocumentFlagged(
        bytes32 indexed documentHash,
        address indexed flagger,
        string reason
    );
    
    event DocumentVerified(
        bytes32 indexed documentHash,
        address indexed verifier
    );
    
    event GPSCoordinatesRegistered(
        uint256 indexed projectId,
        string latitude,
        string longitude
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a document on the blockchain
     */
    function registerDocument(
        bytes32 _documentHash,
        DocumentType _docType,
        uint256 _projectId,
        string memory _ipfsHash
    ) 
        external 
        returns (bool) 
    {
        require(_documentHash != bytes32(0), "Invalid document hash");
        require(documents[_documentHash].timestamp == 0, "Document already registered");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        documents[_documentHash] = DocumentMetadata({
            documentHash: _documentHash,
            uploadedBy: msg.sender,
            timestamp: block.timestamp,
            docType: _docType,
            projectId: _projectId,
            ipfsHash: _ipfsHash,
            isFlagged: false,
            flagReason: "",
            flaggedBy: address(0),
            isVerified: false,
            verifiedBy: address(0)
        });
        
        projectDocuments[_projectId].push(_documentHash);
        allDocumentHashes.push(_documentHash);
        
        emit DocumentRegistered(
            _documentHash,
            msg.sender,
            _docType,
            _projectId,
            _ipfsHash
        );
        
        return true;
    }
    
    /**
     * @dev Verify a document with digital signature
     */
    function verifyDocument(bytes32 _documentHash, bytes memory _signature) 
        external 
        view 
        returns (bool) 
    {
        require(documents[_documentHash].timestamp != 0, "Document not found");
        
        // In production, implement actual signature verification
        // For now, return true if signature is provided
        return _signature.length > 0;
    }
    
    /**
     * @dev Register GPS coordinates for a project
     */
    function registerGPSCoordinates(
        uint256 _projectId,
        string memory _latitude,
        string memory _longitude
    ) 
        external 
    {
        require(bytes(_latitude).length > 0, "Latitude required");
        require(bytes(_longitude).length > 0, "Longitude required");
        
        projectLocations[_projectId] = GPSCoordinates({
            latitude: _latitude,
            longitude: _longitude,
            timestamp: block.timestamp,
            projectId: _projectId
        });
        
        emit GPSCoordinatesRegistered(_projectId, _latitude, _longitude);
    }
    
    /**
     * @dev Validate GPS coordinates proximity (simplified)
     */
    function validateGPSCoordinates(
        string memory _lat1,
        string memory _long1,
        string memory _lat2,
        string memory _long2
    ) 
        external 
        pure 
        returns (bool) 
    {
        // Simplified validation - in production, implement proper distance calculation
        // For now, check if coordinates are not empty
        return (
            bytes(_lat1).length > 0 &&
            bytes(_long1).length > 0 &&
            bytes(_lat2).length > 0 &&
            bytes(_long2).length > 0
        );
    }
    
    /**
     * @dev Check document integrity
     */
    function checkDocumentIntegrity(bytes32 _documentHash) 
        external 
        view 
        returns (bool exists, bool isFlagged, bool isVerified) 
    {
        DocumentMetadata memory doc = documents[_documentHash];
        return (
            doc.timestamp != 0,
            doc.isFlagged,
            doc.isVerified
        );
    }
    
    /**
     * @dev Get document metadata
     */
    function getDocumentMetadata(bytes32 _documentHash) 
        external 
        view 
        returns (DocumentMetadata memory) 
    {
        require(documents[_documentHash].timestamp != 0, "Document not found");
        return documents[_documentHash];
    }
    
    /**
     * @dev Flag a suspicious document
     */
    function flagDocument(bytes32 _documentHash, string memory _reason) 
        external 
    {
        require(documents[_documentHash].timestamp != 0, "Document not found");
        require(!documents[_documentHash].isFlagged, "Document already flagged");
        require(bytes(_reason).length > 0, "Reason required");
        
        documents[_documentHash].isFlagged = true;
        documents[_documentHash].flagReason = _reason;
        documents[_documentHash].flaggedBy = msg.sender;
        
        emit DocumentFlagged(_documentHash, msg.sender, _reason);
    }
    
    /**
     * @dev Verify a document (authority only)
     */
    function markDocumentVerified(bytes32 _documentHash) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(documents[_documentHash].timestamp != 0, "Document not found");
        require(!documents[_documentHash].isVerified, "Already verified");
        
        documents[_documentHash].isVerified = true;
        documents[_documentHash].verifiedBy = msg.sender;
        
        emit DocumentVerified(_documentHash, msg.sender);
    }
    
    /**
     * @dev Get all documents for a project
     */
    function getProjectDocuments(uint256 _projectId) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return projectDocuments[_projectId];
    }
    
    /**
     * @dev Get GPS coordinates for a project
     */
    function getProjectGPSCoordinates(uint256 _projectId) 
        external 
        view 
        returns (GPSCoordinates memory) 
    {
        return projectLocations[_projectId];
    }
    
    /**
     * @dev Audit complete document history for a project
     */
    function auditDocumentHistory(uint256 _projectId) 
        external 
        view 
        returns (DocumentMetadata[] memory) 
    {
        bytes32[] memory docHashes = projectDocuments[_projectId];
        DocumentMetadata[] memory history = new DocumentMetadata[](docHashes.length);
        
        for (uint256 i = 0; i < docHashes.length; i++) {
            history[i] = documents[docHashes[i]];
        }
        
        return history;
    }
    
    /**
     * @dev Get total number of documents
     */
    function getTotalDocuments() external view returns (uint256) {
        return allDocumentHashes.length;
    }
    
    /**
     * @dev Get flagged documents count for a project
     */
    function getFlaggedDocumentsCount(uint256 _projectId) 
        external 
        view 
        returns (uint256) 
    {
        bytes32[] memory docHashes = projectDocuments[_projectId];
        uint256 flaggedCount = 0;
        
        for (uint256 i = 0; i < docHashes.length; i++) {
            if (documents[docHashes[i]].isFlagged) {
                flaggedCount++;
            }
        }
        
        return flaggedCount;
    }
    
    /**
     * @dev Compute document hash from IPFS hash
     */
    function computeDocumentHash(string memory _ipfsHash) 
        external 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(_ipfsHash));
    }
}
