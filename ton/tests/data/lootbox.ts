import { Dictionary } from "@ton/core";
import { dictValueParserNftItem, dictValueParserRarityType, RarityType, NftItem } from "../../wrappers/Lootbox";
import { getBasicRarityItems, getEpicRarityItems, getLegendaryRarityItems, getRareRarityItems, getSpecialRarityItems } from "./lootboxData/lootboxData";

export function getRarity(): Dictionary<bigint, RarityType> {
    /* 
    item types
    characters = 0
    armors = 1
    boots = 2
    weapons = 3
    */
    let itemsDictBasic: Dictionary<bigint, NftItem> = Dictionary.empty(Dictionary.Keys.BigInt(257), dictValueParserNftItem());
    let itemsDictSpecial: Dictionary<bigint, NftItem> = Dictionary.empty(Dictionary.Keys.BigInt(257), dictValueParserNftItem());
    let itemsDictRare: Dictionary<bigint, NftItem> = Dictionary.empty(Dictionary.Keys.BigInt(257), dictValueParserNftItem());
    let itemsDictEpic: Dictionary<bigint, NftItem> = Dictionary.empty(Dictionary.Keys.BigInt(257), dictValueParserNftItem());
    let itemsDictLegendary: Dictionary<bigint, NftItem> = Dictionary.empty(Dictionary.Keys.BigInt(257), dictValueParserNftItem());
    getBasicRarityItems().forEach((item) => {
        itemsDictBasic.set(item.id, item.item);
    });
    getSpecialRarityItems().forEach((item) => {
        itemsDictSpecial.set(item.id, item.item);
    })
    getRareRarityItems().forEach((item) => {
        itemsDictRare.set(item.id, item.item);
    })
    getEpicRarityItems().forEach((item) => {
        itemsDictEpic.set(item.id, item.item);
    })
    getLegendaryRarityItems().forEach((item) => {
        itemsDictLegendary.set(item.id, item.item);
    })
    let itemsByRarity: Dictionary<bigint, RarityType> = Dictionary.empty(Dictionary.Keys.BigInt(257), dictValueParserRarityType());
    itemsByRarity.set(BigInt(0), {
        $$type: 'RarityType',
        amount: BigInt(getBasicRarityItems().length),
        items: itemsDictBasic
    })
    itemsByRarity.set(BigInt(1), {
        $$type: 'RarityType',
        amount: BigInt(getSpecialRarityItems().length),
        items: itemsDictSpecial
    })
    itemsByRarity.set(BigInt(2), {
        $$type: 'RarityType',
        amount: BigInt(getRareRarityItems().length),
        items: itemsDictRare
    })
    itemsByRarity.set(BigInt(3), {
        $$type: 'RarityType',
        amount: BigInt(getEpicRarityItems().length),
        items: itemsDictEpic
    })
    itemsByRarity.set(BigInt(4), {
        $$type: 'RarityType',
        amount: BigInt(getLegendaryRarityItems().length),
        items: itemsDictLegendary
    })
    return itemsByRarity
}

export function getRarityPercent():  Dictionary<bigint, bigint> {
    let rarityPercent: Dictionary<bigint, bigint> = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
    rarityPercent.set(0n, 8000n)
    rarityPercent.set(1n, 2000n)
    rarityPercent.set(2n, 200n)
    rarityPercent.set(3n, 20n)
    rarityPercent.set(4n, 2n)
    return rarityPercent
}