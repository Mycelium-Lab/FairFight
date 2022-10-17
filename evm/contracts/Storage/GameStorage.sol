// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract GameStorage {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public minAmountForOneRound;
    address public signerAccess;
    address public feeAddress;
    uint16 public fee; //if equals 100 -> 1%
    uint8 public maxDeathInARow;
    //amount user games to return
    uint8 public amountUserGamesToReturn;

    //currently open battles for join
    CountersUpgradeable.Counter public openBattles;
    //amount of user games
    mapping(address => uint32) public userBattles;
    //user cant have more than 1 game in a moment
    mapping(address => bool) public currentlyBusy;

    struct Battle {
        uint256 ID;
        address player1;
        address player2;
        address winner;
        uint256 player1Amount;
        uint256 player2Amount;
        bool finished;
        uint256 battleCreatedTimestamp;
        uint256 battleFinishedTimestamp;
        uint256 amountForOneDeath;
    }

    Battle[] public battles;
    
}