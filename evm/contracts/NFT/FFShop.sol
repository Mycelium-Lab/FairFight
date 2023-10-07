// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IFFNFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FairFightShop is Ownable {

    using SafeERC20 for IERC20;

    event Buy(
        address indexed buyer, 
        IFFNFT indexed propertyType,
        IERC20 indexed token, 
        uint256 propertyID,
        uint256 price
    );

    error NotAllowedBuy();
    error ShopNotWorking();

    address private collector;
    /// @dev isShop works
    bool private work;
    /// @notice PropertyType(Character, Weapon, Armor, Boot) => token(ERC-20) => amounts[] (each propertyID)
    mapping (IFFNFT => mapping(IERC20 => uint256[])) public prices;

    constructor(
        IFFNFT characters,
        IFFNFT weapons,
        IFFNFT armors,
        IFFNFT boots,
        IERC20 token,
        uint256[] memory charactersPrices,
        uint256[] memory weaponsPrices,
        uint256[] memory armorsPrices,
        uint256[] memory bootsPrices,
        address _collector
    ) {
        prices[characters][token] = charactersPrices;
        prices[weapons][token] = weaponsPrices;
        prices[armors][token] = armorsPrices;
        prices[boots][token] = bootsPrices;
        collector = _collector;
        work = true;
    }

    function setAllPrices(IFFNFT propertyType, IERC20 token, uint256[] memory _prices) external onlyOwner {
        prices[propertyType][token] = _prices;
    }

    /// @dev to disable the sale of this property, enter the price 0
    function setPrice(IFFNFT propertyType, IERC20 token, uint256 propertyID, uint256 _price) external onlyOwner {
        prices[propertyType][token][propertyID] = _price;
    }

    function setCollector(address _collector) external onlyOwner {
        collector = _collector;
    }

    function setWorkStatus(bool _work) external onlyOwner {
        work = _work;
    }

    function buy(IFFNFT propertyType, IERC20 token, uint256 propertyID) external payable checkWork {
        uint256 price = prices[propertyType][token][propertyID];
        if (price == 0) revert NotAllowedBuy();
        if (address(token) != address(0)) {
            token.safeTransferFrom(msg.sender, collector, price);
        } else {
            require(msg.value == price, "FFShop: Value not equal price");
            (bool success, ) = payable(collector).call{value: price}("");
            require(success, "FFShop: Not success sending to collector");
        }
        propertyType.mint(msg.sender, propertyID);
        emit Buy(msg.sender, propertyType, token, propertyID, price);
    }

    modifier checkWork() {
        if (!work) revert ShopNotWorking();
        _;
    }

}