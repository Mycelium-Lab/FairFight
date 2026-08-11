// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";

/// @title FairFight V2
/// @notice Hardened, fresh-deployment settlement contract for two-player fights.
/// @dev The referee attests only the winner. Payout amounts are always derived
///      from the isolated escrow recorded for the referenced fight.
contract FairFightV2 is
    Initializable,
    EIP712Upgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant STALE_FIGHT_TIMEOUT = 7 days;

    bytes32 public constant OUTCOME_TYPEHASH = keccak256(
        "FightOutcome(uint256 fightId,address claimant,uint256 nonce,uint256 deadline)"
    );

    enum FightStatus {
        None,
        Open,
        Ready,
        Settled,
        Claimed,
        Cancelled
    }

    struct Fight {
        address creator;
        address opponent;
        IERC20 token;
        uint256 stake;
        uint256 escrowed;
        uint256 released;
        uint256 feeBps;
        uint64 createdAt;
        uint64 completedAt;
        address winner;
        FightStatus status;
    }

    address public signer;
    address public feeCollector;
    uint256 public feeBps;
    uint256 public nextFightId;

    mapping(IERC20 => uint256) public minStake;
    mapping(IERC20 => uint256) public escrowLiability;
    mapping(uint256 => Fight) public fights;
    mapping(uint256 => mapping(address => bool)) public isParticipant;
    mapping(address => bool) public currentlyBusy;
    mapping(address => uint256) public lastPlayerFight;
    mapping(address => uint256) public nonces;

    event FightCreated(
        uint256 indexed fightId,
        address indexed creator,
        IERC20 indexed token,
        uint256 stake
    );
    event FightJoined(uint256 indexed fightId, address indexed opponent);
    event FightSettled(uint256 indexed fightId, address indexed winner);
    event FightClaimed(
        uint256 indexed fightId,
        address indexed winner,
        uint256 payout,
        uint256 fee
    );
    event FightWithdrawn(uint256 indexed fightId, address indexed creator, uint256 refund);
    event StalePlayerReleased(uint256 indexed fightId, address indexed player);
    event SignerChanged(address indexed signer);
    event FeeCollectorChanged(address indexed feeCollector);
    event FeeChanged(uint256 feeBps);
    event MinStakeChanged(IERC20 indexed token, uint256 minStake);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address signer_,
        address feeCollector_,
        uint256 feeBps_,
        uint256 minNativeStake
    ) external initializer {
        require(signer_ != address(0), "FairFightV2: zero signer");
        require(feeCollector_ != address(0), "FairFightV2: zero fee collector");
        require(feeBps_ <= BASIS_POINTS, "FairFightV2: invalid fee");
        require(minNativeStake != 0, "FairFightV2: zero minimum");

        __EIP712_init("FairFight", "2");
        __Pausable_init();
        __Ownable_init();
        __ReentrancyGuard_init();

        signer = signer_;
        feeCollector = feeCollector_;
        feeBps = feeBps_;
        minStake[IERC20(address(0))] = minNativeStake;
        nextFightId = 1;
    }

    function create(uint256 stake, IERC20 token)
        external
        payable
        whenNotPaused
        nonReentrant
        returns (uint256 fightId)
    {
        uint256 minimum = minStake[token];
        require(minimum != 0, "FairFightV2: token not allowed");
        require(stake >= minimum, "FairFightV2: stake too small");
        require(!currentlyBusy[msg.sender], "FairFightV2: player busy");

        fightId = nextFightId++;
        fights[fightId] = Fight({
            creator: msg.sender,
            opponent: address(0),
            token: token,
            stake: stake,
            escrowed: stake,
            released: 0,
            feeBps: feeBps,
            createdAt: uint64(block.timestamp),
            completedAt: 0,
            winner: address(0),
            status: FightStatus.Open
        });
        isParticipant[fightId][msg.sender] = true;
        currentlyBusy[msg.sender] = true;
        lastPlayerFight[msg.sender] = fightId;
        escrowLiability[token] += stake;

        _collect(token, stake);
        emit FightCreated(fightId, msg.sender, token, stake);
    }

    function join(uint256 fightId) external payable whenNotPaused nonReentrant {
        Fight storage fight = fights[fightId];
        require(fight.status == FightStatus.Open, "FairFightV2: fight not open");
        require(msg.sender != fight.creator, "FairFightV2: creator cannot join");
        require(!currentlyBusy[msg.sender], "FairFightV2: player busy");

        fight.opponent = msg.sender;
        fight.escrowed += fight.stake;
        fight.status = FightStatus.Ready;
        isParticipant[fightId][msg.sender] = true;
        currentlyBusy[msg.sender] = true;
        lastPlayerFight[msg.sender] = fightId;
        escrowLiability[fight.token] += fight.stake;

        _collect(fight.token, fight.stake);
        emit FightJoined(fightId, msg.sender);
    }

    /// @notice Completes a ready fight with the referee-attested winner.
    /// @dev EIP-712 binds the outcome to this chain, this contract, the fight,
    ///      the claimant's current nonce and a deadline. No amount is signed or
    ///      accepted from the caller.
    function finish(
        uint256 fightId,
        address claimant,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        require(msg.sender == claimant, "FairFightV2: wrong claimant");

        Fight storage fight = fights[fightId];
        require(fight.status == FightStatus.Ready, "FairFightV2: fight not ready");
        require(isParticipant[fightId][claimant], "FairFightV2: not participant");
        require(block.timestamp <= deadline, "FairFightV2: signature expired");
        require(nonce == nonces[claimant], "FairFightV2: invalid nonce");

        bytes32 structHash = keccak256(
            abi.encode(OUTCOME_TYPEHASH, fightId, claimant, nonce, deadline)
        );
        address recovered = ECDSAUpgradeable.recover(_hashTypedDataV4(structHash), signature);
        require(recovered == signer, "FairFightV2: invalid signature");

        nonces[claimant] = nonce + 1;
        fight.completedAt = uint64(block.timestamp);
        fight.winner = claimant;
        fight.status = FightStatus.Settled;
        _clearBusy(fight.creator, fightId);
        _clearBusy(fight.opponent, fightId);

        emit FightSettled(fightId, claimant);
    }

    /// @notice Claims the completed fight's contract-computed winner payout.
    function claim(uint256 fightId) external whenNotPaused nonReentrant {
        Fight storage fight = fights[fightId];
        require(fight.status == FightStatus.Settled, "FairFightV2: fight not settled");
        require(isParticipant[fightId][msg.sender], "FairFightV2: not participant");
        require(fight.winner == msg.sender, "FairFightV2: not winner");

        uint256 escrow = fight.escrowed;
        uint256 feeAmount = (escrow * fight.feeBps) / BASIS_POINTS;
        uint256 payout = escrow - feeAmount;

        // Effects precede both native/ERC-20 interactions. released is set to
        // exactly escrow, so this fight can never authorize a second outflow.
        fight.released = escrow;
        fight.status = FightStatus.Claimed;
        escrowLiability[fight.token] -= escrow;

        _pay(fight.token, msg.sender, payout);
        if (feeAmount != 0) {
            _pay(fight.token, feeCollector, feeAmount);
        }

        emit FightClaimed(fightId, msg.sender, payout, feeAmount);
    }

    function withdraw(uint256 fightId) external nonReentrant {
        Fight storage fight = fights[fightId];
        require(fight.creator == msg.sender, "FairFightV2: not creator");
        require(fight.status == FightStatus.Open, "FairFightV2: fight not open");

        uint256 refund = fight.escrowed;
        fight.released = refund;
        fight.completedAt = uint64(block.timestamp);
        fight.status = FightStatus.Cancelled;
        escrowLiability[fight.token] -= refund;
        _clearBusy(msg.sender, fightId);

        _pay(fight.token, msg.sender, refund);
        emit FightWithdrawn(fightId, msg.sender, refund);
    }

    /// @notice Releases only a player who is still locked in this exact stale fight.
    /// @dev Escrow and settlement rights are intentionally unchanged. If the old
    ///      fight settles after the player starts another, it cannot clear the
    ///      busy flag belonging to the newer fight.
    function releaseStalePlayer(uint256 fightId, address player) external onlyOwner {
        Fight storage fight = fights[fightId];
        require(
            fight.status == FightStatus.Open || fight.status == FightStatus.Ready,
            "FairFightV2: fight resolved"
        );
        require(isParticipant[fightId][player], "FairFightV2: not participant");
        require(
            currentlyBusy[player] && lastPlayerFight[player] == fightId,
            "FairFightV2: player not locked here"
        );
        require(
            block.timestamp >= uint256(fight.createdAt) + STALE_FIGHT_TIMEOUT,
            "FairFightV2: fight not stale"
        );

        currentlyBusy[player] = false;
        emit StalePlayerReleased(fightId, player);
    }

    function escrowRemaining(uint256 fightId) external view returns (uint256) {
        Fight storage fight = fights[fightId];
        return fight.escrowed - fight.released;
    }

    function setMinStake(IERC20 token, uint256 minimum) external onlyOwner {
        minStake[token] = minimum;
        emit MinStakeChanged(token, minimum);
    }

    function setSigner(address signer_) external onlyOwner {
        require(signer_ != address(0), "FairFightV2: zero signer");
        signer = signer_;
        emit SignerChanged(signer_);
    }

    function setFeeCollector(address feeCollector_) external onlyOwner {
        require(feeCollector_ != address(0), "FairFightV2: zero fee collector");
        feeCollector = feeCollector_;
        emit FeeCollectorChanged(feeCollector_);
    }

    function setFee(uint256 feeBps_) external onlyOwner {
        require(feeBps_ <= BASIS_POINTS, "FairFightV2: invalid fee");
        feeBps = feeBps_;
        emit FeeChanged(feeBps_);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _collect(IERC20 token, uint256 amount) private {
        if (address(token) == address(0)) {
            require(msg.value == amount, "FairFightV2: wrong native amount");
            return;
        }

        require(msg.value == 0, "FairFightV2: unexpected native amount");
        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), amount);
        require(
            token.balanceOf(address(this)) - balanceBefore == amount,
            "FairFightV2: unsupported transfer fee"
        );
    }

    function _pay(IERC20 token, address recipient, uint256 amount) private {
        if (address(token) == address(0)) {
            (bool success, ) = payable(recipient).call{value: amount}("");
            require(success, "FairFightV2: native transfer failed");
        } else {
            token.safeTransfer(recipient, amount);
        }
    }

    function _clearBusy(address player, uint256 fightId) private {
        if (lastPlayerFight[player] == fightId) {
            currentlyBusy[player] = false;
        }
    }

    uint256[42] private __gap;
}
