// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./Storage/GameStorage.sol";
import "./Interfaces/IGame.sol";

contract GameBasic is Initializable, PausableUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, GameStorage {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _signer, uint8 _amountUserGamesToReturn, uint8 _maxDeathInARow) initializer public {
        __Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(SIGNER_ROLE, _signer);
        signerAccess = _signer;
        amountUserGamesToReturn = _amountUserGamesToReturn;
        maxDeathInARow = _maxDeathInARow;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

}

contract Game is IGame, GameBasic {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    function createBattle(uint256 amountForOneDeath) external payable {
        require(msg.value != 0, "Amount to play cant be zero");
        require(msg.value % amountForOneDeath == 0, "Amount for one death must be divided by the msg.value with the remainder 0");
        require(msg.value / amountForOneDeath <= maxDeathInARow, "Exceeded the limit death in a row");
        require(currentlyBusy[msg.sender] == false, "You already have open battle");
        uint256 battlesLength = battles.length;
        Battle memory _newBattle = Battle(
            battlesLength,   //ID
            msg.sender,      //player1
            address(0),      //player2
            address(0),      //winner
            msg.value,       //player1Amount
            0,               //player2Amount
            false,           //finished
            block.timestamp, //battleCreatedTimestamp
            0,               //battleFinishedTimestamp
            amountForOneDeath
        );
        currentlyBusy[msg.sender] = true;
        userBattles[msg.sender]+=1;
        battles.push(_newBattle);
        openBattles.increment();
        emit CreateBattle(battlesLength, msg.sender);
    }

    function joinBattle(uint256 _ID) external payable {
        Battle memory _battle = battles[_ID];
        require(msg.value == _battle.player1Amount, "Not enough amount to play");
        require(_battle.player1 != address(0), "Battle not exists");
        require(_battle.finished == false, "Battle already finished");
        require(_battle.player1 != msg.sender, "You creator of this battle");
        require(currentlyBusy[msg.sender] == false, "You already have open battle");
        _battle.player2 = msg.sender;
        _battle.player2Amount = msg.value;
        currentlyBusy[msg.sender] = true;
        userBattles[msg.sender]+=1;
        battles[_ID] = _battle;
        openBattles.decrement();
        emit JoinBattle(_ID, msg.sender);
    }

    //withdraw if nobody join to game
    function withdraw(uint256 ID) external payable nonReentrant {
        Battle memory _battle = battles[ID];
        require(_battle.player1 == msg.sender, "You not creator");
        require(_battle.player2 == address(0), "Battle was joined");
        require(_battle.finished == false, "Already finished");
        openBattles.decrement();
        currentlyBusy[msg.sender] = false;
        _battle.finished = true;
        _battle.battleFinishedTimestamp = block.timestamp;
        (bool success, ) = msg.sender.call{value: _battle.player1Amount}("");
        battles[ID] = _battle;
        require(success, "Not success");
    }

    //finish with signature
    function finishBattle(bytes memory data) external payable nonReentrant {
        (
            uint256 _ID, 
            uint256 player1Amount,
            uint256 player2Amount,  //player2Amount
            bytes32 _r,             //_r
            uint8 _v,               //_v
            bytes32 _s              //_s
        ) = abi.decode(data, (uint256, uint256, uint256, bytes32, uint8, bytes32));
        require(checkAccess(_ID, player1Amount, player2Amount, _r, _v, _s), "You dont have access");
        Battle memory _battle = battles[_ID];
        require(msg.sender == _battle.player1 || msg.sender == _battle.player2, "You not player");
        require(_battle.finished == false, "Battle already finished");
        _battle.finished = true;
        _battle.battleFinishedTimestamp = block.timestamp;
        battles[_ID] = _battle;
        currentlyBusy[_battle.player1] = false;
        currentlyBusy[_battle.player2] = false;
        (bool success1, ) = _battle.player1.call{value: player1Amount}("");
        (bool success2, ) = _battle.player2.call{value: player2Amount}("");
        require(success1 && success2, "Not success sending");
    }

    function checkAccess(
        uint256 _ID,
        uint256 player1Amount,
        uint256 player2Amount,
        bytes32 _r,
        uint8 _v,
        bytes32 _s
    ) private view returns(bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                _ID,
                player1Amount,
                player2Amount,
                msg.sender
            )
        );
        return signerAccess == ecrecover(
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)),
            _v,
            _r,
            _s
        );
    }

    function getAccess(bytes memory data, address sender) public pure returns(address) {
        (
            uint256 _ID, 
            uint256 player1Amount,
            uint256 player2Amount,  //player2Amount
            bytes32 _r,             //_r
            uint8 _v,               //_v
            bytes32 _s              //_s
        ) = abi.decode(data, (uint256, uint256, uint256, bytes32, uint8, bytes32));
        bytes32 hash = keccak256(
            abi.encodePacked(
                _ID,
                player1Amount,
                player2Amount,
                sender
            )
        );
        return ecrecover(
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)),
            _v,
            _r,
            _s
        );
    }

    function getUserPastBattles(address user) public view returns(Battle[] memory) {
        //ОГРАНИЧИТЬ КОЛИЧЕСТВО ВЫДАЧИ
        uint32 _userBattlesAmount = userBattles[user];
        Battle[] memory _userB = new Battle[](_userBattlesAmount);
        uint256 counter = 0;
        for (uint256 i; i < battles.length; i++) {
            if (
                (battles[i].player1 == user || battles[i].player2 == user)
                &&
                battles[i].finished == true
            ) {
                _userB[counter] = battles[i];
                counter++;
            }
        }
        //limit amount games to send
        if (_userB.length > amountUserGamesToReturn) {
            Battle[] memory _userLimitedB = new Battle[](amountUserGamesToReturn);
            for (uint256 j; j < amountUserGamesToReturn; j++) {
                _userLimitedB[j] = _userB[_userB.length - 1 - j];
            }
            return _userLimitedB;
        } else {
            return _userB;
        }
    }

    function getOpenBattles() public view returns(Battle[] memory) {
        Battle[] memory _openB = new Battle[](openBattles.current());
        uint256 counter = 0;
        for (uint256 i; i < battles.length; i++) {
            if (battles[i].player2 == address(0) && battles[i].finished == false) {
                _openB[counter] = battles[i];
                counter++;
            }
        }
        return _openB;
    }

    function getCurrentUserGame(address user) public view returns(Battle memory) {
        for (uint256 i; i < battles.length; i++) {
            if (
                (battles[i].player1 == user || battles[i].player2 == user)
                &&
                battles[i].finished == false
            ){
                return battles[i];
            }
        }
        Battle memory _battle = Battle(0,address(0),address(0),address(0),0,0,false,0,0,0);
        return _battle;
    }

}