// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import "./Storage/FairFightStorage.sol";

contract FairFight is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    FairFightStorage
{
    using SafeERC20 for IERC20;
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
        minAmountPerRound[IERC20(address(0))] = _minAmountPerRound;
        maxPlayers = _maxPlayers;
        //Create dummy Fight at index 0 with ID 0 to avoid collisions with default data type values.
        Fight memory _fight = Fight({
            ID: 0,
            owner: address(0),
            token: IERC20(address(0)),
            baseAmount: 0,
            createTime: 0,
            finishTime: 0,
            amountPerRound: 0,
            rounds: 0,
            playersAmount: 0
        });
        emit CreateFight(0, address(0), IERC20(address(0)));
        fights.push(_fight);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Creates new fight with provided params. Checks if sender is not busy and all the params are valid. Emits CreateFight event.
    /// @param amountPerRound - Amount of native currency that we add/subtract to/from the base deposit for kill/death.
    /// @param rounds - Amount of rounds to play.
    /// @param playersAmount - Maximum amount of players to join this fight.
    /// @param token - Player can set what token to play (from the list of allowed). If address(0) means native currency.
    /// @return ID - Id of created fight.
    function create(
        uint256 amountPerRound,
        uint256 rounds,
        uint256 playersAmount,
        IERC20 token
    ) external payable whenNotPaused returns (uint256 ID) {
        require(minAmountPerRound[token] != 0, "FairFight: Not allowed payment type");
        require(!currentlyBusy[msg.sender], "FairFight: You have open fight");
        require(
            rounds != 0 && rounds <= maxRounds,
            "FairFight: Wrong rounds amount"
        );
        require(playersAmount <= maxPlayers, "FairFight: Too much players");
        require(
            amountPerRound >= minAmountPerRound[token],
            "FairFight: Too little amount per round"
        );
        if (address(token) == address(0)) {
            require(
                msg.value == rounds * amountPerRound,
                "FairFight: Wrong amount"
            );
        } else {
            token.safeTransferFrom(msg.sender, address(this), rounds * amountPerRound);
        }
        ID = fights.length;
        Fight memory _fight = Fight({
            ID: ID,
            owner: msg.sender,
            token: token,
            baseAmount: rounds * amountPerRound,
            createTime: block.timestamp,
            finishTime: 0,
            amountPerRound: amountPerRound,
            rounds: rounds,
            playersAmount: playersAmount
        });
        fights.push(_fight);
        players[ID].push(msg.sender);
        currentlyBusy[msg.sender] = true;
        lastPlayerFight[msg.sender] = ID;
        emit CreateFight(ID, msg.sender, token);
    }

    /// @notice Allows player to join the fight if he can. Emits JoinFight event.
    /// @param ID - Id of the fight.
    function join(uint256 ID) external payable whenNotPaused {
        Fight memory _fight = fights[ID];
        if (address(_fight.token) == address(0)) {
            require(
                msg.value == _fight.rounds * _fight.amountPerRound,
                "FairFight: Wrong amount"
            );
        } else {
            _fight.token.safeTransferFrom(msg.sender, address(this), _fight.rounds * _fight.amountPerRound);
        }
        //it's also prevents from owner to join and another player to join twice
        require(!currentlyBusy[msg.sender], "FairFight: You have open fight");
        require(
            players[ID].length < _fight.playersAmount,
            "FairFight: Fight is full"
        );
        require(_fight.finishTime == 0, "FairFight: Fight is over");
        players[ID].push(msg.sender);
        currentlyBusy[msg.sender] = true;
        uint256 playerFullFightsLength = playerFullFights[_fight.owner].length;
        if (
            playerFullFightsLength == 0 ||
            playerFullFights[_fight.owner][playerFullFightsLength - 1] != ID
        ) {
            playerFullFights[_fight.owner].push(ID);
        }
        playerFullFights[msg.sender].push(ID);
        lastPlayerFight[msg.sender] = ID;
        emit JoinFight(ID, msg.sender, _fight.token);
    }

    /// @notice Finish fight, claim rewards. If amount more than baseAmount than send fee to feeCollector. Emits FinishFight event.
    /// @dev If fight was already finished we will not update finish time.
    /// @param ID - Id of the fight.
    /// @param amount - Amount on the end of the fight.
    /// @param r - Part of signature.
    /// @param v - Part of signature.
    /// @param s - Part of signature.
    function finish(
        uint256 ID,
        uint256 amount,
        bytes32 r,
        uint8 v,
        bytes32 s
    ) external nonReentrant {
        Fight memory _fight = fights[ID];
        require(check(ID, amount, address(_fight.token), r, v, s), "FairFight: You dont have access");
        if (_fight.finishTime == 0) {
            fights[ID].finishTime = block.timestamp;
        }
        if (playerClaimed[msg.sender][ID]) revert("FairFight: Already sended");
        playerClaimed[msg.sender][ID] = true;
        (uint256 toFeeCollector, uint256 toSend) = feeCalc(
            _fight.baseAmount,
            amount
        );
        if (address(_fight.token) == address(0)) {
            (bool success, ) = msg.sender.call{value: toSend}("");
            bool success2 = true;
            if (toFeeCollector != 0) {
                (success2, ) = feeCollector.call{value: toFeeCollector}("");
            }
            require(success && success2, "FairFight: Not success payment");
        } else {
            _fight.token.safeTransfer(msg.sender, toSend);
            if (toFeeCollector != 0) {
                _fight.token.safeTransfer(feeCollector, toFeeCollector);
            }
        }
        currentlyBusy[msg.sender] = false;
        emit FinishFight(ID, msg.sender, amount, _fight.token);
    }

    /// @notice Withdraw baseAmount from fight and finish it if no one has joined it. Emits Withdraw event.
    /// @param ID - Id of the fight.
    function withdraw(uint256 ID) external nonReentrant {
        Fight memory _fight = fights[ID];
        require(
            _fight.owner == msg.sender,
            "FairFight: You're not fight's owner"
        );
        require(_fight.finishTime == 0, "FairFight: Fight is over");
        require(players[ID].length == 1, "FairFight: Fight has players");
        fights[ID].finishTime = block.timestamp;
        currentlyBusy[msg.sender] = false;
        if (address(_fight.token) == address(0)) {
            (bool success, ) = msg.sender.call{value: _fight.baseAmount}("");
            require(success, "FairFight: Not success payment");
        } else {
            _fight.token.safeTransfer(msg.sender, _fight.baseAmount);
        }
        emit Withdraw(ID, msg.sender, _fight.token);
    }

    /// @notice Returns player's full fights.
    /// @param player - Player whom fights to get.
    /// @param amount - Amount of fights to return.
    /// @return playerFights - Array of fights.
    function getPlayerFullFights(
        address player,
        uint256 amount
    ) external view returns (Fight[] memory) {
        Fight[] memory playerFights = new Fight[](amount);
        uint256 length = playerFullFights[player].length;
        uint256 startIndex = length > amount ? length - amount : 0;
        for (uint256 i = startIndex; i < length; i++) {
            uint256 fightId = playerFullFights[player][i];
            playerFights[i - startIndex] = fights[fightId];
        }
        return playerFights;
    }

    /// @notice Returns chunk of fights.
    /** 
        @dev For example if _fightsAmount = 30 and chunk index = 0 we will return chunk of battles with ids [29...20];
        if _fightsAmount = 30 and chunk index = 10 we will return chunk of battles with ids [19...10];
        if _fightsAmount = 30 and chunk index = 20 we will return chunk of battles with ids [9...0].
    **/
    /// @param index - Index of chunk in array.
    /// @param amount - Amount of fights to return in one chunk.
    /// @return chunk - Chunk of Fights.
    function getChunkFights(
        uint256 index,
        uint256 amount
    ) external view returns (Fight[] memory) {
        Fight[] memory chunk = new Fight[](amount);
        uint256 length = fights.length;
        require(index < length, "Invalid index");

        uint256 endIndex = length - index > amount ? index + amount : length;
        for (uint256 i = index; i < endIndex; i++) {
            chunk[i - index] = fights[length - i - 1];
        }

        return chunk;
    }

    /// @notice Returns fight players.
    /// @param ID - Id of the fight.
    /// @return fightPlayers - Addresses of players of the fight.
    function getFightPlayers(
        uint256 ID
    ) external view returns (address[] memory) {
        uint256 length = players[ID].length;
        address[] memory fightPlayers = new address[](length);
        for (uint256 i; i < length; i++) {
            fightPlayers[i] = players[ID][i];
        }
        return fightPlayers;
    }

    function check(
        uint256 _ID,
        uint256 amount,
        address token,
        bytes32 r,
        uint8 v,
        bytes32 s
    ) private view returns (bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                _ID,
                amount,
                block.chainid,
                token,
                msg.sender,
                address(this)
            )
        );
        return
            signer ==
            ecrecover(
                keccak256(
                    abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
                ),
                v,
                r,
                s
            );
    }

    function feeCalc(
        uint256 _baseAmount,
        uint256 _amount
    ) private view returns (uint256 _fee, uint256 _toSend) {
        if (_amount > _baseAmount) {
            _toSend = _amount - (_amount * fee) / 10000;
            _fee = _amount - _toSend;
        } else {
            _toSend = _amount;
        }
    }

    function changeMinAmountPerRound(
        IERC20 _token,
        uint256 _minAmountPerRound
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minAmountPerRound[_token] = _minAmountPerRound;
    }

    function changeSigner(
        address _signer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        signer = _signer;
    }

    function changeFeeCollector(
        address _feeCollector
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeCollector = _feeCollector;
    }

    function changeFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fee = _fee;
    }

    function changeMaxPlayers(
        uint256 _maxPlayers
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxPlayers = _maxPlayers;
    }

    function changeMaxRounds(
        uint256 _maxRounds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxRounds = _maxRounds;
    }

}
