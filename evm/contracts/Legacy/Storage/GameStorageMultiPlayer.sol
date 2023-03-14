// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./GameStorage.sol";

contract GameStorageV2 is GameStorage {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    //max amount players in one game
    uint8 public maxAmountNumberOfPlayers;

    //что будет если поменять значения тут и апгрейдить контракт
    struct BattleV2 {
        uint256     ID;
        address     owner;
        address[]   players;
        address     winner;
        uint256     ownerAmount;
        uint256[]   playersAmount;
        bool        finished;
        uint256     battleCreatedTimestamp;
        uint256     battleFinishedTimestamp;
        uint256     amountForOneDeath;
        uint8       numberOfPlayers;
    }

}