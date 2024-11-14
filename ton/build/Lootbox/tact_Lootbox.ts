import { 
    Cell,
    Slice, 
    Address, 
    Builder, 
    beginCell, 
    ComputeError, 
    TupleItem, 
    TupleReader, 
    Dictionary, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    Contract, 
    ContractABI, 
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function loadTupleDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function storeTupleDeploy(source: Deploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function loadTupleDeployOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function storeTupleDeployOk(source: DeployOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function loadTupleFactoryDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function storeTupleFactoryDeploy(source: FactoryDeploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

function loadTupleChangeOwner(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

function storeTupleChangeOwner(source: ChangeOwner) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

function loadTupleChangeOwnerOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type MintFromAllowedToMint = {
    $$type: 'MintFromAllowedToMint';
    to: Address;
    nftType: bigint;
    nftItem: bigint;
}

export function storeMintFromAllowedToMint(src: MintFromAllowedToMint) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(96012249, 32);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.nftType, 257);
        b_0.storeInt(src.nftItem, 257);
    };
}

export function loadMintFromAllowedToMint(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 96012249) { throw Error('Invalid prefix'); }
    let _to = sc_0.loadAddress();
    let _nftType = sc_0.loadIntBig(257);
    let _nftItem = sc_0.loadIntBig(257);
    return { $$type: 'MintFromAllowedToMint' as const, to: _to, nftType: _nftType, nftItem: _nftItem };
}

function loadTupleMintFromAllowedToMint(source: TupleReader) {
    let _to = source.readAddress();
    let _nftType = source.readBigNumber();
    let _nftItem = source.readBigNumber();
    return { $$type: 'MintFromAllowedToMint' as const, to: _to, nftType: _nftType, nftItem: _nftItem };
}

function storeTupleMintFromAllowedToMint(source: MintFromAllowedToMint) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.to);
    builder.writeNumber(source.nftType);
    builder.writeNumber(source.nftItem);
    return builder.build();
}

function dictValueParserMintFromAllowedToMint(): DictionaryValue<MintFromAllowedToMint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMintFromAllowedToMint(src)).endCell());
        },
        parse: (src) => {
            return loadMintFromAllowedToMint(src.loadRef().beginParse());
        }
    }
}

export type Rarity = {
    $$type: 'Rarity';
    Basic: bigint;
    Special: bigint;
    Rare: bigint;
    Epic: bigint;
    Legendary: bigint;
}

export function storeRarity(src: Rarity) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.Basic, 257);
        b_0.storeInt(src.Special, 257);
        b_0.storeInt(src.Rare, 257);
        let b_1 = new Builder();
        b_1.storeInt(src.Epic, 257);
        b_1.storeInt(src.Legendary, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadRarity(slice: Slice) {
    let sc_0 = slice;
    let _Basic = sc_0.loadIntBig(257);
    let _Special = sc_0.loadIntBig(257);
    let _Rare = sc_0.loadIntBig(257);
    let sc_1 = sc_0.loadRef().beginParse();
    let _Epic = sc_1.loadIntBig(257);
    let _Legendary = sc_1.loadIntBig(257);
    return { $$type: 'Rarity' as const, Basic: _Basic, Special: _Special, Rare: _Rare, Epic: _Epic, Legendary: _Legendary };
}

function loadTupleRarity(source: TupleReader) {
    let _Basic = source.readBigNumber();
    let _Special = source.readBigNumber();
    let _Rare = source.readBigNumber();
    let _Epic = source.readBigNumber();
    let _Legendary = source.readBigNumber();
    return { $$type: 'Rarity' as const, Basic: _Basic, Special: _Special, Rare: _Rare, Epic: _Epic, Legendary: _Legendary };
}

function storeTupleRarity(source: Rarity) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.Basic);
    builder.writeNumber(source.Special);
    builder.writeNumber(source.Rare);
    builder.writeNumber(source.Epic);
    builder.writeNumber(source.Legendary);
    return builder.build();
}

function dictValueParserRarity(): DictionaryValue<Rarity> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRarity(src)).endCell());
        },
        parse: (src) => {
            return loadRarity(src.loadRef().beginParse());
        }
    }
}

export type NftItem = {
    $$type: 'NftItem';
    type: bigint;
    index: bigint;
    data: string;
}

export function storeNftItem(src: NftItem) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.type, 257);
        b_0.storeInt(src.index, 257);
        b_0.storeStringRefTail(src.data);
    };
}

export function loadNftItem(slice: Slice) {
    let sc_0 = slice;
    let _type = sc_0.loadIntBig(257);
    let _index = sc_0.loadIntBig(257);
    let _data = sc_0.loadStringRefTail();
    return { $$type: 'NftItem' as const, type: _type, index: _index, data: _data };
}

function loadTupleNftItem(source: TupleReader) {
    let _type = source.readBigNumber();
    let _index = source.readBigNumber();
    let _data = source.readString();
    return { $$type: 'NftItem' as const, type: _type, index: _index, data: _data };
}

function storeTupleNftItem(source: NftItem) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.type);
    builder.writeNumber(source.index);
    builder.writeString(source.data);
    return builder.build();
}

export function dictValueParserNftItem(): DictionaryValue<NftItem> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNftItem(src)).endCell());
        },
        parse: (src) => {
            return loadNftItem(src.loadRef().beginParse());
        }
    }
}

export type RarityType = {
    $$type: 'RarityType';
    amount: bigint;
    items: Dictionary<bigint, NftItem>;
}

export function storeRarityType(src: RarityType) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.amount, 257);
        b_0.storeDict(src.items, Dictionary.Keys.BigInt(257), dictValueParserNftItem());
    };
}

export function loadRarityType(slice: Slice) {
    let sc_0 = slice;
    let _amount = sc_0.loadIntBig(257);
    let _items = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserNftItem(), sc_0);
    return { $$type: 'RarityType' as const, amount: _amount, items: _items };
}

function loadTupleRarityType(source: TupleReader) {
    let _amount = source.readBigNumber();
    let _items = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserNftItem(), source.readCellOpt());
    return { $$type: 'RarityType' as const, amount: _amount, items: _items };
}

function storeTupleRarityType(source: RarityType) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeCell(source.items.size > 0 ? beginCell().storeDictDirect(source.items, Dictionary.Keys.BigInt(257), dictValueParserNftItem()).endCell() : null);
    return builder.build();
}

export function dictValueParserRarityType(): DictionaryValue<RarityType> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRarityType(src)).endCell());
        },
        parse: (src) => {
            return loadRarityType(src.loadRef().beginParse());
        }
    }
}

export type SetWorkStatus = {
    $$type: 'SetWorkStatus';
    status: boolean;
}

export function storeSetWorkStatus(src: SetWorkStatus) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2759222066, 32);
        b_0.storeBit(src.status);
    };
}

export function loadSetWorkStatus(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2759222066) { throw Error('Invalid prefix'); }
    let _status = sc_0.loadBit();
    return { $$type: 'SetWorkStatus' as const, status: _status };
}

function loadTupleSetWorkStatus(source: TupleReader) {
    let _status = source.readBoolean();
    return { $$type: 'SetWorkStatus' as const, status: _status };
}

function storeTupleSetWorkStatus(source: SetWorkStatus) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.status);
    return builder.build();
}

function dictValueParserSetWorkStatus(): DictionaryValue<SetWorkStatus> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetWorkStatus(src)).endCell());
        },
        parse: (src) => {
            return loadSetWorkStatus(src.loadRef().beginParse());
        }
    }
}

export type SetFeeCollector = {
    $$type: 'SetFeeCollector';
    feeCollector: Address;
}

export function storeSetFeeCollector(src: SetFeeCollector) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2539461976, 32);
        b_0.storeAddress(src.feeCollector);
    };
}

export function loadSetFeeCollector(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2539461976) { throw Error('Invalid prefix'); }
    let _feeCollector = sc_0.loadAddress();
    return { $$type: 'SetFeeCollector' as const, feeCollector: _feeCollector };
}

function loadTupleSetFeeCollector(source: TupleReader) {
    let _feeCollector = source.readAddress();
    return { $$type: 'SetFeeCollector' as const, feeCollector: _feeCollector };
}

function storeTupleSetFeeCollector(source: SetFeeCollector) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.feeCollector);
    return builder.build();
}

function dictValueParserSetFeeCollector(): DictionaryValue<SetFeeCollector> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetFeeCollector(src)).endCell());
        },
        parse: (src) => {
            return loadSetFeeCollector(src.loadRef().beginParse());
        }
    }
}

export type SetPrice = {
    $$type: 'SetPrice';
    price: bigint;
}

export function storeSetPrice(src: SetPrice) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(500092971, 32);
        b_0.storeInt(src.price, 257);
    };
}

export function loadSetPrice(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 500092971) { throw Error('Invalid prefix'); }
    let _price = sc_0.loadIntBig(257);
    return { $$type: 'SetPrice' as const, price: _price };
}

function loadTupleSetPrice(source: TupleReader) {
    let _price = source.readBigNumber();
    return { $$type: 'SetPrice' as const, price: _price };
}

function storeTupleSetPrice(source: SetPrice) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.price);
    return builder.build();
}

function dictValueParserSetPrice(): DictionaryValue<SetPrice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPrice(src)).endCell());
        },
        parse: (src) => {
            return loadSetPrice(src.loadRef().beginParse());
        }
    }
}

export type SetRarity = {
    $$type: 'SetRarity';
    itemsByRarity: Dictionary<bigint, RarityType>;
}

export function storeSetRarity(src: SetRarity) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(322173811, 32);
        b_0.storeDict(src.itemsByRarity, Dictionary.Keys.BigInt(257), dictValueParserRarityType());
    };
}

export function loadSetRarity(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 322173811) { throw Error('Invalid prefix'); }
    let _itemsByRarity = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserRarityType(), sc_0);
    return { $$type: 'SetRarity' as const, itemsByRarity: _itemsByRarity };
}

function loadTupleSetRarity(source: TupleReader) {
    let _itemsByRarity = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserRarityType(), source.readCellOpt());
    return { $$type: 'SetRarity' as const, itemsByRarity: _itemsByRarity };
}

function storeTupleSetRarity(source: SetRarity) {
    let builder = new TupleBuilder();
    builder.writeCell(source.itemsByRarity.size > 0 ? beginCell().storeDictDirect(source.itemsByRarity, Dictionary.Keys.BigInt(257), dictValueParserRarityType()).endCell() : null);
    return builder.build();
}

function dictValueParserSetRarity(): DictionaryValue<SetRarity> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetRarity(src)).endCell());
        },
        parse: (src) => {
            return loadSetRarity(src.loadRef().beginParse());
        }
    }
}

export type SetNftShopAddress = {
    $$type: 'SetNftShopAddress';
    address: Address;
}

export function storeSetNftShopAddress(src: SetNftShopAddress) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2554656096, 32);
        b_0.storeAddress(src.address);
    };
}

export function loadSetNftShopAddress(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2554656096) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    return { $$type: 'SetNftShopAddress' as const, address: _address };
}

function loadTupleSetNftShopAddress(source: TupleReader) {
    let _address = source.readAddress();
    return { $$type: 'SetNftShopAddress' as const, address: _address };
}

function storeTupleSetNftShopAddress(source: SetNftShopAddress) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    return builder.build();
}

function dictValueParserSetNftShopAddress(): DictionaryValue<SetNftShopAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetNftShopAddress(src)).endCell());
        },
        parse: (src) => {
            return loadSetNftShopAddress(src.loadRef().beginParse());
        }
    }
}

export type Mint = {
    $$type: 'Mint';
    recipient: Address;
    type: bigint;
    type_index: bigint;
    data: string;
}

export function storeMint(src: Mint) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2552375875, 32);
        b_0.storeAddress(src.recipient);
        b_0.storeInt(src.type, 257);
        b_0.storeInt(src.type_index, 257);
        b_0.storeStringRefTail(src.data);
    };
}

export function loadMint(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2552375875) { throw Error('Invalid prefix'); }
    let _recipient = sc_0.loadAddress();
    let _type = sc_0.loadIntBig(257);
    let _type_index = sc_0.loadIntBig(257);
    let _data = sc_0.loadStringRefTail();
    return { $$type: 'Mint' as const, recipient: _recipient, type: _type, type_index: _type_index, data: _data };
}

function loadTupleMint(source: TupleReader) {
    let _recipient = source.readAddress();
    let _type = source.readBigNumber();
    let _type_index = source.readBigNumber();
    let _data = source.readString();
    return { $$type: 'Mint' as const, recipient: _recipient, type: _type, type_index: _type_index, data: _data };
}

function storeTupleMint(source: Mint) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.type);
    builder.writeNumber(source.type_index);
    builder.writeString(source.data);
    return builder.build();
}

function dictValueParserMint(): DictionaryValue<Mint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMint(src)).endCell());
        },
        parse: (src) => {
            return loadMint(src.loadRef().beginParse());
        }
    }
}

 type Lootbox_init_args = {
    $$type: 'Lootbox_init_args';
    owner: Address;
    price: bigint;
    feeCollector: Address;
    nftShopAddress: Address;
    itemsByRarity: Dictionary<bigint, RarityType>;
    rarityPercent: Dictionary<bigint, bigint>;
}

function initLootbox_init_args(src: Lootbox_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.price, 257);
        b_0.storeAddress(src.feeCollector);
        let b_1 = new Builder();
        b_1.storeAddress(src.nftShopAddress);
        b_1.storeDict(src.itemsByRarity, Dictionary.Keys.BigInt(257), dictValueParserRarityType());
        b_1.storeDict(src.rarityPercent, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_0.storeRef(b_1.endCell());
    };
}

async function Lootbox_init(owner: Address, price: bigint, feeCollector: Address, nftShopAddress: Address, itemsByRarity: Dictionary<bigint, RarityType>, rarityPercent: Dictionary<bigint, bigint>) {
    const __code = Cell.fromBase64('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');
    const __system = Cell.fromBase64('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');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initLootbox_init_args({ $$type: 'Lootbox_init_args', owner, price, feeCollector, nftShopAddress, itemsByRarity, rarityPercent })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const Lootbox_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack underflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    137: { message: `Masterchain support is not enabled for this contract` },
    4181: { message: `not working` },
    46093: { message: `value does not equal price to pay` },
    49280: { message: `not owner` },
}

const Lootbox_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MintFromAllowedToMint","header":96012249,"fields":[{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"nftType","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nftItem","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Rarity","header":null,"fields":[{"name":"Basic","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"Special","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"Rare","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"Epic","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"Legendary","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"NftItem","header":null,"fields":[{"name":"type","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"index","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"data","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"RarityType","header":null,"fields":[{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"items","type":{"kind":"dict","key":"int","value":"NftItem","valueFormat":"ref"}}]},
    {"name":"SetWorkStatus","header":2759222066,"fields":[{"name":"status","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SetFeeCollector","header":2539461976,"fields":[{"name":"feeCollector","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetPrice","header":500092971,"fields":[{"name":"price","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SetRarity","header":322173811,"fields":[{"name":"itemsByRarity","type":{"kind":"dict","key":"int","value":"RarityType","valueFormat":"ref"}}]},
    {"name":"SetNftShopAddress","header":2554656096,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Mint","header":2552375875,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"type","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"type_index","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"data","type":{"kind":"simple","type":"string","optional":false}}]},
]

const Lootbox_getters: ABIGetter[] = [
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const Lootbox_getterMapping: { [key: string]: string } = {
    'owner': 'getOwner',
}

const Lootbox_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SetWorkStatus"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetFeeCollector"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetNftShopAddress"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetRarity"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPrice"}},
    {"receiver":"internal","message":{"kind":"text","text":"Buy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
]

export class Lootbox implements Contract {
    
    static async init(owner: Address, price: bigint, feeCollector: Address, nftShopAddress: Address, itemsByRarity: Dictionary<bigint, RarityType>, rarityPercent: Dictionary<bigint, bigint>) {
        return await Lootbox_init(owner, price, feeCollector, nftShopAddress, itemsByRarity, rarityPercent);
    }
    
    static async fromInit(owner: Address, price: bigint, feeCollector: Address, nftShopAddress: Address, itemsByRarity: Dictionary<bigint, RarityType>, rarityPercent: Dictionary<bigint, bigint>) {
        const init = await Lootbox_init(owner, price, feeCollector, nftShopAddress, itemsByRarity, rarityPercent);
        const address = contractAddress(0, init);
        return new Lootbox(address, init);
    }
    
    static fromAddress(address: Address) {
        return new Lootbox(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Lootbox_types,
        getters: Lootbox_getters,
        receivers: Lootbox_receivers,
        errors: Lootbox_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: SetWorkStatus | SetFeeCollector | SetNftShopAddress | SetRarity | SetPrice | 'Buy' | Deploy | ChangeOwner) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetWorkStatus') {
            body = beginCell().store(storeSetWorkStatus(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetFeeCollector') {
            body = beginCell().store(storeSetFeeCollector(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetNftShopAddress') {
            body = beginCell().store(storeSetNftShopAddress(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetRarity') {
            body = beginCell().store(storeSetRarity(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPrice') {
            body = beginCell().store(storeSetPrice(message)).endCell();
        }
        if (message === 'Buy') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeOwner') {
            body = beginCell().store(storeChangeOwner(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}