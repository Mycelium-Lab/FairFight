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

    function createBattle(string memory _name) external payable nonReentrant {
        require(msg.value == amountToPlay, "Not enough amount to play");
        uint256 battlesLength = battles.length;
        Battle memory _newBattle = Battle(
            _name,          //name
            msg.sender,      //player1
            address(0),      //player2
            address(0),      //winner
            msg.value,       //player1Amount
            0,               //player2Amount
            false            //finished
        );
        battles.push(_newBattle);
        emit CreateBattle(battlesLength, _name, msg.sender);
    }

    function joinBattle(uint256 _ID) external payable nonReentrant {
        require(msg.value == amountToPlay, "Not enough amount to play");
        require(battles[_ID].player1 != address(0), "Game not exists");
        Battle memory _battle = battles[_ID];
        _battle.player2 = msg.sender;
        _battle.player2Amount = msg.value;
        battles[_ID] = _battle;
        emit JoinBattle(_ID, msg.sender);
    }

    //finish with signature
    function finishBattle(bytes memory data) public payable nonReentrant {
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
    ) public view returns(bool) {
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
}