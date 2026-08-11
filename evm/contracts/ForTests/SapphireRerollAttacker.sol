// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface ISapphireLootbox {
    function buyNative() external payable;
}

/// @dev Test-only wrapper that models a buyer inspecting a draw and rolling it back.
contract SapphireRerollAttacker {
    ISapphireLootbox public immutable lootbox;

    constructor(ISapphireLootbox lootbox_) {
        lootbox = lootbox_;
    }

    receive() external payable {}

    function attemptAndReject() external payable {
        lootbox.buyNative{value: msg.value}();
        revert("SapphireRerollAttacker: reject draw");
    }

    /// @notice One attempt whose payment and mint are both rolled back.
    function grind(uint256 value) external returns (bool succeeded) {
        try this.attemptAndReject{value: value}() {
            succeeded = true;
        } catch {
            succeeded = false;
        }
    }
}
