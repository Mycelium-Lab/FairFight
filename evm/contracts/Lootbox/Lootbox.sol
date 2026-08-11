// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../NFT/IFFNFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Lootbox is Pausable, Ownable, ReentrancyGuard {

    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    enum Rarity {
        Regular,
        Superior,
        Rare,
        Legendary,
        Epic
    }

    struct Prize {
        IFFNFT  nft;
        uint256 propertyId;
    }

    struct PendingLoot {
        bytes32 commitment;
        uint64 blockNumber;
    }

    uint256 constant    MAX_PERCENT = 10000;
    uint256 public      price;
    address             signer;
    address immutable   collector; 
    IERC20  immutable   paymentToken;

    /// @notice chance to get nft
    /// @dev percent 0 - 10000 => 0.00% - 100.00%
    mapping(Rarity  => uint256) public rarityPercent;
    /// @notice Prevents using one signature few times
    mapping(address => uint256) public currentUserLoot;
    mapping(Rarity  => Prize[]) public prizesByRarity;
    mapping(address => PendingLoot) public pendingLoots;

    event Loot(address indexed looter, IFFNFT indexed nft, uint256 indexed propertyId);
    event Buy(address indexed looter, IERC20 indexed token, uint256 price);
    event LootCommitted(address indexed looter, bytes32 indexed commitment, uint256 blockNumber);
    event LootCommitmentExpired(address indexed looter, bytes32 indexed commitment);

    constructor(
        Prize[] memory  regularRarityPrizes,
        Prize[] memory  superiorRarityPrizes,
        Prize[] memory  rareRarityPrizes,
        Prize[] memory  legendaryRarityPrizes,
        Prize[] memory  epicRarityPrizes,
        uint256         _price,
        address         _signer,
        address         _collector,
        IERC20          _paymentToken
    ) {
        require(regularRarityPrizes.length != 0, "FairFight Lootbox: Empty rarity");
        require(superiorRarityPrizes.length != 0, "FairFight Lootbox: Empty rarity");
        require(rareRarityPrizes.length != 0, "FairFight Lootbox: Empty rarity");
        require(legendaryRarityPrizes.length != 0, "FairFight Lootbox: Empty rarity");
        require(epicRarityPrizes.length != 0, "FairFight Lootbox: Empty rarity");
        require(_price != 0, "FairFight Lootbox: Price is zero");
        require(_signer != address(0), "FairFight Lootbox: Signer cant be address zero");
        require(_collector != address(0), "FairFight Lootbox: Collector cant be address zero");
        require(address(_paymentToken) != address(0), "FairFight Lootbox: Token cant be address zero");

        rarityPercent[Rarity.Regular] = 8000;   //80%
        rarityPercent[Rarity.Superior] = 2000;  //20%
        rarityPercent[Rarity.Rare] = 200;       //2%
        rarityPercent[Rarity.Legendary] = 20;   //0.2%
        rarityPercent[Rarity.Epic] = 2;         //0.02%
        for (uint256 i = 0; i < regularRarityPrizes.length; i++) {
            prizesByRarity[Rarity.Regular].push(regularRarityPrizes[i]); 
        }
        for (uint256 i = 0; i < superiorRarityPrizes.length; i++) {
            prizesByRarity[Rarity.Superior].push(superiorRarityPrizes[i]); 
        }
        for (uint256 i = 0; i < rareRarityPrizes.length; i++) {
            prizesByRarity[Rarity.Rare].push(rareRarityPrizes[i]); 
        }
        for (uint256 i = 0; i < legendaryRarityPrizes.length; i++) {
            prizesByRarity[Rarity.Legendary].push(legendaryRarityPrizes[i]); 
        }
        for (uint256 i = 0; i < epicRarityPrizes.length; i++) {
            prizesByRarity[Rarity.Epic].push(epicRarityPrizes[i]); 
        }
        signer = _signer;
        paymentToken = _paymentToken;
        price = _price;
        collector = _collector;
    }

    /// @notice Commits an authorized free loot before its randomness exists.
    /// @dev commitment = keccak256(abi.encode(looter, address(this), secret)).
    ///      The authorization nonce is consumed here, not during reveal.
    function commitLoot(bytes32 commitment, bytes32 r, uint8 v, bytes32 s)
        external
        whenNotPaused
        nonReentrant
    {
        require(_checkCommit(commitment, r, v, s), "FairFight Lootbox: Not verified");
        _commit(commitment);
    }

    /// @notice Pays for a lootbox and commits before its randomness exists.
    /// @dev Payment is final at commit time. A caller can decline to reveal a
    ///      bad result, but cannot recover the payment or reroll this commitment.
    function commitBuy(bytes32 commitment) external whenNotPaused nonReentrant {
        _commit(commitment);
        paymentToken.safeTransferFrom(msg.sender, collector, price);
        emit Buy(msg.sender, paymentToken, price);
    }

    /// @notice Reveals a fixed draw after the commitment block has been mined.
    /// @dev The commitment block hash was unknowable when the secret was
    ///      committed. It remains fixed across reveal retries, so a wrapper that
    ///      reverts after inspecting a bad mint cannot obtain a different roll.
    function reveal(bytes32 secret)
        external
        whenNotPaused
        nonReentrant
        returns (IFFNFT nft, uint256 propertyId)
    {
        PendingLoot memory pending = pendingLoots[msg.sender];
        require(pending.commitment != bytes32(0), "FairFight Lootbox: No commitment");
        require(block.number > pending.blockNumber, "FairFight Lootbox: Reveal too early");
        require(block.number <= uint256(pending.blockNumber) + 256, "FairFight Lootbox: Commitment expired");
        require(
            keccak256(abi.encode(msg.sender, address(this), secret)) == pending.commitment,
            "FairFight Lootbox: Wrong secret"
        );

        bytes32 entropy = keccak256(
            abi.encode(secret, blockhash(pending.blockNumber), msg.sender, address(this))
        );
        delete pendingLoots[msg.sender];
        return _loot(entropy, msg.sender);
    }

    function expireCommitment() external {
        PendingLoot memory pending = pendingLoots[msg.sender];
        require(pending.commitment != bytes32(0), "FairFight Lootbox: No commitment");
        require(block.number > uint256(pending.blockNumber) + 256, "FairFight Lootbox: Not expired");
        delete pendingLoots[msg.sender];
        emit LootCommitmentExpired(msg.sender, pending.commitment);
    }

    function _commit(bytes32 commitment) private {
        require(commitment != bytes32(0), "FairFight Lootbox: Empty commitment");
        require(pendingLoots[msg.sender].commitment == bytes32(0), "FairFight Lootbox: Pending commitment");
        pendingLoots[msg.sender] = PendingLoot({
            commitment: commitment,
            blockNumber: uint64(block.number)
        });
        currentUserLoot[msg.sender] += 1;
        emit LootCommitted(msg.sender, commitment, block.number);
    }

    function _loot(bytes32 entropy, address looter) private returns (IFFNFT nft, uint256 propertyId) {
        uint256 randomRarity = uint256(entropy) % MAX_PERCENT;
        Rarity rarity;
        if (randomRarity >= rarityPercent[Rarity.Superior])                                                 rarity = Rarity.Regular;
        if (randomRarity < rarityPercent[Rarity.Superior] && randomRarity >= rarityPercent[Rarity.Rare])    rarity = Rarity.Superior;
        if (randomRarity < rarityPercent[Rarity.Rare] && randomRarity >= rarityPercent[Rarity.Legendary])   rarity = Rarity.Rare;
        if (randomRarity < rarityPercent[Rarity.Legendary] && randomRarity >= rarityPercent[Rarity.Epic])   rarity = Rarity.Legendary;
        if (randomRarity < rarityPercent[Rarity.Epic])                                                      rarity = Rarity.Epic;
        uint256 prizesLength = prizesByRarity[rarity].length;
        uint256 randomPrizeIndex = uint256(keccak256(abi.encode(entropy, "PRIZE"))) % prizesLength;
        Prize memory prize = prizesByRarity[rarity][randomPrizeIndex];
        prize.nft.mint(looter, prize.propertyId);
        emit Loot(looter, prize.nft, prize.propertyId);
        return (prize.nft, prize.propertyId);
    }

    function _checkCommit(bytes32 commitment, bytes32 r, uint8 v, bytes32 s) private view returns (bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                commitment,
                msg.sender,
                address(this),
                currentUserLoot[msg.sender]
            )
        );
        return signer == hash.toEthSignedMessageHash().recover(v, r, s);
    }

    function setSigner(
        address _signer
    ) external onlyOwner {
        require(_signer != address(0), "FairFight Lootbox: Signer cant be address zero");
        signer = _signer;
    }

    function setPrice(
        uint256 _price
    ) external onlyOwner {
        require(_price != 0, "FairFight Lootbox: Price is zero");
        price = _price;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

}
