// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FairFightCharacter is ERC721, Ownable {

    uint256 currentID = 1;
    constructor() ERC721("FairFightCharacter", "FFC") {}

    function mint(address _to, uint256 _character) internal returns(uint256 ID) {
        require(addressTokenIds[_to][_character] == 0, "FairFightCharacter: You already have this character");
        ID = currentID;
        _safeMint(_to, ID);
        tokenCharacter[ID] = _character;
        addressTokenIds[_to][_character] = ID;
        currentID += 1;
    }

    function setCharacterUri(uint256 character, string memory uri) external onlyOwner {
        characterURIs[character] = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        uint256 character = tokenCharacter[tokenId];
        return characterURIs[character];
    }

}

contract FairFightCharacterShop is FairFightCharacter {

    using SafeERC20 for IERC20;

    constructor(address _collector) {
        collector = _collector;
    }

    //EVENTS
    event Buy(address indexed buyer, IERC20 indexed token, uint256 amount, uint256 ID, uint256 indexed character);

    //ERRORS
    error NotAllowedToken(IERC20 token);
    error ShopNotWorking();

    //STATE
    /// @notice Contains allowed token to pay. With mimimum amount.
    /// @dev Token => character type => tokens amount.
    mapping(IERC20 => mapping(uint256 => uint256)) public allowedTokens;
    /// @dev False if allowed to buy, true if not allowed. 
    bool private notWorks; 
    address private collector;

    function buy(IERC20 token, uint256 character) external returns(uint256 ID) {
        isShopWorks();
        uint256 amount = isAllowedToken(token, character);
        token.safeTransferFrom(msg.sender, collector, amount);
        ID = mint(msg.sender, character);
        emit Buy(msg.sender, token, amount, ID, character);
    }

    function isShopWorks() private view {
        if (notWorks) revert ShopNotWorking();
    }

    function isAllowedToken(IERC20 _token, uint256 _character) private view returns (uint256 _amount) {
        _amount = allowedTokens[_token][_character];
        if (_amount == 0) revert NotAllowedToken(_token);
    }

    function setWorkStatus(bool status) external onlyOwner {
        notWorks = status;
    }

    function setCollector(address _collector) external onlyOwner {
        collector = _collector;
    }

    function setAllowedToken(IERC20 token, uint256 character, uint256 amount) external onlyOwner {
        allowedTokens[token][character] = amount;
    }

}