// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./Storage/GameStorage.sol";
import "./Interfaces/IGame.sol";

contract GameBasic is Initializable, PausableUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, GameStorage {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _amountToPlay, address _signer) initializer public {
        __Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(SIGNER_ROLE, _signer);
        signerAccess = _signer;
        amountToPlay = _amountToPlay;
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

    function createBattle() external payable {
        require(msg.value == amountToPlay, "Not enough amount to play");
        uint256 battlesLength = battles.length;
        Battle memory _newBattle = Battle(
            battlesLength,   //ID
            msg.sender,      //player1
            address(0),      //player2
            address(0),      //winner
            msg.value,       //player1Amount
            0,               //player2Amount
            false            //finished
        );
        userBattles[msg.sender]+=1;
        battles.push(_newBattle);
        openBattles.increment();
        emit CreateBattle(battlesLength, msg.sender);
    }

    function joinBattle(uint256 _ID) external payable {
        Battle memory _battle = battles[_ID];
        require(msg.value == amountToPlay, "Not enough amount to play");
        require(_battle.player1 != address(0), "Battle not exists");
        require(_battle.finished == false, "Battle already finished");
        require(_battle.player1 != msg.sender, "You creator of this battle");
        _battle.player2 = msg.sender;
        _battle.player2Amount = msg.value;
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
        _battle.finished = true;
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
        (bool success1, ) = _battle.player1.call{value: player1Amount}("");
        (bool success2, ) = _battle.player2.call{value: player2Amount}("");
        require(success1 && success2, "Not success sending");
        battles[_ID] = _battle;
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

    function getUserPastBattles(address user) public view returns(Battle[] memory) {
        //ОГРАНИЧИТЬ КОЛИЧЕСТВО ВЫДАЧИ
        Battle[] memory _userB = new Battle[](userBattles[user]);
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
        return _userB;
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

}