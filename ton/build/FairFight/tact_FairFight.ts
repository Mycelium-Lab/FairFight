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

export type FightMsg = {
    $$type: 'FightMsg';
    amountPerRound: bigint;
    rounds: bigint;
    maxPlayersAmount: bigint;
}

export function storeFightMsg(src: FightMsg) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(586963753, 32);
        b_0.storeCoins(src.amountPerRound);
        b_0.storeInt(src.rounds, 257);
        b_0.storeInt(src.maxPlayersAmount, 257);
    };
}

export function loadFightMsg(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 586963753) { throw Error('Invalid prefix'); }
    let _amountPerRound = sc_0.loadCoins();
    let _rounds = sc_0.loadIntBig(257);
    let _maxPlayersAmount = sc_0.loadIntBig(257);
    return { $$type: 'FightMsg' as const, amountPerRound: _amountPerRound, rounds: _rounds, maxPlayersAmount: _maxPlayersAmount };
}

function loadTupleFightMsg(source: TupleReader) {
    let _amountPerRound = source.readBigNumber();
    let _rounds = source.readBigNumber();
    let _maxPlayersAmount = source.readBigNumber();
    return { $$type: 'FightMsg' as const, amountPerRound: _amountPerRound, rounds: _rounds, maxPlayersAmount: _maxPlayersAmount };
}

function storeTupleFightMsg(source: FightMsg) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amountPerRound);
    builder.writeNumber(source.rounds);
    builder.writeNumber(source.maxPlayersAmount);
    return builder.build();
}

function dictValueParserFightMsg(): DictionaryValue<FightMsg> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFightMsg(src)).endCell());
        },
        parse: (src) => {
            return loadFightMsg(src.loadRef().beginParse());
        }
    }
}

export type Join = {
    $$type: 'Join';
    id: bigint;
}

export function storeJoin(src: Join) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1172312541, 32);
        b_0.storeInt(src.id, 257);
    };
}

export function loadJoin(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1172312541) { throw Error('Invalid prefix'); }
    let _id = sc_0.loadIntBig(257);
    return { $$type: 'Join' as const, id: _id };
}

function loadTupleJoin(source: TupleReader) {
    let _id = source.readBigNumber();
    return { $$type: 'Join' as const, id: _id };
}

function storeTupleJoin(source: Join) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.id);
    return builder.build();
}

function dictValueParserJoin(): DictionaryValue<Join> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJoin(src)).endCell());
        },
        parse: (src) => {
            return loadJoin(src.loadRef().beginParse());
        }
    }
}

export type Withdraw = {
    $$type: 'Withdraw';
    id: bigint;
}

export function storeWithdraw(src: Withdraw) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(465817403, 32);
        b_0.storeInt(src.id, 257);
    };
}

export function loadWithdraw(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 465817403) { throw Error('Invalid prefix'); }
    let _id = sc_0.loadIntBig(257);
    return { $$type: 'Withdraw' as const, id: _id };
}

function loadTupleWithdraw(source: TupleReader) {
    let _id = source.readBigNumber();
    return { $$type: 'Withdraw' as const, id: _id };
}

function storeTupleWithdraw(source: Withdraw) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.id);
    return builder.build();
}

function dictValueParserWithdraw(): DictionaryValue<Withdraw> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdraw(src)).endCell());
        },
        parse: (src) => {
            return loadWithdraw(src.loadRef().beginParse());
        }
    }
}

export type FinishData = {
    $$type: 'FinishData';
    id: bigint;
    address: Address;
    contract: Address;
    amount: bigint;
}

export function storeFinishData(src: FinishData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3077991154, 32);
        b_0.storeInt(src.id, 257);
        b_0.storeAddress(src.address);
        b_0.storeAddress(src.contract);
        b_0.storeCoins(src.amount);
    };
}

export function loadFinishData(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3077991154) { throw Error('Invalid prefix'); }
    let _id = sc_0.loadIntBig(257);
    let _address = sc_0.loadAddress();
    let _contract = sc_0.loadAddress();
    let _amount = sc_0.loadCoins();
    return { $$type: 'FinishData' as const, id: _id, address: _address, contract: _contract, amount: _amount };
}

function loadTupleFinishData(source: TupleReader) {
    let _id = source.readBigNumber();
    let _address = source.readAddress();
    let _contract = source.readAddress();
    let _amount = source.readBigNumber();
    return { $$type: 'FinishData' as const, id: _id, address: _address, contract: _contract, amount: _amount };
}

function storeTupleFinishData(source: FinishData) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.id);
    builder.writeAddress(source.address);
    builder.writeAddress(source.contract);
    builder.writeNumber(source.amount);
    return builder.build();
}

function dictValueParserFinishData(): DictionaryValue<FinishData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFinishData(src)).endCell());
        },
        parse: (src) => {
            return loadFinishData(src.loadRef().beginParse());
        }
    }
}

export type Finish = {
    $$type: 'Finish';
    data: FinishData;
    signature: Slice;
}

export function storeFinish(src: Finish) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1707239921, 32);
        b_0.store(storeFinishData(src.data));
        b_0.storeRef(src.signature.asCell());
    };
}

export function loadFinish(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1707239921) { throw Error('Invalid prefix'); }
    let _data = loadFinishData(sc_0);
    let _signature = sc_0.loadRef().asSlice();
    return { $$type: 'Finish' as const, data: _data, signature: _signature };
}

function loadTupleFinish(source: TupleReader) {
    const _data = loadTupleFinishData(source.readTuple());
    let _signature = source.readCell().asSlice();
    return { $$type: 'Finish' as const, data: _data, signature: _signature };
}

function storeTupleFinish(source: Finish) {
    let builder = new TupleBuilder();
    builder.writeTuple(storeTupleFinishData(source.data));
    builder.writeSlice(source.signature.asCell());
    return builder.build();
}

function dictValueParserFinish(): DictionaryValue<Finish> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFinish(src)).endCell());
        },
        parse: (src) => {
            return loadFinish(src.loadRef().beginParse());
        }
    }
}

export type FightJoin = {
    $$type: 'FightJoin';
    id: bigint;
    joiner: Address;
}

export function storeFightJoin(src: FightJoin) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2018577786, 32);
        b_0.storeInt(src.id, 257);
        b_0.storeAddress(src.joiner);
    };
}

export function loadFightJoin(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2018577786) { throw Error('Invalid prefix'); }
    let _id = sc_0.loadIntBig(257);
    let _joiner = sc_0.loadAddress();
    return { $$type: 'FightJoin' as const, id: _id, joiner: _joiner };
}

function loadTupleFightJoin(source: TupleReader) {
    let _id = source.readBigNumber();
    let _joiner = source.readAddress();
    return { $$type: 'FightJoin' as const, id: _id, joiner: _joiner };
}

function storeTupleFightJoin(source: FightJoin) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.id);
    builder.writeAddress(source.joiner);
    return builder.build();
}

function dictValueParserFightJoin(): DictionaryValue<FightJoin> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFightJoin(src)).endCell());
        },
        parse: (src) => {
            return loadFightJoin(src.loadRef().beginParse());
        }
    }
}

export type ChangeSignerPublicKey = {
    $$type: 'ChangeSignerPublicKey';
    signerPublicKey: bigint;
}

export function storeChangeSignerPublicKey(src: ChangeSignerPublicKey) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(4087772316, 32);
        b_0.storeInt(src.signerPublicKey, 257);
    };
}

export function loadChangeSignerPublicKey(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 4087772316) { throw Error('Invalid prefix'); }
    let _signerPublicKey = sc_0.loadIntBig(257);
    return { $$type: 'ChangeSignerPublicKey' as const, signerPublicKey: _signerPublicKey };
}

function loadTupleChangeSignerPublicKey(source: TupleReader) {
    let _signerPublicKey = source.readBigNumber();
    return { $$type: 'ChangeSignerPublicKey' as const, signerPublicKey: _signerPublicKey };
}

function storeTupleChangeSignerPublicKey(source: ChangeSignerPublicKey) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.signerPublicKey);
    return builder.build();
}

function dictValueParserChangeSignerPublicKey(): DictionaryValue<ChangeSignerPublicKey> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeSignerPublicKey(src)).endCell());
        },
        parse: (src) => {
            return loadChangeSignerPublicKey(src.loadRef().beginParse());
        }
    }
}

export type ChangeFee = {
    $$type: 'ChangeFee';
    fee: bigint;
}

export function storeChangeFee(src: ChangeFee) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(179207920, 32);
        b_0.storeInt(src.fee, 257);
    };
}

export function loadChangeFee(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 179207920) { throw Error('Invalid prefix'); }
    let _fee = sc_0.loadIntBig(257);
    return { $$type: 'ChangeFee' as const, fee: _fee };
}

function loadTupleChangeFee(source: TupleReader) {
    let _fee = source.readBigNumber();
    return { $$type: 'ChangeFee' as const, fee: _fee };
}

function storeTupleChangeFee(source: ChangeFee) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.fee);
    return builder.build();
}

function dictValueParserChangeFee(): DictionaryValue<ChangeFee> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeFee(src)).endCell());
        },
        parse: (src) => {
            return loadChangeFee(src.loadRef().beginParse());
        }
    }
}

export type ChangeFeeCollector = {
    $$type: 'ChangeFeeCollector';
    feeCollector: Address;
}

export function storeChangeFeeCollector(src: ChangeFeeCollector) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(723028610, 32);
        b_0.storeAddress(src.feeCollector);
    };
}

export function loadChangeFeeCollector(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 723028610) { throw Error('Invalid prefix'); }
    let _feeCollector = sc_0.loadAddress();
    return { $$type: 'ChangeFeeCollector' as const, feeCollector: _feeCollector };
}

function loadTupleChangeFeeCollector(source: TupleReader) {
    let _feeCollector = source.readAddress();
    return { $$type: 'ChangeFeeCollector' as const, feeCollector: _feeCollector };
}

function storeTupleChangeFeeCollector(source: ChangeFeeCollector) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.feeCollector);
    return builder.build();
}

function dictValueParserChangeFeeCollector(): DictionaryValue<ChangeFeeCollector> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeFeeCollector(src)).endCell());
        },
        parse: (src) => {
            return loadChangeFeeCollector(src.loadRef().beginParse());
        }
    }
}

export type ChangeMaxPlayersAmount = {
    $$type: 'ChangeMaxPlayersAmount';
    maxPlayers: bigint;
}

export function storeChangeMaxPlayersAmount(src: ChangeMaxPlayersAmount) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3563588553, 32);
        b_0.storeInt(src.maxPlayers, 257);
    };
}

export function loadChangeMaxPlayersAmount(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3563588553) { throw Error('Invalid prefix'); }
    let _maxPlayers = sc_0.loadIntBig(257);
    return { $$type: 'ChangeMaxPlayersAmount' as const, maxPlayers: _maxPlayers };
}

function loadTupleChangeMaxPlayersAmount(source: TupleReader) {
    let _maxPlayers = source.readBigNumber();
    return { $$type: 'ChangeMaxPlayersAmount' as const, maxPlayers: _maxPlayers };
}

function storeTupleChangeMaxPlayersAmount(source: ChangeMaxPlayersAmount) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.maxPlayers);
    return builder.build();
}

function dictValueParserChangeMaxPlayersAmount(): DictionaryValue<ChangeMaxPlayersAmount> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeMaxPlayersAmount(src)).endCell());
        },
        parse: (src) => {
            return loadChangeMaxPlayersAmount(src.loadRef().beginParse());
        }
    }
}

export type ChangeMaxRoundsAmount = {
    $$type: 'ChangeMaxRoundsAmount';
    maxRounds: bigint;
}

export function storeChangeMaxRoundsAmount(src: ChangeMaxRoundsAmount) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2352005463, 32);
        b_0.storeInt(src.maxRounds, 257);
    };
}

export function loadChangeMaxRoundsAmount(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2352005463) { throw Error('Invalid prefix'); }
    let _maxRounds = sc_0.loadIntBig(257);
    return { $$type: 'ChangeMaxRoundsAmount' as const, maxRounds: _maxRounds };
}

function loadTupleChangeMaxRoundsAmount(source: TupleReader) {
    let _maxRounds = source.readBigNumber();
    return { $$type: 'ChangeMaxRoundsAmount' as const, maxRounds: _maxRounds };
}

function storeTupleChangeMaxRoundsAmount(source: ChangeMaxRoundsAmount) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.maxRounds);
    return builder.build();
}

function dictValueParserChangeMaxRoundsAmount(): DictionaryValue<ChangeMaxRoundsAmount> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeMaxRoundsAmount(src)).endCell());
        },
        parse: (src) => {
            return loadChangeMaxRoundsAmount(src.loadRef().beginParse());
        }
    }
}

export type ChangeMinAmountPerRound = {
    $$type: 'ChangeMinAmountPerRound';
    minAmountPerRound: bigint;
}

export function storeChangeMinAmountPerRound(src: ChangeMinAmountPerRound) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3670985398, 32);
        b_0.storeInt(src.minAmountPerRound, 257);
    };
}

export function loadChangeMinAmountPerRound(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3670985398) { throw Error('Invalid prefix'); }
    let _minAmountPerRound = sc_0.loadIntBig(257);
    return { $$type: 'ChangeMinAmountPerRound' as const, minAmountPerRound: _minAmountPerRound };
}

function loadTupleChangeMinAmountPerRound(source: TupleReader) {
    let _minAmountPerRound = source.readBigNumber();
    return { $$type: 'ChangeMinAmountPerRound' as const, minAmountPerRound: _minAmountPerRound };
}

function storeTupleChangeMinAmountPerRound(source: ChangeMinAmountPerRound) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.minAmountPerRound);
    return builder.build();
}

function dictValueParserChangeMinAmountPerRound(): DictionaryValue<ChangeMinAmountPerRound> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeMinAmountPerRound(src)).endCell());
        },
        parse: (src) => {
            return loadChangeMinAmountPerRound(src.loadRef().beginParse());
        }
    }
}

export type Fight = {
    $$type: 'Fight';
    id: bigint;
    owner: Address;
    createTime: bigint;
    finishTime: bigint;
    baseAmount: bigint;
    amountPerRound: bigint;
    rounds: bigint;
    maxPlayersAmount: bigint;
    players: Dictionary<bigint, Address>;
    playersCurrentLength: bigint;
    playersClaimed: Dictionary<Address, boolean>;
}

export function storeFight(src: Fight) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.id, 257);
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.createTime, 257);
        let b_1 = new Builder();
        b_1.storeInt(src.finishTime, 257);
        b_1.storeCoins(src.baseAmount);
        b_1.storeCoins(src.amountPerRound);
        b_1.storeInt(src.rounds, 257);
        b_1.storeInt(src.maxPlayersAmount, 257);
        b_1.storeDict(src.players, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        let b_2 = new Builder();
        b_2.storeInt(src.playersCurrentLength, 257);
        b_2.storeDict(src.playersClaimed, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadFight(slice: Slice) {
    let sc_0 = slice;
    let _id = sc_0.loadIntBig(257);
    let _owner = sc_0.loadAddress();
    let _createTime = sc_0.loadIntBig(257);
    let sc_1 = sc_0.loadRef().beginParse();
    let _finishTime = sc_1.loadIntBig(257);
    let _baseAmount = sc_1.loadCoins();
    let _amountPerRound = sc_1.loadCoins();
    let _rounds = sc_1.loadIntBig(257);
    let _maxPlayersAmount = sc_1.loadIntBig(257);
    let _players = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_1);
    let sc_2 = sc_1.loadRef().beginParse();
    let _playersCurrentLength = sc_2.loadIntBig(257);
    let _playersClaimed = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_2);
    return { $$type: 'Fight' as const, id: _id, owner: _owner, createTime: _createTime, finishTime: _finishTime, baseAmount: _baseAmount, amountPerRound: _amountPerRound, rounds: _rounds, maxPlayersAmount: _maxPlayersAmount, players: _players, playersCurrentLength: _playersCurrentLength, playersClaimed: _playersClaimed };
}

function loadTupleFight(source: TupleReader) {
    let _id = source.readBigNumber();
    let _owner = source.readAddress();
    let _createTime = source.readBigNumber();
    let _finishTime = source.readBigNumber();
    let _baseAmount = source.readBigNumber();
    let _amountPerRound = source.readBigNumber();
    let _rounds = source.readBigNumber();
    let _maxPlayersAmount = source.readBigNumber();
    let _players = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    let _playersCurrentLength = source.readBigNumber();
    let _playersClaimed = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'Fight' as const, id: _id, owner: _owner, createTime: _createTime, finishTime: _finishTime, baseAmount: _baseAmount, amountPerRound: _amountPerRound, rounds: _rounds, maxPlayersAmount: _maxPlayersAmount, players: _players, playersCurrentLength: _playersCurrentLength, playersClaimed: _playersClaimed };
}

function storeTupleFight(source: Fight) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.id);
    builder.writeAddress(source.owner);
    builder.writeNumber(source.createTime);
    builder.writeNumber(source.finishTime);
    builder.writeNumber(source.baseAmount);
    builder.writeNumber(source.amountPerRound);
    builder.writeNumber(source.rounds);
    builder.writeNumber(source.maxPlayersAmount);
    builder.writeCell(source.players.size > 0 ? beginCell().storeDictDirect(source.players, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeNumber(source.playersCurrentLength);
    builder.writeCell(source.playersClaimed.size > 0 ? beginCell().storeDictDirect(source.playersClaimed, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

function dictValueParserFight(): DictionaryValue<Fight> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFight(src)).endCell());
        },
        parse: (src) => {
            return loadFight(src.loadRef().beginParse());
        }
    }
}

export type Fee = {
    $$type: 'Fee';
    amount: bigint;
    fee: bigint;
}

export function storeFee(src: Fee) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeCoins(src.amount);
        b_0.storeCoins(src.fee);
    };
}

export function loadFee(slice: Slice) {
    let sc_0 = slice;
    let _amount = sc_0.loadCoins();
    let _fee = sc_0.loadCoins();
    return { $$type: 'Fee' as const, amount: _amount, fee: _fee };
}

function loadTupleFee(source: TupleReader) {
    let _amount = source.readBigNumber();
    let _fee = source.readBigNumber();
    return { $$type: 'Fee' as const, amount: _amount, fee: _fee };
}

function storeTupleFee(source: Fee) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeNumber(source.fee);
    return builder.build();
}

function dictValueParserFee(): DictionaryValue<Fee> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFee(src)).endCell());
        },
        parse: (src) => {
            return loadFee(src.loadRef().beginParse());
        }
    }
}

 type FairFight_init_args = {
    $$type: 'FairFight_init_args';
    owner: Address;
    signerPublicKey: bigint;
    feeCollector: Address;
    fee: bigint;
    maxPlayers: bigint;
    maxRounds: bigint;
    minAmountPerRound: bigint;
}

function initFairFight_init_args(src: FairFight_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.signerPublicKey, 257);
        b_0.storeAddress(src.feeCollector);
        let b_1 = new Builder();
        b_1.storeInt(src.fee, 257);
        b_1.storeInt(src.maxPlayers, 257);
        b_1.storeInt(src.maxRounds, 257);
        let b_2 = new Builder();
        b_2.storeInt(src.minAmountPerRound, 257);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

async function FairFight_init(owner: Address, signerPublicKey: bigint, feeCollector: Address, fee: bigint, maxPlayers: bigint, maxRounds: bigint, minAmountPerRound: bigint) {
    const __code = Cell.fromBase64('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');
    const __system = Cell.fromBase64('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');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initFairFight_init_args({ $$type: 'FairFight_init_args', owner, signerPublicKey, feeCollector, fee, maxPlayers, maxRounds, minAmountPerRound })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const FairFight_errors: { [key: number]: { message: string } } = {
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
    4109: { message: `invalid owner` },
    7757: { message: `max amount per round exceeded` },
    13244: { message: `value does not equal sum to play` },
    15880: { message: `fight has players` },
    31383: { message: `player already busy` },
    44463: { message: `already claimed` },
    45028: { message: `max players amount exceeded` },
    55104: { message: `invalid contract address` },
    57400: { message: `invalid signature` },
    58632: { message: `fight is over` },
    59313: { message: `fight is full of players` },
    61308: { message: `max rounds amount exceeded` },
}

const FairFight_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"FightMsg","header":586963753,"fields":[{"name":"amountPerRound","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rounds","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"maxPlayersAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Join","header":1172312541,"fields":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Withdraw","header":465817403,"fields":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"FinishData","header":3077991154,"fields":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"contract","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"Finish","header":1707239921,"fields":[{"name":"data","type":{"kind":"simple","type":"FinishData","optional":false}},{"name":"signature","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"FightJoin","header":2018577786,"fields":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"joiner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeSignerPublicKey","header":4087772316,"fields":[{"name":"signerPublicKey","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ChangeFee","header":179207920,"fields":[{"name":"fee","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ChangeFeeCollector","header":723028610,"fields":[{"name":"feeCollector","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeMaxPlayersAmount","header":3563588553,"fields":[{"name":"maxPlayers","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ChangeMaxRoundsAmount","header":2352005463,"fields":[{"name":"maxRounds","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ChangeMinAmountPerRound","header":3670985398,"fields":[{"name":"minAmountPerRound","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Fight","header":null,"fields":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"createTime","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"finishTime","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"baseAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"amountPerRound","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rounds","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"maxPlayersAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"players","type":{"kind":"dict","key":"int","value":"address"}},{"name":"playersCurrentLength","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"playersClaimed","type":{"kind":"dict","key":"address","value":"bool"}}]},
    {"name":"Fee","header":null,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"fee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
]

const FairFight_getters: ABIGetter[] = [
    {"name":"feeCalc","arguments":[{"name":"baseAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"Fee","optional":false}},
    {"name":"currentFights","arguments":[],"returnType":{"kind":"dict","key":"int","value":"Fight","valueFormat":"ref"}},
    {"name":"currentFight","arguments":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"Fight","optional":false}},
    {"name":"currentFightPlayers","arguments":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"dict","key":"int","value":"address"}},
    {"name":"currentFightPlayerClaimed","arguments":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"player","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"fee","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"maxPlayers","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"maxRounds","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"minAmountPerRound","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"currentPlayerFight","arguments":[{"name":"player","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const FairFight_getterMapping: { [key: string]: string } = {
    'feeCalc': 'getFeeCalc',
    'currentFights': 'getCurrentFights',
    'currentFight': 'getCurrentFight',
    'currentFightPlayers': 'getCurrentFightPlayers',
    'currentFightPlayerClaimed': 'getCurrentFightPlayerClaimed',
    'fee': 'getFee',
    'maxPlayers': 'getMaxPlayers',
    'maxRounds': 'getMaxRounds',
    'minAmountPerRound': 'getMinAmountPerRound',
    'currentPlayerFight': 'getCurrentPlayerFight',
    'owner': 'getOwner',
}

const FairFight_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"FightMsg"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Join"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Withdraw"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Finish"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeSignerPublicKey"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeFee"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeFeeCollector"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeMaxPlayersAmount"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeMaxRoundsAmount"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeMinAmountPerRound"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
]

export class FairFight implements Contract {
    
    static async init(owner: Address, signerPublicKey: bigint, feeCollector: Address, fee: bigint, maxPlayers: bigint, maxRounds: bigint, minAmountPerRound: bigint) {
        return await FairFight_init(owner, signerPublicKey, feeCollector, fee, maxPlayers, maxRounds, minAmountPerRound);
    }
    
    static async fromInit(owner: Address, signerPublicKey: bigint, feeCollector: Address, fee: bigint, maxPlayers: bigint, maxRounds: bigint, minAmountPerRound: bigint) {
        const init = await FairFight_init(owner, signerPublicKey, feeCollector, fee, maxPlayers, maxRounds, minAmountPerRound);
        const address = contractAddress(0, init);
        return new FairFight(address, init);
    }
    
    static fromAddress(address: Address) {
        return new FairFight(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  FairFight_types,
        getters: FairFight_getters,
        receivers: FairFight_receivers,
        errors: FairFight_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: FightMsg | Join | Withdraw | Finish | ChangeSignerPublicKey | ChangeFee | ChangeFeeCollector | ChangeMaxPlayersAmount | ChangeMaxRoundsAmount | ChangeMinAmountPerRound | Deploy | ChangeOwner) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'FightMsg') {
            body = beginCell().store(storeFightMsg(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Join') {
            body = beginCell().store(storeJoin(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Withdraw') {
            body = beginCell().store(storeWithdraw(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Finish') {
            body = beginCell().store(storeFinish(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeSignerPublicKey') {
            body = beginCell().store(storeChangeSignerPublicKey(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeFee') {
            body = beginCell().store(storeChangeFee(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeFeeCollector') {
            body = beginCell().store(storeChangeFeeCollector(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeMaxPlayersAmount') {
            body = beginCell().store(storeChangeMaxPlayersAmount(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeMaxRoundsAmount') {
            body = beginCell().store(storeChangeMaxRoundsAmount(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeMinAmountPerRound') {
            body = beginCell().store(storeChangeMinAmountPerRound(message)).endCell();
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
    
    async getFeeCalc(provider: ContractProvider, baseAmount: bigint, amount: bigint) {
        let builder = new TupleBuilder();
        builder.writeNumber(baseAmount);
        builder.writeNumber(amount);
        let source = (await provider.get('feeCalc', builder.build())).stack;
        const result = loadTupleFee(source.readTuple());
        return result;
    }
    
    async getCurrentFights(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('currentFights', builder.build())).stack;
        let result = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserFight(), source.readCellOpt());
        return result;
    }
    
    async getCurrentFight(provider: ContractProvider, id: bigint) {
        let builder = new TupleBuilder();
        builder.writeNumber(id);
        let source = (await provider.get('currentFight', builder.build())).stack;
        const result = loadTupleFight(source.readTuple());
        return result;
    }
    
    async getCurrentFightPlayers(provider: ContractProvider, id: bigint) {
        let builder = new TupleBuilder();
        builder.writeNumber(id);
        let source = (await provider.get('currentFightPlayers', builder.build())).stack;
        let result = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
        return result;
    }
    
    async getCurrentFightPlayerClaimed(provider: ContractProvider, id: bigint, player: Address) {
        let builder = new TupleBuilder();
        builder.writeNumber(id);
        builder.writeAddress(player);
        let source = (await provider.get('currentFightPlayerClaimed', builder.build())).stack;
        let result = source.readBoolean();
        return result;
    }
    
    async getFee(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('fee', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getMaxPlayers(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('maxPlayers', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getMaxRounds(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('maxRounds', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getMinAmountPerRound(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('minAmountPerRound', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getCurrentPlayerFight(provider: ContractProvider, player: Address) {
        let builder = new TupleBuilder();
        builder.writeAddress(player);
        let source = (await provider.get('currentPlayerFight', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}