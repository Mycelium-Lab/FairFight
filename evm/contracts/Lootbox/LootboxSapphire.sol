// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../NFT/IFFNFT.sol";
import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LootboxSapphire is Pausable, Ownable {

    enum Rarity {
        Regular,
        Superior,
        Rare,
        Legendary,
        Epic
    }

    struct Prize {
        IFFNFT nft;
        uint256 propertyId;
    }

    uint256 constant MAX_PERCENT = 10000;
    uint256 immutable MASK;

    address signer;

    /// @notice chance to get nft
    /// @dev percent 0 - 10000 => 0.00% - 100.00%
    mapping(Rarity => uint256) public rarityPercent;
    mapping(Rarity => Prize[]) public prizesByRarity;
    /// @notice Prevents using one signature few times
    mapping(address => uint256) public currentUserLoot;

    event Loot(address indexed looter, IFFNFT indexed nft, uint256 indexed propertyId);

    constructor(
        Prize[] memory regularRarityPrizes,
        Prize[] memory superiorRarityPrizes,
        Prize[] memory rareRarityPrizes,
        Prize[] memory legendaryRarityPrizes,
        Prize[] memory epicRarityPrizes,
        address _signer
    ) {
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
        MASK = uint256(bytes32(Sapphire.randomBytes(32, "")));
    }

    /// @notice Allowes to loot some reward for user
    /// @dev Only if user is verified
    /// @param r - Part of signature.
    /// @param v - Part of signature.
    /// @param s - Part of signature.
    /// @param somenumber - Some random number
    function loot(bytes32 r, uint8 v, bytes32 s, uint256 somenumber) external whenNotPaused {
        require(_check(r, v, s, somenumber), "FairFight Lootbox: Not verified");
        uint256 randomRarity = getPseudoRandomNumber(somenumber, msg.sender, MAX_PERCENT);
        Rarity rarity;
        if (randomRarity >= rarityPercent[Rarity.Superior])                                                 rarity = Rarity.Regular;
        if (randomRarity < rarityPercent[Rarity.Superior] && randomRarity >= rarityPercent[Rarity.Rare])    rarity = Rarity.Superior;
        if (randomRarity < rarityPercent[Rarity.Rare] && randomRarity >= rarityPercent[Rarity.Legendary])   rarity = Rarity.Rare;
        if (randomRarity < rarityPercent[Rarity.Legendary] && randomRarity >= rarityPercent[Rarity.Epic])   rarity = Rarity.Legendary;
        if (randomRarity < rarityPercent[Rarity.Epic])                                                      rarity = Rarity.Epic;
        uint256 prizesLength = prizesByRarity[rarity].length;
        uint256 randomPrizeIndex = getPseudoRandomNumber(somenumber, address(this), prizesLength - 1);
        Prize memory prize = prizesByRarity[rarity][randomPrizeIndex];
        prize.nft.mint(msg.sender, prize.propertyId);
        currentUserLoot[msg.sender] += 1;
        emit Loot(msg.sender, prize.nft, prize.propertyId);
    }

    function getPseudoRandomNumber(uint256 _somenumber, address _someaddress, uint256 _max) private view returns (uint256) {
        uint256 pseudoRandomNumber = 
            uint256(
                keccak256(
                    abi.encodePacked(
                        _someaddress, block.number, block.prevrandao, _somenumber, blockhash(block.number - 1), MASK
                    )
                )
            );
        return uint256(pseudoRandomNumber % _max); 
    }

    function _check(bytes32 _r, uint8 _v, bytes32 _s, uint256 _somenumber) private view returns (bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                _somenumber,
                msg.sender,
                address(this),
                currentUserLoot[msg.sender]
            )
        );
        return
            signer ==
            ecrecover(
                keccak256(
                    abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
                ),
                _v,
                _r,
                _s
            );
    }

    function setSigner(
        address _signer
    ) external onlyOwner {
        require(_signer != address(0), "FairFight Lootbox: Signer cant be address zero");
        signer = _signer;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

}