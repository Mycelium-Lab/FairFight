// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../Interfaces/IFairFight.sol";

abstract contract FairFightStorage is IFairFight {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 internal constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Contains minimum token amount allowed for one round
    /// @return minAmountPerRound minimum token amount for one round
    uint256 public minAmountPerRound;

    address internal signer;

    address internal feeCollector;
    
    uint256 internal fee;

    /// @notice Contains of maximum players
    /// @return maxPlayers
    uint256 public maxPlayers;

    /// @notice Contains the maximum number of consecutive deaths, which can be understood as rounds
    /// @return maxDeath maximum number of consecutive deaths
    uint256 public maxRounds;

    /// @notice User fights
    mapping(address => uint256[]) public playerFullFights;
    mapping(uint256 => bool) internal ownerAddedFight;
    mapping(address => uint256) public lastPlayerFight;

    /// @notice Shoes if user currently busy
    /// @dev User cant have more than 1 game in a moment
    mapping(address => bool) public currentlyBusy;

    mapping(address => mapping(uint256 => uint256)) public playerFightAmount;
    mapping(uint256 => address[]) public players;

    /// @notice Contains all fights
    Fight[] public fights;
    
}