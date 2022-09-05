// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract GameStorage {

    uint256 public amountToPlay;
    address public signerAccess;

    struct Battle {
        string name;
        address player1;
        address player2;
        address winner;
        uint256 player1Amount;
        uint256 player2Amount;
        bool player1Finished;
        bool player2Finished;
    }

    Battle[] public battles;
    
}