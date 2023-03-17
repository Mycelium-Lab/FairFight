// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IFairFight {
    struct Fight {
        uint256 ID;
        address owner;
        uint256 baseAmount;
        uint256 createTime;
        uint256 finishTime;
        uint256 amountPerRound;
        uint256 rounds;
        uint256 playersAmount;
    }

    event CreateFight(uint256 indexed ID, address indexed owner);

    event JoinFight(uint256 indexed ID, address indexed player);

    event FinishFight(
        uint256 indexed ID,
        address indexed player,
        uint256 amount
    );

    event Withdraw(uint256 indexed ID, address indexed owner);

    function create(
        uint256 amountPerRound,
        uint256 rounds,
        uint256 playersAmount
    ) external payable returns (uint256 ID);

    function join (uint256 _ID) external payable;

    function withdraw (uint256 ID) external;

    function finish(
        uint256 ID,
        uint256 amount,
        bytes32 r,
        uint8 v,
        bytes32 s
    ) external;

    function userPastFights(
        address player,
        uint256 amount
    ) external view returns(Fight[] memory);

    function getChunkFights(
        uint256 index,
        uint256 amount
    ) external view returns (Fight[] memory);

    event Gas(uint256 gas);

}
