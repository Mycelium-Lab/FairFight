import "@stdlib/deploy";
import "@stdlib/ownable";
import "./common_message.tact";

const minTonsForStorage: Int = ton("0.02");
const gasConsumption: Int = ton("0.05");

struct NftType {
    data: String; //example https://ipfs.io/folder/
    prices: map<Int, Int>;
}

message SetNftAddress {
    address: Address;
}

message SetPrices {
    prices: map<Int, NftType>;
}

message SetWorkStatus {
    status: Bool;
}

message SetFeeCollector {
    feeCollector: Address;
}

message Buy {
    nftType: Int;
    nftItem: Int;
}

message ChangeNftCollectionOwner {
    new_owner: Address;
}

message SetAllowedMint {
    minter: Address;
    allowed: Bool;
}

contract NftShop with Deployable, OwnableTransferable {

    owner:  Address;
    feeCollector: Address;
    prices: map<Int, NftType>;
    nft_address: Address;
    workStatus: Bool;
    nextItemIndex: Int;
    allowedMint: map<Address, Bool>;

    init (
        owner: Address, 
        feeCollector: Address,
        nft_address: Address,
        prices: map<Int, NftType>,
        nextItemIndex: Int,
        allowedMint: map<Address, Bool>
    ) {
        self.owner = owner;
        self.feeCollector = feeCollector;
        self.prices = prices;
        self.workStatus = true;
        self.nft_address = nft_address;
        self.nextItemIndex = nextItemIndex;
        self.allowedMint = allowedMint;
    }

    receive(msg: SetAllowedMint) {
        require(context().sender == self.owner, "not owner");
        self.allowedMint.set(msg.minter, msg.allowed);
    }

    receive(msg: SetNftAddress) {
        require(context().sender == self.owner, "not owner");
        self.nft_address = msg.address;
    }

    receive(msg: SetPrices) {
        require(context().sender == self.owner, "not owner");
        self.prices = msg.prices;
    }

    receive(msg: SetWorkStatus) {
        require(context().sender == self.owner, "not owner");
        self.workStatus = msg.status;
    }

    receive(msg: SetFeeCollector) {
        require(context().sender == self.owner, "not owner");
        self.feeCollector = msg.feeCollector;
    }

    receive(msg: Buy) {
        require(self.workStatus, "not working");
        let ctx: Context = context(); // get sender Info
        if (self.prices.get(msg.nftType) == null) {
            throw(32); // "nft type not exist"
        }
        let nftType: NftType = self.prices.get(msg.nftType)!!;
        if (nftType.prices.get(msg.nftItem) == null) {
            throw(32); // "nft item not exist"
        }
        let price: Int = nftType.prices.get(msg.nftItem)!!;
        require(ctx.value >= price + gasConsumption * 2, "value does not equal price to pay");
        let nftData: StringBuilder = beginString();
        nftData.append(nftType.data);
        nftData.append(msg.nftItem.toString());
        nftData.append(".json");

        let nftItemMessage: Cell = beginCell()
            .storeAddress(ctx.sender)
            .storeRef(nftData.toCell())
            .endCell();

        let msgBody: Cell = beginCell()
            .storeUint(1, 32)
            .storeUint(0, 64)
            .storeUint(self.nextItemIndex, 64)
            .storeCoins(gasConsumption)
            .storeRef(nftItemMessage)
            .endCell();

        send(
            SendParameters{
                to: self.nft_address,
                value: gasConsumption,
                bounce: false,
                mode: SendIgnoreErrors,
                body: msgBody
            }
        );
        self.nextItemIndex = self.nextItemIndex + 1;
        send(
            SendParameters{
                to: self.feeCollector,
                bounce: true,
                value: price,
                mode: SendIgnoreErrors
            }
        );
    }

    receive(msg: MintFromAllowedToMint) {
        require(self.workStatus, "not working");
        let ctx: Context = context(); // get sender Info
        if (self.allowedMint.get(ctx.sender) == null) {
            throw(32); // "minter not exist"
        }
        let allowedToMint: Bool = self.allowedMint.get(ctx.sender)!!;
        require(allowedToMint, "not allowed to mint");
        if (self.prices.get(msg.nftType) == null) {
            throw(32); // "nft type not exist"
        }
        let nftType: NftType = self.prices.get(msg.nftType)!!;
        if (nftType.prices.get(msg.nftItem) == null) {
            throw(32); // "nft item not exist"
        }
        let nftData: StringBuilder = beginString();
        nftData.append(nftType.data);
        nftData.append(msg.nftItem.toString());
        nftData.append(".json");

        let nftItemMessage: Cell = beginCell()
            .storeAddress(msg.to)
            .storeRef(nftData.toCell())
            .endCell();

        let msgBody: Cell = beginCell()
            .storeUint(1, 32)
            .storeUint(0, 64)
            .storeUint(self.nextItemIndex, 64)
            .storeCoins(gasConsumption)
            .storeRef(nftItemMessage)
            .endCell();

        send(
            SendParameters{
                to: self.nft_address,
                value: gasConsumption,
                bounce: false,
                mode: SendIgnoreErrors,
                body: msgBody
            }
        );
        self.nextItemIndex = self.nextItemIndex + 1;
    }

    receive(msg: ChangeNftCollectionOwner) {
        require(context().sender == self.owner, "not owner");
        let changeOwnerCell: Cell = beginCell()
            .storeUint(3, 32)
            .storeUint(0, 64)
            .storeAddress(msg.new_owner)
            .endCell();
        send(
            SendParameters{
                to: self.nft_address,
                bounce: false,
                value: gasConsumption,
                body: changeOwnerCell
            }
        );
    }

    get fun prices(): map<Int, NftType> {
        return self.prices;
    }

}