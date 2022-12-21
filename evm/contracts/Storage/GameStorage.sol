// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract GameStorage {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    /// @notice Contains pauser data
    /// @return PAUSER_ROLE pauser
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Contains minimum token amount allowed for one round
    /// @return minAmountForOneRound minimum token amount for one round
    uint256 public minAmountForOneRound;

    /// @notice Contains signer address
    /// @dev Needs for checking users signatures 
    /// @return signerAccess signer address
    address public signerAccess;

    /// @notice Contains fee wallet
    /// @return feeAddress fee wallet
    address public feeAddress;

    /// @notice Contains fee percent
    /// @dev If equals 100 fee = 1%
    /// @return fee
    uint16 public fee;

    /// @notice Contains the maximum number of consecutive deaths, which can be understood as rounds
    /// @return maxDeathInARow maximum number of consecutive deaths
    uint8 public maxDeathInARow;

    /// @notice We limit the number of games returned as data to prevent gas limitation errors.
    /// @return amountUserGamesToReturn maximum number of games to return
    uint8 public amountUserGamesToReturn;

    /// @notice Currently open battles amount for join
    CountersUpgradeable.Counter public openBattles;

    /// @notice Amount of user games
    mapping(address => uint32) public userBattles;

    /// @notice Shoes if user currently busy
    /// @dev User cant have more than 1 game in a moment
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

    /// @notice Contains all battles
    Battle[] public battles;
    
}