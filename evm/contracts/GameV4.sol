// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./Storage/GameStorage.sol";
import "./Interfaces/IGameV2.sol";

contract GameBasic is Initializable, PausableUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, GameStorage {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _signer, 
        uint8 _amountUserGamesToReturn, 
        uint8 _maxDeathInARow,
        address _feeAddress,
        uint16 _fee,
        uint256 _minAmountForOneRound
    ) initializer public {
        __Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        signerAccess = _signer;
        amountUserGamesToReturn = _amountUserGamesToReturn;
        maxDeathInARow = _maxDeathInARow;
        feeAddress = _feeAddress;
        fee = _fee;
        minAmountForOneRound = _minAmountForOneRound;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

}

/// @title Fight Game
/// @notice You can create, join and finish battles.
/// @dev Data entered into the contract to finish the battle must be signed with the signerAccess address
contract GameV4 is IGameV2, GameBasic {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    /// @notice Creates new battle
    /// @param amountForOneDeath Amount of tokens taken in one death/kill
    /// @dev Only when not paused
    function createBattle(uint256 amountForOneDeath) external payable whenNotPaused {
        require(msg.value != 0, "Amount to play is zero");
        require(msg.value % amountForOneDeath == 0, "must be divided with the remainder 0");
        require(msg.value / amountForOneDeath <= maxDeathInARow, "Exceeded the limit rounds");
        require(currentlyBusy[msg.sender] == false, "You already have open battle");
        require(amountForOneDeath >= minAmountForOneRound, "AmountForOneDeath is too low");
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
        // openBattles.increment();
        emit CreateBattle(battlesLength, _newBattle.player1Amount, amountForOneDeath, msg.sender, _newBattle.battleCreatedTimestamp);
    }

    /// @notice Join to the battle
    /// @param _ID Battle ID
    /// @dev Only when not paused
    function joinBattle(uint256 _ID) external payable whenNotPaused {
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
        // openBattles.decrement();
        emit JoinBattle(_ID, msg.sender, block.timestamp);
    }

    /// @notice Withdraw if nobody join to game
    /// @param ID Battle ID
    /// @dev Only when not paused
    function withdraw(uint256 ID) external payable nonReentrant {
        Battle memory _battle = battles[ID];
        require(_battle.player1 == msg.sender, "You not creator");
        require(_battle.player2 == address(0), "Battle was joined");
        require(_battle.finished == false, "Already finished");
        // openBattles.decrement();
        currentlyBusy[msg.sender] = false;
        _battle.finished = true;
        _battle.battleFinishedTimestamp = block.timestamp;
        (bool success, ) = msg.sender.call{value: _battle.player1Amount}("");
        battles[ID] = _battle;
        require(success, "Not success");
    }

    /// @notice Finish with signature and claim tokens
    /// @param data battle data in bytes format
    /// @dev On game server signer creates signature with correct data and user addresses
    /// @dev Can be called only one time
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
        uint256 player1ToSend;
        uint256 player2ToSend;
        uint256 feeToSend;
        if (player1Amount > player2Amount) {
            player1ToSend = player1Amount - player1Amount * fee / 10000;
            player2ToSend = player2Amount;
            feeToSend = player1Amount - player1ToSend;
        } else if (player2Amount > player1Amount) {
            player2ToSend = player2Amount - player2Amount * fee / 10000;
            player1ToSend = player1Amount;
            feeToSend = player2Amount - player2ToSend;
        } else {
            player1ToSend = player1Amount;
            player2ToSend = player2Amount;
        }
        (bool success1, ) = _battle.player1.call{value: player1ToSend}("");
        (bool success2, ) = _battle.player2.call{value: player2ToSend}("");
        bool success3 = true;
        if (feeToSend != 0) {
            (success3, ) = feeAddress.call{value: feeToSend}("");
        }
        require(success1 && success2 && success3, "Not success");
        _battle.finished = true;
        _battle.player1Amount = player1Amount;
        _battle.player2Amount = player2Amount;
        _battle.battleFinishedTimestamp = block.timestamp;
        battles[_ID] = _battle;
        currentlyBusy[_battle.player1] = false;
        currentlyBusy[_battle.player2] = false;
        emit FinishBattle(_ID, player1Amount, player2Amount, _battle.battleFinishedTimestamp);
    }

    /// @notice Checks user's signature
    /// @param _ID battle ID
    /// @param player1Amount battle owner amount
    /// @param player2Amount battle joiner amount
    /// @param _r part of signature
    /// @param _v part of signature
    /// @param _s part of signature
    /// @dev Compares signarures signer address with correct signer of this contract
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

    // /// @notice Checks user's signature
    // /// @param data battle data
    // /// @param sender user
    // function getAccess(bytes memory data, address sender) public pure returns(address) {
    //     (
    //         uint256 _ID, 
    //         uint256 player1Amount,
    //         uint256 player2Amount,  //player2Amount
    //         bytes32 _r,             //_r
    //         uint8 _v,               //_v
    //         bytes32 _s              //_s
    //     ) = abi.decode(data, (uint256, uint256, uint256, bytes32, uint8, bytes32));
    //     bytes32 hash = keccak256(
    //         abi.encodePacked(
    //             _ID,
    //             player1Amount,
    //             player2Amount,
    //             sender
    //         )
    //     );
    //     return ecrecover(
    //         keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)),
    //         _v,
    //         _r,
    //         _s
    //     );
    // }

    /// @notice Returns user's past battles
    /// @param user user address
    /// @dev limit = amountUserGamesToReturn
    /// @return Battle[]
    function getUserPastBattles(address user) public view returns(Battle[] memory) {
        uint32 _userBattlesAmount = userBattles[user];
        Battle[] memory _userB = new Battle[](_userBattlesAmount);
        uint256 counter = 0;
        for (uint256 i; i < battles.length; i++) {
            if (
                (battles[i].player1 == user || battles[i].player2 == user)
                &&
                battles[i].finished == true
                &&
                battles[i].player2 != address(0)
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

    /// @notice Returns current open battles
    /// @return Battle[]
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

    /// @notice Returns current user battle
    /// @return Battle
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

    /// @notice Returns chunk of battles
    /// @param chunkIndex index of chunk in array
    /// @dev chunkIndex for example if _battlesAmount = 30 and chunk index = 0 we will return chunk of battles with ids [29...20]
    /// @dev chunkIndex for example if _battlesAmount = 30 and chunk index = 1 we will return chunk of battles with ids [19...10]
    /// @dev chunkIndex for example if _battlesAmount = 30 and chunk index = 2 we will return chunk of battles with ids [9...0]
    /// @param amountBattlesToReturn amount of battles to return in one chunk
    /// @return Battle[]
    function getChunkFinishedBattles(uint256 chunkIndex, uint256 amountBattlesToReturn) public view returns(Battle[] memory) {
        Battle[] memory _chunk = new Battle[](amountBattlesToReturn);
        uint256 counter;
        uint256 _battlesAmount = battles.length;
        //it can be negative when for example battlesAmount = 42, battles to return = 10, chunkindex = 5
        int checkerIfMinus = int(_battlesAmount) - 1 - int(chunkIndex) * int(amountBattlesToReturn);
        //create index of last element in chunk
        uint256 i = 
            checkerIfMinus >= 0
            ? 
            _battlesAmount - 1 - chunkIndex * amountBattlesToReturn
            :
            _battlesAmount - 1 - (chunkIndex - 1) * amountBattlesToReturn
        ;
        //create index of first element in chunk
        uint256 to = i > 10 ? i + 1 - amountBattlesToReturn : 0;
        for (;i >= to; i--) {
            _chunk[counter] = battles[i];
            counter++;
            if (i == 0) break;
        }
        return _chunk;
    }

    /// @notice Change Max Death In A Row (per round)
    /// @dev only admin
    function changeMaxDeathInARow(uint8 _new) public onlyRole(DEFAULT_ADMIN_ROLE) {
        maxDeathInARow = _new;
    }

    /// @notice Change signer
    /// @dev only admin
    function changeSigner(address _new) public onlyRole(DEFAULT_ADMIN_ROLE) {
        signerAccess = _new;
    }

    /// @notice Change fee address
    /// @dev only admin
    function changeFeeAddress(address _new) public onlyRole(DEFAULT_ADMIN_ROLE) {
        feeAddress = _new;
    }

    /// @notice Change amount user games to return
    /// @dev only admin
    function changeAmountUserGamesToReturn(uint8 _new) public onlyRole(DEFAULT_ADMIN_ROLE) {
        amountUserGamesToReturn = _new;
    }

    /// @notice Change fee
    /// @dev only admin
    function changeFee(uint16 _new) public onlyRole(DEFAULT_ADMIN_ROLE) {
        fee = _new;
    }

    /// @notice Change user currently busy
    /// @dev only admin
    function changePlayerCurrentlyBusy(address player, bool value) public onlyRole(DEFAULT_ADMIN_ROLE) {
        currentlyBusy[player] = value;
    }

}