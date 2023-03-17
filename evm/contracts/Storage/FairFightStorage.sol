// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../Interfaces/IFairFight.sol";

abstract contract FairFightStorage is IFairFight {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 internal constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Contains minimum token amount allowed for one round.
    /// @return minAmountPerRound - Minimum token amount for one round.
    uint256 public minAmountPerRound;

    address internal signer;

    address internal feeCollector;
    
    uint256 internal fee;

    /// @notice Contains maximum players allowed to join fight.
    /// @return maxPlayers - Maximum players to join.
    uint256 public maxPlayers;

    /// @notice Contains the maximum number of rounds.
    /// @return maxRounds - Maximum number of rounds.
    uint256 public maxRounds;

    /// @notice PLayer full fights, by full means that fight was played with another players, not created and withdrawn.
    mapping(address => uint256[]) internal playerFullFights;

    /// @notice Contains last played fight ID by player. This ID allows us to see current fight of player.
    mapping(address => uint256) public lastPlayerFight;

    /// @notice Shoes if player currently busy.
    /// @dev Player cant have more than one game in a moment.
    mapping(address => bool) internal currentlyBusy;

    /// @notice Contains data of claimed amount. If player finished game it will be true.
    mapping(address => mapping(uint256 => bool)) internal playerClaimed;

    /// @notice Contains players of the fight.
    mapping(uint256 => address[]) internal players;

    /// @notice Contains all fights
    Fight[] public fights;
    
}