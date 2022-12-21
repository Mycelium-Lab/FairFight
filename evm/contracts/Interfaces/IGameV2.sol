// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IGameV2 {
    
    event CreateBattle(uint256 ID, uint256 amount, uint256 amountForOneDeath, address owner, uint256 battleCreatedTimestamp);
    event JoinBattle(uint256 ID, address player2, uint256 timestamp);
    event FinishBattle(uint256 ID, uint256 player1Amount, uint256 player2Amount, uint256 battleFinishedTimestamp);

    function createBattle(uint256 amountForOneDeath) external payable;
    function joinBattle(uint256 _ID) external payable;
    function withdraw(uint256 ID) external payable;
    function finishBattle(bytes memory data) external payable;
    // function getAccess(bytes memory data, address sender) external pure returns(address);

}