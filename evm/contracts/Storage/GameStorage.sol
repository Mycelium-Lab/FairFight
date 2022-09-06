// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract GameStorage {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    uint256 public amountToPlay;
    address public signerAccess;

    CountersUpgradeable.Counter public openBattles;
    mapping(address => uint32) public userBattles;

    struct Battle {
        uint256 ID;
        address player1;
        address player2;
        address winner;
        uint256 player1Amount;
        uint256 player2Amount;
        bool finished;
    }

    Battle[] public battles;
    
}