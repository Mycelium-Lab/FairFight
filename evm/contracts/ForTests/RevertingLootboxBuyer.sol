// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface ICommitRevealLootbox {
    function commitBuy(bytes32 commitment) external;

    function reveal(bytes32 secret) external returns (address nft, uint256 propertyId);
}

/// @dev Test-only wrapper that models a buyer reverting after seeing a draw.
contract RevertingLootboxBuyer is IERC721Receiver {
    ICommitRevealLootbox public immutable lootbox;

    constructor(ICommitRevealLootbox lootbox_) {
        lootbox = lootbox_;
    }

    function approveAndCommit(IERC20 token, uint256 price, bytes32 commitment) external {
        token.approve(address(lootbox), price);
        lootbox.commitBuy(commitment);
    }

    function previewReveal(bytes32 secret) external returns (address nft, uint256 propertyId) {
        return lootbox.reveal(secret);
    }

    function revealAndRevert(bytes32 secret) external {
        lootbox.reveal(secret);
        revert("RevertingLootboxBuyer: reject draw");
    }

    function reveal(bytes32 secret) external returns (address nft, uint256 propertyId) {
        return lootbox.reveal(secret);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
