// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IGame {
    
    event CreateBattle(uint256 ID, string name, address player1);
    event JoinBattle(uint256 ID, address player2);
    event FinishBattle(uint256 ID, address winner);

}