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

export type NftType = {
    $$type: 'NftType';
    data: string;
    prices: Dictionary<bigint, bigint>;
}

export function storeNftType(src: NftType) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeStringRefTail(src.data);
        b_0.storeDict(src.prices, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
    };
}

export function loadNftType(slice: Slice) {
    let sc_0 = slice;
    let _data = sc_0.loadStringRefTail();
    let _prices = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_0);
    return { $$type: 'NftType' as const, data: _data, prices: _prices };
}

function loadTupleNftType(source: TupleReader) {
    let _data = source.readString();
    let _prices = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'NftType' as const, data: _data, prices: _prices };
}

function storeTupleNftType(source: NftType) {
    let builder = new TupleBuilder();
    builder.writeString(source.data);
    builder.writeCell(source.prices.size > 0 ? beginCell().storeDictDirect(source.prices, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    return builder.build();
}

export function dictValueParserNftType(): DictionaryValue<NftType> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNftType(src)).endCell());
        },
        parse: (src) => {
            return loadNftType(src.loadRef().beginParse());
        }
    }
}

export type SetNftAddress = {
    $$type: 'SetNftAddress';
    address: Address;
}

export function storeSetNftAddress(src: SetNftAddress) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(4235524936, 32);
        b_0.storeAddress(src.address);
    };
}

export function loadSetNftAddress(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 4235524936) { throw Error('Invalid prefix'); }
    let _address = sc_0.loadAddress();
    return { $$type: 'SetNftAddress' as const, address: _address };
}

function loadTupleSetNftAddress(source: TupleReader) {
    let _address = source.readAddress();
    return { $$type: 'SetNftAddress' as const, address: _address };
}

function storeTupleSetNftAddress(source: SetNftAddress) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.address);
    return builder.build();
}

function dictValueParserSetNftAddress(): DictionaryValue<SetNftAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetNftAddress(src)).endCell());
        },
        parse: (src) => {
            return loadSetNftAddress(src.loadRef().beginParse());
        }
    }
}

export type SetPrices = {
    $$type: 'SetPrices';
    prices: Dictionary<bigint, NftType>;
}

export function storeSetPrices(src: SetPrices) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2097036430, 32);
        b_0.storeDict(src.prices, Dictionary.Keys.BigInt(257), dictValueParserNftType());
    };
}

export function loadSetPrices(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2097036430) { throw Error('Invalid prefix'); }
    let _prices = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserNftType(), sc_0);
    return { $$type: 'SetPrices' as const, prices: _prices };
}

function loadTupleSetPrices(source: TupleReader) {
    let _prices = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserNftType(), source.readCellOpt());
    return { $$type: 'SetPrices' as const, prices: _prices };
}

function storeTupleSetPrices(source: SetPrices) {
    let builder = new TupleBuilder();
    builder.writeCell(source.prices.size > 0 ? beginCell().storeDictDirect(source.prices, Dictionary.Keys.BigInt(257), dictValueParserNftType()).endCell() : null);
    return builder.build();
}

function dictValueParserSetPrices(): DictionaryValue<SetPrices> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPrices(src)).endCell());
        },
        parse: (src) => {
            return loadSetPrices(src.loadRef().beginParse());
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

export type Buy = {
    $$type: 'Buy';
    nftType: bigint;
    nftItem: bigint;
}

export function storeBuy(src: Buy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3491171472, 32);
        b_0.storeInt(src.nftType, 257);
        b_0.storeInt(src.nftItem, 257);
    };
}

export function loadBuy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3491171472) { throw Error('Invalid prefix'); }
    let _nftType = sc_0.loadIntBig(257);
    let _nftItem = sc_0.loadIntBig(257);
    return { $$type: 'Buy' as const, nftType: _nftType, nftItem: _nftItem };
}

function loadTupleBuy(source: TupleReader) {
    let _nftType = source.readBigNumber();
    let _nftItem = source.readBigNumber();
    return { $$type: 'Buy' as const, nftType: _nftType, nftItem: _nftItem };
}

function storeTupleBuy(source: Buy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.nftType);
    builder.writeNumber(source.nftItem);
    return builder.build();
}

function dictValueParserBuy(): DictionaryValue<Buy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBuy(src)).endCell());
        },
        parse: (src) => {
            return loadBuy(src.loadRef().beginParse());
        }
    }
}

export type ChangeNftCollectionOwner = {
    $$type: 'ChangeNftCollectionOwner';
    new_owner: Address;
}

export function storeChangeNftCollectionOwner(src: ChangeNftCollectionOwner) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(485130862, 32);
        b_0.storeAddress(src.new_owner);
    };
}

export function loadChangeNftCollectionOwner(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 485130862) { throw Error('Invalid prefix'); }
    let _new_owner = sc_0.loadAddress();
    return { $$type: 'ChangeNftCollectionOwner' as const, new_owner: _new_owner };
}

function loadTupleChangeNftCollectionOwner(source: TupleReader) {
    let _new_owner = source.readAddress();
    return { $$type: 'ChangeNftCollectionOwner' as const, new_owner: _new_owner };
}

function storeTupleChangeNftCollectionOwner(source: ChangeNftCollectionOwner) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.new_owner);
    return builder.build();
}

function dictValueParserChangeNftCollectionOwner(): DictionaryValue<ChangeNftCollectionOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeNftCollectionOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeNftCollectionOwner(src.loadRef().beginParse());
        }
    }
}

export type SetAllowedMint = {
    $$type: 'SetAllowedMint';
    minter: Address;
    allowed: boolean;
}

export function storeSetAllowedMint(src: SetAllowedMint) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3500333732, 32);
        b_0.storeAddress(src.minter);
        b_0.storeBit(src.allowed);
    };
}

export function loadSetAllowedMint(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3500333732) { throw Error('Invalid prefix'); }
    let _minter = sc_0.loadAddress();
    let _allowed = sc_0.loadBit();
    return { $$type: 'SetAllowedMint' as const, minter: _minter, allowed: _allowed };
}

function loadTupleSetAllowedMint(source: TupleReader) {
    let _minter = source.readAddress();
    let _allowed = source.readBoolean();
    return { $$type: 'SetAllowedMint' as const, minter: _minter, allowed: _allowed };
}

function storeTupleSetAllowedMint(source: SetAllowedMint) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.minter);
    builder.writeBoolean(source.allowed);
    return builder.build();
}

function dictValueParserSetAllowedMint(): DictionaryValue<SetAllowedMint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetAllowedMint(src)).endCell());
        },
        parse: (src) => {
            return loadSetAllowedMint(src.loadRef().beginParse());
        }
    }
}

 type NftShop_init_args = {
    $$type: 'NftShop_init_args';
    owner: Address;
    feeCollector: Address;
    nft_address: Address;
    prices: Dictionary<bigint, NftType>;
    nextItemIndex: bigint;
    allowedMint: Dictionary<Address, boolean>;
}

function initNftShop_init_args(src: NftShop_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.feeCollector);
        b_0.storeAddress(src.nft_address);
        b_0.storeDict(src.prices, Dictionary.Keys.BigInt(257), dictValueParserNftType());
        let b_1 = new Builder();
        b_1.storeInt(src.nextItemIndex, 257);
        b_1.storeDict(src.allowedMint, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_0.storeRef(b_1.endCell());
    };
}

async function NftShop_init(owner: Address, feeCollector: Address, nft_address: Address, prices: Dictionary<bigint, NftType>, nextItemIndex: bigint, allowedMint: Dictionary<Address, boolean>) {
    const __code = Cell.fromBase64('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');
    const __system = Cell.fromBase64('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');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initNftShop_init_args({ $$type: 'NftShop_init_args', owner, feeCollector, nft_address, prices, nextItemIndex, allowedMint })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const NftShop_errors: { [key: number]: { message: string } } = {
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
    22049: { message: `not allowed to mint` },
    46093: { message: `value does not equal price to pay` },
    49280: { message: `not owner` },
}

const NftShop_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MintFromAllowedToMint","header":96012249,"fields":[{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"nftType","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nftItem","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"NftType","header":null,"fields":[{"name":"data","type":{"kind":"simple","type":"string","optional":false}},{"name":"prices","type":{"kind":"dict","key":"int","value":"int"}}]},
    {"name":"SetNftAddress","header":4235524936,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetPrices","header":2097036430,"fields":[{"name":"prices","type":{"kind":"dict","key":"int","value":"NftType","valueFormat":"ref"}}]},
    {"name":"SetWorkStatus","header":2759222066,"fields":[{"name":"status","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SetFeeCollector","header":2539461976,"fields":[{"name":"feeCollector","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Buy","header":3491171472,"fields":[{"name":"nftType","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nftItem","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ChangeNftCollectionOwner","header":485130862,"fields":[{"name":"new_owner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetAllowedMint","header":3500333732,"fields":[{"name":"minter","type":{"kind":"simple","type":"address","optional":false}},{"name":"allowed","type":{"kind":"simple","type":"bool","optional":false}}]},
]

const NftShop_getters: ABIGetter[] = [
    {"name":"prices","arguments":[],"returnType":{"kind":"dict","key":"int","value":"NftType","valueFormat":"ref"}},
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const NftShop_getterMapping: { [key: string]: string } = {
    'prices': 'getPrices',
    'owner': 'getOwner',
}

const NftShop_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SetAllowedMint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetNftAddress"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPrices"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetWorkStatus"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetFeeCollector"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Buy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"MintFromAllowedToMint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeNftCollectionOwner"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
]

export class NftShop implements Contract {
    
    static async init(owner: Address, feeCollector: Address, nft_address: Address, prices: Dictionary<bigint, NftType>, nextItemIndex: bigint, allowedMint: Dictionary<Address, boolean>) {
        return await NftShop_init(owner, feeCollector, nft_address, prices, nextItemIndex, allowedMint);
    }
    
    static async fromInit(owner: Address, feeCollector: Address, nft_address: Address, prices: Dictionary<bigint, NftType>, nextItemIndex: bigint, allowedMint: Dictionary<Address, boolean>) {
        const init = await NftShop_init(owner, feeCollector, nft_address, prices, nextItemIndex, allowedMint);
        const address = contractAddress(0, init);
        return new NftShop(address, init);
    }
    
    static fromAddress(address: Address) {
        return new NftShop(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  NftShop_types,
        getters: NftShop_getters,
        receivers: NftShop_receivers,
        errors: NftShop_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: SetAllowedMint | SetNftAddress | SetPrices | SetWorkStatus | SetFeeCollector | Buy | MintFromAllowedToMint | ChangeNftCollectionOwner | Deploy | ChangeOwner) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetAllowedMint') {
            body = beginCell().store(storeSetAllowedMint(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetNftAddress') {
            body = beginCell().store(storeSetNftAddress(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPrices') {
            body = beginCell().store(storeSetPrices(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetWorkStatus') {
            body = beginCell().store(storeSetWorkStatus(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetFeeCollector') {
            body = beginCell().store(storeSetFeeCollector(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Buy') {
            body = beginCell().store(storeBuy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MintFromAllowedToMint') {
            body = beginCell().store(storeMintFromAllowedToMint(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeNftCollectionOwner') {
            body = beginCell().store(storeChangeNftCollectionOwner(message)).endCell();
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
    
    async getPrices(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('prices', builder.build())).stack;
        let result = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserNftType(), source.readCellOpt());
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}