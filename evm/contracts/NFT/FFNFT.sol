// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./token/ERC721.sol";
import "./IFFNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FairFightNFT is IFFNFT, ERC721, Ownable {

    using Strings for uint256;

    mapping(address => bool) private allowedMint;
    string public baseURI;
    uint256 currentID = 1;
    uint256 maxSupply;
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
        require(propertyToken[to][propertyTypeId] == 0, "FairFightNFT: You already have this character");
        ID = currentID;
        _safeMint(to, ID);
        tokenProperty[ID] = propertyTypeId;
        propertyToken[to][propertyTypeId] = ID;
        currentID += 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        uint256 character = tokenProperty[tokenId];
        return string(abi.encodePacked(baseURI, character.toString(), ".json"));
    }

    modifier checkMinter() {
        require(allowedMint[msg.sender], "FairFightNFT: Not allowed to mint");
        _;
    }

}
