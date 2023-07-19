// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFairFight {
    struct Fight {
        uint256 ID;
        address owner;
        IERC20 token; //if fight without ERC-20 token: token == address(0)
        uint256 baseAmount;
        uint256 createTime;
        uint256 finishTime;
        uint256 amountPerRound;
        uint256 rounds;
        uint256 playersAmount;
    }

    event CreateFight(uint256 indexed ID, address indexed owner, IERC20 indexed token);

    event JoinFight(uint256 indexed ID, address indexed player, IERC20 indexed token);

    event FinishFight(
        uint256 indexed ID,
        address indexed player,
        uint256 amount, 
        IERC20 indexed token
    );

    event Withdraw(uint256 indexed ID, address indexed owner, IERC20 indexed token);

    function create(
        uint256 amountPerRound,
        uint256 rounds,
        uint256 playersAmount,
        IERC20 token
    ) external payable returns (uint256 ID);

    // function createWithToken(
    //     uint256 amountPerRound,
    //     uint256 rounds,
    //     uint256 playersAmount,
    //     IERC20 token
    // ) external returns (uint256 ID);

    function join (uint256 _ID) external payable;

    // function withdraw (uint256 ID) external;

    // function finish(
    //     uint256 ID,
    //     uint256 amount,
    //     bytes32 r,
    //     uint8 v,
    //     bytes32 s
    // ) external;

    function getPlayerFullFights(
        address player,
        uint256 amount
    ) external view returns(Fight[] memory);

    function getChunkFights(
        uint256 index,
        uint256 amount
    ) external view returns (Fight[] memory);

}
