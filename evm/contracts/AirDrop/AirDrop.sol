// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../Interfaces/IFairFight.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Distribution of tokens for active players
/// @notice Checks if user have games in contract and then sends tokens
contract AirDrop is ReentrancyGuard, Ownable {

    event Withdraw(address indexed player);
    event WithdrawFirst(address indexed player);

    IFairFight public gameContract;
    /// @notice Contains minimum number of battles for a player to get a prize
    /// @return minBattlesAmount minimum battles amount
    uint8 public minBattlesAmount = 5;
    /// @notice Contains number of prize tokens for the minimum number of battles scored
    /// @return amountToSend amount to send
    uint256 public amountToSend = 5 ether;
    /// @notice Contains number of prize tokens for the first battle
    /// @return amountToFirstSend amount to first send
    uint256 public amountToFirstSend = 1 ether;
    /// @notice Address through which the signature is created and verified
    address public signerAccess;
    /// @notice Has the token distribution ended or not
    /// @return isAirDropEnded is Air Drop Ended
    bool public isAirDropEnded;
    /// @notice Contains data - did the user collect prize tokens for the battles played
    /// @return alreadyGetTokens user already get tokens
    mapping(address => bool) public alreadyGetTokens;
    /// @notice Contains data - did the user collect prize tokens for the first battle
    /// @return alreadyGetTokens user already get tokens
    mapping(address => bool) public alreadyGetFirstTokens;

    constructor (address _gameAddress, address _signerAccess) {
        gameContract = IFairFight(_gameAddress);
        signerAccess = _signerAccess;
    }

    fallback() external payable {}
    receive() external payable {}

    /// @notice Allows you to withdraw tokens as a prize for battles played
    /// @dev To withdraw tokens, the player needs to play a minimum number of battles, as well as have a signed confirmation that the address is not just created
    /// @dev There is a check for reentrancy
    /// @param player player to whom we are sending tokens
    /// @param r one of the signature values
    /// @param v one of the signature values
    /// @param s one of the signature values
    function withdraw(address player, bytes32 r, uint8 v, bytes32 s) public payable nonReentrant isAirDropNotEnded {
        require(alreadyGetTokens[player] == false, "AirDrop: You already get tokens");
        IFairFight.Fight[] memory userPastBattles = gameContract.userPastFights(player,minBattlesAmount);
        bool fightsIsOk = true;
        for (uint256 i = 0; i < userPastBattles.length; i++) {
            if (userPastBattles[i].finishTime == 0) {
                fightsIsOk = false;
                break;
            }
        }
        require(userPastBattles.length >= minBattlesAmount && fightsIsOk, "Not enough battles");
        require(checkAccess(player, r, v, s, "second"), "AirDrop: Your are not allowed to withdraw");
        _send(player);
        emit Withdraw(player);
    }

    /// @notice Sends tokens to the user's address
    /// @dev We also change the value of the state variable alreadyGetTokens for this address to avoid a second attempt to withdraw tokens
    /// @param _player player to whom we are sending tokens
    function _send(address _player) private {
        alreadyGetTokens[_player] = true;
        (bool success, ) = _player.call{value: amountToSend}("");
        require(success, "Not success");
    }

    /// @notice Allows you to withdraw tokens as a gift to play the first battle
    /// @dev To withdraw tokens, the player needs to have a signed confirmation that the address is not just created
    /// @dev There is a check for reentrancy
    /// @param player player to whom we are sending tokens
    /// @param r one of the signature values
    /// @param v one of the signature values
    /// @param s one of the signature values
    function withdrawFirstTime(address player, bytes32 r, uint8 v, bytes32 s) public payable nonReentrant isAirDropNotEnded {
        require(alreadyGetFirstTokens[player] == false, "AirDrop: You already get first tokens");
        require(checkAccess(player, r, v, s, "first"), "AirDrop: Your are not allowed to withdraw");
        _sendFirstTime(player);
        emit WithdrawFirst(player);
    }
    
    /// @notice Sends tokens to the user's address
    /// @dev We also change the value of the state variable alreadyGetFirstTokens for this address to avoid a second attempt to withdraw tokens
    /// @param _player player to whom we are sending tokens
    function _sendFirstTime(address _player) private {
        alreadyGetFirstTokens[_player] = true;
        (bool success, ) = _player.call{value: amountToFirstSend}("");
        require(success, "Not success");
    }

    /// @notice Сhecks the signatures for correctness
    /// @return signerAccess signerAccess == ecrecover
    function checkAccess(address _player, bytes32 _r, uint8 _v, bytes32 _s, string memory _typeOfWithdraw) private view returns(bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                address(this),
                _player,
                _typeOfWithdraw
            )
        );
        return signerAccess == ecrecover(
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)),
            _v,
            _r,
            _s
        );
    }

    function changeMinBattleAmount(uint8 _minBattlesAmount) public onlyOwner {
        minBattlesAmount = _minBattlesAmount;
    }

    function changeAmountToSend(uint256 _amountToSend) public onlyOwner {
        amountToSend = _amountToSend;
    }

    function changeAmountToSendFirst(uint256 _amountToFirstSend) public onlyOwner {
        amountToFirstSend = _amountToFirstSend;
    }

    function changeSignerAccess(address _signerAccess) public onlyOwner {
        signerAccess = _signerAccess;
    }

    function endAirDrop() public onlyOwner {
        isAirDropEnded = true;
    }

    function startAirDrop() public onlyOwner {
        isAirDropEnded = false;
    }

    function withdrawOwner() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Not success");
    }

    function withdrawOwnerExactAmount(uint256 amount) public onlyOwner {
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Not success");
    }

    modifier isAirDropNotEnded() {
        require(isAirDropEnded == false, "AirDrop: Is ended");
        _;
    }

}