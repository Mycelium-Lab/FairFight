// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IFairFight {

    function createBattle(uint256 amountForOneDeath, uint256 amount, address token) external;
    function joinBattle(uint256 ID) external;
    function finishBattle(uint256 ID) external;
    
    event CreateBattle(uint256 ID, uint256 amount, uint256 amountForOneDeath, address owner, uint256 battleCreatedTimestamp);
    event JoinBattle(uint256 ID, address player2, uint256 timestamp);
    event FinishBattle(uint256 ID, uint256 player1Amount, uint256 player2Amount, uint256 battleFinishedTimestamp);

}