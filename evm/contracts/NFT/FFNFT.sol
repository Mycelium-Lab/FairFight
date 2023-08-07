// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FairFightNFT is ERC721, Ownable {

    using Strings for uint256;

    uint256 public maxSupply;
    uint256 currentID = 1;
    string public baseURI;
    /// @notice propertyID baseURI
    string public propertyBaseURI;
    /// @notice Address to propertyID to tokenIds[]
    mapping(address => mapping(uint256 => uint256[])) public ownerPropertyTokens;
    /// @notice Token to propertyID
    mapping(uint256 => uint256) public tokenProperty;
    /// @notice Token to index in array of ownerPropertyTokens
    mapping(uint256 => uint256) public tokenIndex;
    mapping(address => bool) allowedMint;

    constructor(
        string memory _name, 
        string memory _symbol,
        string memory baseURI_,
        uint256 maxSupply_
    ) ERC721(_name, _symbol) {
        baseURI = baseURI_;
        maxSupply = maxSupply_;
    }

    function setAllowedMint(address minter, bool allowed) external onlyOwner {
        allowedMint[minter] = allowed;
    }

    function setBaseUri(string memory uri) external onlyOwner {
        baseURI = uri;
    }

    function setMaxSupply(uint256 maxSupply_) external onlyOwner {
        require(maxSupply_ > currentID, "FairFightNFT: Too little max supply");
        maxSupply = maxSupply_;
    }

    function mint(address to, uint256 propertyTypeId) external checkMinter returns(uint256 ID) {
        require(currentID <= maxSupply, "FairFightNFT: MaxSupply exceeded");
        ID = currentID;
        _safeMint(to, ID);
        tokenProperty[ID] = propertyTypeId;
        uint256 index = ownerPropertyTokens[to][propertyTypeId].length;
        ownerPropertyTokens[to][propertyTypeId].push(ID);
        tokenIndex[ID] = index;
        currentID += 1;
    }

    function getOwnerPropertyTokensLength(address owner, uint256 property) external view returns(uint256) {
        return ownerPropertyTokens[owner][property].length;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        uint256 character = tokenProperty[tokenId];
        return string(abi.encodePacked(baseURI, character.toString(), ".json"));
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256
    ) internal override {
        //means if not mint
        if (from != address(0)) {
            uint256 propertyId = tokenProperty[firstTokenId];
            _deleteOwnerPropertyToken(from, propertyId, firstTokenId);
            uint256 index = ownerPropertyTokens[to][propertyId].length;
            ownerPropertyTokens[to][propertyId].push(firstTokenId);
            tokenIndex[firstTokenId] = index;
        }
    }

    function _deleteOwnerPropertyToken(address from, uint256 propertyId, uint256 tokenId) private {
        uint256[] storage _ownerPropertyToken = ownerPropertyTokens[from][propertyId];
        uint256 index = tokenIndex[tokenId];
        uint256 _length = _ownerPropertyToken.length - 1;
        if(index != _length){
            _ownerPropertyToken[index] = _ownerPropertyToken[_length];
            tokenIndex[_ownerPropertyToken[index]] = index;
        }
        _ownerPropertyToken.pop();
    }

    modifier checkMinter() {
        require(allowedMint[msg.sender], "FairFightNFT: Not allowed to mint");
        _;
    }

}
