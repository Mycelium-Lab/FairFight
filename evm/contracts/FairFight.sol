// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./Storage/FairFightStorage.sol";

contract FairFight is 
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    FairFightStorage 
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _signer,
        uint256 _maxRounds,
        address _feeCollector,
        uint256 _fee,
        uint256 _minAmountPerRound,
        uint256 _maxPlayers
    ) public initializer {
        __Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        signer = _signer;
        maxRounds = _maxRounds;
        feeCollector = _feeCollector;
        fee = _fee;
        minAmountPerRound = _minAmountPerRound;
        maxPlayers = _maxPlayers;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function create(
        uint256 amountPerRound,
        uint256 rounds,
        uint256 playersAmount
    ) external payable whenNotPaused returns (uint256 ID) {
        require(!currentlyBusy[msg.sender], "FairFight: You open have fight");
        require(rounds <= maxRounds, "FairFight: Too much rounds");
        require(playersAmount <= maxPlayers, "FairFight: Too much players");
        require(
            amountPerRound >= minAmountPerRound,
            "FairFight: Too little amount"
        );
        require(
            msg.value == rounds * amountPerRound,
            "FairFight: Wrong amount"
        );
        ID = fights.length;
        Fight memory _fight = Fight({
            ID: ID,
            owner: msg.sender,
            baseAmount: msg.value,
            createTime: block.timestamp,
            finishTime: 0,
            amountPerRound: amountPerRound,
            rounds: rounds,
            playersAmount: playersAmount
        });
        fights.push(_fight);
        players[ID].push(msg.sender);
        currentlyBusy[msg.sender] = true;
        playerFightAmount[msg.sender][ID] = msg.value;
        lastPlayerFight[msg.sender] = ID;
        emit CreateFight(ID, msg.sender);
    }

    function finish(
        uint256 ID,
        uint256 amount,
        bytes32 r,
        uint8 v,
        bytes32 s
    ) external nonReentrant {
        (bool c,,,) = check(ID, amount, r, v, s);
        require(
            check()
        if (_fight.finishTime == 0) {
)            _fight.finishTime = block.timestamp;
        }
        if (playerFightAmount[msg.sender][ID] == 0)
            revert("FairFight: Already sended or you not in game");
        playerFightAmount[msg.sender][ID] = 0;
        (uint256 toFeeCollector, uint256 toSend) = feeCalc(
            _fight.baseAmount,
            amount
        );
        (bool success, ) = msg.sender.call{value: toSend}("");
        bool success2 = true;
        if (toFeeCollector != 0) {
            (success2, ) = feeCollector.call{value: toFeeCollector}("");
        }
        require(success, "FairFight: Not success payment");
        currentlyBusy[msg.sender] = false;
        emit FinishFight(ID, msg.sender, amount);
    }

    function join(uint256 ID) external payable whenNotPaused {
        Fight memory _fight = fights[ID];
        require(
            msg.value == _fight.rounds * _fight.amountPerRound,
            "FairFight: Wrong amount"
        );
        require(
            players[ID].length < _fight.playersAmount,
            "FairFight: Fight is full"
        );
        require(_fight.finishTime == 0, "FairFight: Fight is over");
        require(!currentlyBusy[msg.sender], "FairFight: You open have fight");
        require(_fight.owner != msg.sender, "FairFight: You fight's owner");
        require(
            playerFightAmount[msg.sender][ID] == 0,
            "FairFight: You already in it"
        );
        players[ID].push(msg.sender);
        playerFightAmount[msg.sender][ID] = msg.value;
        currentlyBusy[msg.sender] = true;
        if (!ownerAddedFight[ID]) {
            playerFullFights[_fight.owner].push(ID);
            ownerAddedFight[ID] = true;
        }
        playerFullFights[msg.sender].push(ID);
        lastPlayerFight[msg.sender] = ID;
        emit JoinFight(ID, msg.sender);
    }

    function withdraw(uint256 ID) external nonReentrant {
        Fight storage _fight = fights[ID];
        require(
            _fight.owner == msg.sender,
            "FairFight: You're not fight's owner"
        );
        require(_fight.finishTime == 0, "FairFight: Fight is over");
        require(players[ID].length == 1, "FairFight: Fight has players");
        _fight.finishTime = block.timestamp;
        playerFightAmount[msg.sender][ID] = 0;
        (bool success, ) = msg.sender.call{value: _fight.baseAmount}("");
        require(success, "FairFight: Not success payment");
        currentlyBusy[msg.sender] = false;
        emit Withdraw(ID, msg.sender);
    }

    function userPastFights(
        address player,
        uint256 amountToReturn
    ) external view returns (Fight[] memory _fights) {
        uint256 length = playerFullFights[player].length ;
        if (length < amountToReturn) {
            amountToReturn = length;
        }
        uint256 counter;
        for (
            uint256 i = length - 1;
            i > length - amountToReturn;
            i--
        ) {
            _fights[counter] = fights[playerFullFights[player][i]];
            counter++;
        }
    }

    /// @notice Returns chunk of fights
    /// @param chunkIndex index of chunk in array
    /// @dev chunkIndex for example if _fightsAmount = 30 and chunk index = 0 we will return chunk of battles with ids [29...20]
    /// @dev chunkIndex for example if _fightsAmount = 30 and chunk index = 1 we will return chunk of battles with ids [19...10]
    /// @dev chunkIndex for example if _fightsAmount = 30 and chunk index = 2 we will return chunk of battles with ids [9...0]
    /// @param amountToReturn amount of fights to return in one chunk
    /// @return Fight[]
    function getChunkFights(
        uint256 chunkIndex,
        uint256 amountToReturn
    ) external view returns (Fight[] memory) {
        Fight[] memory _chunk = new Fight[](amountToReturn);
        uint256 counter;
        uint256 _fightsAmount = fights.length;
        //it can be negative when for example _fightsAmount = 42, fights to return = 10, chunkindex = 5
        int checkerIfMinus = int(_fightsAmount) -
            1 -
            int(chunkIndex) *
            int(amountToReturn);
        //create index of last element in chunk
        uint256 i = checkerIfMinus >= 0
            ? _fightsAmount - 1 - chunkIndex * amountToReturn
            : _fightsAmount - 1 - (chunkIndex - 1) * amountToReturn;
        //create index of first element in chunk
        uint256 to = i > 10 ? i + 1 - amountToReturn : 0;
        for (; i >= to; i--) {
            _chunk[counter] = fights[i];
            counter++;
            if (i == 0) break;
        }
        return _chunk;
    }

    function check(
        uint256 _ID,
        uint256 amount,
        bytes32 r,
        uint8 v,
        bytes32 s
    ) public view returns (bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                _ID,
                amount,
                block.chainid,
                msg.sender
            )
        );
        return signer == ecrecover(
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)),
            v,
            r,
            s
        );
    }

    function feeCalc(uint256 _baseAmount, uint256 _amount) private view returns(uint256 _fee, uint256 _toSend) {
        if (_amount > _baseAmount) {
            _toSend = _amount - _amount * fee / 10000;
            _fee = _amount - _toSend;
        } else {
            _toSend = _amount;
        }
    }

    function changeMinAmountPerRound(uint256 _minAmountPerRound) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minAmountPerRound = _minAmountPerRound;
    }

    function changeSigner(address _signer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        signer = _signer;
    }

    function changeFeeCollector(address _feeCollector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeCollector = _feeCollector;
    }

    function changeFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fee = _fee;
    }

    function changeMaxPlayers(uint256 _maxPlayers) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxPlayers = _maxPlayers;
    }

    function changeMaxRounds(uint256 _maxRounds) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxRounds = _maxRounds;
    }

}