import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common_message.tact";

struct Rarity {
    Basic: Int;
    Special: Int;
    Rare: Int;
    Epic: Int;
    Legendary: Int;
}

const gasConsumption: Int = ton("0.05");
const maxPercent: Int = 10000; //100%
const rarityTypes: Rarity = Rarity{
    Basic: 0,
    Special: 1,
    Rare: 2,
    Epic: 3,
    Legendary: 4
};

struct NftItem {
    type: Int;
    index: Int;
    data: String;
}

struct RarityType {
    amount: Int;
    items: map<Int, NftItem>;
}

message SetWorkStatus {
    status: Bool;
}

message SetFeeCollector {
    feeCollector: Address;
}

message SetPrice {
    price: Int;
}

message SetRarity {
    itemsByRarity: map<Int, RarityType>;
}

message SetNftShopAddress {
    address: Address;
}

message Mint {
    recipient: Address;
    type: Int;
    type_index: Int;
    data: String; //example https://nft.io/1.json
}

contract Lootbox with Deployable, OwnableTransferable {

    owner: Address;
    price: Int as coins;
    workStatus: Bool;
    feeCollector: Address;
    nftShopAddress: Address;
    /*
    itemsByRarity:
    Basic - 0       //8000 - 80%
    Special - 1     //2000 - 20%
    Rare - 2        //200 - 2% 
    Epic - 3        //20 - 0.2%
    Legendary - 4   //2 - 0.02%
    */
    itemsByRarity: map<Int, RarityType>;
    rarityPercent: map<Int, Int>;


    init(
        owner: Address, 
        price: Int, 
        feeCollector: Address, 
        nftShopAddress: Address, 
        itemsByRarity: map<Int, RarityType>,
        rarityPercent: map<Int, Int>
    ) {
        self.owner = owner;
        self.itemsByRarity = itemsByRarity;
        self.price = price;
        self.workStatus = true;
        self.feeCollector = feeCollector;
        self.nftShopAddress = nftShopAddress;
        self.rarityPercent = rarityPercent;
    }

    receive(msg: SetWorkStatus) {
        require(context().sender == self.owner, "not owner");
        self.workStatus = msg.status;
    }

    receive(msg: SetFeeCollector) {
        require(context().sender == self.owner, "not owner");
        self.feeCollector = msg.feeCollector;
    }

    receive(msg: SetNftShopAddress) {
        require(context().sender == self.owner, "not owner");
        self.nftShopAddress = msg.address;
    }

    receive(msg: SetRarity) {
        require(context().sender == self.owner, "not owner");
        self.itemsByRarity = msg.itemsByRarity;
    }

    receive(msg: SetPrice) {
        require(context().sender == self.owner, "not owner");
        self.price = msg.price;
    }

    receive("Buy") {
        require(self.workStatus, "not working");
        let ctx: Context = context(); // get sender Info
        require(ctx.value >= self.price + gasConsumption * 2, "value does not equal price to pay");
        //get random rarity
        let randomRarity: Int = random(0, maxPercent + 1);
        let rarityType: Int = rarityTypes.Basic;
        if (randomRarity >= self.rarityPercent.get(rarityTypes.Basic)!!) {
            rarityType = rarityTypes.Basic;
        }
        if (randomRarity < self.rarityPercent.get(rarityTypes.Special)!! && randomRarity >= self.rarityPercent.get(rarityTypes.Rare)!!) {
            rarityType = rarityTypes.Special;
        }
        if (randomRarity < self.rarityPercent.get(rarityTypes.Rare)!! && randomRarity >= self.rarityPercent.get(rarityTypes.Epic)!!) {
            rarityType = rarityTypes.Rare;
        }
        if (randomRarity < self.rarityPercent.get(rarityTypes.Epic)!! && randomRarity >= self.rarityPercent.get(rarityTypes.Legendary)!!) {
            rarityType = rarityTypes.Epic;
        }
        if (randomRarity < self.rarityPercent.get(rarityTypes.Legendary)!!) {
            rarityType = rarityTypes.Legendary;
        }
        //get item by rarity
        let rarity: RarityType = self.itemsByRarity.get(rarityType)!!;
        let randomItemId: Int = random(0, rarity.amount);
        let nftItem: NftItem = rarity.items.get(randomItemId)!!;
        //mint item
        send(
            SendParameters{
                to: self.nftShopAddress,
                value: gasConsumption,
                bounce: false,
                mode: SendIgnoreErrors,
                body: MintFromAllowedToMint {
                    to: ctx.sender,
                    nftType: nftItem.type,
                    nftItem: nftItem.index
                }.toCell()
            }
        );
        send(
            SendParameters{
                to: self.feeCollector,
                bounce: true,
                value: self.price,
                mode: SendIgnoreErrors
            }
        );
    }

}